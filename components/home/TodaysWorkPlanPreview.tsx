"use client";

/* ============================================================
   TodaysWorkPlanPreview — a read-only look at the top of the
   same Work Plan the Reports page builds (workPlanReports):
   my-queue reports, urgency-sorted, with the real planReason and
   estimateMinutes the full page uses. Reordering/drag-and-drop
   stays on /reports — Home only launches into it.
   ============================================================ */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/fincaree/button";
import { planReason, estimateMinutes, formatMinutes } from "@/components/report-queue/data";
import { TODAYS_WORK_PLAN } from "./home-data";

export function TodaysWorkPlanPreview() {
  const totalMinutes = TODAYS_WORK_PLAN.reduce((sum, r) => sum + estimateMinutes(r), 0);

  return (
    <section id="todays-work-plan" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 scroll-mt-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-base font-semibold text-[var(--text-primary)]">Today&apos;s Work Plan</span>
        <Link href="/reports" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">Open Work Plan</span>
          </span>
        </Link>
      </div>

      {TODAYS_WORK_PLAN.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">Nothing in your queue — enjoy the clear day.</p>
      ) : (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-1.5">
            {TODAYS_WORK_PLAN.length} report{TODAYS_WORK_PLAN.length === 1 ? "" : "s"} · {formatMinutes(totalMinutes)} total
          </p>
          <ol className="divide-y divide-[var(--border-tertiary)]">
            {TODAYS_WORK_PLAN.map((r, i) => (
              <li key={r.id} className="flex items-start gap-2.5 py-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">{r.reportName}</div>
                  <div className="text-xs text-[var(--text-tertiary)] truncate">
                    {r.client.name} · {planReason(r)}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-tertiary)] shrink-0 tabular-nums mt-0.5">
                  {formatMinutes(estimateMinutes(r))}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
