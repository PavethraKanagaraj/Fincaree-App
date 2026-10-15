"use client";

import { Button } from "@/components/fincaree/button";
import { SIMULATION_RECORDS, AVAILABLE_SIMULATORS } from "./journey.data";
import { Calculator } from "lucide-react";

export function SimulationsTab() {
  if (SIMULATION_RECORDS.length === 0) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-tertiary)] bg-[var(--bg-tertiary)]/50 p-6">
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-3">No simulations run yet</h2>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIMULATORS.map((s) => (
            <Button key={s} variant="secondary" size="sm">Run {s}</Button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Simulation History</h2>
      </div>
      <div className="divide-y divide-[var(--border-tertiary)]">
        {SIMULATION_RECORDS.map((s) => (
          <div key={s.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{s.type}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{s.date} · Run by {s.runBy}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
              <div>
                <div className="text-[var(--text-tertiary)] mb-0.5">Key inputs</div>
                <div className="text-[var(--text-primary)] font-medium">{s.keyInputs}</div>
              </div>
              <div>
                <div className="text-[var(--text-tertiary)] mb-0.5">Key output</div>
                <div className="text-[var(--text-primary)] font-medium">{s.keyOutput}</div>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-quaternary)] mb-3">
              {s.relatedGoal} · {s.relatedMeeting}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="tertiary" size="sm">View Full Results</Button>
              <Button variant="tertiary" size="sm">Re-run with Updated Data</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
