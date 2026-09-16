import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A Pulse is a live watch for rental listings in one city.
  pulses: defineTable({
    ownerKey: v.string(), // anonymous device key (localStorage) until auth lands
    email: v.string(), // where match digests are sent via AgentMail
    label: v.string(), // e.g. "Sunset Park 1BR"
    city: v.string(), // e.g. "Brooklyn, NY" or "Jakarta"
    query: v.string(), // free-text description of what they want
    budgetMax: v.number(),
    currency: v.optional(v.string()), // "USD", "IDR", ...
    minScore: v.optional(v.number()), // alert threshold 0-100, default 70
    active: v.boolean(),
    createdAt: v.number(),
    lastScanAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerKey"])
    .index("by_active", ["active"]),

  // A normalized rental listing found for a pulse, scored by OpenAI.
  listings: defineTable({
    pulseId: v.id("pulses"),
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
    source: v.optional(v.string()), // domain it was found on
    firstSeenAt: v.number(),
  })
    .index("by_pulse_score", ["pulseId", "score"])
    .index("by_pulse_url", ["pulseId", "url"]),

  // One row per scan run: powers the live status strip in the UI.
  scans: defineTable({
    pulseId: v.id("pulses"),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    status: v.string(), // running | done | error
    found: v.optional(v.number()),
    newMatches: v.optional(v.number()),
    alerted: v.optional(v.boolean()),
    error: v.optional(v.string()),
  }).index("by_pulse_started", ["pulseId", "startedAt"]),

  // One AgentMail sending inbox per owner, so replies thread correctly.
  mailboxes: defineTable({
    ownerKey: v.string(),
    inboxId: v.string(),
    address: v.optional(v.string()),
  }).index("by_owner", ["ownerKey"]),
});
