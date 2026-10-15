"use client";

/* ============================================================
   FinnyBriefDialog — the evidence behind the card

   The card carries the conclusion; this carries the working, in
   the order Finny reasoned it and in the advisor's language:

     What I looked at   → what was examined, as a sentence
     Finny is seeing    → the insights
     Finny recommends   → the recommendation and why
     The 5 leads        → the recommendation made inspectable
     Your move          → actions, still theirs to take

   A ledger, not a stack of cards. The modal is the one surface;
   sections are divided by hairlines, rows run edge to edge, and
   the single tinted band is the recommendation — the one thing
   on the page that should look different. Nothing inside draws
   its own box, so nothing nests.

   Nothing here acts on its own. "Prepare N follow-ups" asks Finny
   to draft messages and opens them for review; it does not send.
   ============================================================ */

import { useRef } from "react";
import { Modal, ModalContent, ModalTitle } from "@/components/ui/modal";
import { Badge } from "@/components/fincaree/badge";
import { Avatar } from "@/components/fincaree/avatar";
import { AIHeader, FinnyInsight, FinnyAction, FinnyReasoning, AI_STAGE_LABEL } from "@/components/finny/ai-pattern";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { CONVERSION_BRIEF, PipelineLead } from "./pipeline-data";
import {
  LEAD_INSIGHTS,
  LEAD_RECOMMENDATION,
  LEAD_RECOMMENDATION_REASON,
  FINNY_CONSIDERED,
  OBSERVED,
  actionableLeads,
  leadReason,
} from "./finny-brief-data";

/** Section heading. Sentence in the ledger's gutter, not a badge or a box. */
function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider", className)}>{children}</p>
  );
}

const Num = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-[var(--text-primary)] tabular-nums">{children}</span>
);

interface FinnyBriefDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Row the advisor drilled in from, tinted on open. */
  focusInsightId?: string | null;
  onOpenLead: (lead: PipelineLead) => void;
  /** Hands the advisor to the drafts drawer. */
  onPrepareFollowUps: () => void;
  /** "Prepare 5 follow-ups" → "Review drafts · 2/5" once prepared. */
  prepareLabel: string;
}

export function FinnyBriefDialog({ open, onOpenChange, focusInsightId, onOpenLead, onPrepareFollowUps, prepareLabel }: FinnyBriefDialogProps) {
  const leadsRef = useRef<HTMLDivElement>(null);

  /** The list below IS the review surface — take the advisor to it. */
  function reviewLeads() {
    leadsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        {/* Header */}
        <div className="shrink-0 border-b border-[var(--border-tertiary)] px-5 py-4 pr-14">
          <AIHeader
            context="Conversion Insights"
            trailing={
              <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] rounded-full px-2.5 py-1 shrink-0">
                <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{CONVERSION_BRIEF.rate}%</span>
                <TrendingUp size={11} strokeWidth={2} className="text-[var(--text-status-success)]" />
                <span className="text-xs font-semibold text-[var(--text-status-success)]">+8% this mo</span>
              </div>
            }
          />
          <ModalTitle className="sr-only">Finny AI — Conversion Insights</ModalTitle>
        </div>

        {/* Ledger — sections divided by hairlines, no boxes inside */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-tertiary)]">
          {/* What I looked at — a sentence, so the counts read as reasoning
              rather than as a dashboard */}
          <section className="px-5 py-4">
            <SectionLabel>What I looked at</SectionLabel>
            <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed max-w-[62ch]">
              <Num>{OBSERVED.total}</Num> leads in the pipeline. <Num>{OBSERVED.stale}</Num> have been quiet for {OBSERVED.staleDays}+ days,{" "}
              <Num>{OBSERVED.critical}</Num> of them for a week or more. <Num>{OBSERVED.waitingOnClient}</Num> are waiting on the client;{" "}
              <Num>{OBSERVED.waitingOnYou}</Num> are waiting on you.
            </p>
          </section>

          {/* What I found — rows edge to edge; the drilled-in one is tinted */}
          <section className="pt-4">
            <SectionLabel className="px-5">{AI_STAGE_LABEL.insight}</SectionLabel>
            <ul className="mt-2 divide-y divide-[var(--border-tertiary)]">
              {LEAD_INSIGHTS.map((insight) => (
                <li key={insight.id}>
                  <FinnyInsight
                    insight={insight}
                    className={cn("px-5 py-3 transition-colors", focusInsightId === insight.id && "bg-[var(--bg-brand-subtle)]")}
                  />
                </li>
              ))}
            </ul>
          </section>

          {/* What I'd suggest — the one tinted band. Full bleed, no border,
              no radius: a change of ground, not a box on the ground. */}
          <section className="bg-[var(--bg-brand-subtle)] px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <SectionLabel className="text-[var(--text-brand-primary)]">{AI_STAGE_LABEL.recommendation}</SectionLabel>
              <FinnyReasoning considered={FINNY_CONSIDERED} side="bottom" />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
              <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />
              {LEAD_RECOMMENDATION}
            </p>
            <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed max-w-[62ch]">{LEAD_RECOMMENDATION_REASON}</p>
            <p className="mt-2 text-xs font-semibold text-[var(--text-brand-secondary)] tabular-nums">
              Based on {FINNY_CONSIDERED.length} signals, not a single rule
            </p>
          </section>

          {/* The named leads — edge-to-edge rows, hairline between */}
          <section ref={leadsRef} className="pt-4 scroll-mt-0">
            <SectionLabel className="px-5">The {actionableLeads.length} leads</SectionLabel>
            <ul className="mt-2 divide-y divide-[var(--border-tertiary)] border-t border-[var(--border-tertiary)]">
              {actionableLeads.map((lead) => (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenLead(lead);
                    }}
                    className="group flex items-center gap-2.5 w-full px-5 py-2.5 text-left hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Avatar size="xs" initials={lead.initials.replace(/[0-9]/g, "")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{lead.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{leadReason(lead)}</p>
                    </div>
                    {lead.highIntent && (
                      <Badge size="sm" color="success">
                        High intent
                      </Badge>
                    )}
                    <ArrowRight
                      size={13}
                      strokeWidth={2}
                      className="text-[var(--icon-tertiary)] shrink-0 group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Your move — Finny prepares, the advisor decides */}
        <div className="shrink-0 border-t border-[var(--border-tertiary)] px-5 py-4">
          <FinnyAction
            fill
            actions={[
              { label: "Review leads", onClick: reviewLeads, variant: "secondary" },
              { label: prepareLabel, onClick: onPrepareFollowUps, variant: "primary" },
            ]}
          />
        </div>
      </ModalContent>
    </Modal>
  );
}
