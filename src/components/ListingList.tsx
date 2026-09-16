import { useRef } from "react";
import { fmtPrice, timeAgo } from "../lib";
import { tierFor, tierLabel, type SampleListing } from "../sample";

export function ListingList({
  listings,
  minScore,
  selectedId,
  onSelect,
}: {
  listings: SampleListing[];
  minScore: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const buttons = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (buttons.length === 0) return;
    const focusedIndex = buttons.findIndex(
      (button) => button === document.activeElement,
    );
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (focusedIndex + 1 + buttons.length) % buttons.length;
        break;
      case "ArrowUp":
        next = (focusedIndex - 1 + buttons.length) % buttons.length;
        break;
      case "Home":
        next = 0;
        break;
      default:
        next = buttons.length - 1;
    }
    buttons[next < 0 ? 0 : next].focus();
  };

  return (
    <div
      className="listing-list"
      role="listbox"
      aria-label="Listings for this Pulse"
      onKeyDown={onKeyDown}
    >
      {listings.map((listing, index) => {
        const tier = tierFor(listing.score, minScore);
        const isNew = Date.now() - listing.firstSeenAt < 60 * 60_000;
        const selected = listing.id === selectedId;
        return (
          <button
            key={listing.id}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role="option"
            aria-selected={selected}
            tabIndex={selected || (selectedId == null && index === 0) ? 0 : -1}
            className="listing-row"
            onClick={() => onSelect(listing.id)}
          >
            <span className="row-score">
              <span
                className={`score-num tier-${tier === "unknown" ? "below" : tier}`}
              >
                {listing.score ?? "—"}
              </span>
              <span className={`score-tier tier-${tier === "unknown" ? "below" : tier}`}>
                {tierLabel[tier]}
              </span>
            </span>
            <span className="row-main">
              <span className="row-title">{listing.title}</span>
              <span className="row-meta">
                {listing.location && <span>{listing.location}</span>}
                {listing.source && <span>{listing.source}</span>}
                <span>seen {timeAgo(listing.firstSeenAt)}</span>
                {isNew && <span className="new">New</span>}
              </span>
            </span>
            <span className="row-price">
              {listing.price != null ? (
                fmtPrice(listing.price, listing.currency)
              ) : (
                <span className="unknown">price on ask</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
