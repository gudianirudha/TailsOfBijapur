import { connectDB } from "../db.js";
import {
    Adoption,
    ADOPTION_STATUSES,
    Volunteer,
    VOLUNTEER_STATUSES,
} from "../models.js";
import { guard, jsonResult } from "../util.js";

function countsByStatus(rows, statuses) {
    const counts = Object.fromEntries(statuses.map((s) => [s, 0]));

    for (const row of rows) {
        // A status outside the enum can exist if a document predates the enum.
        counts[row._id ?? "unknown"] = row.count;
    }

    return counts;
}

export function registerStatsTools(server) {
    server.registerTool(
        "get_shelter_stats", {
            title: "Get shelter stats",
            description:
                "Counts of adoption submissions and volunteer applications broken down by " +
                "status, plus how many arrived in the last 7 and 30 days.",
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        guard(async () => {
            await connectDB();

            const now = Date.now();
            const day = 24 * 60 * 60 * 1000;
            const last7 = new Date(now - 7 * day);
            const last30 = new Date(now - 30 * day);

            const group = [{ $group: { _id: "$status", count: { $sum: 1 } } }];

            const [
                adoptionRows,
                volunteerRows,
                adoptions7,
                adoptions30,
                volunteers7,
                volunteers30,
            ] = await Promise.all([
                Adoption.aggregate(group),
                Volunteer.aggregate(group),
                Adoption.countDocuments({ createdAt: { $gte: last7 } }),
                Adoption.countDocuments({ createdAt: { $gte: last30 } }),
                Volunteer.countDocuments({ createdAt: { $gte: last7 } }),
                Volunteer.countDocuments({ createdAt: { $gte: last30 } }),
            ]);

            return jsonResult({
                adoptions: {
                    byStatus: countsByStatus(adoptionRows, ADOPTION_STATUSES),
                    total: adoptionRows.reduce((sum, r) => sum + r.count, 0),
                    last7Days: adoptions7,
                    last30Days: adoptions30,
                },
                volunteers: {
                    byStatus: countsByStatus(volunteerRows, VOLUNTEER_STATUSES),
                    total: volunteerRows.reduce((sum, r) => sum + r.count, 0),
                    last7Days: volunteers7,
                    last30Days: volunteers30,
                },
            });
        })
    );
}
