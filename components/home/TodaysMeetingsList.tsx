"use client";

/* ============================================================
   TodaysMeetingsList — real MEETINGS filtered to today
   (dateLabel starting "Today", same convention MEETING_ATTENTION_
   STATS.today is built from). Opening a meeting's full context
   stays on /meetings — this is a preview, not a second drawer.
   ============================================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { buttonVariants } from "@/components/fincaree/button";
import { ChevronRight, Video, Phone, Users } from "lucide-react";
import { TODAYS_MEETINGS } from "./home-data";
import { STATUS_COLORS, STATUS_LABELS, type MeetingRecord } from "@/components/meeting-desk/data";

const MODE_ICON: Record<MeetingRecord["mode"], React.ReactNode> = {
  Video: <Video size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  "In-person": <Users size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  Phone: <Phone size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
};

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** "3:00" + "PM" → minutes since midnight. */
function minutesOfDay(clock: string, period: string): number | null {
  const m = clock.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (period.toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

/** How far off a meeting is, in a few characters: "in 2h 15m", "in 45m", "Now", "Done". */
function timeLeft(startMin: number | null, durationMin: number, nowMin: number): { text: string; soon: boolean } | null {
  if (startMin === null) return null;
  const until = startMin - nowMin;
  if (until > 0) {
    const h = Math.floor(until / 60);
    const m = until % 60;
    return { text: `in ${h > 0 ? `${h}h ` : ""}${m > 0 || h === 0 ? `${m}m` : ""}`.trim(), soon: until <= 60 };
  }
  if (nowMin < startMin + durationMin) return { text: "Now", soon: true };
  return { text: "Done", soon: false };
}

export function TodaysMeetingsList() {
  /* The clock is read after mount, so the server and the browser never disagree about it,
     and it refreshes every minute. */
  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    const read = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    read();
    const id = setInterval(read, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-base font-semibold text-[var(--text-primary)]">Today&apos;s Meetings</span>
        <Link href="/meetings" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">View schedule</span>
          </span>
        </Link>
      </div>

      {TODAYS_MEETINGS.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">No meetings scheduled for today.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {TODAYS_MEETINGS.map((m) => {
            const [clock = "", period = ""] = m.dateLabel.replace("Today ", "").split(" ");
            const left = nowMin === null ? null : timeLeft(minutesOfDay(clock, period), parseInt(m.duration, 10) || 30, nowMin);
            const done = left?.text === "Done";
            return (
              <li key={m.id}>
                <Link
                  href="/meetings"
                  className={cn(
                    "group flex items-center gap-4 rounded-[var(--radius-lg)] border px-4 py-3.5 outline-none transition-colors duration-150 motion-reduce:transition-none",
                    "focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)] focus-visible:ring-offset-2",
                    "border-[var(--border-tertiary)] bg-[var(--bg-primary)] hover:bg-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)]",
                    done && "opacity-70"
                  )}
                >
                  {/* When, as a small ticket: the time on top, how long until it underneath. */}
                  <div className="w-20 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] text-center">
                    <div className="px-1 pt-2 pb-1.5 tabular-nums whitespace-nowrap leading-none">
                      <div className="text-xl font-bold text-[var(--text-primary)]">{clock}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{period}</div>
                    </div>
                    {left && (
                      <div
                        className={cn(
                          "px-1 py-1 text-xs font-semibold tabular-nums whitespace-nowrap",
                          left.text === "Now"
                            ? "bg-[var(--bg-status-success-subtle)] text-[var(--text-status-success)]"
                            : left.soon
                              ? "bg-[var(--bg-status-warning-subtle)] text-[var(--text-status-warning)]"
                              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                        )}
                      >
                        {left.text}
                      </div>
                    )}
                  </div>

                  <Avatar size="md" initials={initials(m.client.name)} className="shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.client.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      {MODE_ICON[m.mode]}
                      <span className="truncate">
                        {m.meetingType} · {m.duration}
                      </span>
                    </div>
                  </div>

                  <Badge size="sm" color={STATUS_COLORS[m.status] ?? "gray"} leadingIcon="dot" className="shrink-0">
                    {STATUS_LABELS[m.status] ?? m.status}
                  </Badge>
                  <ChevronRight
                    size={16}
                    strokeWidth={1.75}
                    className="shrink-0 text-[var(--icon-tertiary)] transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--icon-brand-primary)] motion-reduce:transition-none motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
