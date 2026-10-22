"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge, type BadgeColor } from "@/components/fincaree/badge";
import { Tag } from "@/components/fincaree/tag";
import { GoalTags } from "./GoalTags";
import { PipelineLead, LEAD_SOURCE_LABEL } from "./pipeline-data";
import { Calendar, Circle, CheckCircle2, AlertTriangle, ArrowRight, Clock, type LucideIcon } from "lucide-react";

/* ============================================================
   Pipeline Card — same anatomy as the Meeting Desk's MeetingCard:
   transparent border with a hover glow (no border accent), thin
   hairline dividers between header / body / footer, status
   carried by a Badge, and the whole card as one click target.
   ============================================================ */

const STATUS_GLOW: Record<string, string> = {
  invited: "rgba(0, 0, 0, 0.12)",
  suggested: "rgba(0, 0, 0, 0.12)",
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

function statusColor(lead: PipelineLead): BadgeColor {
  if (lead.stage === "needs-followup") return "warning";
  if (lead.stage === "invited" && lead.lastActivitySort >= 5) return "warning";
  if (lead.stage === "ready-for-advice" || lead.highIntent) return "success";
  if (lead.stage === "suggested") return "brand";
  return "gray-blue";
}

/** The single fact that says where this lead stands in its stage. */
function KeyFact({ lead }: { lead: PipelineLead }) {
  if (lead.completeness !== undefined) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">Data completeness</span>
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{lead.completeness}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-success-500)]" style={{ width: `${lead.completeness}%` }} />
        </div>
      </div>
    );
  }

  const fact: { icon: LucideIcon; text: string; urgent?: boolean } | null =
    lead.meetingLabel ? { icon: Calendar, text: lead.meetingLabel }
    : lead.noResponseNote ? { icon: AlertTriangle, text: lead.noResponseNote, urgent: true }
    : lead.completedNote ? { icon: Clock, text: lead.completedNote }
    : lead.planSharedNote ? { icon: Clock, text: lead.planSharedNote }
    : null;
  if (!fact) return null;

  const Icon = fact.icon;
  return (
    <div className={cn("flex items-center gap-1.5 text-[13px] font-semibold", fact.urgent ? "text-[var(--text-status-error)]" : "text-[var(--text-primary)]")}>
      <Icon size={13} strokeWidth={1.75} className={cn("shrink-0", fact.urgent ? "text-[var(--icon-status-error)]" : "text-[var(--icon-tertiary)]")} />
      {fact.text}
    </div>
  );
}

/** Quieter than the key fact: profile facts on one line, to-dos and checks as a list. */
function SupportingDetail({ lead }: { lead: PipelineLead }) {
  const lines: string[] = [];
  if (lead.meetingFacts) lines.push(lead.meetingFacts.join(" · "));
  if (lead.lastActivityNote || lead.followUpAttempts !== undefined) {
    const attempts = lead.followUpAttempts !== undefined
      ? `${lead.followUpAttempts} follow-up ${lead.followUpAttempts === 1 ? "attempt" : "attempts"}`
      : null;
    lines.push([lead.lastActivityNote, attempts].filter(Boolean).join(" · "));
  }
  if (lead.decisionNote) lines.push(lead.decisionNote);

  return (
    <>
      {lines.map((l) => (
        <p key={l} className="text-xs text-[var(--text-secondary)] leading-snug">{l}</p>
      ))}

      {lead.checklist && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1">Still needed</p>
          <ul className="space-y-1">
            {lead.checklist.map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Circle size={5} strokeWidth={2} className="fill-current text-[var(--icon-quaternary)] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
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
    </>
  );
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
            <GoalTags lead={lead} />
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      {/* Body — same order in every stage:
          1 status, 2 the one fact that defines this stage, 3 supporting detail */}
      <div className="px-3.5 pt-3 pb-3 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge color={statusColor(lead)} leadingIcon="dot" size="sm">{lead.statusTag}</Badge>
          {lead.source !== "self-booked" && (
            <Tag color={lead.source === "suggested" ? "brand" : "grey"} size="sm">{LEAD_SOURCE_LABEL[lead.source]}</Tag>
          )}
        </div>

        <KeyFact lead={lead} />

        <SupportingDetail lead={lead} />
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
