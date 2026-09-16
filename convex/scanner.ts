import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { components, internal } from "./_generated/api";
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { scoreListing, type ScoredListing } from "./scoring";
import { sendMatchDigest } from "./mail";
import { requireLiveBackend } from "./access";

const firecrawl = new FirecrawlClient(components.firecrawl);

const RESULTS_PER_SCAN = 8;

/** The scan pipeline: search the web → scrape → score with OpenAI → save → alert. */
async function runScan(ctx: any, pulseId: string) {
  requireLiveBackend();
  const pulse = await ctx.runQuery(internal.pulses.get, { pulseId });
  if (!pulse) return;

  const scanId = await ctx.runMutation(internal.scanner.startScan, { pulseId });
  try {
    // 1. Firecrawl: web search, scraping each result to markdown.
    const searchQuery = `${pulse.query} for rent ${pulse.city}`;
    const response = await firecrawl.search(ctx, searchQuery, {
      limit: RESULTS_PER_SCAN,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    });

    const seen = new Set(await ctx.runQuery(internal.listings.urlsForPulse, { pulseId }));
    const pages = (response.web ?? []).filter(
      (p: any): p is { url: string; title?: string; description?: string; markdown?: string } =>
        typeof p?.url === "string" && !seen.has(p.url) && typeof p.markdown === "string" && p.markdown.length > 200,
    );
    // Dedupe by URL within one scan.
    const unique = pages.filter((p, i) => pages.findIndex((q) => q.url === p.url) === i);

    // 2. OpenAI: normalize + score each new page in parallel.
    const settled = await Promise.allSettled(
      unique.map((p) =>
        scoreListing(
          {
            label: pulse.label,
            city: pulse.city,
            query: pulse.query,
            budgetMax: pulse.budgetMax,
            currency: pulse.currency,
          },
          p.url,
          p.markdown!,
          p.title ?? p.url,
        ),
      ),
    );
    const scored: ScoredListing[] = settled
      .filter((r): r is PromiseFulfilledResult<ScoredListing | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((s): s is ScoredListing => s !== null);

    // 3. Persist everything we found (live board updates reactively).
    if (scored.length > 0) {
      await ctx.runMutation(internal.scanner.saveListings, {
        pulseId,
        listings: scored,
      });
    }

    // 4. AgentMail: digest email for matches above the threshold.
    const threshold = pulse.minScore ?? 70;
    const matches = scored
      .filter((s) => (s.score ?? 0) >= threshold)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    let alerted = false;
    if (matches.length > 0) {
      try {
        await sendMatchDigest(ctx, pulse, matches);
        alerted = true;
      } catch (err) {
        console.error("digest email failed", err);
      }
    }

    await ctx.runMutation(internal.scanner.finishScan, {
      scanId,
      status: "done",
      found: unique.length,
      newMatches: scored.length,
      alerted,
    });
    await ctx.runMutation(internal.pulses.touchLastScan, {
      pulseId,
      at: Date.now(),
    });
  } catch (err) {
    console.error("scan failed", err);
    await ctx.runMutation(internal.scanner.finishScan, {
      scanId,
      status: "error",
      error: String(err).slice(0, 500),
    });
  }
}

/** Triggered on pulse creation and by the cron refresh. */
export const scanPulse = internalAction({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => runScan(ctx, args.pulseId),
});

/** Called by the "Scan now" button in the UI. */
export const scanNow = action({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => runScan(ctx, args.pulseId),
});

/** Cron entrypoint: schedule a scan for every active pulse, staggered. */
export const refreshActivePulses = internalAction({
  args: {},
  handler: async (ctx) => {
    const ids = await ctx.runQuery(internal.scanner.activePulseIds, {});
    await Promise.all(
      ids.map((pulseId: string, i: number) =>
        ctx.scheduler.runAfter(i * 3_000, internal.scanner.scanPulse, { pulseId }),
      ),
    );
  },
});

export const activePulseIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("pulses")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(20);
    return rows.map((r) => r._id);
  },
});

export const startScan = internalMutation({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) =>
    ctx.db.insert("scans", { pulseId: args.pulseId, startedAt: Date.now(), status: "running" }),
});

export const finishScan = internalMutation({
  args: {
    scanId: v.id("scans"),
    status: v.string(),
    found: v.optional(v.number()),
    newMatches: v.optional(v.number()),
    alerted: v.optional(v.boolean()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { scanId, ...patch }) =>
    ctx.db.patch(scanId, { ...patch, finishedAt: Date.now() }),
});

export const saveListings = internalMutation({
  args: {
    pulseId: v.id("pulses"),
    listings: v.array(
      v.object({
        url: v.string(),
        title: v.string(),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        location: v.optional(v.string()),
        summary: v.optional(v.string()),
        score: v.optional(v.number()),
        reasons: v.optional(v.array(v.string())),
        missing: v.optional(v.array(v.string())),
        language: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const l of args.listings) {
      const existing = await ctx.db.query("listings")
        .withIndex("by_pulse_url", (q) => q.eq("pulseId", args.pulseId).eq("url", l.url))
        .first();
      if (existing) continue;
      let source: string | undefined;
      try {
        source = new URL(l.url).hostname.replace(/^www\./, "");
      } catch {
        source = undefined;
      }
      await ctx.db.insert("listings", { ...l, pulseId: args.pulseId, source, firstSeenAt: now });
    }
  },
});
