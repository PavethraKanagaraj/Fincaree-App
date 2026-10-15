/* ============================================================
   Advice & Decisions — shared data model.
   "Current Advice" (Overview) shows only items still in motion;
   the full Advice & Decisions tab shows this same list plus
   history and the decisions log.

   Advice and Decisions are kept as separate concepts on purpose:
   advice is what was proposed, a decision is what was decided.
   Accepting advice is also not the same as implementing it.
   ============================================================ */

export type AdviceStatus = "draft" | "advisor-reviewed" | "shared" | "client-considering" | "accepted" | "declined" | "implemented";
export type AdviceSource = "ai-drafted" | "advisor-authored" | "client-provided";

export interface AdviceItem {
  id: string;
  title: string;
  status: AdviceStatus;
  source: AdviceSource;
  advisor: string;
  created: string;
  relatedGoal?: string;
  context: string;
}

export const ADVICE_STATUS_LABEL: Record<AdviceStatus, string> = {
  draft: "Draft",
  "advisor-reviewed": "Advisor Reviewed",
  shared: "Shared",
  "client-considering": "Awaiting client decision",
  accepted: "Accepted",
  declined: "Declined",
  implemented: "Implemented",
};

export const ADVICE_SOURCE_LABEL: Record<AdviceSource, string> = {
  "ai-drafted": "AI-drafted",
  "advisor-authored": "Advisor-authored",
  "client-provided": "Client-provided",
};

/** Only items still in motion (not accepted/declined/implemented) count as "current". */
export const CURRENT_ADVICE: AdviceItem[] = [
  {
    id: "advice-retirement-contribution",
    title: "Review retirement contribution",
    status: "client-considering",
    source: "ai-drafted",
    advisor: "Amit Sharma",
    created: "18 Aug 2025",
    relatedGoal: "Retirement",
    context: "Retirement projection changed after the goal timeline moved from age 60 to 58. Review whether the monthly contribution should increase.",
  },
  {
    id: "advice-insurance-coverage",
    title: "Insurance coverage review",
    status: "advisor-reviewed",
    source: "advisor-authored",
    advisor: "Amit Sharma",
    created: "01 Aug 2025",
    relatedGoal: "Protection",
    context: "Waiting for client to share updated policy documents before the coverage gap can be assessed.",
  },
];

/** The lifecycle every advice item moves through. Rendered once as a legend,
    not repeated per card — each card just shows where it currently sits. */
export const ADVICE_LIFECYCLE: AdviceStatus[] = [
  "draft",
  "advisor-reviewed",
  "shared",
  "client-considering",
  "accepted",
  "implemented",
];

const RESOLVED_ADVICE: AdviceItem[] = [
  {
    id: "advice-emergency-fund",
    title: "Emergency fund recommendation",
    status: "implemented",
    source: "advisor-authored",
    advisor: "Amit Sharma",
    created: "18 Jun 2025",
    context: "Recommended maintaining 6 months of expenses in the emergency fund, given the client's moderate risk profile.",
  },
];

/** Full chronological record — current items plus resolved ones, for context. */
export const ADVICE_HISTORY: AdviceItem[] = [...CURRENT_ADVICE, ...RESOLVED_ADVICE].sort(
  (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
);

export interface DecisionLogEntry {
  id: string;
  date: string;
  meetingLabel?: string;
  decision: string;
  decisionMaker: string;
  reason: string;
  relatedGoal?: string;
}

/** What was actually decided — distinct from advice, which is only what was proposed. */
export const DECISIONS_LOG: DecisionLogEntry[] = [
  {
    id: "decision-retirement-age",
    date: "18 Aug 2025",
    meetingLabel: "Quarterly Review",
    decision: "Move retirement target age from 60 to 58",
    decisionMaker: "Client",
    reason: "Client wants to retire earlier and is prepared to revisit the funding plan.",
    relatedGoal: "Retirement",
  },
  {
    id: "decision-sip-increase",
    date: "20 May 2025",
    meetingLabel: "Plan Discussion",
    decision: "Increase SIP contribution after bonus review",
    decisionMaker: "Advisor + Client",
    reason: "Bonus income created room to accelerate goal funding without affecting monthly cash flow.",
    relatedGoal: "Retirement",
  },
];
