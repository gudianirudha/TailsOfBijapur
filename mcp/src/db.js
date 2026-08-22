import mongoose from "mongoose";

let pending = null;

/**
 * Idempotent connect. Every tool handler calls this before touching the DB,
 * so a server that started before Atlas was reachable still recovers.
 */
export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!pending) {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error(
                "MONGO_URI is not set. Put it in mcp/.env or api/.env (see mcp/.env.example)."
            );
        }

        pending = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 10000 })
            .catch((err) => {
                // Drop the rejected promise so the next tool call retries
                // instead of replaying the same failure forever.
                pending = null;
                throw err;
            });
    }

    await pending;
    return mongoose.connection;
}

export async function disconnectDB() {
    pending = null;
    await mongoose.connection.close();
}
