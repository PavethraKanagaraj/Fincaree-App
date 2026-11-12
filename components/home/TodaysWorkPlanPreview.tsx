"use client";

/* ============================================================
   TodaysWorkPlanPreview — the advisor's whole day, not just reports.

   Each line is one kind of work, read from the place it lives:
   reports to write, client queries to answer, content to finish and
   send for compliance, Finny's suggested sends to approve, and leads
   to follow up. Urgent work comes first. Every line opens the page
   where that work is done; reordering and the full report plan stay
   on /reports.
   ============================================================ */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/fincaree/button";
import { formatMinutes } from "@/components/report-queue/data";
import { ChevronRight, FileText, MessageSquare, Send, ShieldCheck, Users } from "lucide-react";
import { HOME_WORK_PLAN, type WorkKind } from "./home-data";

const KIND: Record<WorkKind, { icon: React.ReactNode; label: string }> = {
  report: { icon: <FileText size={16} strokeWidth={1.75} />, label: "Report" },
  queries: { icon: <MessageSquare size={16} strokeWidth={1.75} />, label: "Queries" },
  compliance: { icon: <ShieldCheck size={16} strokeWidth={1.75} />, label: "Compliance" },
  send: { icon: <Send size={16} strokeWidth={1.75} />, label: "Send" },
  leads: { icon: <Users size={16} strokeWidth={1.75} />, label: "Leads" },
};

export function TodaysWorkPlanPreview() {
  const totalMinutes = HOME_WORK_PLAN.reduce((sum, w) => sum + w.minutes, 0);

  return (
    <section id="todays-work-plan" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 scroll-mt-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-base font-semibold text-[var(--text-primary)]">Today&apos;s Tasks</span>
        <Link href="/reports" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">Open report plan</span>
          </span>
        </Link>
      </div>

      {HOME_WORK_PLAN.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">Nothing in your plan. Enjoy the clear day.</p>
      ) : (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">
            {HOME_WORK_PLAN.length} task{HOME_WORK_PLAN.length === 1 ? "" : "s"} · {formatMinutes(totalMinutes)} total
          </p>
          <ol className="divide-y divide-[var(--border-tertiary)]">
            {HOME_WORK_PLAN.map((w) => (
              <li key={w.id}>
                <Link
                  href={w.href}
                  className={cn(
                    "group relative flex items-center gap-3.5 py-3.5 outline-none",
                    /* A pale wash behind the row on hover; nothing moves and the dividers stay straight. */
                    "before:pointer-events-none before:absolute before:inset-y-0 before:-inset-x-2 before:rounded-[var(--radius-lg)]",
                    "before:bg-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)] before:opacity-0",
                    "before:transition-opacity before:duration-150 before:ease-out motion-reduce:before:transition-none",
                    "hover:before:opacity-100 focus-visible:before:opacity-100",
                    "focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)] focus-visible:ring-offset-2"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
                      w.urgent ? "bg-[var(--bg-status-warning-subtle)] text-[var(--icon-status-warning)]" : "bg-[var(--bg-secondary)] text-[var(--icon-tertiary)]"
                    )}
                    aria-hidden="true"
                  >
                    {KIND[w.kind].icon}
                  </span>
                  <div className="relative min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate transition-colors duration-150 group-hover:text-[var(--text-brand-primary)] motion-reduce:transition-none">
                        {w.title}
                      </span>
                      {w.urgent && <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-[var(--text-status-error)]">Urgent</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--text-tertiary)] truncate">{w.detail}</div>
                  </div>
                  <span className="relative shrink-0 text-xs font-medium text-[var(--text-secondary)] tabular-nums">{formatMinutes(w.minutes)}</span>
                  <ChevronRight
                    size={16}
                    strokeWidth={1.75}
                    className="relative shrink-0 text-[var(--icon-tertiary)] transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--icon-brand-primary)] motion-reduce:transition-none motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
