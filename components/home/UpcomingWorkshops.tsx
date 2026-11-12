"use client";

/* ============================================================
   UpcomingWorkshops — workshops from the Content Management
   library (CONTENT_ITEMS) that haven't finished running yet.
   Each row leads with what the advisor plans around: the date, the
   time and place, and how full the session is (engagement.assignedCount
   against capacity). The compliance status is left to Content Management.
   ============================================================ */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/fincaree/button";
import { ArrowRight, Clock, MapPin, Video } from "lucide-react";
import { UPCOMING_WORKSHOPS } from "./home-data";

/** "04 Oct 2026 · 6:00 PM" → the pieces the row shows big. */
function whenParts(scheduledFor?: string) {
  const [datePart = "", time = ""] = (scheduledFor ?? "").split(" · ");
  const m = datePart.match(/^(\d{1,2}) ([A-Za-z]{3})/);
  return { day: m?.[1] ?? "", month: m?.[2] ?? "", time };
}

export function UpcomingWorkshops() {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-base font-semibold text-[var(--text-primary)]">Upcoming Workshops</span>
        <Link href="/content-management" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">View All</span>
          </span>
        </Link>
      </div>

      {UPCOMING_WORKSHOPS.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">No workshops scheduled.</p>
      ) : (
        <div className="divide-y divide-[var(--border-tertiary)]">
          {UPCOMING_WORKSHOPS.map((w) => {
            const { day, month, time } = whenParts(w.scheduledFor);
            const enrolled = w.engagement.assignedCount;
            const fill = w.capacity ? Math.min(100, Math.round((enrolled / w.capacity) * 100)) : null;
            const place = w.mode === "online" ? "Online" : (w.venue ?? w.location ?? "Venue to be confirmed");
            return (
              <Link
                key={w.id}
                href={`/content-management?open=${w.id}`}
                aria-label={`Open ${w.title}`}
                className={cn(
                  "group relative flex items-center gap-4 py-4 outline-none",
                  /* The hover is a light wash on a layer behind the row. The row itself never changes size,
                     the dividers stay straight, and the tile and bar below switch to white so they keep
                     their contrast against it. */
                  "before:pointer-events-none before:absolute before:inset-y-0 before:-inset-x-2 before:rounded-[var(--radius-lg)]",
                  "before:bg-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)] before:opacity-0",
                  "before:transition-opacity before:duration-150 before:ease-out motion-reduce:before:transition-none",
                  "hover:before:opacity-100 focus-visible:before:opacity-100",
                  "focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)] focus-visible:ring-offset-2"
                )}
              >
                {/* Date first: it is what the advisor plans around. */}
                <div className="relative w-14 shrink-0 rounded-[var(--radius-lg)] border border-transparent bg-[var(--bg-brand-subtle)] py-2 text-center leading-none transition-colors duration-150 group-hover:border-[var(--border-brand-secondary)] group-hover:bg-[var(--bg-primary)] motion-reduce:transition-none">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-brand-primary)]">{month || "TBC"}</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-[var(--text-primary)]">{day || "—"}</div>
                </div>

                <div className="relative min-w-0 flex-1">
                  <div className="text-base font-semibold text-[var(--text-primary)] truncate transition-colors duration-150 group-hover:text-[var(--text-brand-primary)] motion-reduce:transition-none">{w.title}</div>
                  <div className="mt-1 flex items-center gap-x-4 gap-y-0.5 flex-wrap text-sm text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
                      {time || "Time to be confirmed"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      {w.mode === "online" ? (
                        <Video size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
                      ) : (
                        <MapPin size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
                      )}
                      <span className="truncate">{place}</span>
                    </span>
                  </div>
                </div>

                {/* Enrolment: the number that says whether the session will fill. */}
                <div className="relative w-28 shrink-0 text-right">
                  <div className="tabular-nums leading-none">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{enrolled}</span>
                    {w.capacity && <span className="text-sm text-[var(--text-tertiary)]"> / {w.capacity}</span>}
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-tertiary)]">enrolled</div>
                  {fill !== null && (
                    <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden transition-colors duration-150 group-hover:bg-[var(--bg-primary)] motion-reduce:transition-none" role="img" aria-label={`${fill}% of places taken`}>
                      <div className="fc-grow h-full rounded-full bg-[var(--icon-brand-primary)]" style={{ width: `${fill}%`, ["--rise-i" as string]: 1 }} />
                    </div>
                  )}
                </div>

                <ArrowRight size={18} strokeWidth={1.75} className="relative shrink-0 text-[var(--icon-tertiary)] transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--icon-brand-primary)] motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
