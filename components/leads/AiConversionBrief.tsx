"use client";

/* ============================================================
   AiConversionBrief — Finny on the Leads board

   Composed from the shared Finny primitives so the same
   Insight → Recommendation → Explanation → Action shape can be
   dropped onto Clients, Meetings, Reports, Content, Simulations
   and the Opportunity Engine without redrawing it.

   The card carries the conclusion and the next step. The working
   lives in FinnyBriefDialog and the prepared drafts in
   FollowUpDraftsSheet, one click away — the card sits in a three-up
   row, so earning its place means staying light. The drafts state
   is held here so it survives closing either surface: an advisor
   who opens a lead mid-review returns to the same drafts, edits
   and review marks intact.

   Every number is derived in finny-brief-data.ts from the same
   PIPELINE_LEADS the board renders, so the card cannot claim
   something the board contradicts.
   ============================================================ */

import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import {
  AIHeader,
  InsightSummary,
  InsightList,
  FinnyRecommendation,
  type AIInsight,
} from "@/components/finny/ai-pattern";
import { FinnyBriefDialog } from "./FinnyBriefDialog";
import { FollowUpDraftsSheet } from "./FollowUpDraftsSheet";
import { useFollowUpDrafts, type FollowUpState } from "./use-follow-up-drafts";
import { CONVERSION_BRIEF, PipelineLead } from "./pipeline-data";
import { LEAD_INSIGHTS, LEAD_RECOMMENDATION, FINNY_CONSIDERED, actionableLeads } from "./finny-brief-data";

/** The follow-up action, worded for where the advisor is in the flow.
    Every label prepares, reviews or marks — none of them sends. */
function prepareLabel(f: FollowUpState): string {
  switch (f.phase) {
    case "review":
      return `Review drafts · ${f.reviewedCount}/${f.total}`;
    case "approved":
      return "Mark as ready";
    case "ready":
      return `${f.total} follow-ups ready`;
    default:
      return `Prepare ${actionableLeads.length} follow-ups`;
  }
}

interface AiConversionBriefProps {
  /** Lets the dialog hand the advisor straight into a lead. */
  onOpenLead?: (lead: PipelineLead) => void;
}

export function AiConversionBrief({ onOpenLead }: AiConversionBriefProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const followUp = useFollowUpDrafts(actionableLeads);

  function drillIn(insight: AIInsight | null) {
    setFocused(insight?.id ?? null);
    setOpen(true);
  }

  /** Finny prepares the drafts, then the advisor reviews them. The
      insights modal steps aside — two dialogs must not stack. */
  function openDrafts() {
    followUp.prepare();
    setOpen(false);
    setDraftsOpen(true);
  }

  return (
    <>
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4 flex flex-col gap-3 h-full">
        <AIHeader
          context="Conversion Insights"
          trailing={
            <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] rounded-full px-2.5 py-1 shrink-0">
              <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{CONVERSION_BRIEF.rate}%</span>
              <TrendingUp size={11} strokeWidth={2} className="text-[var(--text-status-success)]" />
              <span className="text-xs font-semibold text-[var(--text-status-success)]">+8% this mo</span>
            </div>
          }
        />

        {/* Insights sit directly on the card — hairlines between rows,
            no inner box. Each row still drills into its own evidence. */}
        <div className="flex-1">
          <InsightSummary>Here&apos;s what I&apos;m seeing:</InsightSummary>
          <InsightList
            insights={LEAD_INSIGHTS}
            onSelect={drillIn}
            className="mt-1 divide-[var(--border-brand-tint)]"
          />
        </div>

        {/* Recommendation → explanation → action, advisor-controlled.
            Separated by a rule, not wrapped in a second card. */}
        <FinnyRecommendation
          className="border-t border-[var(--border-brand-tint)] pt-3"
          recommendation={LEAD_RECOMMENDATION}
          considered={FINNY_CONSIDERED}
          actions={[
            { label: "Review leads", onClick: () => drillIn(null), variant: "secondary" },
            { label: prepareLabel(followUp), onClick: openDrafts, variant: "secondary" },
          ]}
        />

        <button
          type="button"
          onClick={() => drillIn(null)}
          className="flex items-center gap-1 text-[12px] font-semibold text-[var(--text-brand-primary)] hover:underline self-start"
        >
          View insights <ArrowRight size={11} strokeWidth={2} />
        </button>
      </section>

      <FinnyBriefDialog
        open={open}
        onOpenChange={setOpen}
        focusInsightId={focused}
        onOpenLead={onOpenLead ?? (() => {})}
        onPrepareFollowUps={openDrafts}
        prepareLabel={prepareLabel(followUp)}
      />

      <FollowUpDraftsSheet
        open={draftsOpen}
        onOpenChange={setDraftsOpen}
        followUp={followUp}
        onOpenLead={(lead) => {
          /* One sheet at a time; the drafts stay put in state. */
          setDraftsOpen(false);
          onOpenLead?.(lead);
        }}
        onBackToInsights={() => {
          setDraftsOpen(false);
          setOpen(true);
        }}
      />
    </>
  );
}
