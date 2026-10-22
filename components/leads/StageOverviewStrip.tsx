"use client";

import { COLUMNS, BoardColumn } from "./PipelineBoard";
import { PipelineLead } from "./pipeline-data";
import { cn } from "@/lib/utils";

/* ============================================================
   Stage Overview Strip — the whole pipeline in one row, so the
   advisor sees where leads are bunching up without scrolling the
   board sideways. One tile per board column: how many leads, and
   the one thing in that stage worth a glance. Counts come from the
   same filtered list the board shows, so they always agree. A tile
   jumps to its column.
   ============================================================ */

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The single line of urgency under a stage's count, or null when there is none. */
function urgency(col: BoardColumn, leads: PipelineLead[]): { text: string; warn?: boolean } | null {
  const n = leads.length;
  if (n === 0) return null;
  switch (col.key) {
    case "new": {
      const waiting = leads.filter((l) => l.stage === "suggested").length;
      return waiting > 0 ? { text: `${waiting} waiting for you`, warn: true } : null;
    }
    case "discovery-call": {
      const today = leads.filter((l) => l.meetingLabel?.startsWith("Today")).length;
      return today > 0 ? { text: `${today} today` } : null;
    }
    case "plan-discussion": {
      const week = leads.filter((l) => l.meetingThisWeek).length;
      return week > 0 ? { text: `${week} this week` } : null;
    }
    case "ready-for-advice": {
      const hot = leads.filter((l) => l.highIntent).length;
      return hot > 0 ? { text: `${hot} high intent` } : null;
    }
    default: {
      const stale = leads.filter((l) => l.lastActivitySort >= 5).length;
      return stale > 0 ? { text: `${stale} stale · 5+ days`, warn: true } : null;
    }
  }
}

interface StageOverviewStripProps {
  leads: PipelineLead[];
  onSelect: (columnKey: string) => void;
}

export function StageOverviewStrip({ leads, onSelect }: StageOverviewStripProps) {
  return (
    <section aria-label="Pipeline overview">
      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {COLUMNS.map((col, i) => {
          const inCol = leads.filter((l) => col.stageIds.includes(l.stage));
          const note = urgency(col, inCol);
          return (
            <li key={col.key}>
              <button
                type="button"
                onClick={() => onSelect(col.key)}
                aria-label={`${col.title}: ${plural(inCol.length, "lead")}${note ? `, ${note.text}` : ""}. Go to column`}
                className={cn(
                  "w-full h-full text-left rounded-[var(--radius-xl)] bg-[var(--bg-primary)]",
                  "border border-[var(--border-tertiary)] px-3 py-2.5",
                  "transition-colors hover:bg-[var(--bg-subtle)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)]"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white leading-none"
                    style={{ backgroundColor: col.accent }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)] truncate">{col.title}</span>
                </span>
                <span className="block mt-1 text-xl font-bold text-[var(--text-primary)] leading-tight tabular-nums">
                  {inCol.length}
                </span>
                <span
                  className={cn(
                    "block text-[12px] leading-snug truncate min-h-[1.25em]",
                    note?.warn ? "text-[var(--text-status-warning)] font-medium" : "text-[var(--text-tertiary)]"
                  )}
                >
                  {note?.text ?? " "}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
