"use client";

/* ============================================================
   Today's Focus — what deserves attention today, not a backlog.

   Sits beside the calendar and the Finny brief so the advisor opens
   the page to a decision, not a dashboard.

   Two separate actions per row, deliberately:
     · the checkbox marks the task done (and moves the progress)
     · the row itself takes you to the leads it's about, by scoping
       the pipeline below to exactly those leads
   Ticking a task must never navigate, and navigating must never tick
   it, so they are two controls rather than one row that does both.

   Every number and name is derived — see todays-focus-data.ts.
   Done state is local to the session; it is not persisted.
   ============================================================ */

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/fincaree/checkbox";
import { cn } from "@/lib/utils";
import { FOCUS_TASKS, FocusFilter } from "./todays-focus-data";

interface TodaysFocusProps {
  /** Scope the pipeline to a task's leads. */
  onSelect: (filter: FocusFilter) => void;
}

export function TodaysFocus({ onSelect }: TodaysFocusProps) {
  const [done, setDone] = useState<Set<FocusFilter>>(new Set());
  const total = FOCUS_TASKS.length;
  const pct = total === 0 ? 0 : Math.round((done.size / total) * 100);

  function toggle(id: FocusFilter) {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Today&apos;s Focus</h2>
        <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums shrink-0" aria-live="polite">
          {done.size} of {total} done
        </span>
      </div>

      <div
        className="mt-2.5 h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done.size}
        aria-label="Tasks completed today"
      >
        <div className="h-full rounded-full bg-[var(--bg-brand-primary)] transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Nothing needs your attention today.</p>
      ) : (
        <ul className="mt-2 flex-1 divide-y divide-[var(--border-tertiary)]">
          {FOCUS_TASKS.map((task) => {
            const isDone = done.has(task.id);
            return (
              <li key={task.id} className="flex items-start gap-3 py-3">
                <Checkbox
                  size="sm"
                  checked={isDone}
                  onChange={() => toggle(task.id)}
                  aria-label={`Mark done: ${task.title}`}
                  className="mt-0.5"
                />
                <button
                  type="button"
                  onClick={() => onSelect(task.id)}
                  className="group flex-1 min-w-0 flex items-center gap-2 text-left"
                  aria-label={`${task.title} — show these leads`}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-medium leading-snug transition-colors",
                        isDone ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)] group-hover:text-[var(--text-brand-primary)]"
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--text-tertiary)] truncate">{task.context}</span>
                  </span>
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-[var(--icon-tertiary)] group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2 pt-3 border-t border-[var(--border-tertiary)] text-xs text-[var(--text-tertiary)]">
        Select a task to filter the pipeline below.
      </p>
    </section>
  );
}
