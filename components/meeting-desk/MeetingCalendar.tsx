"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/fincaree/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MeetingRecord,
  MEETING_STAGES,
  MEETINGS_TODAY,
  STATUS_LABELS,
  stageForStatus,
} from "./data";

/* ============================================================
   Meeting Calendar — month view for /meetings
   The third view beside Board and List. Each meeting is a chip on
   its day, edged in its stage colour (the same accents as the Board
   columns) and opens the same detail drawer. Month, not week: most
   meetings don't have a confirmed time yet, so hourly slots would be
   mostly empty — those show "Time TBC".
   ============================================================ */

interface MeetingCalendarProps {
  meetings: MeetingRecord[];
  onMeetingClick: (meeting: MeetingRecord) => void;
}

const WEEKDAYS = [
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Thu", long: "Thursday" },
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
  { short: "Sun", long: "Sunday" },
];

/** Chips shown per day before "+N more". */
const VISIBLE_PER_DAY = 3;

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthLabel = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const fullDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** "10:30 AM", or null when no time is set (stored as midnight). */
function timeOf(iso: string): string | null {
  if (iso.slice(11, 16) === "00:00") return null;
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
}

/** Monday-first weeks covering the month, padded with the adjacent months' days. */
function monthGrid(year: number, month: number): Date[][] {
  const mondayIndex = (d: Date) => (d.getDay() + 6) % 7; // Mon 0 … Sun 6
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - mondayIndex(first));
  const days = mondayIndex(first) + last.getDate() + (6 - mondayIndex(last));
  const weeks: Date[][] = [];
  for (let i = 0; i < days; i++) {
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return weeks;
}

export function MeetingCalendar({ meetings, onMeetingClick }: MeetingCalendarProps) {
  const today = useMemo(() => new Date(`${MEETINGS_TODAY}T00:00:00`), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const weeks = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);

  /* Meetings by day: timed first in time order, then those without a time. */
  const byDay = useMemo(() => {
    const map = new Map<string, MeetingRecord[]>();
    for (const m of meetings) {
      const key = m.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    /* Plain string comparison of ISO timestamps; untimed meetings sort last. */
    const sortKey = (m: MeetingRecord) => (timeOf(m.date) ? m.date : "\uffff");
    for (const list of map.values())
      list.sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));
    return map;
  }, [meetings]);

  const inMonth = meetings.filter((m) => {
    const d = new Date(m.date);
    return d.getFullYear() === cursor.year && d.getMonth() === cursor.month;
  });
  const stageCounts = MEETING_STAGES.map((s) => ({
    ...s,
    count: inMonth.filter((m) => stageForStatus(m.status) === s.id).length,
  }));

  const step = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setExpanded(new Set());
  };
  const isThisMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();
  /** Weekday column holding today (Mon 0 … Sun 6), when today is in view. */
  const todayColumn = isThisMonth ? (today.getDay() + 6) % 7 : -1;
  const title = monthLabel(cursor.year, cursor.month);

  return (
    /* `relative` keeps the visually hidden (position:absolute) date labels
       inside the page's scroll area; without a positioned ancestor they're
       placed against the viewport and stretch the document below the app. */
    <section
      aria-label="Meeting calendar"
      className="relative rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)]"
    >
      {/* ── Header: month, navigation, legend ── */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--border-tertiary)]">
        <div className="flex items-center gap-1">
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            aria-label="Previous month"
            leadingIcon={<ChevronLeft size={16} strokeWidth={1.75} />}
            onClick={() => step(-1)}
          />
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            aria-label="Next month"
            leadingIcon={<ChevronRight size={16} strokeWidth={1.75} />}
            onClick={() => step(1)}
          />
        </div>
        <h2 aria-live="polite" className="text-base font-semibold text-[var(--text-primary)] min-w-[140px]">
          {title}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          disabled={isThisMonth}
          onClick={() => {
            setCursor({ year: today.getFullYear(), month: today.getMonth() });
            setExpanded(new Set());
          }}
        >
          Today
        </Button>

        <ul aria-label="Stages this month" className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          {stageCounts.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.accent }} />
              {s.label}
              <span className="font-semibold tabular-nums text-[var(--text-tertiary)]">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Month grid ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <caption className="sr-only">Meetings in {title}</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d, i) => (
                <th
                  key={d.short}
                  scope="col"
                  abbr={d.long}
                  className={cn(
                    "px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider border-b border-[var(--border-tertiary)]",
                    i === todayColumn ? "text-[var(--text-brand-primary)]" : "text-[var(--text-tertiary)]",
                  )}
                >
                  {d.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={dayKey(week[0])}>
                {week.map((d) => {
                  const key = dayKey(d);
                  const outside = d.getMonth() !== cursor.month;
                  const isToday = key === dayKey(today);
                  const list = byDay.get(key) ?? [];
                  const open = expanded.has(key);
                  const shown = open ? list : list.slice(0, VISIBLE_PER_DAY);
                  const hidden = list.length - shown.length;

                  return (
                    <td
                      key={key}
                      aria-current={isToday ? "date" : undefined}
                      className={cn(
                        "align-top h-[124px] p-1.5 border-b border-r last:border-r-0 border-[var(--border-tertiary)]",
                        /* Today: a light brand tint with a 3px brand bar along
                           the top — clear at a glance without boxing the cell. */
                        isToday &&
                          "bg-[var(--bg-brand-subtle)] shadow-[inset_0_3px_0_0_var(--border-brand-primary)]",
                      )}
                    >
                      <div className="flex items-center gap-1.5 px-0.5 mb-1">
                        <time
                          dateTime={key}
                          className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold tabular-nums",
                            isToday
                              ? "bg-[var(--bg-brand-primary)] text-[var(--text-on-brand-primary)]"
                              : outside
                                ? "text-[var(--text-tertiary)] font-normal"
                                : "text-[var(--text-secondary)]",
                          )}
                        >
                          <span aria-hidden="true">{d.getDate()}</span>
                          <span className="sr-only">
                            {fullDate(d)}
                            {isToday ? ", today" : ""}
                            {list.length ? `, ${list.length} meeting${list.length === 1 ? "" : "s"}` : ""}
                          </span>
                        </time>
                        {isToday && (
                          <span aria-hidden="true" className="text-xs font-semibold text-[var(--text-brand-primary)]">
                            Today
                          </span>
                        )}
                      </div>

                      <ul className="flex flex-col gap-1">
                        {shown.map((m) => {
                          const stage = MEETING_STAGES.find((s) => s.id === stageForStatus(m.status))!;
                          const time = timeOf(m.date);
                          const cancelled = m.status === "cancelled";
                          return (
                            <li key={m.id}>
                              <button
                                type="button"
                                onClick={() => onMeetingClick(m)}
                                aria-label={`${m.meetingType} with ${m.client.name}, ${time ?? "time to be confirmed"}, ${m.duration}, ${m.mode}, ${STATUS_LABELS[m.status]}`}
                                title={`${m.client.name} · ${m.meetingType} · ${STATUS_LABELS[m.status]}`}
                                className="w-full flex flex-col items-start rounded-[var(--radius-sm)] border border-[var(--border-tertiary)] border-l-[3px] bg-[var(--bg-primary)] px-1.5 py-1 text-left hover:bg-[var(--bg-secondary)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--focus-ring-border-primary)] transition-colors"
                                style={{ borderLeftColor: stage.accent }}
                              >
                                <span
                                  className={cn(
                                    "w-full truncate text-xs font-semibold text-[var(--text-primary)]",
                                    cancelled && "line-through text-[var(--text-tertiary)]",
                                  )}
                                >
                                  {m.client.name}
                                </span>
                                <span className="w-full truncate text-[11px] text-[var(--text-tertiary)] tabular-nums">
                                  {time ?? "Time TBC"} · {m.meetingType}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {hidden > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpanded((prev) => new Set(prev).add(key))}
                          className="mt-1 px-1 text-[11px] font-semibold text-[var(--text-brand-primary)] hover:underline"
                        >
                          +{hidden} more
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inMonth.length === 0 && (
        <p className="px-4 py-3 text-xs text-[var(--text-tertiary)] border-t border-[var(--border-tertiary)]">
          No meetings in {title} match the current filters.
        </p>
      )}
    </section>
  );
}
