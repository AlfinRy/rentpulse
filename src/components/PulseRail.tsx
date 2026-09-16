import { useState, type RefObject } from "react";
import { Plus } from "lucide-react";
import type { SamplePulse } from "../sample";
import { CreatePulseForm } from "./CreatePulseForm";
import { timeAgo } from "../lib";

export function PulseRail({
  pulses,
  selectedId,
  onSelect,
  listingCounts,
  newButtonRef,
}: {
  pulses: SamplePulse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  listingCounts: Map<string, number>;
  newButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <nav className="rail" aria-label="Pulses">
      <div className="rail-heading">
        <span className="rail-title" id="pulse-dir-label">
          Pulse directory
        </span>
      </div>

      <ul className="pulse-list" aria-labelledby="pulse-dir-label">
        {pulses.map((pulse) => {
          const selected = pulse.id === selectedId;
          return (
            <li key={pulse.id}>
              <button
                type="button"
                className={`pulse-item ${pulse.active ? "is-active" : "is-paused"}`}
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(pulse.id)}
              >
                <span className="pulse-dot" aria-hidden="true" />
                <span className="pulse-body">
                  <span className="pulse-label">{pulse.label}</span>
                  <span className="pulse-city">{pulse.city}</span>
                  <span className="pulse-meta">
                    {pulse.lastScanAt ? (
                      <>
                        scanned {timeAgo(pulse.lastScanAt)}
                        {" · "}
                        <span className="count">
                          {listingCounts.get(pulse.id) ?? 0}
                        </span>{" "}
                        listings
                      </>
                    ) : (
                      <>
                        {pulse.active ? "no scan yet" : "paused"}
                        {" · "}
                        <span className="count">
                          {listingCounts.get(pulse.id) ?? 0}
                        </span>{" "}
                        listings
                      </>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="new-pulse">
        {formOpen ? (
          <CreatePulseForm
            onDone={() => setFormOpen(false)}
            onCancel={() => {
              setFormOpen(false);
              newButtonRef?.current?.focus();
            }}
          />
        ) : (
          <button
            type="button"
            ref={newButtonRef}
            className="btn btn-secondary btn-block"
            onClick={() => setFormOpen(true)}
          >
            <Plus size={16} />
            New Pulse
          </button>
        )}
      </div>
    </nav>
  );
}
