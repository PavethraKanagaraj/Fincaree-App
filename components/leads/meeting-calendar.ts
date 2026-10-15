/* ============================================================
   Lead meetings as real dates

   The pipeline data labels meetings for humans: "Today, 11:00 AM",
   "Tomorrow, 10:00 AM", "Fri, 19 Sep · 9:30 AM". A calendar can't be
   built on labels, so they're parsed once into actual date-times.

   The prototype's "today" is a single fixed anchor. It has to be
   Tuesday 16 Sep 2025: that is the only day for which every
   absolute label's weekday (Fri 19, Mon 22, Wed 24, Thu 25 Sep) is
   correct. The card used to hardcode "Mon, 16 Sep", which was a
   Tuesday in 2025 and contradicted the rest of the data.

   All arithmetic is on local calendar dates (year, month, day) with
   no time-zone conversion, so a meeting never slides to the wrong
   day for someone in another zone.
   ============================================================ */

import { PIPELINE_LEADS, PipelineLead, PipelineStageId } from "./pipeline-data";

export const PIPELINE_TODAY = new Date(2025, 8, 16); // Tue 16 Sep 2025

const MEETING_STAGES: PipelineStageId[] = ["discovery-call", "plan-discussion"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const weekdayShort = (d: Date) => WEEKDAYS[d.getDay()];
export const dayShort = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

export type DayKey = string;
export const dayKey = (d: Date): DayKey =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const isSameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

export function formatTime(d: Date): string {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

function parseClock(t: string): { h: number; m: number } | null {
  const x = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!x) return null;
  return { h: (parseInt(x[1]!, 10) % 12) + (x[3]!.toUpperCase() === "PM" ? 12 : 0), m: parseInt(x[2]!, 10) };
}

/** "Today, 11:00 AM" · "Tomorrow, 10:00 AM" · "Fri, 19 Sep · 9:30 AM" → a Date.
    Returns null for anything it can't read, or whose stated weekday
    disagrees with the date — a mismatch means the data is wrong, and a
    calendar should not quietly place a meeting on a day it isn't. */
export function parseMeetingStart(label: string, today: Date = PIPELINE_TODAY): Date | null {
  const rel = label.match(/^(Today|Tomorrow),\s*(.+)$/);
  if (rel) {
    const clock = parseClock(rel[2]!);
    if (!clock) return null;
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + (rel[1] === "Tomorrow" ? 1 : 0), clock.h, clock.m);
  }
  const abs = label.match(/^(\w{3}),\s*(\d{1,2})\s+(\w{3})\s*·\s*(.+)$/);
  if (abs) {
    const month = MONTHS.indexOf(abs[3]!);
    const clock = parseClock(abs[4]!);
    if (month < 0 || !clock) return null;
    const d = new Date(today.getFullYear(), month, parseInt(abs[2]!, 10), clock.h, clock.m);
    return WEEKDAYS[d.getDay()] === abs[1] ? d : null;
  }
  return null;
}

export interface LeadMeeting {
  lead: PipelineLead;
  start: Date;
}

/** Every lead with a scheduled touchpoint, earliest first. */
export const LEAD_MEETINGS: LeadMeeting[] = PIPELINE_LEADS.flatMap((lead) => {
  if (!MEETING_STAGES.includes(lead.stage) || !lead.meetingLabel) return [];
  const start = parseMeetingStart(lead.meetingLabel);
  return start ? [{ lead, start }] : [];
}).sort((a, b) => a.start.getTime() - b.start.getTime());

const BY_DAY = new Map<DayKey, LeadMeeting[]>();
for (const m of LEAD_MEETINGS) {
  const k = dayKey(m.start);
  BY_DAY.set(k, [...(BY_DAY.get(k) ?? []), m]);
}

export const meetingsOn = (d: Date): LeadMeeting[] => BY_DAY.get(dayKey(d)) ?? [];

/** The first meeting on a day after `d` — used to answer "nothing today,
    so what's next?" instead of leaving an empty state with no way out. */
export function nextMeetingAfter(d: Date): LeadMeeting | null {
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  return LEAD_MEETINGS.find((m) => m.start.getTime() >= end) ?? null;
}

/** Monday of the week containing `d` (weeks run Mon–Sun). */
export const startOfWeek = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** The seven days of the week containing `d`. */
export const weekDays = (d: Date): Date[] => {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/** "15 – 21 Sep 2025", or "29 Sep – 5 Oct 2025" when the week straddles a month. */
export function weekRangeLabel(d: Date): string {
  const days = weekDays(d);
  const first = days[0]!, last = days[6]!;
  const year = last.getFullYear();
  return first.getMonth() === last.getMonth()
    ? `${first.getDate()} – ${last.getDate()} ${MONTHS[last.getMonth()]} ${year}`
    : `${first.getDate()} ${MONTHS[first.getMonth()]} – ${last.getDate()} ${MONTHS[last.getMonth()]} ${year}`;
}
