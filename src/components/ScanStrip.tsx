import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { timeAgo } from "../lib";
import type { SamplePulse } from "../sample";

/**
 * Explicit scan status: idle, scanning, done, or error — separated on
 * purpose so each state reads at a glance (direction: Neighborhood Guide,
 * raised from Stagecraft).
 */
export function ScanStrip({ pulse }: { pulse: SamplePulse }) {
  const [notice, setNotice] = useState(false);

  const chip = (() => {
    if (!pulse.lastScanAt || !pulse.lastScanStatus) {
      return (
        <span className="scan-chip chip-idle">
          <span className="dot" />
          {pulse.active ? "Waiting for first scan" : "Paused — no scans"}
        </span>
      );
    }
    switch (pulse.lastScanStatus) {
      case "running":
        return (
          <span className="scan-chip chip-scanning">
            <span className="dot" />
            Scanning listings…
          </span>
        );
      case "error":
        return (
          <span className="scan-chip chip-error">
            <span className="dot" />
            Scan failed
          </span>
        );
      default:
        return (
          <span className="scan-chip chip-done">
            <span className="dot" />
            Scan done
          </span>
        );
    }
  })();

  return (
    <div className="scan-strip">
      {chip}
      {pulse.lastScanAt && (
        <span className="scan-time">{timeAgo(pulse.lastScanAt)}</span>
      )}
      {pulse.lastScanStatus === "done" && pulse.lastScanFound != null && (
        <span className="scan-time">
          {pulse.lastScanFound} seen
          {pulse.lastScanNewMatches
            ? ` · ${pulse.lastScanNewMatches} new match${pulse.lastScanNewMatches === 1 ? "" : "es"}`
            : ""}
        </span>
      )}
      {pulse.lastScanStatus === "error" && pulse.lastScanError && (
        <span className="scan-time">{pulse.lastScanError}</span>
      )}
      <span className="scan-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setNotice(true)}
        >
          <RefreshCw size={16} />
          Run scan
        </button>
      </span>
      <span
        role="status"
        aria-live="polite"
        className="scan-hint"
        style={{ visibility: notice ? "visible" : "hidden" }}
      >
        Live scans aren’t connected in this sample workspace.
      </span>
    </div>
  );
}
