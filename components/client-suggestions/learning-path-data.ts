/* ============================================================
   Learning Paths — the sequenced counterpart to Assign

   The distinction the whole feature rests on:

     ONE item          → Assign. Individual or group. Send.
     MANY items, and
     the ORDER matters → Learning Path. Curate, sequence, send.

   A path step carries a *role* — Understand / Apply / Explore /
   Discuss — which is how the advisor tells the client what this
   step is for. Roles are the advisor's editorial voice; Finny
   may propose them but never commits them.

   Finny's insight is per client and derived from the context the
   advisor already has: discovery notes, queries the client
   raised, goal trajectory, previous learning, engagement. It
   produces objectives and a suggested sequence. Applying either
   one only rearranges the canvas — nothing is sent, nothing is
   approved, nothing reaches the client.
   ============================================================ */

import type { Topic } from "./content-data";

/* ---- Sequence roles ---- */

export type SequenceRole = "understand" | "apply" | "explore" | "discuss";

export const SEQUENCE_ROLE_LABEL: Record<SequenceRole, string> = {
  understand: "Understand",
  apply: "Apply",
  explore: "Explore",
  discuss: "Discuss",
};

/** What the role promises the client — shown under the step. */
export const SEQUENCE_ROLE_HINT: Record<SequenceRole, string> = {
  understand: "Build the concept first",
  apply: "Try it against their own numbers",
  explore: "Go deeper at their own pace",
  discuss: "Bring questions to the meeting",
};

export const SEQUENCE_ROLES = Object.keys(SEQUENCE_ROLE_LABEL) as SequenceRole[];

/* ---- Path ---- */

export interface PathStep {
  /** Stable across reorders, so drag state doesn't fight React keys. */
  id: string;
  contentId: string;
  role?: SequenceRole;
}

export type PathAudienceMode = "individual" | "group";

/* ---- Finny's per-client insight ---- */

export interface SuggestedStep {
  contentId: string;
  role: SequenceRole;
  /** Why this piece, at this position — the advisor's audit of Finny's logic. */
  because: string;
}

export interface FinnyClientInsight {
  clientId: string;
  /** One sentence the advisor can agree or disagree with. */
  headline: string;
  /** The context Finny drew on. Named explicitly so it can be challenged. */
  signals: string[];
  /** What the client should walk away able to do. */
  objectives: string[];
  sequence: SuggestedStep[];
  /** Clients whose recent conversations point the same way, but who aren't
      matched by any hard facet — the advisor opts them in, never Finny. */
  adjacentClientIds: string[];
  adjacentReason: string;
}

export const FINNY_CLIENT_INSIGHTS: FinnyClientInsight[] = [
  {
    clientId: "C12347", // Priya Sharma — Gold, retirement, review in 5 days
    headline:
      "Priya may benefit from strengthening her understanding of retirement readiness before the next review.",
    signals: [
      "Retirement is her primary goal",
      "She asked what corpus she actually needs during the last call",
      "Her current retirement trajectory needs attention",
      "Retirement timeline was discussed in discovery",
      "Next review is in 5 days",
    ],
    objectives: [
      "Understand what retirement readiness means",
      "Test her current position against the plan",
      "Explore the planning trade-offs before we meet",
    ],
    sequence: [
      { contentId: "ct-017", role: "understand", because: "She has not been assigned any retirement primer yet" },
      { contentId: "ct-005", role: "apply", because: "Answers her corpus question with her own numbers" },
      { contentId: "ct-002", role: "explore", because: "Depth for the trade-offs she raised, at her own pace" },
    ],
    adjacentClientIds: ["C12356", "C12379", "C12389"],
    adjacentReason: "Retirement readiness came up in their last two meetings, though their goals aren't flagged",
  },
  {
    clientId: "C12345", // Anika Rao — Platinum, retirement + child education, goal off track
    headline:
      "Anika's education goal is off track — she may benefit from seeing the shortfall before we discuss the fix.",
    signals: [
      "Child Education goal is flagged off track",
      "Education corpus projects ₹4.3L below target",
      "She completed The Power of Compounding",
      "Review due in 5 days",
    ],
    objectives: [
      "See the size of the education shortfall",
      "Understand which levers actually close it",
      "Come to the review with a preferred option",
    ],
    sequence: [
      { contentId: "ct-009", role: "apply", because: "Already personalised to her education goal and plan" },
      { contentId: "ct-018", role: "explore", because: "Shows what a step-up does without changing today's outflow" },
      { contentId: "ct-015", role: "discuss", because: "Frames the goal-vs-goal trade-off for the meeting" },
    ],
    adjacentClientIds: ["C12375", "C12383"],
    adjacentReason: "Both raised education funding in recent meetings and have the same goal flagged",
  },
  {
    clientId: "C12350", // Rahul Singh — Silver, emergency fund, inactive, new client
    headline: "Rahul has been inactive since onboarding — the shortest possible path is more likely to land.",
    signals: [
      "New client, onboarded 62 days ago",
      "No content opened yet",
      "Emergency fund is his only stated goal",
      "Engagement is inactive",
    ],
    objectives: ["Get one concept across", "Establish the habit of opening what I send"],
    sequence: [
      { contentId: "ct-008", role: "understand", because: "Matches his only goal and takes under five minutes" },
      { contentId: "ct-019", role: "discuss", because: "An in-person session is the better re-engagement lever for him" },
    ],
    adjacentClientIds: ["C12362", "C12391"],
    adjacentReason: "Also inactive since onboarding with no content opened",
  },
];

export function insightFor(clientId: string | null): FinnyClientInsight | null {
  if (!clientId) return null;
  return FINNY_CLIENT_INSIGHTS.find((i) => i.clientId === clientId) ?? null;
}

/* ---- Group audience ---- */

export interface GroupFacets {
  goals: Topic[];
  plans: string[];
  engagement: string[];
  advisoryContext: string[];
}

export const EMPTY_FACETS: GroupFacets = { goals: [], plans: [], engagement: [], advisoryContext: [] };

export function facetCount(f: GroupFacets): number {
  return f.goals.length + f.plans.length + f.engagement.length + f.advisoryContext.length;
}

/* ---- Finny's audience hints ----

   The facets can only see recorded fields. These clients come from
   somewhere the facets cannot reach — what was actually said in recent
   meetings and messages. That is the whole reason they are a *suggestion*
   the advisor opts into, and never part of the matched count. */

export interface AudienceHint {
  topic: Topic;
  clientIds: string[];
  reason: string;
}

export const FINNY_AUDIENCE_HINTS: AudienceHint[] = [
  {
    topic: "child-education",
    clientIds: ["C12346", "C12349", "C12365", "C12370", "C12386"],
    reason: "Education planning came up in their last two meetings, though it isn't a recorded goal yet",
  },
  {
    topic: "retirement",
    clientIds: ["C12358", "C12361", "C12374", "C12385"],
    reason: "They asked about retirement corpus during recent calls",
  },
  {
    topic: "emergency-fund",
    clientIds: ["C12360", "C12368", "C12380"],
    reason: "Cash-flow strain discussed recently — an emergency fund is the step before it",
  },
  {
    topic: "home-purchase",
    clientIds: ["C12354", "C12376", "C12388"],
    reason: "Mentioned property plans during discovery",
  },
  {
    topic: "wealth-creation",
    clientIds: ["C12367", "C12371", "C12389"],
    reason: "Investable surplus has grown since their last review",
  },
  {
    topic: "market-education",
    clientIds: ["C12350", "C12362", "C12372", "C12384"],
    reason: "Raised concerns about market movement in recent messages",
  },
  {
    topic: "tax-planning",
    clientIds: ["C12351", "C12364", "C12379"],
    reason: "Retired clients with taxable withdrawals this financial year",
  },
  {
    topic: "insurance",
    clientIds: ["C12347", "C12353", "C12358"],
    reason: "No protection review on record in the last 18 months",
  },
  {
    topic: "investment-basics",
    clientIds: ["C12350", "C12368"],
    reason: "New relationships with no foundational content assigned yet",
  },
  {
    topic: "financial-planning",
    clientIds: ["C12357", "C12372"],
    reason: "Multiple competing goals with no written plan on record",
  },
  {
    topic: "cash-flow",
    clientIds: ["C12352", "C12375"],
    reason: "Contributions missed twice this quarter",
  },
  {
    topic: "debt-planning",
    clientIds: ["C12365", "C12392"],
    reason: "Loan EMIs discussed during their last review",
  },
];

export function audienceHintFor(topic: Topic): AudienceHint | null {
  return FINNY_AUDIENCE_HINTS.find((h) => h.topic === topic) ?? null;
}

/** The five goals worth targeting a broadcast at — the rest are too thin
    to compose a group from in a solo practice. */
export const GROUP_GOAL_OPTIONS: Topic[] = [
  "retirement",
  "child-education",
  "emergency-fund",
  "home-purchase",
  "wealth-creation",
];

/* ---- Saved learning paths ----
   Ready-made sequences the advisor can drop into the Sequence Builder as a
   single step. Built only from approved, published content. */

export interface SavedLearningPath {
  id: string;
  title: string;
  description: string;
  /** Content ids in the order the client receives them. */
  contentIds: string[];
}

export const LEARNING_PATHS: SavedLearningPath[] = [
  {
    id: "lp-001",
    title: "Retirement readiness",
    description: "From what readiness means to a plan the client can test against their own numbers.",
    contentIds: ["ct-017", "ct-004", "ct-005"],
  },
  {
    id: "lp-002",
    title: "Investing foundations",
    description: "Compounding, goal-based investing, then a step-up SIP the client can explore.",
    contentIds: ["ct-001", "ct-015", "ct-018"],
  },
  {
    id: "lp-003",
    title: "Protect the household",
    description: "Emergency reserve first, then term cover sized to the family's needs.",
    contentIds: ["ct-008", "ct-010"],
  },
];
