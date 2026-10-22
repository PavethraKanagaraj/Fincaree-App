"use client";

import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { GoalTags } from "./GoalTags";
import { PipelineLead } from "./pipeline-data";
import { Check, Clock, X } from "lucide-react";

/* ============================================================
   Suggested Lead Card — same anatomy as PipelineCard (header /
   body / footer with hairline dividers), but the footer carries
   Accept and Decline instead of a single click target. Because
   it holds buttons, the card itself is not a button: only the
   name opens the lead.
   ============================================================ */

interface SuggestedLeadCardProps {
  lead: PipelineLead;
  onOpen: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function SuggestedLeadCard({ lead, onOpen, onAccept, onDecline }: SuggestedLeadCardProps) {
  const initials = lead.initials.replace(/[0-9]/g, "");

  return (
    <article
      aria-label={`Suggested lead ${lead.name}`}
      className="flex flex-col rounded-[12px] overflow-hidden bg-[var(--bg-primary)] border border-transparent transition-all duration-150 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)]"
    >
      <div className="px-3.5 pt-3.5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar size="sm" initials={initials} />
          <div className="min-w-0">
            <button
              type="button"
              onClick={onOpen}
              className="block max-w-full text-left text-sm font-bold text-[var(--text-primary)] leading-tight truncate hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)] rounded-sm"
            >
              {lead.name}
            </button>
            <GoalTags lead={lead} />
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      <div className="px-3.5 pt-3 pb-3 flex flex-col gap-2.5 flex-1">
        <div>
          <Badge color="brand" leadingIcon="dot" size="sm">{lead.statusTag}</Badge>
        </div>
        {lead.suggestedLabel && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
            <Clock size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
            {lead.suggestedLabel}
          </div>
        )}
        {lead.matchReasons && lead.matchReasons.length > 0 && (
          <div aria-label="Why Fincaree matched this lead">
            <p className="text-xs text-[var(--text-secondary)] leading-snug">{lead.matchReasons[0]}</p>
            {lead.matchReasons.length > 1 && (
              <p className="text-xs text-[var(--text-tertiary)] leading-snug mt-0.5">{lead.matchReasons.slice(1).join(" · ")}</p>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--border-tertiary)]" />

      <div className="px-3.5 py-2.5 flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Check size={14} strokeWidth={2} />}
          onClick={onAccept}
          aria-label={`Accept ${lead.name}`}
        >
          Accept
        </Button>
        <Button
          variant="tertiary"
          size="sm"
          leadingIcon={<X size={14} strokeWidth={2} />}
          onClick={onDecline}
          aria-label={`Decline ${lead.name}`}
        >
          Decline
        </Button>
      </div>
    </article>
  );
}
