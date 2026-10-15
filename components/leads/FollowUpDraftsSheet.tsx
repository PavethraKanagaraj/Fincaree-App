"use client";

/* ============================================================
   FollowUpDraftsSheet — "Finny prepared N follow-ups"

   The Prepare → Advisor reviews → Act half of the chain. Finny has
   done the drafting; everything here is the advisor checking it.

   Approval is earned, not offered: the footer shows "Review all
   drafts" until every draft has been individually marked reviewed,
   and only then becomes "Approve drafts". "Review all drafts" walks
   the advisor to the next unreviewed draft — it does NOT bulk-mark
   them, because a button that reviews everything in one click is a
   rubber stamp, which is exactly what this flow exists to prevent.

   Nothing is sent from here. There is no messaging integration, so
   the end of the flow is a "Ready to Send" status the advisor sets.
   ============================================================ */

import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/fincaree/button";
import { Avatar } from "@/components/fincaree/avatar";
import {
  AIPreparedDraft,
  AIProvenance,
  AdvisorReviewStatus,
  AIReviewNotice,
  ReviewProgress,
} from "@/components/finny/ai-pattern";
import { ArrowLeft, Check } from "lucide-react";
import type { PipelineLead } from "./pipeline-data";
import type { FollowUpState } from "./use-follow-up-drafts";
import { FOLLOW_UP_SOURCES, stageLabel } from "./finny-brief-data";

const initialsOf = (lead: PipelineLead) => lead.initials.replace(/[0-9]/g, "");

interface FollowUpDraftsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUpState;
  onOpenLead: (lead: PipelineLead) => void;
  onBackToInsights: () => void;
}

export function FollowUpDraftsSheet({ open, onOpenChange, followUp, onOpenLead, onBackToInsights }: FollowUpDraftsSheetProps) {
  const { phase, drafts, total, reviewedCount, allReviewed, edit, toggleReviewed, approve, backToDrafts, markReady } = followUp;

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);

  /** Takes the advisor to the next draft that still needs them. Never
      marks anything reviewed on their behalf. */
  function reviewNext() {
    const next = drafts.find((d) => !d.reviewed);
    if (!next) return;
    const el = cardRefs.current[next.lead.id];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
    setHighlightId(next.lead.id);
    window.setTimeout(() => setHighlightId((cur) => (cur === next.lead.id ? null : cur)), 1600);
  }

  const confirmed = phase === "approved" || phase === "ready";
  const isReady = phase === "ready";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:w-[520px]">
        <SheetHeader className="border-b border-[var(--border-tertiary)] pb-4">
          {phase === "review" && (
            <button
              type="button"
              onClick={onBackToInsights}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mb-2 w-fit"
            >
              <ArrowLeft size={12} strokeWidth={2} />
              Back to insights
            </button>
          )}
          <SheetTitle className="text-base pr-8">
            {isReady ? "Follow-ups marked as ready" : confirmed ? "Follow-ups ready to send" : `Finny prepared ${total} follow-ups`}
          </SheetTitle>
          <SheetDescription className="text-xs text-[var(--text-tertiary)]">
            {confirmed ? `${total} messages reviewed by you.` : "Review and edit before sending."}
          </SheetDescription>
        </SheetHeader>

        {/* ── Review ── */}
        {phase === "review" && (
          <>
            {/* A ledger: one surface, entries divided by hairlines. No card
                around the entries and none inside them. */}
            <div className="flex-1 overflow-y-auto">
              <AIProvenance intro="Finny prepared these drafts using:" sources={FOLLOW_UP_SOURCES} note="Review before sending" />

              <div className="divide-y divide-[var(--border-tertiary)]">
                {drafts.map((d) => (
                  <AIPreparedDraft
                    key={d.lead.id}
                    ref={(el) => {
                      cardRefs.current[d.lead.id] = el;
                    }}
                    recipient={d.lead.name}
                    initials={initialsOf(d.lead)}
                    context={stageLabel(d.lead.stage)}
                    message={d.message}
                    edited={d.message !== d.original}
                    onMessageChange={(next) => edit(d.lead.id, next)}
                    reviewed={d.reviewed}
                    onToggleReviewed={() => toggleReviewed(d.lead.id)}
                    secondaryAction={{
                      label: "View lead",
                      onClick: () => onOpenLead(d.lead),
                    }}
                    highlighted={highlightId === d.lead.id}
                  />
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-[var(--border-tertiary)] p-4">
              <div className="flex items-center justify-between gap-3">
                <ReviewProgress total={total} reviewed={reviewedCount} />
                {allReviewed ? (
                  <Button variant="primary" size="sm" leadingIcon={<Check size={13} strokeWidth={2.5} />} onClick={approve}>
                    Approve drafts
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={reviewNext}>
                    Review all drafts
                  </Button>
                )}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                {allReviewed ? "Every draft is reviewed. Nothing is sent until you send it." : "Approval unlocks once you have reviewed every draft."}
              </p>
              <AIReviewNotice className="mt-1.5" />
            </div>
          </>
        )}

        {/* ── Confirmation ── */}
        {confirmed && (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center text-center px-4 pt-8 pb-6">
                <div className="w-11 h-11 rounded-full bg-[var(--bg-status-success-subtle)] flex items-center justify-center">
                  <Check size={20} strokeWidth={2.25} className="text-[var(--icon-status-success)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-3">
                  {isReady ? `${total} follow-ups are ready` : `${total} messages reviewed by you`}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-[320px]">
                  {isReady
                    ? "They are marked ready to send. Nothing has been sent."
                    : "Mark them ready when you want them queued. Nothing is sent until you send it."}
                </p>
              </div>

              <div className="border-y border-[var(--border-tertiary)] divide-y divide-[var(--border-tertiary)]">
                {drafts.map((d) => (
                  <div key={d.lead.id} className="flex items-center gap-2.5 px-4 py-3">
                    <Avatar size="xs" initials={initialsOf(d.lead)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{d.lead.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{stageLabel(d.lead.stage)}</p>
                    </div>
                    <AdvisorReviewStatus status={isReady ? "ready" : "reviewed"} />
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-[var(--border-tertiary)] p-4">
              <div className="flex items-center justify-between gap-2">
                {isReady ? (
                  <span />
                ) : (
                  <Button variant="tertiary" size="sm" onClick={backToDrafts}>
                    Back to drafts
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                    Back to leads
                  </Button>
                  {!isReady && (
                    <Button variant="primary" size="sm" onClick={markReady}>
                      Mark as ready
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
