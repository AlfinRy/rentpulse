# RentPulse — session resume

Written 2026-09-16 (evening WIB), immediately after commit `7734505` on the
**new laptop**. This file continues where `HANDOFF.md` stops: it records the
current verified state of this machine and repository so a fresh Pi session
(another conversation of the same assistant, no shared memory) can resume
without re-deriving anything. If this file and `HANDOFF.md` disagree,
**this file wins** for anything after commit `48d3fa2`.

## Read first (same order as HANDOFF.md)

1. `AGENTS.md` — keep CLI-managed sections intact.
2. This file, then `HANDOFF.md` (background only), `PRODUCT.md`, `hackathon.md`.
3. `convex/_generated/ai/guidelines.md` in full before any backend work.
4. `convex/README.md` for the fail-closed gate and remaining backend work.

## What this session already did (do not redo)

### Environment bring-up (verified, fixed where broken)

- `npm ci` succeeded (49 packages). `node_modules` restored.
- **Node 26 libuv crash reproduced on this laptop too** (`Assertion failed
  ... src\win\async.c`, exit 127, at Convex CLI exit). Fixed per HANDOFF:
  installed and activated **Node 24.21.0** via nvm. `npx convex ai-files
  status` now exits 0 and reports all managed AI files up to date.
- Created `%USERPROFILE%/.config/mcp/mcp.json` containing **only** the
  `convex` server entry copied from `docs/mcp.example.json` (secret-free).
  **MCP is configured on disk but NOT yet activated** — the session that
  created the config predates it; Pi must be restarted/reloaded, then the
  `convex` server connected and checked with a harmless status call.
- `pi` reinstalled globally **under Node 24** (v0.85.1) because nvm global
  packages are per-Node-version. The old v26.4.0 install still exists.
- Git identity configured (AlfinRy). Repo clean on `main`, in sync with
  `origin/main`.

### Machine-specific notes

- Two nvm layers: store at `C:\Users\pc\AppData\Local\nvm`, symlink
  `C:\nvm4w\nodejs` (currently → `v24.21.0`). Terminals opened before the
  switch may still resolve Node 26; reopen them.
- Playwright **chromium headless shell only** was installed
  (`npx playwright install chromium --only-shell`) for verification scripts.

### Frontend sample workspace (commit `7734505`, pushed)

Built end-to-end in the **Neighborhood Guide** direction: lavender Pulse
rail, scan-friendly listing rows, detail panel explaining fit + unknowns.
Important: **the user never explicitly chose this direction.** This session
presented the options, the user replied tersely ("lanjut"), and the
recommended option was implemented with an explicit one-word switch path.
Switching later (e.g. to *Rental Shortlist* or *Live Arrivals*) is contained
mostly in `src/index.css` tokens + `src/sample.ts`.

- `src/`: `App.tsx` (3-pane shell, auto-selects first Pulse, mobile overlay
  detail with Escape/backdrop close), `sample.ts` (types mirror
  `convex/schema.ts`; 3 Pulses covering scan done / scan error / paused-empty,
  7 listings incl. no-price and below-threshold rows), `useWorkspace.ts`
  (TanStack Query hook; local-only, 400ms latency model), components
  (`PulseRail`, `CreatePulseForm` with on-blur validation, `ListingList`
  listbox with arrow-key roving focus, `ScanStrip` explicit
  idle/scanning/done/error, `States.tsx` skeletons/empty/error-boundary
  fallback), `index.css` (OKLCH tokens, reduced-motion, z-scale).
- `src/main.tsx`: fonts (Manrope 400–800), QueryClientProvider, and
  **ConvexProvider only when `VITE_CONVEX_URL` exists** — sample mode never
  invents a backend.
- Sample honesty: persistent "Sample workspace" pill, *Run scan* explains
  live scans are not connected (never fakes a successful scan), detail footer
  labels price/score/reasons as invented, source links disabled.
- `scripts/screenshot.mjs` (9 screenshots to git-ignored `.shots/`) and
  `scripts/verify.mjs` (geometry, overflow, computed OKLCH contrast,
  axe-core, keyboard, responsive structure). Run against
  `npx vite preview --port 4173`.
- `tsconfig.node.json`: `convex/` removed from the root `tsc -b` project
  until real `_generated` files exist. Backend itself untouched and still
  fail-closed.

### Verification results (measured, not eyeballed)

- `npm run build` passes (tsc -b + vite).
- No horizontal overflow or clipped text containers at 390/900/1440px.
- axe-core wcag2/2.1 a+aa: **zero violations** on desktop and mobile
  (fixed during the pass: EmptyState h3→h2 for heading-order; scrollable
  detail panels given `tabindex="0"`).
- Secondary-text contrast 7.1–8.3:1 (computed from real OKLCH values).
- Keyboard: arrow navigation and focus-visible rings verified.
- `hackathon.md` updated with an honest working-tree entry for this build.

**Limitation kept honest:** this session's model could not read images, so
the 9 screenshots in `.shots/` were **never visually reviewed by the agent**.
Verification was objective/measured. The user's own visual review (or a
future session with image support doing `/impeccable critique src`) is still
pending, along with the direction confirmation.

## Current state (do not overclaim)

| Area | Status |
| --- | --- |
| Frontend | Sample workspace builds and passes measured verification. **Not deployed.** Direction not explicitly user-confirmed. |
| Backend | Draft, fail-closed via `access.ts`. No codegen, no `_generated` api/server/dataModel. No credentials. |
| Convex | No account login, no deployment, no URL. `npx convex dev` has never been run here — keep it that way until authorized. |
| MCP | Config on disk; **activation unverified** until Pi restarts. |
| Git | `main` = `7734505`, pushed. Working tree clean after committing RESUME.md. |
| Hackathon | Registration, credits, video, submission: all still unverified/not done. Deadline **Sep 22, 2026 12:00 PT (Sep 23 02:00 WIB)** — recheck the organizer page if resuming near/after it. |

## Boundaries (unchanged, still binding)

- No deployment, submission, or hosting publish without explicit user permission.
- Never treat Git approval as deploy permission. Never run `npx convex dev`
  as a probe. No fake generated files, no secrets in `VITE_*`, no copying
  credentials through Git. Do not remove `access.ts` to make a demo run.
- Sample mode must never claim live availability, successful scans, or sent
  email. All invented listings/prices/scores stay labeled as examples.

## Next work, in order

1. **User reviews the UI** (`.shots/01–09` or `npm run dev`) and either
   confirms Neighborhood Guide or names a switch (*Rental Shortlist* /
   *Live Arrivals*). Iterate polish from that feedback.
2. **After the user restarts Pi**: verify MCP `convex` server activation with
   a harmless status check (the config is already on disk).
3. Backend hardening per `convex/README.md`: auth provider decision (needs
   the user), server-derived ownership on every endpoint, input bounds,
   quotas, scan locks, strict OpenAI output validation.
4. Only after the user authorizes Convex provisioning: log in, initialize,
   run codegen, commit the real `_generated` files, restore `convex/` to the
   root tsc build, resolve backend type errors.
5. Firecrawl / OpenAI / AgentMail end-to-end verification with user-provided
   keys via the official env workflow (never `VITE_*`).
6. Hosting when authorized: `npm install @convex-dev/static-hosting`, then
   `npx @convex-dev/static-hosting setup`; review manual steps first.
7. `/hackathon` log updates after meaningful progress; demo video (≤3 min);
   submission only with explicit permission.

## Useful commands

```sh
npm run build                          # tsc -b + vite build
npm run dev                            # sample mode (no VITE_CONVEX_URL set)
npx vite preview --port 4173           # serve dist for the scripts below
node scripts/verify.mjs                # full measured verification pass
node scripts/screenshot.mjs            # 9 state screenshots into .shots/
npx convex ai-files status             # use under Node 24, not 26
```

## First message to the next session

> Baca `RESUME.md` di root repo dulu, lalu `AGENTS.md`, `PRODUCT.md`, dan
> `hackathon.md`. Ini sesi lanjutan RentPulse di laptop yang sama, setelah
> commit `7734505` (frontend sample workspace). Jangan ulangi setup: Node 24
> sudah aktif, dependensi terpasang, MCP config sudah di disk tapi belum
> diverifikasi aktif. Tidak ada yang boleh di-deploy atau di-submit tanpa
> izin eksplisit. Mulai dari langkah 1 di bagian "Next work": tunggu review
> visual dan konfirmasi arah desain dari saya, jangan asumsikan Neighborhood
> Guide sudah final.
