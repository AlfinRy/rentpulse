import { useEffect, useRef } from "react";
import { Check, CircleAlert, X } from "lucide-react";
import { fmtPrice, timeAgo } from "../lib";
import { tierFor, tierLabel, type SampleListing, type SamplePulse } from "../sample";

export function ListingDetail({
  listing,
  pulse,
  overlay = false,
  onClose,
}: {
  listing: SampleListing;
  pulse: SamplePulse;
  overlay?: boolean;
  onClose?: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (overlay) closeRef.current?.focus();
  }, [overlay]);

  const tier = tierFor(listing.score, pulse.minScore);

  return (
    <div className="detail" tabIndex={0}>
      {overlay && (
        <button
          ref={closeRef}
          type="button"
          className="detail-close"
          onClick={onClose}
          aria-label="Close listing detail"
        >
          <X size={18} />
        </button>
      )}
      <span className="detail-kicker">Listing detail</span>
      <h2>{listing.title}</h2>

      <dl className="detail-meta">
        <dt>Price</dt>
        <dd>
          {listing.price != null
            ? fmtPrice(listing.price, listing.currency)
            : "Not stated — listed on ask"}
        </dd>
        {listing.location && (
          <>
            <dt>Location</dt>
            <dd>{listing.location}</dd>
          </>
        )}
        {listing.source && (
          <>
            <dt>Source</dt>
            <dd>{listing.source}</dd>
          </>
        )}
        {listing.language && (
          <>
            <dt>Language</dt>
            <dd>{listing.language}</dd>
          </>
        )}
        <dt>First seen</dt>
        <dd>{timeAgo(listing.firstSeenAt)}</dd>
      </dl>

      {listing.score != null && (
        <div className="score-block">
          <span
            className={`big tier-${tier === "unknown" ? "below" : tier}`}
          >
            {listing.score}
          </span>
          <span className="explain">
            <strong>{tierLabel[tier]} match</strong> against “{pulse.label}”
            criteria, budget {fmtPrice(pulse.budgetMax, pulse.currency)}. The
            score is a starting point — the lists below are the substance.
          </span>
        </div>
      )}

      {listing.reasons && listing.reasons.length > 0 && (
        <section className="detail-section">
          <h3>Why it fits</h3>
          <ul className="reason-list">
            {listing.reasons.map((reason) => (
              <li key={reason}>
                <Check size={16} />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {listing.missing && listing.missing.length > 0 && (
        <section className="detail-section">
          <h3>Worth checking</h3>
          <ul className="missing-list">
            {listing.missing.map((item) => (
              <li key={item}>
                <CircleAlert size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="detail-foot">
        <CircleAlert size={14} />
        Example listing — the price, score, and reasons are invented for
        demonstration, and the source link is disabled in sample mode.
      </p>
    </div>
  );
}
