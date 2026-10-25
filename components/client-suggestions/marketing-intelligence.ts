/* ============================================================
   Marketing intelligence — what Finny can say about follow-up

   Everything here is computed from the same data the page shows
   (the lead pipeline, the sequences and their results, the content
   library), so no number is typed in. Finny observes and prepares;
   it never schedules. The advisor reviews the prepared loop and
   schedules it themselves.

   Compliance is not Finny's call: it only ever proposes content
   that is already Approved and written for leads.
   ============================================================ */

import { PIPELINE_LEADS, type PipelineLead, type PipelineStageId } from "@/components/leads/pipeline-data";
import { TOPIC_LABEL, type Topic } from "./content-data";
import type { ContentItem } from "./content-data";
import { isSendableToLeads, type NurtureSequence } from "./delivery-data";
import type { AIInsight } from "@/components/finny/ai-pattern";

/** Had a discovery call, have not subscribed, and are not moving on their own. */
const MARKETABLE_STAGES: PipelineStageId[] = ["awaiting-details", "needs-followup", "decision-pending"];

/** Marketing starts after a discovery call, once the lead is not moving on their own. */
export const isMarketable = (lead: PipelineLead) => MARKETABLE_STAGES.includes(lead.stage);

const STAGE_GROUP_LABEL: Partial<Record<PipelineStageId, string>> = {
  "awaiting-details": "Awaiting details",
  "needs-followup": "Needs follow-up",
  "decision-pending": "Decision pending",
};

const GOAL_TOPIC: Record<string, Topic> = {
  Retirement: "retirement",
  "Buy a home": "home-purchase",
  "Wealth building": "wealth-creation",
  "Child's education": "child-education",
};

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

export interface LoopAudience {
  key: string;
  label: string;
  /** The goal this group shares, or null for the "gone quiet" group. */
  goal: string | null;
  leads: PipelineLead[];
}

/** Leads who could be followed up but are not in any loop yet. */
export function unenrolledLeads(sequences: NurtureSequence[]): PipelineLead[] {
  const enrolled = new Set(sequences.flatMap((s) => s.leadList.map((l) => l.name)));
  return PIPELINE_LEADS.filter((l) => MARKETABLE_STAGES.includes(l.stage) && !enrolled.has(l.name));
}

/** Who a new loop could be for: one group per goal, plus everyone who has gone quiet. Largest first. */
export function loopAudiences(sequences: NurtureSequence[]): LoopAudience[] {
  const pool = unenrolledLeads(sequences);
  const byGoal = new Map<string, PipelineLead[]>();
  for (const l of pool) if (l.goal) byGoal.set(l.goal, [...(byGoal.get(l.goal) ?? []), l]);

  const groups: LoopAudience[] = [...byGoal.entries()]
    .map(([goal, leads]) => ({ key: `goal:${goal}`, label: `${goal} leads`, goal, leads }))
    .sort((a, b) => b.leads.length - a.leads.length);

  for (const stage of MARKETABLE_STAGES) {
    const inStage = pool.filter((l) => l.stage === stage);
    if (inStage.length > 0) groups.push({ key: `stage:${stage}`, label: `${STAGE_GROUP_LABEL[stage]} leads`, goal: null, leads: inStage });
  }

  const quiet = pool.filter((l) => l.lastActivitySort >= 5);
  if (quiet.length > 0) groups.push({ key: "quiet", label: "Leads quiet for 5+ days", goal: null, leads: quiet });
  return groups;
}

/** Approved-for-leads content, best-engaged first. Topic matches come before the rest. */
export function sendableContent(items: ContentItem[], goal: string | null): ContentItem[] {
  const topic = goal ? GOAL_TOPIC[goal] : undefined;
  const rate = (i: ContentItem) => i.engagement.completionRate ?? -1;
  return items
    .filter(isSendableToLeads)
    .sort((a, b) => Number(b.topic === topic) - Number(a.topic === topic) || rate(b) - rate(a));
}

export interface PreparedLoop {
  name: string;
  audienceKey: string;
  goal: string | null;
  topicLabel: string | null;
  steps: { day: number; contentId: string }[];
}

const CADENCE = [1, 4, 10];

/** The loop Finny would propose for an audience: up to three messages on Day 1, 4 and 10. */
export function prepareLoop(items: ContentItem[], audience: LoopAudience): PreparedLoop {
  const picks = sendableContent(items, audience.goal).slice(0, CADENCE.length);
  const topic = audience.goal ? GOAL_TOPIC[audience.goal] : undefined;
  return {
    name: audience.goal ? `${audience.goal} follow-up` : "Quiet leads — check-in",
    audienceKey: audience.key,
    goal: audience.goal,
    topicLabel: topic ? TOPIC_LABEL[topic] : null,
    steps: picks.map((item, i) => ({ day: CADENCE[i], contentId: item.id })),
  };
}

/* ---- What the results say ---- */

function stepRates(seq: NurtureSequence) {
  return seq.steps.filter((s) => s.sent > 0).map((s) => ({ day: s.day, contentId: s.contentId, sent: s.sent, rate: pct(s.opened, s.sent) }));
}

/** Insights about one sequence, from its own results. Empty until it has sent something. */
export function sequenceInsights(seq: NurtureSequence, titleOf: (id: string) => string): AIInsight[] {
  const rates = stepRates(seq);
  if (rates.length < 2) return [];
  const out: AIInsight[] = [];

  const best = rates.reduce((a, b) => (b.rate > a.rate ? b : a));
  out.push({
    id: `${seq.id}-best`,
    severity: "low",
    primary: `“${titleOf(best.contentId)}” does best here — ${best.rate}% opened`,
    supporting: `Day ${best.day}, sent to ${best.sent} leads`,
  });

  const first = rates[0];
  const last = rates[rates.length - 1];
  if (first.rate - last.rate >= 20) {
    out.push({
      id: `${seq.id}-drop`,
      severity: "medium",
      primary: `Opens fall from ${first.rate}% to ${last.rate}% by Day ${last.day}`,
      supporting: "The later messages are losing people — consider a shorter loop or a stronger last message",
    });
  }
  return out;
}

/** Insights across every loop: what's held, what's paused, what's working. */
export function overviewInsights(
  sequences: NurtureSequence[],
  paused: Record<string, boolean>,
  byId: Map<string, ContentItem>,
): AIInsight[] {
  const out: AIInsight[] = [];

  const held = sequences.flatMap((s) => s.steps.filter((st) => { const it = byId.get(st.contentId); return !it || !isSendableToLeads(it); }).map(() => s.name));
  if (held.length > 0) {
    out.push({
      id: "held",
      severity: "high",
      primary: `${held.length} message${held.length === 1 ? " is" : "s are"} on hold in your loops`,
      supporting: "Their content needs re-approval — the loop skips them until then",
    });
  }

  const idle = sequences.filter((s) => paused[s.id] && s.leads > 0);
  for (const s of idle) {
    out.push({
      id: `paused-${s.id}`,
      severity: "medium",
      primary: `“${s.name}” is paused with ${s.leads} leads waiting`,
      supporting: "No messages go out until you switch it back on",
    });
  }

  const all = sequences.flatMap((s) => stepRates(s).filter((r) => r.sent >= 5).map((r) => ({ ...r, seq: s })));
  if (all.length > 0) {
    const best = all.reduce((a, b) => (b.rate > a.rate ? b : a));
    const item = byId.get(best.contentId);
    if (item) {
      out.push({
        id: "best",
        severity: "low",
        primary: `“${item.title}” is your best opener — ${best.rate}% opened`,
        supporting: `Day ${best.day} in “${best.seq.name}”, sent to ${best.sent} leads`,
      });
    }
  }
  return out;
}
