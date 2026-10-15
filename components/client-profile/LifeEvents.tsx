"use client";

import { LifeEvent, Goal } from "./data";
import { PartyPopper, CalendarClock, Link2 } from "lucide-react";

/* ============================================================
   Life Events — upcoming and past milestones. Each upcoming
   event links to the goal that funds it, so "daughter's wedding,
   March 2027" and the wedding goal read as one story rather than
   two disconnected records.
   ============================================================ */

interface LifeEventsProps {
  events: LifeEvent[];
  goals: Goal[];
  onViewGoal: () => void;
}

export function LifeEvents({ events, goals, onViewGoal }: LifeEventsProps) {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  function goalName(id: string | null): string | null {
    if (!id) return null;
    return goals.find((g) => g.id === id)?.name ?? null;
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <PartyPopper size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Life Events</h2>
      </div>

      {upcoming.length > 0 && (
        <div className={past.length > 0 ? "mb-4" : ""}>
          <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Upcoming
          </div>
          <div className="space-y-2">
            {upcoming.map((event) => {
              const linkedGoal = goalName(event.relatedGoalId);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarClock size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{event.title}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{event.date}</p>
                    </div>
                  </div>
                  {linkedGoal && (
                    <button
                      type="button"
                      onClick={onViewGoal}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-brand-primary)] hover:text-[var(--color-brand-600)] transition-colors shrink-0"
                    >
                      <Link2 size={11} strokeWidth={2} />
                      {linkedGoal}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Past
          </div>
          <div className="space-y-1.5">
            {past.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-secondary)]">{event.title}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
