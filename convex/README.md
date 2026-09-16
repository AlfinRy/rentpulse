# Backend draft — not production-ready

These files preserve the initial integration work. They have NOT passed Convex
codegen, typechecking or provider integration tests. Public reads and writes and
the scanner fail closed via `access.ts`; no cron jobs are registered.
The frontend sample workspace is independent of this code.

Before enabling live mode:
1. Authenticate the CLI and generate real Convex APIs (commit `_generated`).
2. Resolve all backend type/runtime errors; never substitute fake generated files.
3. Add an auth provider, server-derived owners and ownership checks on EVERY endpoint.
4. Add validated input bounds, verified email recipients, per-user scan quotas,
   concurrent scan locks and safe URL validation.
5. Confirm AgentMail's actual response shape and outbound delivery status; queued
   is not delivered. Add idempotency and inbox uniqueness.
6. Test Firecrawl result variants, strict OpenAI output validation, missing values,
   listing expiration, pricing periods, timeouts and email failures.
7. Only then remove the fail-closed gate and connect a live frontend adapter.

No API keys belong in Vite env vars or Git. No auto-scanning or emails during
frontend development. Hosting on convex.site is still pending.
