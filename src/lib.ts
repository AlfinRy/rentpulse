/** Anonymous per-browser owner key until auth lands. Stable across reloads. */
export function getOwnerKey(): string {
  const KEY = "rentpulse.ownerKey";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

export function fmtPrice(price?: number, currency?: string): string {
  if (price == null) return "—";
  const c = currency ?? "";
  return `${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}${c ? ` ${c}` : ""}/mo`;
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
