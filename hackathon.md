# Hackathon log

- **Project:** RentPulse
- **Event:** Convex All Gas Hackathon
- **What it does:** Prototype for monitoring rental listings, scoring matches against saved criteria, and preparing email digests; not yet operational.
- **Live app:** not deployed
- **Repo:** https://github.com/AlfinRy/rentpulse
- **Frontend:** Convex static hosting
- **Convex deployment:** not deployed
- **Components:** none
- **Convex features:** schema, tables, indexes, queries, mutations, actions, HTTP actions, scheduled-function calls (draft source only; runtime unverified)
- **Auth:** none
- **AI models:** gpt-4o-mini (default in draft scoring code; no verified execution)
- **Started:** 2026-09-16T07:42:46Z
- **Last updated:** 2026-09-16 (see log)

## Log

### 2026-09-16 - 9f8e137
Established the Vite, React and TypeScript scaffold and declared Convex,
Firecrawl and AgentMail dependencies. Added the hackathon build-log skill
(`package.json`, `vite.config.ts`, `.agents/skills/convex-hackathon-skill/`).
This commit did not contain a working application or deployment.

### 2026-09-16 - 293a8f7
Preserved a draft rental-search backend with listing schemas, query and mutation
functions, scoring and mail helpers. Firecrawl and AgentMail components are
registered in source (`convex/convex.config.ts`), but are not verified on a
runtime. The Components header above lists no registered convex-dev components.
Public reads/writes and scans fail closed; no cron jobs are enabled
(`convex/access.ts`, `convex/crons.ts`, `convex/README.md`).

### 2026-09-16 - working tree (new laptop)
Implemented the frontend sample workspace end to end (Neighborhood Guide
direction: lavender Pulse rail, scan-friendly listing rows, detail panel with
fit reasons and open questions). New files under `src/` (App shell, sample
data mirroring the Convex schema, TanStack Query resource hook, pulse rail,
create-pulse form with validation, listing listbox with arrow-key navigation,
scan status strip with explicit idle/scanning/done/error states, skeletons,
empty states, error boundary). `src/main.tsx` now wires the Convex provider
only when `VITE_CONVEX_URL` exists, so the sample runs without a backend.
Verification: `npm run build` passes (tsc -b + vite); Playwright checks at
390/900/1440px found no horizontal overflow, no clipped containers, correct
responsive structure, working keyboard navigation and focus-visible rings;
axe-core (wcag2/2.1 a+aa) reports zero violations on desktop and mobile;
computed contrast for secondary text is 7.1-8.3:1. Backend draft untouched;
`convex/` was excluded from the root tsc build references until generated
APIs exist (`tsconfig.node.json`), matching the documented fail-closed state.
No deployment, no live scans, no emails.

### 2026-09-16 - working tree (original laptop)
Started official hackathon environment setup. Refreshed the two build-log skill
files and installed CLI-managed Convex AI instructions and project skills
(`AGENTS.md`, `CLAUDE.md`, `convex/_generated/ai/guidelines.md`, `.agents/skills/`).
Verified managed-file status with Node 24 after Node 26 CLI exit failures.
Added the Pi-local `/hackathon` prompt (`.pi/prompts/hackathon.md`). Existing
partial frontend files and dependency changes remain unfinished; no frontend
build, backend typecheck, provider integration test or deployment has passed.
The user confirmed Convex static hosting and reported opening a new Pi terminal.
The current conversation still runs outside the project root and its MCP status
still lists only the previously configured server; new-session activation must
be verified there.

Prepared an explicitly authorized laptop-migration checkpoint with `HANDOFF.md`,
`README.md`, a Node 24 version hint, and a secret-free MCP configuration example.
Excluded local design-session state and machine-specific agent settings from
Git. Preserved partial frontend source and dependencies as WIP, not a working
application. No credentials or private session history are part of the handoff.
Manifest/lockfile declarations match; dependency-install dry-run and Node 24
managed-AI-file status checks passed. Staged-file privacy checks found no
common secret patterns, email addresses outside documentation examples, or
absolute user-home paths. These checks do not establish application readiness.

## Setup status

- Global Convex skills: 33 installed; readable files and CLI listing verified.
- Convex MCP: standard user-level stdio configuration was installed on the
  original laptop; active tooling was not verified. Recreate it on the new
  laptop using `docs/mcp.example.json`. No database records were accessed.
- Pi project resources: bundled in the repository; load from the project root
  after trusting the project and restarting/reloading Pi. Verify native
  activation on the new laptop.
- Hosting: convex.site confirmed by the user. The Frontend header records the
  selected host, not a completed deployment; Live app remains not deployed.
- The static-hosting component has not been installed or configured.
- Environment setup itself performed no commit, push, build, deployment or
  submission. The user separately authorized committing and pushing this
  migration checkpoint; application build, deployment and submission remain
  unverified and are not part of that authorization.
