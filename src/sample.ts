/**
 * Sample workspace data — clearly labeled examples.
 *
 * Every pulse, listing, price, score, and scan status below is invented for
 * demonstration. None of it came from a real crawl, no OpenAI scoring ran, and
 * no emails were sent. The UI repeats this boundary: sample mode never claims
 * live availability.
 *
 * Types intentionally mirror convex/schema.ts so a future live adapter can
 * substitute this module without reshaping the UI.
 */

export type SamplePulse = {
  id: string;
  label: string;
  city: string;
  query: string;
  budgetMax: number;
  currency: string;
  minScore: number;
  active: boolean;
  email: string;
  lastScanAt?: number;
  lastScanStatus?: "running" | "done" | "error";
  lastScanFound?: number;
  lastScanNewMatches?: number;
  lastScanError?: string;
};

export type SampleListing = {
  id: string;
  pulseId: string;
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
  source?: string;
  firstSeenAt: number;
};

export type SampleWorkspace = {
  pulses: SamplePulse[];
  listings: SampleListing[];
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

export const sampleWorkspace: SampleWorkspace = {
  pulses: [
    {
      id: "p-sunset",
      label: "Sunset Park 1BR",
      city: "Brooklyn, NY",
      query:
        "Sunny 1BR near the D line, quiet street, laundry in building, move-in November.",
      budgetMax: 2600,
      currency: "USD",
      minScore: 70,
      active: true,
      email: "you@example.com",
      lastScanAt: now - 6 * MIN,
      lastScanStatus: "done",
      lastScanFound: 12,
      lastScanNewMatches: 2,
    },
    {
      id: "p-menteng",
      label: "Menteng studio",
      city: "Jakarta",
      query: "Studio atau 1BR dekat KRL, furnished, max 15 juta tahunan.",
      budgetMax: 4_500_000,
      currency: "IDR",
      minScore: 70,
      active: true,
      email: "you@example.com",
      lastScanAt: now - 3 * HOUR,
      lastScanStatus: "error",
      lastScanError: "Sample mode — listing provider is not connected.",
    },
    {
      id: "p-lisbon",
      label: "Lisbon 2BR, spring",
      city: "Lisbon, Portugal",
      query: "2BR for a spring sublet, natural light, desk space for two.",
      budgetMax: 1500,
      currency: "EUR",
      minScore: 65,
      active: false,
      email: "you@example.com",
    },
  ],
  listings: [
    {
      id: "l-1",
      pulseId: "p-sunset",
      url: "https://listings.example.com/sunset-44th",
      title: "Sunny 1BR, 44th St & 7th Ave — laundry, quiet block",
      price: 2450,
      currency: "USD",
      location: "Sunset Park, Brooklyn",
      summary:
        "Top-floor 1BR with south light, renovated kitchen, shared laundry in basement. Six-minute walk to the D at 44th St.",
      score: 88,
      reasons: [
        "2450 USD is 150 under your 2600 budget.",
        "Six minutes on foot to the D line, as requested.",
        "Laundry in building is listed on the page.",
        "Available from the first week of November.",
      ],
      missing: [
        "No photos of the bedroom — condition unverified.",
        "Whether the block is quiet is a claim, not a fact; visit before deciding.",
      ],
      language: "English",
      source: "listings.example.com",
      firstSeenAt: now - 6 * MIN,
    },
    {
      id: "l-2",
      pulseId: "p-sunset",
      url: "https://flats.example.net/park-slope-5av",
      title: "Renovated 1BR near Greenwood",
      price: 2595,
      currency: "USD",
      location: "Park Slope, Brooklyn",
      summary:
        "One bedroom over a bakery, renovated bath, heat included. Express trains two blocks away.",
      score: 79,
      reasons: [
        "Just inside your 2600 budget at 2595 USD.",
        "Heat included saves roughly 60 USD in winter months.",
        "Express-train access matches your commute note.",
      ],
      missing: [
        "Above a bakery — street noise in the morning is likely.",
        "Laundry situation not mentioned on the page.",
      ],
      language: "English",
      source: "flats.example.net",
      firstSeenAt: now - 52 * MIN,
    },
    {
      id: "l-3",
      pulseId: "p-sunset",
      url: "https://listings.example.com/bay-ridge-73",
      title: "Bay Ridge 1BR, big kitchen, D train",
      price: 2200,
      currency: "USD",
      location: "Bay Ridge, Brooklyn",
      summary:
        "Large one bedroom in a prewar building, dishwasher, block from the D at Bay Ridge Ave.",
      score: 76,
      reasons: [
        "400 USD under budget.",
        "Direct D-train access with a longer ride (~40 min to Manhattan).",
      ],
      missing: [
        "Commute is roughly twice your stated target — the trade-off behind the score.",
        "Unit floor not stated; prewar buildings vary on stairs and elevators.",
      ],
      language: "English",
      source: "listings.example.com",
      firstSeenAt: now - 3 * HOUR,
    },
    {
      id: "l-4",
      pulseId: "p-sunset",
      url: "https://rental.example.org/ditmas-availability",
      title: "Ditmas Park 1BR — ask about availability",
      location: "Ditmas Park, Brooklyn",
      summary:
        "Charming one bedroom in a Victorian house. Price and dates on request.",
      score: 61,
      reasons: [
        "Neighborhood and house type align with your query.",
      ],
      missing: [
        "No price on the page — cannot compare to your budget yet.",
        "No stated availability date; the score ignores both gaps on purpose.",
      ],
      language: "English",
      source: "rental.example.org",
      firstSeenAt: now - 20 * HOUR,
    },
    {
      id: "l-5",
      pulseId: "p-sunset",
      url: "https://flats.example.net/sunset-furnished",
      title: "Furnished 1BR, short walking distance to Industry City",
      price: 2750,
      currency: "USD",
      location: "Sunset Park, Brooklyn",
      summary:
        "Fully furnished month-to-month one bedroom near Industry City.",
      score: 54,
      reasons: [
        "Location and condition are strong fits.",
      ],
      missing: [
        "150 USD over your 2600 budget.",
        "Month-to-month rent typically embeds a premium; annual lease may differ.",
      ],
      language: "English",
      source: "flats.example.net",
      firstSeenAt: now - 2 * DAY,
    },
    {
      id: "l-6",
      pulseId: "p-menteng",
      url: "https://kos.example.id/menteng-pejaten",
      title: "Studio menteng, 15 menit jalan ke KRL Gambir",
      price: 4_200_000,
      currency: "IDR",
      location: "Menteng, Jakarta Pusat",
      summary:
        "Studio furnished 24 m², AC dan air hangat, keamanan 24 jam.",
      score: 74,
      reasons: [
        "300 ribu di bawah budget bulanan Anda.",
        "Furnish lengkap sesuai kriteria.",
      ],
      missing: [
        "Jarak ke KRL dihitung dari peta, belum diverifikasi saat kunjungan.",
        "Deposit dan biaya lainnya belum tercantum.",
      ],
      language: "Indonesian",
      source: "kos.example.id",
      firstSeenAt: now - 2 * DAY,
    },
    {
      id: "l-7",
      pulseId: "p-menteng",
      url: "https://apart.example.id/sudirman-studio",
      title: "Apartemen studio Sudirman, tower baru",
      price: 5_100_000,
      currency: "IDR",
      location: "Sudirman, Jakarta",
      summary: "Studio 22 m² di tower baru, gym dan kolam renang.",
      score: 48,
      reasons: [
        "Fasilitas bangunan lengkap.",
      ],
      missing: [
        "600 ribu di atas budget bulanan Anda.",
        "Lokasi ke KRL lebih jauh dari target 15 menit.",
      ],
      language: "Indonesian",
      source: "apart.example.id",
      firstSeenAt: now - 3 * DAY,
    },
  ],
};

export function tierFor(
  score: number | undefined,
  minScore: number,
): "strong" | "match" | "below" | "unknown" {
  if (score == null) return "unknown";
  if (score >= 80) return "strong";
  if (score >= minScore) return "match";
  return "below";
}

export const tierLabel: Record<ReturnType<typeof tierFor>, string> = {
  strong: "Strong",
  match: "Match",
  below: "Below bar",
  unknown: "Unscored",
};
