#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { connectDB, disconnectDB } from "./db.js";
import { waitForDrain } from "./util.js";
import { registerAdoptionTools } from "./tools/adoptions.js";
import { registerStatsTools } from "./tools/stats.js";
import { registerVolunteerTools } from "./tools/volunteers.js";

/* ==============================
   Environment
============================== */

const here = path.dirname(fileURLToPath(import.meta.url));

// mcp/.env wins; otherwise reuse the API's env so MONGO_URI lives in one place.
// dotenv never overwrites an already-set variable, so the order here is the
// precedence order.
for (const candidate of [
        path.join(here, "..", ".env"),
        path.join(here, "..", "..", "api", ".env"),
    ]) {
    if (existsSync(candidate)) {
        dotenv.config({ path: candidate });
    }
}

/* ==============================
   Server
============================== */

// stdout carries the JSON-RPC stream — every diagnostic must go to stderr.
const log = (...args) => console.error("[tails-of-bijapur-mcp]", ...args);

const server = new McpServer({
    name: "tails-of-bijapur",
    version: "1.0.0",
});

registerAdoptionTools(server);
registerVolunteerTools(server);
registerStatsTools(server);

// Connect up front so a bad MONGO_URI shows up in the client's stderr log
// immediately rather than on the first tool call. Tools reconnect on their own,
// so a failure here is not fatal.
try {
    await connectDB();
    log("MongoDB connected");
} catch (err) {
    log("MongoDB connection failed, will retry on first tool call:", err.message);
}

if (process.env.MCP_ALLOW_DELETE === "true") {
    log("MCP_ALLOW_DELETE=true — delete tools are ENABLED");
}
if (process.env.MCP_REDACT_PII === "true") {
    log("MCP_REDACT_PII=true — emails and phone numbers will be masked");
}

/* ==============================
   Shutdown
============================== */

let closing = false;

async function shutdown(reason) {
    if (closing) return;
    closing = true;

    log(`${reason}, shutting down`);
    try {
        await server.close();
        await disconnectDB();
    } catch (err) {
        log("error during shutdown:", err.message);
    }
    process.exit(0);
}

process.on("SIGINT", () => shutdown("received SIGINT"));
process.on("SIGTERM", () => shutdown("received SIGTERM"));

// The client owns our lifetime. Without this the open Mongo connection keeps
// the event loop alive after stdin closes and the process has to be killed.
// Drain first, or a tool call still mid-query never gets its response written.
process.stdin.on("end", async () => {
    await waitForDrain();
    shutdown("stdin closed");
});

/* ==============================
   Go
============================== */

await server.connect(new StdioServerTransport());
log("ready on stdio");
