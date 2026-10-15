"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Tag } from "@/components/fincaree/tag";
import {
  MeetingRecord,
  MeetingStatus,
  StatusBadgeColor,
  STATUS_COLORS,
  STATUS_LABELS,
} from "./data";
import { Video, Phone, Users, Calendar, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

/* ============================================================
   Meeting Card — board column card. Same card anatomy as the
   Report Queue's ReportCard, adapted to meeting content.
   ============================================================ */

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function planColor(plan: string): "brand" | "warning" | "gray" {
  if (plan === "Platinum") return "brand";
  if (plan === "Gold") return "warning";
  return "gray";
}

function statusColor(status: MeetingStatus): StatusBadgeColor {
  return STATUS_COLORS[status] ?? "gray";
}

const ACCENTS: Record<StatusBadgeColor, { glow: string }> = {
  error: { glow: "rgba(220, 38, 38, 0.20)" },
  warning: { glow: "rgba(217, 119, 6, 0.20)" },
  success: { glow: "rgba(47, 125, 107, 0.20)" },
  brand: { glow: "rgba(0, 0, 0, 0.12)" },
  gray: { glow: "rgba(0, 0, 0, 0.12)" },
  "gray-blue": { glow: "rgba(0, 0, 0, 0.12)" },
};

const MODE_ICON: Record<MeetingRecord["mode"], React.ReactNode> = {
  Video: <Video size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  "In-person": <Users size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  Phone: <Phone size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
};

function dueLabel(urgency: MeetingRecord["urgency"], status: MeetingStatus): { text: string; urgent: boolean } | null {
  if (urgency === "urgent") return { text: "Today / Tomorrow", urgent: true };
  if (urgency === "soon") return { text: "Due Soon", urgent: false };
  if (status === "needs-prep") return { text: "Prep Required", urgent: true };
  return null;
}

export function MeetingCard({ meeting, onClick }: { meeting: MeetingRecord; onClick: (m: MeetingRecord) => void }) {
  const due = dueLabel(meeting.urgency, meeting.status);
  const accent = ACCENTS[statusColor(meeting.status)];
  const pendingActions = meeting.actionItems.filter((a) => a.status !== "completed").length;

  return (
    <div
      onClick={() => onClick(meeting)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(meeting);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${meeting.meetingType} for ${meeting.client.name}`}
      style={{ "--card-glow": accent.glow } as CSSProperties}
      className={cn(
        "group relative flex flex-col rounded-[12px] overflow-hidden cursor-pointer",
        "bg-[var(--bg-primary)] border border-transparent",
        "transition-all duration-150",
        "hover:shadow-[0_4px_16px_-4px_var(--card-glow)]"
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar size="md" initials={initials(meeting.client.name)} />
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-[var(--text-primary)] leading-tight truncate">
                {meeting.client.name}
              </div>
              <div className="text-[13px] text-[var(--text-tertiary)] mt-0.5 leading-tight truncate">
                {meeting.meetingType}
              </div>
            </div>
          </div>
          <Badge color={planColor(meeting.client.plan)} size="md">{meeting.client.plan}</Badge>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Body */}
      <div className="px-4 pt-3 pb-3 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
          {MODE_ICON[meeting.mode]}
          <span className="font-medium">{meeting.mode}</span>
          <span className="text-[var(--text-tertiary)]">·</span>
          <Calendar size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
          <span>{meeting.dateLabel}</span>
        </div>

        {meeting.alerts.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {meeting.alerts.slice(0, 2).map((alert, i) => (
              <Tag key={i} color="error" size="sm" icon={<AlertTriangle size={10} strokeWidth={2} />}>
                <span className="truncate max-w-[110px]">{alert}</span>
              </Tag>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Badge color={statusColor(meeting.status)} leadingIcon="dot" size="sm">
            {STATUS_LABELS[meeting.status]}
          </Badge>
          {pendingActions > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-[var(--text-brand-primary)] bg-[var(--bg-brand-subtle)]">
              {pendingActions} open action{pendingActions > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {meeting.briefPoints.length > 0 && (
          <div className="inline-flex items-start gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[var(--bg-secondary)] w-fit max-w-full">
            <Sparkles size={11} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0 mt-0.5" />
            <span className="text-[12px] text-[var(--text-secondary)] leading-snug line-clamp-2">
              {meeting.briefPoints[0]}
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] min-w-0">
          <ArrowRight size={14} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0 group-hover:text-[var(--icon-brand-primary)] transition-colors" />
          <span className="truncate group-hover:text-[var(--text-primary)] transition-colors">{meeting.nextBestAction}</span>
        </div>
        {due && (
          <span className={cn("text-[12px] font-bold shrink-0", due.urgent ? "text-[var(--text-status-error)]" : "text-[var(--text-status-warning)]")}>
            {due.text}
          </span>
        )}
      </div>
    </div>
  );
}
