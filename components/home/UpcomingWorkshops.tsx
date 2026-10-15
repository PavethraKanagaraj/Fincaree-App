"use client";

/* ============================================================
   UpcomingWorkshops — workshops from the Content Management
   library (CONTENT_ITEMS) that haven't finished running yet.
   Enrollment is engagement.assignedCount, and "materials
   preparation status" is the real compliance-review status Finny
   already tracks on every piece of content — reused, not invented.
   ============================================================ */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge, type BadgeColor } from "@/components/fincaree/badge";
import { buttonVariants } from "@/components/fincaree/button";
import { Users } from "lucide-react";
import { COMPLIANCE_STATUS_LABEL, type ComplianceStatus } from "@/components/client-suggestions/content-data";
import { UPCOMING_WORKSHOPS } from "./home-data";

const PREP_COLOR: Record<ComplianceStatus, BadgeColor> = {
  "not-reviewed": "gray",
  "ai-review-complete": "brand",
  "advisor-review-required": "warning",
  "changes-required": "error",
  "approved-for-use": "success",
};

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
          {UPCOMING_WORKSHOPS.map((w) => (
            <div key={w.id} className="py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">{w.title}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {w.scheduledFor ?? "Date to be confirmed"}
                    {w.venue ? ` · ${w.venue}` : w.location ? ` · ${w.location}` : ""}
                  </div>
                </div>
                <Badge size="sm" color={PREP_COLOR[w.compliance.status]} className="shrink-0">
                  {COMPLIANCE_STATUS_LABEL[w.compliance.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--text-tertiary)]">
                <Users size={12} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
                {w.engagement.assignedCount} enrolled{w.capacity ? ` of ${w.capacity}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
