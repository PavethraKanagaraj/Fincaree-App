"use client";

import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import {
  Report,
  ReportStatus,
  STATUS_OPTIONS,
  STATUS_LABELS,
  reportCategoryLabel,
  reviewByUrgency,
  mostSevereFlag,
} from "./data";
import { MeetingWhen } from "./MeetingWhen";
import { FlagIcon } from "./FlagIcon";
import {
  Loader2,
  FileCheck,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Send,
  Archive,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

/* ============================================================
   Report Board — same anatomy as the Lead Pipeline board: a
   soft-tinted column (no bordered box) per status, a numbered
   accent circle + title + count pill in the header, a thin accent
   bar underneath, and borderless cards whose status lives in the
   accent colour rather than a border.
   ============================================================ */

const STATUS_ACCENT: Record<ReportStatus, string> = {
  generating: "var(--color-grey-600)",
  "ai-draft-ready": "var(--bg-brand-primary)",
  "advisor-review": "var(--color-warning-700)",
  "needs-attention": "var(--color-error-500)",
  approved: "var(--color-success-700)",
  shared: "var(--icon-status-info)",
  archived: "var(--color-grey-400)",
};

const STATUS_ICON: Record<ReportStatus, LucideIcon> = {
  generating: Loader2,
  "ai-draft-ready": FileCheck,
  "advisor-review": Eye,
  "needs-attention": AlertTriangle,
  approved: CheckCircle2,
  shared: Send,
  archived: Archive,
};

const STATUS_SUBTITLE: Record<ReportStatus, string> = {
  generating: "Finny is pulling client data together",
  "ai-draft-ready": "Drafted — waiting for your first pass",
  "advisor-review": "Mid-review, not yet approved",
  "needs-attention": "Flags to resolve before it can move on",
  approved: "Signed off, ready to share",
  shared: "Delivered to the client",
  archived: "Closed out — kept for the record",
};

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function ReportBoardCard({ report, onOpen }: { report: Report; onOpen: () => void }) {
  const flag = mostSevereFlag(report.aiFlags);
  return (
    <div
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${report.reportName} for ${report.client.name}`}
      className="group relative flex flex-col rounded-[12px] overflow-hidden cursor-pointer bg-[var(--bg-primary)] border border-transparent transition-all duration-150 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)]"
    >
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar size="sm" initials={initials(report.client.name)} />
          <div className="min-w-0">
            <div className="text-sm font-bold text-[var(--text-primary)] leading-tight truncate">{report.client.name}</div>
            <div className="text-[12px] text-[var(--text-tertiary)] mt-0.5 leading-tight truncate">{reportCategoryLabel(report)}</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Body */}
      <div className="px-3.5 pt-3 pb-2.5 flex flex-col gap-2 flex-1">
        <MeetingWhen label={report.reviewBy.label} urgency={reviewByUrgency(report.reviewBy.category)} srLabel="Review by" />

        {flag && (
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <FlagIcon type={flag.type} size={12} />
            <span className="truncate">{flag.label}</span>
            {report.aiFlags.length > 1 && <span className="text-[var(--text-tertiary)] shrink-0">+{report.aiFlags.length - 1}</span>}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${report.readiness}%`,
                backgroundColor:
                  report.readiness >= 90 ? "var(--color-success-500)" : report.readiness >= 70 ? "var(--color-brand-500)" : report.readiness >= 50 ? "var(--color-warning-500)" : "var(--color-error-500)",
              }}
            />
          </div>
          <span className="text-[12px] tabular-nums text-[var(--text-tertiary)]">{report.readiness}%</span>
        </div>

        <div>
          <Badge color="gray-blue" leadingIcon="dot" size="sm">{report.client.plan}</Badge>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Footer */}
      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] min-w-0">
          <ArrowRight size={13} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0 group-hover:text-[var(--icon-brand-primary)] transition-colors" />
          <span className="truncate group-hover:text-[var(--text-primary)] transition-colors">Open report</span>
        </div>
      </div>
    </div>
  );
}

interface ReportBoardProps {
  reports: Report[];
  onOpenReport: (report: Report) => void;
}

export function ReportBoard({ reports, onOpenReport }: ReportBoardProps) {
  return (
    <div className="fc-board-scroller">
      {STATUS_OPTIONS.map((status, i) => {
        const Icon = STATUS_ICON[status];
        const columnReports = reports.filter((r) => r.status === status);
        const accent = STATUS_ACCENT[status];

        return (
          <section
            key={status}
            aria-label={STATUS_LABELS[status]}
            className="flex-1 min-w-[320px] max-w-[420px] flex flex-col rounded-[var(--radius-xl)] bg-[var(--bg-subtle)]"
          >
            <header className="px-3 pt-3 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon size={14} strokeWidth={1.75} className="shrink-0" style={{ color: accent }} aria-hidden />
                <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">{STATUS_LABELS[status]}</h2>
                <span className="ml-auto text-[12px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-full px-2 py-0.5">
                  {columnReports.length}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] leading-snug mt-1.5">{STATUS_SUBTITLE[status]}</p>
              <div className="mt-2.5 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
            </header>

            <div className="px-3 pb-3 flex flex-col gap-2.5 flex-1">
              {columnReports.length === 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] py-8 text-center text-[12px] text-[var(--text-tertiary)]">
                  No reports at this status
                </div>
              ) : (
                columnReports.map((report) => (
                  <ReportBoardCard key={report.id} report={report} onOpen={() => onOpenReport(report)} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
