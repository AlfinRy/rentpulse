# RentPulse

A work-in-progress rental search assistant for the **Convex All Gas Hackathon**.
The intended workflow is web discovery with Firecrawl, criteria-based scoring
with OpenAI, Convex-backed updates, and match digests through AgentMail.

**This is a migration checkpoint, not a runnable application.** The frontend is
incomplete, generated Convex APIs are missing, and backend execution is blocked
intentionally. No live service or end-to-end test has been verified.

## Continuing on another laptop

Start with **[HANDOFF.md](HANDOFF.md)**. It records decisions, limitations,
environment setup, privacy boundaries and the next steps.

Use Node.js **24 LTS**, clone this repo, and run `npm ci` to restore dependencies.
Do not interpret a successful install as a successful build. Open your coding
agent from the repository root so project-local skills and prompts are visible.

## Project map

- `src/` — partial frontend entry and helpers; App and styles remain to be built.
- `convex/` — fail-closed backend draft; read its README before enabling anything.
- `convex/_generated/ai/` — CLI-managed guidance, not generated runtime APIs.
- `.agents/skills/` — official Convex skills and hackathon log skill.
- `.pi/prompts/hackathon.md` — Pi shortcut for `/hackathon [start]`.
- `.impeccable/direction-options.json` — unapproved design proposals, not a design spec.
- `PRODUCT.md` — product facts and explicitly marked assumptions.
- `hackathon.md` — evidence-based public build log.
- `docs/mcp.example.json` — secret-free MCP configuration example.

Selected future frontend host: **Convex static hosting (`convex.site`)**.
It is not installed or deployed yet. Keep secrets, local auth and session files
out of Git. No automatic deployment or submission workflow is configured.
