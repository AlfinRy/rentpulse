import type { ReactNode } from "react";
import { CircleAlert, Inbox, TriangleAlert } from "lucide-react";

export function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle
        cx="12"
        cy="12"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <circle
        cx="12"
        cy="12"
        r="10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      {icon}
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

export function NoPulseSelected() {
  return (
    <EmptyState icon={<Inbox />} title="Pick a Pulse">
      Choose a saved search from the directory on the left. Each Pulse carries
      its own criteria, listings, and scan history.
    </EmptyState>
  );
}

export function NoListings({ paused }: { paused: boolean }) {
  return paused ? (
    <EmptyState icon={<Inbox />} title="This Pulse is paused">
      It keeps the criteria but does not scan. Resume it in a live workspace to
      start collecting listings again — the sample keeps it paused on purpose.
    </EmptyState>
  ) : (
    <EmptyState icon={<Inbox />} title="No listings under this Pulse yet">
      When a live scan runs, matches land here scored against your criteria,
      with the reasons and the gaps spelled out per listing.
    </EmptyState>
  );
}

export function NoListingSelected() {
  return (
    <EmptyState icon={<Inbox />} title="Select a listing">
      Choose a row in the middle panel to see why it fits, and what is still
      worth checking before you trust the score.
    </EmptyState>
  );
}

export function RailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skel" style={{ width: "64px", height: "12px" }} />
      <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skel-rail-item" style={{ display: "grid", gap: "8px" }}>
            <div className="skel" style={{ width: "72%", height: "14px" }} />
            <div className="skel" style={{ width: "48%", height: "12px" }} />
            <div className="skel" style={{ width: "56%", height: "10px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div aria-hidden="true" style={{ padding: "16px 12px" }}>
      <div className="skel" style={{ width: "220px", height: "26px", margin: "0 12px" }} />
      <div
        className="skel"
        style={{ width: "340px", height: "14px", margin: "10px 12px 20px" }}
      />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skel-row">
          <div className="skel" style={{ width: "40px", height: "26px" }} />
          <div style={{ display: "grid", gap: "8px" }}>
            <div className="skel" style={{ width: `${88 - i * 9}%`, height: "14px" }} />
            <div className="skel" style={{ width: `${52 + i * 7}%`, height: "11px" }} />
          </div>
          <div className="skel" style={{ width: "72px", height: "14px" }} />
        </div>
      ))}
    </div>
  );
}

export function CrashFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "An unknown error occurred.";
  return (
    <div className="crash" role="alert">
      <TriangleAlert />
      <h2>The workspace stopped unexpectedly</h2>
      <p>
        {message} This is the sample
        workspace — nothing was lost, and reloading restores it.
      </p>
      <button type="button" className="btn btn-primary" onClick={resetErrorBoundary}>
        <CircleAlert size={16} />
        Try again
      </button>
    </div>
  );
}
