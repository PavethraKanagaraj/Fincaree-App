"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Tag } from "@/components/fincaree/tag";
import { PipelineLead } from "./pipeline-data";
import { Calendar, Circle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

/* ============================================================
   Pipeline Card — same anatomy as the Meeting Desk's MeetingCard:
   transparent border with a hover glow (no border accent), thin
   hairline dividers between header / body / footer, status
   carried by a Badge, and the whole card as one click target.
   ============================================================ */

const STATUS_GLOW: Record<string, string> = {
  "discovery-call": "rgba(0, 0, 0, 0.12)",
  "awaiting-details": "rgba(0, 0, 0, 0.12)",
  "needs-followup": "rgba(217, 119, 6, 0.20)",
  "ready-for-advice": "rgba(47, 125, 107, 0.20)",
  "plan-discussion": "rgba(0, 0, 0, 0.12)",
  "decision-pending": "rgba(0, 0, 0, 0.12)",
};

function initialsOf(lead: PipelineLead): string {
  return lead.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function ctaText(label: string): string {
  return label.replace(/\s*→\s*$/, "");
}

interface PipelineCardProps {
  lead: PipelineLead;
  onOpen: () => void;
}

export function PipelineCard({ lead, onOpen }: PipelineCardProps) {
  return (
    <div
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${lead.name}`}
      style={{ "--card-glow": STATUS_GLOW[lead.stage] } as CSSProperties}
      className={cn(
        "group relative flex flex-col rounded-[12px] overflow-hidden cursor-pointer",
        "bg-[var(--bg-primary)] border border-transparent",
        "transition-all duration-150",
        "hover:shadow-[0_4px_16px_-4px_var(--card-glow)]"
      )}
    >
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar size="sm" initials={initialsOf(lead)} />
          <div className="min-w-0">
            <div className="text-sm font-bold text-[var(--text-primary)] leading-tight truncate">{lead.name}</div>
            <div className="text-[12px] text-[var(--text-tertiary)] mt-0.5 leading-tight truncate">{lead.goal} · {lead.timeline}</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Body */}
      <div className="px-3.5 pt-3 pb-2.5 flex flex-col gap-2 flex-1">
        {lead.meetingLabel && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
            <Calendar size={12} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
            {lead.meetingLabel}
          </div>
        )}
        {(lead.meetingFacts ?? lead.checklist) && (
          <ul className="space-y-1">
            {(lead.meetingFacts ?? lead.checklist ?? []).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Circle size={5} strokeWidth={2} className="fill-current text-[var(--icon-quaternary)] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
        {lead.completedNote && <p className="text-xs text-[var(--text-secondary)]">{lead.completedNote}</p>}

        {lead.noResponseNote && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color="error" size="sm" icon={<AlertTriangle size={10} strokeWidth={2} />}>
              {lead.noResponseNote}
            </Tag>
          </div>
        )}
        {lead.lastActivityNote && <p className="text-[12px] text-[var(--text-tertiary)]">{lead.lastActivityNote}</p>}
        {lead.followUpAttempts !== undefined && (
          <p className="text-xs text-[var(--text-secondary)]">{lead.followUpAttempts} follow-up {lead.followUpAttempts === 1 ? "attempt" : "attempts"}</p>
        )}

        {lead.readyChecklist && (
          <ul className="space-y-1">
            {lead.readyChecklist.map((c) => (
              <li key={c} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <CheckCircle2 size={12} strokeWidth={2} className="text-[var(--icon-status-success-strong)] shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        )}
        {lead.completeness !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-[var(--text-tertiary)]">Data completeness</span>
              <span className="text-[12px] font-semibold text-[var(--text-primary)]">{lead.completeness}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-success-500)]" style={{ width: `${lead.completeness}%` }} />
            </div>
          </div>
        )}

        {lead.planSharedNote && <p className="text-xs text-[var(--text-secondary)]">{lead.planSharedNote}</p>}
        {lead.decisionNote && <p className="text-xs text-[var(--text-secondary)]">{lead.decisionNote}</p>}

        <div>
          <Badge color="gray-blue" leadingIcon="dot" size="sm">{lead.statusTag}</Badge>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Footer */}
      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] min-w-0">
          <ArrowRight size={13} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0 group-hover:text-[var(--icon-brand-primary)] transition-colors" />
          <span className="truncate group-hover:text-[var(--text-primary)] transition-colors">{ctaText(lead.ctaLabel)}</span>
        </div>
      </div>
    </div>
  );
}
