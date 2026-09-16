import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";
import { requireLiveBackend } from "./access";

/** The live board: listings for one pulse, best matches first. */
export const board = query({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => {
    requireLiveBackend();
    return ctx.db
      .query("listings")
      .withIndex("by_pulse_score", (q) => q.eq("pulseId", args.pulseId))
      .order("desc")
      .take(50);
  },
});

/** Latest scan row for the status strip. */
export const latestScan = query({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => {
    requireLiveBackend();
    const [scan] = await ctx.db
      .query("scans")
      .withIndex("by_pulse_started", (q) => q.eq("pulseId", args.pulseId))
      .order("desc")
      .take(1);
    return scan ?? null;
  },
});

/** URLs already stored for a pulse — used by the scanner to dedupe. */
export const urlsForPulse = internalQuery({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_pulse_url", (q) => q.eq("pulseId", args.pulseId))
      .collect();
    return rows.map((r) => r.url);
  },
});
