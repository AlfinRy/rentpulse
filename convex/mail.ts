import { v } from "convex/values";
import { internalQuery, internalMutation, type ActionCtx } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { AgentMail } from "@agentmail/convex";
import type { ScoredListing } from "./scoring";

const agentmail = new AgentMail(components.agentmail);

export const getMailbox = internalQuery({
  args: { ownerKey: v.string() },
  handler: async (ctx, args) => {
    const [row] = await ctx.db
      .query("mailboxes")
      .withIndex("by_owner", (q) => q.eq("ownerKey", args.ownerKey))
      .take(1);
    return row ?? null;
  },
});

export const setMailbox = internalMutation({
  args: { ownerKey: v.string(), inboxId: v.string(), address: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("mailboxes", args),
});

/** One sending inbox per owner so alert threads stay together. */
export async function ensureInbox(ctx: ActionCtx, ownerKey: string): Promise<string> {
  const existing = await ctx.runQuery(internal.mail.getMailbox, { ownerKey });
  if (existing) return existing.inboxId;

  const inbox: any = await agentmail.createInbox(ctx, {
    displayName: "RentPulse Alerts",
    clientId: ownerKey,
  });
  const inboxId: string | undefined = inbox?.id;
  if (!inboxId) throw new Error("AgentMail createInbox returned no id");
  await ctx.runMutation(internal.mail.setMailbox, {
    ownerKey,
    inboxId,
    address: inbox.email_address ?? inbox.emailAddress ?? undefined,
  });
  return inboxId;
}

/** Send one digest email for the matches found in a scan. */
export async function sendMatchDigest(
  ctx: ActionCtx,
  pulse: { ownerKey: string; email: string; label: string; city: string; currency?: string },
  matches: ScoredListing[],
): Promise<void> {
  const inboxId = await ensureInbox(ctx, pulse.ownerKey);

  const cards = matches
    .map((m) => {
      const price = m.price != null ? `${fmtPrice(m.price)}${m.currency ? ` ${m.currency}` : ""} /mo` : "price unknown";
      const reasons = (m.reasons ?? []).map((r) => `<li>${esc(r)}</li>`).join("");
      return `
      <tr>
        <td style="padding:16px;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:15px;font-weight:600;margin-bottom:4px;">
            <a href="${esc(m.url)}" style="color:#0f766e;text-decoration:none;">${esc(m.title)}</a>
            <span style="background:#0f766e;color:#fff;border-radius:9999px;padding:2px 8px;font-size:12px;margin-left:6px;">${m.score ?? "?"}% match</span>
          </div>
          <div style="color:#374151;font-size:13px;margin-bottom:6px;">${esc(m.location ?? pulse.city)} · ${esc(price)}</div>
          ${m.summary ? `<div style="color:#4b5563;font-size:13px;margin-bottom:6px;">${esc(m.summary)}</div>` : ""}
          ${reasons ? `<ul style="color:#4b5563;font-size:13px;margin:0 0 0 18px;padding:0;">${reasons}</ul>` : ""}
        </td>
      </tr>`;
    })
    .join("");

  const subject = `🟢 ${matches.length} new rental match${matches.length > 1 ? "es" : ""} for "${pulse.label}"`;
  const heading = `New matches in ${pulse.city}, scored against "${pulse.label}":`;

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
    <div style="padding:20px 0 8px;font-size:18px;font-weight:700;">🏠 RentPulse</div>
    <p style="color:#4b5563;font-size:14px;margin:8px 0 16px;">${esc(heading)}</p>
    <table style="width:100%;border-collapse:collapse;background:#ffffff;">${cards}</table>
    <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">
      Sent by RentPulse — live rental matches from across the web. Pause this pulse anytime in the app.
    </p>
  </div>`;

  const text = `${heading}\n\n` + matches
    .map((m) => `- ${m.title} (${m.score ?? "?"}% match)\n  ${m.url}\n  ${(m.reasons ?? []).join("; ")}`)
    .join("\n\n");

  await agentmail.sendMessage(ctx, inboxId, {
    to: pulse.email,
    subject,
    text,
    html,
    labels: ["rentpulse", "match-digest"],
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function fmtPrice(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
