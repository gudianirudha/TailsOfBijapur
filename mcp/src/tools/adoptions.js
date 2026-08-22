import { z } from "zod";

import { connectDB } from "../db.js";
import { Adoption, ADOPTION_STATUSES } from "../models.js";
import {
    assertDeleteAllowed,
    assertObjectId,
    errorResult,
    escapeRegex,
    formatAdoption,
    guard,
    isValidEmail,
    isValidPhone,
    jsonResult,
    sanitizeInput,
} from "../util.js";

const statusEnum = z.enum(ADOPTION_STATUSES);

export function registerAdoptionTools(server) {
    server.registerTool(
        "list_adoptions", {
            title: "List adoption submissions",
            description:
                "List adoption (rescued puppy) submissions, newest first. Filter by status " +
                "and/or a free-text search across name, email, location and reporter name.",
            inputSchema: {
                status: statusEnum.optional().describe("Only return submissions with this status"),
                search: z
                    .string()
                    .min(1)
                    .optional()
                    .describe("Case-insensitive substring match on name, email, location, reportername"),
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
                query.$or = [
                    { name: re },
                    { email: re },
                    { location: re },
                    { reportername: re },
                ];
            }

            const [docs, total] = await Promise.all([
                Adoption.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                Adoption.countDocuments(query),
            ]);

            return jsonResult({
                total,
                returned: docs.length,
                skip,
                adoptions: docs.map(formatAdoption),
            });
        })
    );

    server.registerTool(
        "get_adoption", {
            title: "Get one adoption submission",
            description: "Fetch a single adoption submission by its MongoDB _id.",
            inputSchema: {
                id: z.string().describe("The submission's _id"),
            },
            annotations: { readOnlyHint: true },
        },
        guard(async ({ id }) => {
            await connectDB();
            assertObjectId(id);

            const doc = await Adoption.findById(id).lean();
            if (!doc) return errorResult(`No adoption submission with _id ${id}`);

            return jsonResult(formatAdoption(doc));
        })
    );

    server.registerTool(
        "create_adoption", {
            title: "Create an adoption submission",
            description:
                "Create a new adoption submission with status 'pending'. Unlike the public " +
                "web form this does not upload an image to Cloudinary — pass an existing " +
                "imageUrl if you have one. No notification email is sent.",
            inputSchema: {
                name: z.string().min(1).describe("The puppy's name"),
                email: z.string().describe("Contact email for the submission"),
                age: z.number().int().min(0).describe("Age in days at time of submission"),
                gender: z.string().min(1),
                vaccinated: z.string().min(1).describe("Vaccination status, e.g. 'yes' / 'no' / 'partial'"),
                reportername: z.string().min(1).describe("Person reporting the puppy"),
                location: z.string().min(1),
                phone: z.string().describe("Contact phone: digits, spaces, + - ( ) only, 7-20 chars"),
                description: z.string().optional(),
                imageUrl: z.string().url().optional().describe("Existing image URL (e.g. a Cloudinary URL)"),
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
        },
        guard(async (input) => {
            await connectDB();

            if (!isValidEmail(input.email)) return errorResult("Invalid email format");
            if (!isValidPhone(input.phone)) return errorResult("Invalid phone format");

            const doc = await Adoption.create({
                name: sanitizeInput(input.name),
                email: sanitizeInput(input.email).toLowerCase(),
                age: input.age,
                gender: sanitizeInput(input.gender),
                vaccinated: sanitizeInput(input.vaccinated),
                reportername: sanitizeInput(input.reportername),
                location: sanitizeInput(input.location),
                phone: sanitizeInput(input.phone),
                description: sanitizeInput(input.description),
                imageUrl: input.imageUrl || null,
            });

            return jsonResult(formatAdoption(doc));
        })
    );

    server.registerTool(
        "update_adoption", {
            title: "Update adoption fields",
            description:
                "Update one or more fields on an adoption submission. Only the fields you " +
                "pass are changed. Use set_adoption_status to change status.",
            inputSchema: {
                id: z.string().describe("The submission's _id"),
                name: z.string().min(1).optional(),
                email: z.string().optional(),
                age: z.number().int().min(0).optional(),
                gender: z.string().min(1).optional(),
                vaccinated: z.string().min(1).optional(),
                reportername: z.string().min(1).optional(),
                location: z.string().min(1).optional(),
                phone: z.string().optional(),
                description: z.string().optional(),
                imageUrl: z.string().url().optional(),
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
                if (key === "age") update.age = value;
                else if (key === "email") update.email = sanitizeInput(value).toLowerCase();
                else if (key === "imageUrl") update.imageUrl = value;
                else update[key] = sanitizeInput(value);
            }

            if (Object.keys(update).length === 0) {
                return errorResult("No fields to update");
            }

            const doc = await Adoption.findByIdAndUpdate(id, update, {
                new: true,
                runValidators: true,
            });
            if (!doc) return errorResult(`No adoption submission with _id ${id}`);

            return jsonResult(formatAdoption(doc));
        })
    );

    server.registerTool(
        "set_adoption_status", {
            title: "Set adoption status",
            description:
                "Move an adoption submission to pending, approved, rejected or adopted. " +
                "Approving here does NOT send the applicant the approval email that the " +
                "admin panel sends — use the admin UI if the email matters.",
            inputSchema: {
                id: z.string().describe("The submission's _id"),
                status: statusEnum,
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
        },
        guard(async ({ id, status }) => {
            await connectDB();
            assertObjectId(id);

            const doc = await Adoption.findByIdAndUpdate(id, { status }, { new: true });
            if (!doc) return errorResult(`No adoption submission with _id ${id}`);

            return jsonResult({
                _id: String(doc._id),
                name: doc.name,
                status: doc.status,
                emailSent: false,
                note: "Approval email not sent by the MCP server.",
            });
        })
    );

    server.registerTool(
        "delete_adoption", {
            title: "Delete an adoption submission",
            description:
                "Permanently delete an adoption submission. Requires MCP_ALLOW_DELETE=true " +
                "in the environment. The Cloudinary image, if any, is left in place.",
            inputSchema: {
                id: z.string().describe("The submission's _id"),
                confirm: z.literal(true).describe("Must be true to acknowledge this is permanent"),
            },
            annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
        },
        guard(async ({ id }) => {
            await connectDB();
            assertDeleteAllowed();
            assertObjectId(id);

            const doc = await Adoption.findByIdAndDelete(id).lean();
            if (!doc) return errorResult(`No adoption submission with _id ${id}`);

            return jsonResult({
                deleted: true,
                _id: String(doc._id),
                name: doc.name,
                orphanedCloudinaryId: doc.public_id || null,
            });
        })
    );
}
