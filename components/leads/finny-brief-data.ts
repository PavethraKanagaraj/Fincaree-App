/* ============================================================
   Finny's lead brief — derived, not authored

   Every count here is computed from PIPELINE_LEADS. Nothing is
   typed in by hand, so the card cannot drift from the board it
   sits above, and it can never show a number the pipeline does
   not actually contain.

   The one figure that isn't derived is the 3.2× discovery-call
   multiplier: that's an existing practice benchmark carried over
   from CONVERSION_BRIEF, not a metric invented for the card.
   ============================================================ */

import { PIPELINE_LEADS, PipelineLead, PIPELINE_STAGES } from "./pipeline-data";
import type { AIInsight } from "@/components/finny/ai-pattern";

/** Days of silence before a lead is treated as going quiet. */
const STALE_DAYS = 5;
/** A week of silence — the subset worth naming separately. */
const CRITICAL_DAYS = 7;

const stageTitle = (id: string) => PIPELINE_STAGES.find((s) => s.id === id)?.title ?? id;

/** Gone quiet, whoever owes the next move. */
export const staleLeads: PipelineLead[] = PIPELINE_LEADS.filter((l) => l.lastActivitySort >= STALE_DAYS);

/** Silent for a week or more. */
const criticalLeads = staleLeads.filter((l) => l.lastActivitySort >= CRITICAL_DAYS);

/** Explicitly parked in the follow-up stage. */
const followUpStage = PIPELINE_LEADS.filter((l) => l.stage === "needs-followup");

/** The actionable set: quiet AND the next move is the advisor's.
    `decision-pending` is excluded on purpose — those leads are waiting
    on the client, so chasing them is not the advisor's next move. */
export const actionableLeads: PipelineLead[] = staleLeads.filter((l) => l.stage !== "decision-pending");

/** Of the actionable set, the ones already warmed by a discovery call. */
const warmedLeads = actionableLeads.filter((l) => l.stage !== "discovery-call" && l.stage !== "awaiting-details");

export const DISCOVERY_MULTIPLIER = "3.2×";

const plural = (n: number, s: string, p = `${s}s`) => `${n} ${n === 1 ? s : p}`;

export const LEAD_INSIGHTS: AIInsight[] = [
  {
    id: "stale",
    severity: "high",
    primary: `${plural(staleLeads.length, "lead")} at risk of going stale`,
    supporting: `${criticalLeads.length} have had no activity for a week or more`,
  },
  {
    id: "follow-up",
    severity: "medium",
    primary: `${plural(followUpStage.length, "lead")} need a follow-up`,
    supporting: `All sitting in ${stageTitle("needs-followup")} with no reply`,
  },
  {
    id: "discovery",
    severity: "low",
    primary: `Discovery calls drive ${DISCOVERY_MULTIPLIER} more conversions`,
    supporting: "Consider prioritising discovery-call leads",
  },
];

export const LEAD_RECOMMENDATION = `Prioritise ${plural(actionableLeads.length, "lead")} for follow-up.`;

/** The audit trail for "Why this?" — says what Finny actually did. */
export const LEAD_RECOMMENDATION_REASON =
  `Finny grouped leads by days since last activity and by who owes the next move. ` +
  `These ${actionableLeads.length} have gone quiet for ${STALE_DAYS}+ days while the next step is still yours` +
  (warmedLeads.length > 0
    ? `, and ${warmedLeads.length} already have a discovery call behind them, which historically converts better.`
    : `.`);

/** What the recommendation drew on. Named as inputs Finny "considered" —
    a list the advisor can challenge, not a claim of certainty. */
export const FINNY_CONSIDERED = [
  "Days since last activity",
  "Current lead stage",
  "Who owns the next action",
  "Previous discovery-call activity",
  "Historical conversion patterns",
];

/** What the follow-up drafts were written from. */
export const FOLLOW_UP_SOURCES = [
  "Lead stage",
  "Recent activity",
  "Previous conversation context",
  "Discovery-call history",
];

/** What Finny looked at, as plain numbers the advisor can check against
    the board. Rendered as a sentence, not a stat grid. */
export const OBSERVED = {
  total: PIPELINE_LEADS.length,
  staleDays: STALE_DAYS,
  stale: staleLeads.length,
  critical: criticalLeads.length,
  waitingOnClient: staleLeads.length - actionableLeads.length,
  waitingOnYou: actionableLeads.length,
};

/** Per-lead justification, so the recommendation is inspectable. */
export function leadReason(lead: PipelineLead): string {
  const days = `${lead.lastActivitySort}d quiet`;
  return `${days} · ${stageTitle(lead.stage)}`;
}

/* ---- Prepared follow-ups ----
   Finny's drafts. They are proposals in the advisor's voice, never
   sent by Finny and never presented as approved communication. They
   avoid claims about the lead's finances or a plan — a follow-up
   nudges; it doesn't advise. */

const FOLLOW_UP_DRAFTS: Record<string, string> = {
  "vivek-malhotra":
    "Hi Vivek, just checking in on the details we discussed. Once we have the remaining information, we can continue with the next step.",
  "neha-joshi":
    "Hi Neha, following up on the information needed to continue your advisory process. Let me know if you need any clarification.",
  "rahul-verma":
    "Hi Rahul, following up after our recent discussion. I wanted to check if you had any questions before we continue.",
  "sneha-kulkarni":
    "Hi Sneha, I wanted to circle back on our last conversation and see if there is anything I can clarify. Happy to find a time that suits you to talk through the next step.",
  "ajay-bhatt":
    "Hi Ajay, it has been a little while since we last spoke. If it is easier, we can pick this up over a quick call. Let me know what works for you.",
};

/** Stage-based wording for any lead without a bespoke draft, so the
    flow survives the pipeline changing underneath it. */
function fallbackDraft(lead: PipelineLead): string {
  const first = lead.name.split(" ")[0];
  return lead.stage === "awaiting-details"
    ? `Hi ${first}, just checking in on the details we discussed. Once we have them, we can continue with the next step.`
    : `Hi ${first}, following up on our recent conversation. Let me know if you have any questions before we continue.`;
}

export function draftFollowUp(lead: PipelineLead): string {
  return FOLLOW_UP_DRAFTS[lead.slug] ?? fallbackDraft(lead);
}

export const stageLabel = stageTitle;
