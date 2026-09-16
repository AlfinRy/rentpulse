/**
 * OpenAI scoring: turn a scraped page (markdown) into a normalized,
 * criteria-scored rental listing — or null if the page isn't a listing.
 *
 * Uses the OpenAI Chat Completions API directly with OPENAI_API_KEY,
 * falling back gracefully so a scoring failure never breaks a scan.
 */

export type PulseCriteria = {
  label: string;
  city: string;
  query: string;
  budgetMax: number;
  currency?: string;
};

export type ScoredListing = {
  url: string;
  title: string;
  price?: number;
  currency?: string;
  location?: string;
  summary?: string;
  score?: number;
  reasons?: string[];
  missing?: string[];
  language?: string;
};

const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_MARKDOWN_CHARS = 9000;

export async function scoreListing(
  crit: PulseCriteria,
  url: string,
  markdown: string,
  fallbackTitle: string,
): Promise<ScoredListing | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn("OPENAI_API_KEY not set — skipping scoring for", url);
    return null;
  }

  const system = `You extract rental listings from web pages and score them against a renter's criteria.
Respond with a single JSON object, no prose. Schema:
{
  "isListing": boolean,       // is this page (or a dominant part of it) an actual rental/property-for-rent offer?
  "title": string,            // short listing title
  "price": number | null,     // numeric periodic rent, null if unknown
  "currency": string | null,  // ISO code e.g. "USD", "IDR"
  "location": string | null,  // neighborhood/city as stated
  "summary": string,          // one-sentence summary in the page's language
  "score": number,            // 0-100 fit against the criteria below
  "reasons": string[],        // up to 3 short reasons it fits (same language as the page)
  "missing": string[],        // up to 2 trade-offs or unknowns
  "language": string          // ISO 639-1 of the page content
}
Score hard on budget: a listing clearly above budgetMax must not exceed 45.`;

  const user = `Renter's criteria:
- What they want: ${crit.query}
- City: ${crit.city}
- Budget: max ${crit.budgetMax} ${crit.currency ?? "local currency"} per month
- Saved as: "${crit.label}"

Page URL: ${url}
Page title: ${fallbackTitle}

Page content (markdown, truncated):
"""
${markdown.slice(0, MAX_MARKDOWN_CHARS)}
"""`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL(),
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("OpenAI error", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    if (!parsed.isListing) return null;

    return {
      url,
      title: String(parsed.title || fallbackTitle).slice(0, 140),
      price: numOrNull(parsed.price) ?? undefined,
      currency: parsed.currency || undefined,
      location: parsed.location || undefined,
      summary: parsed.summary || undefined,
      score: clamp(parsed.score),
      reasons: strArray(parsed.reasons, 3),
      missing: strArray(parsed.missing, 2),
      language: parsed.language || undefined,
    };
  } catch (err) {
    console.error("scoring failed for", url, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function clamp(n: unknown): number | undefined {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return undefined;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function numOrNull(n: unknown): number | null {
  if (n === null || n === undefined || n === "") return null;
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : null;
}

function strArray(a: unknown, max: number): string[] | undefined {
  if (!Array.isArray(a)) return undefined;
  const out = a.filter((s) => typeof s === "string" && s.trim()).slice(0, max);
  return out.length ? out : undefined;
}
