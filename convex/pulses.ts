import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireLiveBackend } from "./access";

export const listByOwner = query({
  args: { ownerKey: v.string() },
  handler: async (ctx, args) => {
    requireLiveBackend();
    const rows = await ctx.db
      .query("pulses")
      .withIndex("by_owner", (q) => q.eq("ownerKey", args.ownerKey))
      .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = internalQuery({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => ctx.db.get(args.pulseId),
});

export const create = mutation({
  args: {
    ownerKey: v.string(),
    email: v.string(),
    label: v.string(),
    city: v.string(),
    query: v.string(),
    budgetMax: v.number(),
    currency: v.optional(v.string()),
    minScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireLiveBackend();
    const pulseId = await ctx.db.insert("pulses", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
    // First scan runs immediately — the board fills up live while you watch.
    await ctx.scheduler.runAfter(0, internal.scanner.scanPulse, { pulseId });
    return pulseId;
  },
});

export const setActive = mutation({
  args: { pulseId: v.id("pulses"), active: v.boolean() },
  handler: async (ctx, args) => {
    requireLiveBackend();
    return ctx.db.patch(args.pulseId, { active: args.active });
  },
});

export const remove = mutation({
  args: { pulseId: v.id("pulses") },
  handler: async (ctx, args) => {
    requireLiveBackend();
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_pulse_url", (q) => q.eq("pulseId", args.pulseId))
      .collect();
    await Promise.all(listings.map((l) => ctx.db.delete(l._id)));
    await ctx.db.delete(args.pulseId);
  },
});

export const touchLastScan = internalMutation({
  args: { pulseId: v.id("pulses"), at: v.number() },
  handler: async (ctx, args) => ctx.db.patch(args.pulseId, { lastScanAt: args.at }),
});
