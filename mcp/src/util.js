import mongoose from "mongoose";

/* ==============================
   MCP result envelopes
============================== */

export function jsonResult(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    };
}

export function errorResult(message) {
    return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
    };
}

let inflight = 0;

/**
 * Resolves once no tool handler is still running, so shutdown doesn't cut off
 * a request that's mid-query. Caps out so a wedged query can't block exit.
 */
export function waitForDrain({ timeoutMs = 30000, pollMs = 25 } = {}) {
    if (inflight === 0) return Promise.resolve();

    return new Promise((resolve) => {
        const startedAt = Date.now();
        const timer = setInterval(() => {
            if (inflight === 0 || Date.now() - startedAt > timeoutMs) {
                clearInterval(timer);
                resolve();
            }
        }, pollMs);
    });
}

/**
 * Wraps a handler so a thrown error becomes an MCP tool error instead of
 * crashing the stdio server mid-request, and so the request is counted for
 * drain-on-shutdown.
 */
export function guard(handler) {
    return async (args, extra) => {
        inflight++;
        try {
            return await handler(args, extra);
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                const details = Object.values(err.errors).map((e) => e.message);
                return errorResult(`Validation failed: ${details.join("; ")}`);
            }
            return errorResult(err.message);
        } finally {
            inflight--;
        }
    };
}

/* ==============================
   Validation (mirrors api/index.js)
============================== */

export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
}

export function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.length >= 7 && phone.length <= 20;
}

export function sanitizeInput(input) {
    if (typeof input !== "string") return "";
    return input.trim().substring(0, 1000);
}

export function assertObjectId(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error(`"${id}" is not a valid MongoDB ObjectId`);
    }
    return id;
}

/** Escaped so user text can't inject regex metacharacters into a $regex query. */
export function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ==============================
   Write gating
============================== */

export function assertDeleteAllowed() {
    if (process.env.MCP_ALLOW_DELETE !== "true") {
        throw new Error(
            "Deletes are disabled. Set MCP_ALLOW_DELETE=true in mcp/.env to enable them."
        );
    }
}

/* ==============================
   Output formatting
============================== */

function maskEmail(email) {
    const [local, domain] = String(email).split("@");
    if (!domain) return "***";
    return `${local.slice(0, 1)}***@${domain}`;
}

function maskPhone(phone) {
    const digits = String(phone).replace(/\D/g, "");
    return digits.length > 3 ? `***${digits.slice(-3)}` : "***";
}

export function formatDoc(doc) {
    if (!doc) return null;

    const plain = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
    plain._id = String(plain._id);
    delete plain.__v;

    // Checked per call, not at import time — dotenv runs after module init.
    if (process.env.MCP_REDACT_PII === "true") {
        if (plain.email) plain.email = maskEmail(plain.email);
        if (plain.phone) plain.phone = maskPhone(plain.phone);
    }

    return plain;
}

/**
 * The site shows a puppy's age as (days recorded at approval + days elapsed
 * since), matching calculateCurrentAge in api/index.js. Surfaced alongside the
 * stored `age` so the two are never confused.
 */
export function formatAdoption(doc) {
    const plain = formatDoc(doc);
    if (!plain) return null;

    if (plain.status === "approved" || plain.status === "adopted") {
        const elapsed = Math.floor(
            (Date.now() - new Date(plain.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
        );
        plain.currentAgeDays = Math.max(0, (plain.age || 0) + elapsed);
    }

    return plain;
}
