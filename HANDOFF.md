# RentPulse — laptop handoff

Checkpoint prepared 2026-09-16. **WIP, not a runnable or deployed application.**
This document replaces the need to transfer the original chat transcript.

## Read first

1. `AGENTS.md` (keep CLI-managed sections intact).
2. This file, `PRODUCT.md`, and `hackathon.md`.
3. `convex/_generated/ai/guidelines.md` in full before backend work.
4. `convex/README.md` for the fail-closed gate and remaining backend work.

## Confirmed decisions

- Product/repository: RentPulse, https://github.com/AlfinRy/rentpulse.
- Purpose: monitor rental listings across cities, compare them with saved search
  criteria (a **Pulse**), explain matches and prepare email digests.
- Stack: Vite + React + TypeScript; Convex backend; Firecrawl data; OpenAI
  extraction/scoring; AgentMail inbox/digests.
- Hackathon: **Convex All Gas Hackathon**.
- Frontend hosting: **Convex static hosting (`convex.site`)**, explicitly confirmed.
  ChatGPT Sites skill is not required. No static-hosting component or deployment yet.
- User communicates in Indonesian and requested Impeccable/anti-generic frontend
  design. English UI and a clearly labeled sample mode were proposed, not shipped.
- User prefers meaningful incremental commits and pushes, not one final upload.
  Setup was explicitly limited to no application build/deploy/commit/push; a
  separate authorization now permits this migration checkpoint commit and push.
  On the new laptop, verify setup first, then confirm scope before resuming the
  application build. Never infer permission to deploy or submit from Git approval.

## Actual state (do not overclaim)

| Area | Evidence / status |
| --- | --- |
| Scaffold | Vite/TS configuration, HTML shell, package manifest and lockfile exist. |
| Frontend | Only `src/main.tsx` and `src/lib.ts` exist. `main.tsx` imports missing `App.tsx` and `index.css`. It also expects a Convex URL. **Not runnable yet.** |
| Backend | Draft schemas, functions, scanner, scoring and mail helpers in `convex/`. Public app reads/writes and scanner execution fail closed through `access.ts`. No cron jobs enabled. |
| Generated API | Only `_generated/ai/` instructions exist. `_generated/api`, `server`, and `dataModel` have NOT been generated. Never create fake substitutes. |
| Convex project | Source qualifies as a Convex project, but account/deployment initialization and CLI authentication have not been verified. No recorded deployment URL. |
| Verification | Earlier codegen failed because no deployment was configured. Typecheck failed due to incomplete frontend and missing generated API. No successful application build, tests, scan, delivery or deployment. |
| AI files | CLI-managed AGENTS/CLAUDE/guidelines and 33 project Convex skills verified up to date under Node 24. |
| MCP | Configured on the old laptop globally, but the old chat session never reloaded it. Active Convex MCP tooling was NOT verified. Global configuration does not travel with this repo. |
| Log | `hackathon.md` records two existing commits and honest setup progress. |
| Design | `.impeccable/direction-options.json` contains proposals only. No confirmed direction, DESIGN.md, screenshots or finished UI. |

### Design work to resume later

An Impeccable direction round proposed **Neighborhood Guide**: restrained
lavender navigation, scan-friendly listing rows, and a detail panel explaining
fit and unknowns. Alternatives are in the options JSON. The user never selected
one in the recorded conversation. Do not treat this proposal as approved.
Do not reuse the old localhost decision-page URL; its process state is excluded.

The original agent loaded Impeccable and react-data-patterns. An `unslop` folder
was later listed on the old machine but was not loaded or used in this session.
Those global skills are NOT bundled here. Install them from trusted sources on
the new laptop or transfer their reviewed skill directories separately; never
copy the whole Pi agent directory, credentials, or session history to Git.

## Bring up the new laptop

### 1. Toolchain and repository

Install Git and **Node.js 24 LTS**. `.nvmrc` records the recommended major;
activate it using your version manager or install Node 24 directly. Verify
`node --version` rather than assuming a version manager read the file.
Node 26 on the old Windows machine repeatedly crashed at Convex CLI exit with a
libuv assertion; Node 24 successfully ran `ai-files status`.

```sh
git clone https://github.com/AlfinRy/rentpulse.git
cd rentpulse
npm ci
```

This restores dependencies, **not** a working application. The handoff check
verified matching manifest/lockfile declarations and `npm ci --dry-run
--ignore-scripts --no-audit --no-fund` succeeded on the original machine; a full
clean install on the new laptop is still required. Do not claim `npm run build`
or `npm run dev` succeeds with this checkpoint. Preserve the lockfile.
Set Git name/email locally using your own GitHub-linked identity before future
commits. No personal identity or credentials are embedded in these instructions.

### 2. Pi and MCP

If Pi is not installed:

```sh
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
pi install npm:pi-mcp-adapter
```

Authenticate your model provider using Pi's `/login`, not by pasting tokens in
chat. Start Pi **from the cloned repository root**, trust project resources when
prompted, and reload/restart after installing integrations.

Project-local Convex/hackathon skills and the `/hackathon` prompt are already in
`.agents/skills/` and `.pi/prompts/`. Pi loads these after project trust; verify
availability in the new session rather than assuming disk files are active.

Read the current official instructions at https://www.convex.dev/agent-setup.md.
For Pi's global Convex skill installation, the official all-other-agents path is:

```sh
npx -y skills add get-convex/agent-skills --skill '*' --yes --global
npx -y skills list --global
```

Merge the **Convex entry only** from `docs/mcp.example.json` into the new laptop's
`~/.config/mcp/mcp.json` (`%USERPROFILE%/.config/mcp/mcp.json` on Windows). Preserve
other servers and settings. This is a secret-free EXAMPLE, not a credentials
backup. Do not add production-enabling flags.

After restarting/reloading Pi, inspect MCP status and connect the `convex` server.
Use discovery or a harmless status check; do not inspect database records or
secrets. An MCP entry on disk is NOT proof of activation. If the Node 26 problem
recurs, check the Node executable inherited by Pi and the MCP child process.

Verify project-managed instructions:

```sh
npx convex ai-files status
```

Use `npx convex ai-files install` only if the current official CLI reports stale
or missing files. Do not edit managed instruction blocks by hand. A missing
`convex.json` in this checkpoint is not an invitation to invent one; the CLI
reported the installed defaults up to date without it.

### 3. Credentials and the boundary between setup and build

Do not copy `.env`, private keys, global Pi auth files, MCP credentials, session
transcripts or browser cookies through Git. Reauthenticate on the new machine.
No provider API keys or deployment credentials were transferred.

For later application development, provision credentials through official
provider dashboards and the Convex environment management workflow:
`FIRECRAWL_API_KEY`, `OPENAI_API_KEY`, `AGENTMAIL_API_KEY`, and webhook secrets if
needed. Never put these in `VITE_*` variables. `VITE_CONVEX_URL` is a public client
URL, not a secret, but there is no verified value to supply yet.

**Do not run `npx convex dev` as a harmless setup probe.** It can initialize and
push application code. During environment-only setup, do not log in to Convex,
initialize/deploy, set environment values or run database tools. Ask for the
required user login/approval when transitioning into actual application work.

## Next work, in order

1. Verify new-laptop Pi skills, `/hackathon`, MCP, Node 24 and managed AI files.
2. Confirm permission to resume building; resolve the visual direction with the
   user using the installed design skills. A clearly labeled sample workspace
   can be built independently of live integrations; no fake availability,
   successful scans, sent email or real users.
3. Implement the missing frontend, loading/error/empty states, validation,
   responsive behavior, keyboard access and bounded desktop/mobile verification.
   Use resource hooks and error boundaries rather than raw fetch effects.
4. Finish backend auth/ownership, validated inputs, quotas, concurrency,
   strict model-output validation and verified recipient/delivery behavior.
   See `convex/README.md`. Do not remove `access.ts` simply to make a demo run.
5. After authorized Convex provisioning, generate real APIs and resolve all
   backend type/runtime errors. Include genuine generated API files in Git.
6. Verify Firecrawl, OpenAI and AgentMail end to end without exposing user data.
7. During later authorized hosting work, use the current official component:
   `npm install @convex-dev/static-hosting`, then
   `npx @convex-dev/static-hosting setup`; review manual steps before publishing.
8. Run `/hackathon` after meaningful progress. Commit/push completed milestones
   according to the user's confirmed workflow. No deployment or submission
   without explicit permission.

## Hackathon administration (still to verify)

Registration, credits and account provisioning are not proven by local files.
Check the current organizer page: https://luma.com/convex-allgas-hackathon.
The recorded submission deadline is **September 22, 2026, 12:00 PM PT**
(September 23, 02:00 WIB). Recheck deadlines if continuing after these dates.

Submission: https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit

Required: public repository, root `hackathon.md`, a live public `convex.site`
URL, and a demo video no longer than three minutes. The organizer also requires
new work within its build window and sponsor-tagged social posts. Registration,
social posts, video and submission are not completed by this checkpoint.

## First message to the new agent

> Baca AGENTS.md, HANDOFF.md, PRODUCT.md, dan hackathon.md. Saya melanjutkan
> RentPulse dari laptop lain. Verifikasi environment, skills, shortcut
> /hackathon, dan MCP dahulu. Jangan menganggap aplikasi sudah berjalan.
> Jangan build, deploy, commit, atau push sebelum scope lanjutan dikonfirmasi.
