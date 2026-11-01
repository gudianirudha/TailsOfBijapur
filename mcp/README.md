# Tails of Bijapur — MCP server

An [MCP](https://modelcontextprotocol.io) server that exposes the shelter's
adoption submissions and volunteer applications as tools, so an MCP client
(Claude Code, Claude Desktop, or anything else that speaks MCP) can read and
modify them directly instead of going through the admin UI.

It talks to the same MongoDB database as `api/` over stdio. Full read + write.

---

## Setup

```bash
cd mcp
npm install
```

The server needs `MONGO_URI`. It looks for it in this order:

1. `mcp/.env`
2. `api/.env` — already has it, so you usually don't need step 1

Optional flags (see `.env.example`):

| Variable | Default | Effect |
| --- | --- | --- |
| `MCP_ALLOW_DELETE` | unset | `true` enables `delete_adoption` / `delete_volunteer`. While unset those tools refuse to run. |
| `MCP_REDACT_PII` | unset | `true` masks applicant emails and phone numbers in every response, so real contact details never enter an LLM context. |

Verify it starts before wiring it into a client:

```bash
npm run inspect     # opens the MCP Inspector against this server
```

## Using it from Claude Code

[`.mcp.json`](../.mcp.json) in the repo root already registers the server. The
paths in it are relative, so launch Claude Code from the repo root:

```bash
cd TailsOfBijapur
claude
```

Then `/mcp` to confirm `tails-of-bijapur` is connected. If you launch from a
different directory, either copy `.mcp.json` there or change `args` to an
absolute path.

## Using it from Claude Desktop

Add to `claude_desktop_config.json` (absolute path required — Desktop has no
project root):

```json
{
  "mcpServers": {
    "tails-of-bijapur": {
      "command": "node",
      "args": ["/absolute/path/to/TailsOfBijapur/mcp/src/index.js"]
    }
  }
}
```

---

## Tools

### Adoptions

| Tool | Writes? | Description |
| --- | --- | --- |
| `list_adoptions` | no | List submissions newest-first; filter by status, free-text search name/email/location/reporter, paginate. |
| `get_adoption` | no | One submission by `_id`. |
| `create_adoption` | yes | New submission, status `pending`. No Cloudinary upload — pass an existing `imageUrl`. |
| `update_adoption` | yes | Patch any subset of fields. |
| `set_adoption_status` | yes | `pending` / `approved` / `rejected` / `adopted`. |
| `delete_adoption` | yes | Permanent. Gated on `MCP_ALLOW_DELETE` **and** `confirm: true`. |

### Volunteers

| Tool | Writes? | Description |
| --- | --- | --- |
| `list_volunteers` | no | List applications newest-first; filter by status, free-text search name/email/role, paginate. |
| `get_volunteer` | no | One application by `_id`. |
| `create_volunteer` | yes | New application, status `pending`. |
| `update_volunteer` | yes | Patch any subset of fields. |
| `set_volunteer_status` | yes | `pending` / `approved` / `rejected`. |
| `delete_volunteer` | yes | Permanent. Gated on `MCP_ALLOW_DELETE` **and** `confirm: true`. |

### Reporting

| Tool | Writes? | Description |
| --- | --- | --- |
| `get_shelter_stats` | no | Counts by status for both collections, plus last-7-day and last-30-day intake. |

---

## Things to know

**No emails are sent.** The admin API mails the applicant when a record is
approved (`api/index.js`). `set_adoption_status` and `set_volunteer_status`
deliberately skip that — an assistant iterating over records shouldn't be able
to mail real people. Every status response includes `emailSent: false`. Use the
admin panel when the notification matters.

**No image upload.** `create_adoption` can't push to Cloudinary; it only stores
an `imageUrl` you supply. `delete_adoption` doesn't remove the Cloudinary asset
either — it reports the orphaned `public_id` so you can clean it up.

**`age` is in days, and there are two of them.** The stored `age` is the age
recorded at submission; the site displays `age + days elapsed since updatedAt`.
Read tools return that computed value as `currentAgeDays` on approved and
adopted records, so the stored and displayed numbers can't be confused.

**Schemas are duplicated.** [`src/models.js`](src/models.js) mirrors the inline
schemas in [`../api/index.js`](../api/index.js). Change a field in one and you
must change it in the other. It does *not* follow `api/models/Adoption.js`,
which is unused dead code with a conflicting shape.

**This targets MCP TypeScript SDK v1.** `@modelcontextprotocol/sdk` (v1, currently
1.30.0) is not deprecated, but there is now a v2 line — `@modelcontextprotocol/server`
+ `@modelcontextprotocol/core` — which requires zod 4 and takes `inputSchema` as a
wrapped `z.object({...})` instead of v1's plain object of validators. Moving to v2
means changing the two import paths in `src/index.js`, wrapping each `inputSchema`,
and bumping zod.

**This is a direct line to production data.** The server has the same
credentials as the API and no auth layer of its own — whoever can run it can
write to the live database. Keep `MCP_ALLOW_DELETE` unset unless you're actively
cleaning up, and consider a read-only MongoDB user for day-to-day use.
