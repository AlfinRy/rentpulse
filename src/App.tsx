import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FlaskConical } from "lucide-react";
import { useWorkspace } from "./useWorkspace";
import { fmtPrice } from "./lib";
import { ListingDetail } from "./components/ListingDetail";
import { ListingList } from "./components/ListingList";
import { PulseRail } from "./components/PulseRail";
import { ScanStrip } from "./components/ScanStrip";
import {
  BoardSkeleton,
  BrandMark,
  CrashFallback,
  NoListings,
  NoListingSelected,
  NoPulseSelected,
  RailSkeleton,
} from "./components/States";

function useMedia(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export default function App() {
  const { data, isLoading, isError, refetch } = useWorkspace();
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const narrow = useMedia("(max-width: 1024px)");
  const newButtonRef = useRef<HTMLButtonElement | null>(null);

  const pulses = data?.pulses ?? [];
  const selectedPulse =
    pulses.find((pulse) => pulse.id === pulseId) ?? null;

  const listings = useMemo(() => {
    const all = data?.listings ?? [];
    return all
      .filter((listing) => listing.pulseId === pulseId)
      .sort((a, b) => {
        if (a.score == null && b.score == null)
          return b.firstSeenAt - a.firstSeenAt;
        if (a.score == null) return 1;
        if (b.score == null) return -1;
        return b.score - a.score || b.firstSeenAt - a.firstSeenAt;
      });
  }, [data, pulseId]);

  const selectedListing =
    listings.find((listing) => listing.id === listingId) ?? null;

  const listingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const listing of data?.listings ?? []) {
      counts.set(listing.pulseId, (counts.get(listing.pulseId) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  const selectPulse = (id: string) => {
    setPulseId(id);
    setListingId(null);
    setOverlayOpen(false);
  };

  const selectListing = (id: string) => {
    setListingId(id);
    if (narrow) setOverlayOpen(true);
  };

  useEffect(() => {
    if (pulseId == null && pulses.length > 0) {
      setPulseId(pulses[0].id);
    }
  }, [pulseId, pulses]);

  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlayOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen]);

  if (isError) {
    return (
      <div className="app">
        <TopBar />
        <main>
          <CrashFallback
            error={new Error("Sample data failed to load.")}
            resetErrorBoundary={() => refetch()}
          />
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={CrashFallback}>
      <div className="app">
      <a className="skip-link" href="#board">
        Skip to listings
      </a>
      <TopBar />
      <div className="workspace">
        {isLoading ? (
          <nav className="rail" aria-label="Pulses" aria-busy="true">
            <RailSkeleton />
          </nav>
        ) : (
          <PulseRail
            pulses={pulses}
            selectedId={pulseId}
            onSelect={selectPulse}
            listingCounts={listingCounts}
            newButtonRef={newButtonRef}
          />
        )}

        <main className="board" id="board" aria-busy={isLoading || undefined}>
          {isLoading ? (
            <BoardSkeleton />
          ) : !selectedPulse ? (
            <NoPulseSelected />
          ) : (
            <>
              <header className="board-head">
                <h1 className="board-title">{selectedPulse.label}</h1>
                <p className="board-sub">
                  {selectedPulse.query} Up to{" "}
                  {fmtPrice(selectedPulse.budgetMax, selectedPulse.currency)},
                  alert at score {selectedPulse.minScore} and above, digests to{" "}
                  {selectedPulse.email}.
                </p>
                <ScanStrip pulse={selectedPulse} />
              </header>
              {listings.length === 0 ? (
                <NoListings paused={!selectedPulse.active} />
              ) : (
                <ListingList
                  listings={listings}
                  minScore={selectedPulse.minScore}
                  selectedId={listingId}
                  onSelect={selectListing}
                />
              )}
            </>
          )}
        </main>

        {!narrow && (
          <aside
            className="detail detail-inline"
            aria-label="Listing detail"
            tabIndex={0}
            key={selectedListing?.id ?? "empty"}
          >
            {selectedPulse && selectedListing ? (
              <ListingDetail
                listing={selectedListing}
                pulse={selectedPulse}
              />
            ) : (
              <NoListingSelected />
            )}
          </aside>
        )}
      </div>

      {narrow && overlayOpen && selectedPulse && selectedListing && (
        <>
          <button
            type="button"
            className="detail-backdrop"
            aria-label="Close listing detail"
            onClick={() => setOverlayOpen(false)}
          />
          <div className="detail-overlay">
            <ListingDetail
              listing={selectedListing}
              pulse={selectedPulse}
              overlay
              onClose={() => setOverlayOpen(false)}
            />
          </div>
        </>
      )}
      </div>
    </ErrorBoundary>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <span className="brand">
        <BrandMark />
        <span className="brand-name">RentPulse</span>
        <span className="brand-tag">rental matches, watched for you</span>
      </span>
      <span className="sample-note">
        <FlaskConical size={14} />
        Sample workspace — example data
      </span>
    </header>
  );
}
