"use client";

/* ============================================================
   UpcomingMeetingsCard — a week strip with the day's agenda

   The advisor's question here is "what's my week look like, and
   what's next?" A seven-day strip answers the first at a glance
   (a dot per meeting, up to three); the agenda under it answers
   the second for the selected day.

   A week, not a month, on purpose: a month grid answered the same
   question in roughly twice the height, and this card sits in a
   three-up row where the tallest card sets the height of all three.

   One surface, no nested boxes. Dates come from meeting-calendar.ts,
   which parses the pipeline's human labels into real date-times —
   the old card hardcoded a date and showed only Today and Tomorrow,
   so half the scheduled meetings never appeared.
   ============================================================ */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/fincaree/avatar";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES, PipelineLead } from "./pipeline-data";
import {
  PIPELINE_TODAY,
  addDays,
  dayShort,
  formatTime,
  isSameDay,
  meetingsOn,
  nextMeetingAfter,
  weekDays,
  weekRangeLabel,
  weekdayShort,
} from "./meeting-calendar";

const MAX_DOTS = 3;

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const stageTitle = (id: string) => PIPELINE_STAGES.find((s) => s.id === id)?.title ?? id;

/** "Today · Tue 16 Sep", "Tomorrow · Wed 17 Sep", else just "Fri 19 Sep". */
function agendaTitle(d: Date): { lead: string | null; date: string } {
  const lead = isSameDay(d, PIPELINE_TODAY) ? "Today" : isSameDay(d, addDays(PIPELINE_TODAY, 1)) ? "Tomorrow" : null;
  return { lead, date: dayShort(d) };
}

interface UpcomingMeetingsCardProps {
  onOpenLead: (lead: PipelineLead) => void;
}

export function UpcomingMeetingsCard({ onOpenLead }: UpcomingMeetingsCardProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Date>(PIPELINE_TODAY);

  const days = weekDays(selected);
  const dayMeetings = meetingsOn(selected);
  const upcoming = nextMeetingAfter(selected);
  const title = agendaTitle(selected);
  const atToday = isSameDay(selected, PIPELINE_TODAY);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Upcoming Meetings</h2>
        <button
          type="button"
          onClick={() => router.push("/meetings")}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline shrink-0"
        >
          View all meetings <ArrowRight size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Week navigation — moving a week keeps the same weekday selected */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--text-secondary)] tabular-nums" aria-live="polite">
          {weekRangeLabel(selected)}
        </p>
        <div className="flex items-center gap-0.5">
          {!atToday && (
            <button
              type="button"
              onClick={() => setSelected(PIPELINE_TODAY)}
              className="mr-1 px-2 h-6 rounded-[var(--radius-md)] text-xs font-semibold text-[var(--text-brand-primary)] hover:bg-[var(--bg-brand-subtle)] transition-colors"
            >
              Today
            </button>
          )}
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => setSelected(addDays(selected, -7))}
            className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => setSelected(addDays(selected, 7))}
            className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Week strip */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const count = meetingsOn(date).length;
          const isSel = isSameDay(date, selected);
          const isToday = isSameDay(date, PIPELINE_TODAY);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelected(date)}
              aria-label={`${dayShort(date)}${count ? `, ${count} meeting${count === 1 ? "" : "s"}` : ""}`}
              aria-pressed={isSel}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "flex flex-col items-center py-1.5 rounded-[var(--radius-md)] transition-colors",
                isSel
                  ? "bg-[var(--bg-brand-primary)] text-white"
                  : cn("hover:bg-[var(--bg-secondary)]", isToday && "ring-1 ring-inset ring-[var(--border-brand-primary)]")
              )}
            >
              <span className={cn("text-xs font-medium", isSel ? "text-white" : "text-[var(--text-tertiary)]")}>{weekdayShort(date)}</span>
              <span
                className={cn(
                  "mt-0.5 text-sm leading-5 tabular-nums",
                  isSel ? "font-semibold text-white" : isToday ? "font-bold text-[var(--text-brand-primary)]" : "font-medium text-[var(--text-primary)]"
                )}
              >
                {date.getDate()}
              </span>
              {/* Reserve the dot row on every day so the strip never shifts. */}
              <span className="mt-1 flex h-1 items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: Math.min(count, MAX_DOTS) }).map((_, i) => (
                  <span key={i} className={cn("w-1 h-1 rounded-full", isSel ? "bg-white" : "bg-[var(--bg-brand-primary)]")} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Agenda for the selected day — plain rows under a hairline */}
      <div className="mt-3 pt-3 border-t border-[var(--border-tertiary)] flex-1 flex flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {title.lead ? (
              <>
                {title.lead} <span className="font-normal text-[var(--text-tertiary)]">· {title.date}</span>
              </>
            ) : (
              title.date
            )}
          </p>
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
            {dayMeetings.length > 0 ? `${dayMeetings.length} meeting${dayMeetings.length === 1 ? "" : "s"}` : "Free"}
          </span>
        </div>

        {dayMeetings.length > 0 ? (
          <ul className="mt-1.5 -mx-2">
            {dayMeetings.map(({ lead, start }) => (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => onOpenLead(lead)}
                  className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-[var(--radius-md)] text-left hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <span className="w-16 shrink-0 text-xs font-medium tabular-nums text-[var(--text-secondary)]">{formatTime(start)}</span>
                  <Avatar size="xs" initials={initialsOf(lead.name)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--text-primary)] truncate">{lead.name}</span>
                    <span className="block text-xs text-[var(--text-tertiary)] truncate">
                      {stageTitle(lead.stage)} · {lead.goal}
                    </span>
                  </span>
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-[var(--icon-tertiary)] group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-[var(--text-secondary)]">No meetings on {title.date}.</p>
            {upcoming ? (
              <button
                type="button"
                onClick={() => setSelected(upcoming.start)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
              >
                Next: {dayShort(upcoming.start)} · {formatTime(upcoming.start)} <ArrowRight size={12} strokeWidth={2} />
              </button>
            ) : (
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Nothing else is scheduled.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
