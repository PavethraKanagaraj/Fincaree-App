"use client";

import { Button } from "@/components/fincaree/button";
import { computeFinnySummary, Report } from "./data";
import { Sparkles, Calendar, FileText, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { useMemo } from "react";

/* ============================================================
   Finny Queue Summary — the queue's only AI touchpoint at the
   top of the page. One line answering "what should I work on
   first," not a dashboard: a headline count, four breakdown
   stats, one CTA. No chat, no panel.
   ============================================================ */

interface FinnyQueueSummaryProps {
  reports: Report[];
  onReviewPriorities: () => void;
}

export function FinnyQueueSummary({ reports, onReviewPriorities }: FinnyQueueSummaryProps) {
  const summary = useMemo(() => computeFinnySummary(reports), [reports]);

  const stats = [
    { icon: <Calendar size={13} strokeWidth={2} />, count: summary.meetingBlockers, label: "Meeting blockers" },
    { icon: <FileText size={13} strokeWidth={2} />, count: summary.readyForReview, label: "Ready for review" },
    { icon: <AlertCircle size={13} strokeWidth={2} />, count: summary.dataIssues, label: "Data issues" },
    { icon: <ShieldAlert size={13} strokeWidth={2} />, count: summary.complianceReview, label: "Compliance review" },
  ];

  return (
    <div className="flex items-center gap-4 flex-wrap rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-brand-subtle)] px-4 py-3">
      <div className="flex items-center gap-2 shrink-0">
        <Sparkles size={15} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
        <span className="text-sm font-semibold text-[var(--text-brand-primary)]">Finny</span>
      </div>

      <div className="h-5 w-px bg-[var(--border-brand-tint)] shrink-0" />

      <span className="text-sm font-medium text-[var(--text-primary)] shrink-0">
        {summary.total} report{summary.total === 1 ? "" : "s"} need attention
      </span>

      <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
        {stats.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
            <span className="text-[var(--icon-tertiary)]">{s.icon}</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">{s.count}</span>
            {s.label}
          </span>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        trailingIcon={<ArrowRight size={12} strokeWidth={2} />}
        onClick={onReviewPriorities}
        className="shrink-0"
      >
        Review priorities
      </Button>
    </div>
  );
}
