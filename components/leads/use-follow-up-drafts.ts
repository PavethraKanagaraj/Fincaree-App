"use client";

/* ============================================================
   Follow-up drafts — the prepare → review → approve → ready flow

     idle      Finny has recommended; nothing prepared yet
     review    Finny prepared drafts; the advisor reads, edits, and
               marks each one reviewed
     approved  every draft reviewed and the advisor approved them
     ready     the advisor marked them ready to send

   The gate is enforced here rather than in the UI: `approve()` does
   nothing unless every draft is reviewed, so no future surface can
   wire a button around it. Editing a reviewed draft clears its
   reviewed flag — what the advisor signed off on is no longer what
   is on screen.

   Nothing in this flow sends. There is no messaging integration, so
   the terminal state is "Ready to Send" — a status the advisor sets —
   not a delivery.
   ============================================================ */

import { useCallback, useMemo, useState } from "react";
import type { PipelineLead } from "./pipeline-data";
import { draftFollowUp } from "./finny-brief-data";

export type FollowUpPhase = "idle" | "review" | "approved" | "ready";

export interface FollowUpDraft {
  lead: PipelineLead;
  /** Finny's original wording, kept so "edited by you" is honest. */
  original: string;
  message: string;
  reviewed: boolean;
}

export function useFollowUpDrafts(leads: PipelineLead[]) {
  const [phase, setPhase] = useState<FollowUpPhase>("idle");
  const [drafts, setDrafts] = useState<FollowUpDraft[]>([]);

  const reviewedCount = useMemo(() => drafts.filter((d) => d.reviewed).length, [drafts]);
  const total = drafts.length;
  const allReviewed = total > 0 && reviewedCount === total;

  /** Idempotent: reopening after leaving must not regenerate the drafts
      and lose the advisor's edits and review marks. */
  const prepare = useCallback(() => {
    setDrafts((prev) =>
      prev.length > 0
        ? prev
        : leads.map((lead) => {
            const message = draftFollowUp(lead);
            return { lead, original: message, message, reviewed: false };
          })
    );
    setPhase((p) => (p === "idle" ? "review" : p));
  }, [leads]);

  /* Drafts are only mutable while under review. After approval they are
     what the advisor signed off on. */
  const edit = useCallback(
    (leadId: string, message: string) => {
      if (phase !== "review") return;
      setDrafts((prev) => prev.map((d) => (d.lead.id === leadId ? { ...d, message, reviewed: false } : d)));
    },
    [phase]
  );

  const toggleReviewed = useCallback(
    (leadId: string) => {
      if (phase !== "review") return;
      setDrafts((prev) => prev.map((d) => (d.lead.id === leadId ? { ...d, reviewed: !d.reviewed } : d)));
    },
    [phase]
  );

  const approve = useCallback(() => {
    if (!allReviewed) return;
    setPhase("approved");
  }, [allReviewed]);

  /** Only from `approved`. `ready` is terminal: once the advisor has
      marked drafts ready, quietly reopening them for edits would let
      the thing they signed off on change without a new review. */
  const backToDrafts = useCallback(() => {
    setPhase((p) => (p === "approved" ? "review" : p));
  }, []);

  const markReady = useCallback(() => {
    setPhase((p) => (p === "approved" ? "ready" : p));
  }, []);

  return { phase, drafts, total, reviewedCount, allReviewed, prepare, edit, toggleReviewed, approve, backToDrafts, markReady };
}

export type FollowUpState = ReturnType<typeof useFollowUpDrafts>;
