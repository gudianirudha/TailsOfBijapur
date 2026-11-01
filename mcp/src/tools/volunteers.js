import { z } from "zod";

import { connectDB } from "../db.js";
import { Volunteer, VOLUNTEER_STATUSES } from "../models.js";
import {
    assertDeleteAllowed,
    assertObjectId,
    errorResult,
    escapeRegex,
    formatDoc,
    guard,
    isValidEmail,
    isValidPhone,
    jsonResult,
    sanitizeInput,
} from "../util.js";

const statusEnum = z.enum(VOLUNTEER_STATUSES);

export function registerVolunteerTools(server) {
    server.registerTool(
        "list_volunteers", {
            title: "List volunteer applications",
            description:
                "List volunteer applications, newest first. Filter by status and/or a " +
                "free-text search across name, email and role.",
            inputSchema: {
                status: statusEnum.optional().describe("Only return applications with this status"),
                search: z
                    .string()
                    .min(1)
                    .optional()
                    .describe("Case-insensitive substring match on name, email, role"),
                limit: z.number().int().min(1).max(100).default(20),
                skip: z.number().int().min(0).default(0),
            },
            annotations: { readOnlyHint: true },
        },
        guard(async ({ status, search, limit, skip }) => {
            await connectDB();

            const query = {};
            if (status) query.status = status;

            if (search) {
                const re = new RegExp(escapeRegex(search), "i");
                query.$or = [{ name: re }, { email: re }, { role: re }];
            }

            const [docs, total] = await Promise.all([
                Volunteer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                Volunteer.countDocuments(query),
            ]);

            return jsonResult({
                total,
                returned: docs.length,
                skip,
                volunteers: docs.map(formatDoc),
            });
        })
    );

    server.registerTool(
        "get_volunteer", {
            title: "Get one volunteer application",
            description: "Fetch a single volunteer application by its MongoDB _id.",
            inputSchema: {
                id: z.string().describe("The application's _id"),
            },
            annotations: { readOnlyHint: true },
        },
        guard(async ({ id }) => {
            await connectDB();
            assertObjectId(id);

            const doc = await Volunteer.findById(id).lean();
            if (!doc) return errorResult(`No volunteer application with _id ${id}`);

            return jsonResult(formatDoc(doc));
        })
    );

    server.registerTool(
        "create_volunteer", {
            title: "Create a volunteer application",
            description:
                "Create a new volunteer application with status 'pending'. No notification " +
                "email is sent.",
            inputSchema: {
                name: z.string().min(1),
                email: z.string().describe("Applicant email"),
                phone: z.string().describe("Digits, spaces, + - ( ) only, 7-20 chars"),
                role: z.string().min(1).describe("Role applied for, e.g. 'Feeder', 'Rescuer'"),
                time: z.string().min(1).describe("Availability, e.g. 'Weekends' or '2 hrs/week'"),
                why: z.string().min(1).describe("Why they want to volunteer"),
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
        },
        guard(async (input) => {
            await connectDB();

            if (!isValidEmail(input.email)) return errorResult("Invalid email format");
            if (!isValidPhone(input.phone)) return errorResult("Invalid phone format");

            const doc = await Volunteer.create({
                name: sanitizeInput(input.name),
                email: sanitizeInput(input.email).toLowerCase(),
                phone: sanitizeInput(input.phone),
                role: sanitizeInput(input.role),
                time: sanitizeInput(input.time),
                why: sanitizeInput(input.why),
            });

            return jsonResult(formatDoc(doc));
        })
    );

    server.registerTool(
        "update_volunteer", {
            title: "Update volunteer fields",
            description:
                "Update one or more fields on a volunteer application. Only the fields you " +
                "pass are changed. Use set_volunteer_status to change status.",
            inputSchema: {
                id: z.string().describe("The application's _id"),
                name: z.string().min(1).optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
                role: z.string().min(1).optional(),
                time: z.string().min(1).optional(),
                why: z.string().min(1).optional(),
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
        },
        guard(async ({ id, ...fields }) => {
            await connectDB();
            assertObjectId(id);

            if (fields.email !== undefined && !isValidEmail(fields.email)) {
                return errorResult("Invalid email format");
            }
            if (fields.phone !== undefined && !isValidPhone(fields.phone)) {
                return errorResult("Invalid phone format");
            }

            const update = {};
            for (const [key, value] of Object.entries(fields)) {
                if (value === undefined) continue;
                update[key] =
                    key === "email" ? sanitizeInput(value).toLowerCase() : sanitizeInput(value);
            }

            if (Object.keys(update).length === 0) {
                return errorResult("No fields to update");
            }

            const doc = await Volunteer.findByIdAndUpdate(id, update, {
                new: true,
                runValidators: true,
            });
            if (!doc) return errorResult(`No volunteer application with _id ${id}`);

            return jsonResult(formatDoc(doc));
        })
    );

    server.registerTool(
        "set_volunteer_status", {
            title: "Set volunteer status",
            description:
                "Move a volunteer application to pending, approved or rejected. Approving " +
                "here does NOT send the welcome email that the admin panel sends.",
            inputSchema: {
                id: z.string().describe("The application's _id"),
                status: statusEnum,
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
        },
        guard(async ({ id, status }) => {
            await connectDB();
            assertObjectId(id);

            const doc = await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
            if (!doc) return errorResult(`No volunteer application with _id ${id}`);

            return jsonResult({
                _id: String(doc._id),
                name: doc.name,
                role: doc.role,
                status: doc.status,
                emailSent: false,
                note: "Welcome email not sent by the MCP server.",
            });
        })
    );

    server.registerTool(
        "delete_volunteer", {
            title: "Delete a volunteer application",
            description:
                "Permanently delete a volunteer application. Requires MCP_ALLOW_DELETE=true " +
                "in the environment.",
            inputSchema: {
                id: z.string().describe("The application's _id"),
                confirm: z.literal(true).describe("Must be true to acknowledge this is permanent"),
            },
            annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
        },
        guard(async ({ id }) => {
            await connectDB();
            assertDeleteAllowed();
            assertObjectId(id);

            const doc = await Volunteer.findByIdAndDelete(id).lean();
            if (!doc) return errorResult(`No volunteer application with _id ${id}`);

            return jsonResult({ deleted: true, _id: String(doc._id), name: doc.name });
        })
    );
}
