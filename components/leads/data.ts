/* ============================================================
   Lead Profile — Mock Data (pre-subscription)
   The advisor's workspace for one prospect, Priya Menon, who
   entered via Path A (Explore) and is currently at Stage 3 —
   her financial snapshot has just been generated. Stages 4-8
   haven't happened yet, so those sections render as ghost cards.

   Stage numbering and completeness % are continuous with the
   Client Profile's 9-stage journey model (journey.data.ts) —
   when this lead subscribes, stage 8 here (85%) picks up
   exactly where the Client Profile's "subscribe" stage begins.
   ============================================================ */

export type LeadStageId =
  | "discover"
  | "quick-profile"
  | "snapshot"
  | "matching"
  | "discovery"
  | "detailed-data"
  | "plan-generated"
  | "subscribe";

export interface LeadStageInfo {
  id: LeadStageId;
  number: string;
  label: string;
  completeness: number;
}

export const LEAD_STAGES: LeadStageInfo[] = [
  { id: "discover", number: "01", label: "Discover", completeness: 5 },
  { id: "quick-profile", number: "02", label: "Quick Profile", completeness: 15 },
  { id: "snapshot", number: "03", label: "Snapshot", completeness: 25 },
  { id: "matching", number: "04", label: "Matching", completeness: 30 },
  { id: "discovery", number: "05", label: "Discovery Call", completeness: 45 },
  { id: "detailed-data", number: "06", label: "Detailed Data", completeness: 65 },
  { id: "plan-generated", number: "07", label: "Plan Generated", completeness: 80 },
  { id: "subscribe", number: "08", label: "Subscribe", completeness: 85 },
];

export const CURRENT_LEAD_STAGE: LeadStageId = "snapshot";

export function leadStageIndex(stage: LeadStageId): number {
  return LEAD_STAGES.findIndex((s) => s.id === stage);
}

export function leadStageStatus(stage: LeadStageId): "completed" | "current" | "upcoming" {
  const currentIndex = leadStageIndex(CURRENT_LEAD_STAGE);
  const stageIndex = leadStageIndex(stage);
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "current";
  return "upcoming";
}

export const DAYS_IN_CURRENT_STAGE: number = 2;
export const PROFILE_COMPLETENESS: number = 25;

export function completenessBand(pct: number): { label: string; tone: "behind" | "at-risk" | "on-track" } {
  if (pct <= 20) return { label: "Behind", tone: "behind" };
  if (pct <= 45) return { label: "At risk", tone: "at-risk" };
  return { label: "On track", tone: "on-track" };
}

export const NEXT_ACTION_BY_STAGE: Record<LeadStageId, string> = {
  discover: "Priya hasn't started her quick profile yet — nudge her if there's no movement in a few days.",
  "quick-profile": "Priya hasn't started her quick profile yet — nudge her if there's no movement in a few days.",
  snapshot: "Priya's snapshot flagged an ₹18L gap on her home purchase goal — review it before you talk to her.",
  matching: "Priya has been matched to you — get familiar with her profile before reaching out.",
  discovery: "You haven't logged discovery call notes yet — add them so her profile can move forward.",
  "detailed-data": "Priya hasn't connected accounts or shared documents yet — guide her to whichever method she's comfortable with.",
  "plan-generated": "Her plan has been generated — review it before you recommend it to her.",
  subscribe: "Priya is ready to subscribe — confirm her plan and complete the conversion.",
};

/* ---- Identity ---- */

export type LeadStatus = "New" | "Engaged" | "Qualified" | "Ready";

export interface LeadIdentity {
  name: string;
  id: string;
  prospectSince: string;
  status: LeadStatus;
}

export const LEAD_IDENTITY: LeadIdentity = {
  name: "Priya Menon",
  id: "L4821",
  prospectSince: "18 May 2025",
  status: "Engaged",
};

/* ---- Entry path ---- */

export type EntryPathId = "explore" | "talk" | "act";

export interface EntryPathInfo {
  id: EntryPathId;
  label: string;
  subtitle: string;
  description: string;
  timeline: string[];
}

export const ENTRY_PATHS: Record<EntryPathId, EntryPathInfo> = {
  explore: {
    id: "explore",
    label: "Exploring",
    subtitle: "Started with free financial snapshot",
    description:
      "This prospect started by exploring on their own. They completed a financial snapshot before engaging with you. They may be self-directed and value data before conversation.",
    timeline: ["Visited site", "Filled profile", "Got snapshot", "Explored advisors", "Booked call"],
  },
  talk: {
    id: "talk",
    label: "Wants to talk",
    subtitle: "Booked discovery call first",
    description:
      "This prospect wanted to speak with an advisor before committing to anything. They may need more guidance and reassurance. Lead the discovery call with empathy and education.",
    timeline: ["Visited site", "Set goal + expectation", "Got matched", "Booked call"],
  },
  act: {
    id: "act",
    label: "Ready to act",
    subtitle: "Selected plan and sharing data",
    description:
      "This prospect came ready to commit. They've already selected a plan and are sharing financial data. They're motivated — focus on data verification and quick onboarding.",
    timeline: ["Visited site", "Explored plans", "Selected plan", "Sharing data", "Review + confirm", "Book meeting"],
  },
};

export const LEAD_ENTRY_PATH: EntryPathId = "explore";

/* Steps completed within the path timeline, given the current stage. */
export const PATH_STEPS_COMPLETED = 3; // Visited site, Filled profile, Got snapshot

/* ---- Quick facts ---- */

export const LEAD_QUICK_FACTS = {
  primaryGoal: "Home Purchase",
  lifeStage: "Early Career",
  incomeRange: "₹15–25 L",
  riskComfort: "Moderate",
  entryPath: "Explore",
  leadSource: "Google search — retirement calculator",
  daysSinceFirstContact: 4,
  lastActivityDate: "20 May 2025",
};

/* ---- Conversion readiness ---- */

export interface ConversionMissingItem {
  label: string;
  actionLabel: string;
}

export const CONVERSION_READINESS: {
  status: "ready" | "not-ready" | "blocked";
  summary: string;
  missing: ConversionMissingItem[];
} = {
  status: "not-ready",
  summary: "Missing: discovery call, verified financial data, risk assessment",
  missing: [
    { label: "Discovery call not completed", actionLabel: "Suggest a call" },
    { label: "Financial data not verified", actionLabel: "Send data request" },
    { label: "Risk profile not assessed", actionLabel: "Schedule assessment" },
  ],
};

/* ---- AI features ---- */

export const AI_LEAD_INSIGHT = {
  text: "Priya completed her quick profile and financial snapshot within 24 hours of her first visit — high engagement, and her stated goals suggest a likely Gold-tier fit. She hasn't booked a discovery call yet — that's the next step to move her forward.",
  confidence: "high" as "high" | "medium" | "low",
};

export const AI_LEAD_SCORE = {
  score: 68,
  factors: "engagement velocity, data completeness, goal complexity",
  trend: "improving" as "improving" | "stable" | "declining",
};

export const AI_CONVERSION_PREDICTION = {
  probability: 61,
  avgDaysToConvert: 12,
  currentDaysInFunnel: 4,
  onTrack: true,
};

/* ---- Section 1 — AI lead summary ---- */

export const AI_LEAD_SUMMARY = {
  text: "Priya wants help planning a home purchase and building an emergency fund. She's early career, income ₹15–25L, and describes herself as moderate risk. Her snapshot flagged an ₹18L gap against her home purchase target, but that's built on self-reported numbers only — nothing verified yet. Book a discovery call to confirm the real picture and address her savings-rate concern directly.",
  updatedAt: "20 May 2025",
};

/* ---- Section 2 — Quick profile data ---- */

export const QUICK_PROFILE_DATA = {
  goals: ["Home Purchase", "Emergency Fund"],
  lifeStage: "Early Career",
  incomeRange: "₹15–25 L",
  riskComfort: { label: "Moderate", level: 3 }, // 1-5
  concerns: ["Not sure how much to save monthly", "Worried about market timing"],
  expectations: "Wants clear, simple guidance without excessive jargon",
  submittedDate: "19 May 2025",
  daysAgo: 1,
};

/* ---- Section 3 — Financial snapshot (free, AI-generated) ---- */

export interface GoalGapCard {
  goal: string;
  target: string;
  gap: string;
  feasibility: "achievable" | "tight" | "unlikely";
}

export const FINANCIAL_SNAPSHOT = {
  goalReadinessScore: 58,
  status: "at-risk" as "on-track" | "at-risk" | "behind",
  basis: "Based on self-reported income and goals",
  goalGaps: [
    { goal: "Home Purchase", target: "₹40 L", gap: "₹18 L", feasibility: "tight" },
    { goal: "Emergency Fund", target: "₹3 L", gap: "₹3 L", feasibility: "achievable" },
  ] as GoalGapCard[],
  keyInsights: [
    "At her stated savings rate, Priya won't hit the home purchase goal within her timeline — flag this early in the call.",
    "She didn't mention an emergency fund at all — worth asking about directly rather than assuming it's covered.",
    "Her moderate risk comfort lines up with a balanced portfolio, so no red flag there.",
  ],
  advisorNextSteps: [
    "Book the discovery call — she hasn't scheduled one yet",
    "Use the savings-rate gap to frame the conversation",
    "Guide her to connect accounts once she's engaged, so the numbers stop being estimates",
  ],
};

/* ---- Bottom — Lead activity timeline ---- */

export type LeadActor = "Client" | "Advisor" | "AI" | "System";

export interface LeadActivityEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  stageId: LeadStageId;
  actor: LeadActor;
  isAI: boolean;
}

export const LEAD_ACTIVITY: LeadActivityEntry[] = [
  { id: "a1", date: "18 May 2025", time: "10:12 AM", title: "Lead captured", description: "Visited retirement calculator and pricing pages · referred via Google search.", stageId: "discover", actor: "System", isAI: false },
  { id: "a2", date: "19 May 2025", time: "6:45 PM", title: "Profile form submitted", description: "Quick profile completed — home purchase goal, early career, moderate risk comfort.", stageId: "quick-profile", actor: "Client", isAI: false },
  { id: "a3", date: "20 May 2025", time: "9:02 AM", title: "Financial snapshot generated", description: "AI-generated snapshot flagged an ₹18L gap against the home purchase target.", stageId: "snapshot", actor: "AI", isAI: true },
];

export type LeadActivityFilter = "all" | "mine" | "prospect" | "ai" | "system";

/* ---- Prospect Awareness — what the prospect is seeing right now,
   by current sub-stage. Left column, so the advisor never has to
   guess what's on the other side of the conversation. ---- */

export const PROSPECT_TOUCHPOINT: Record<LeadStageId, string> = {
  discover: "Website landing page — product info, customer stories, security & compliance info.",
  "quick-profile": "Quick profile form — progress indicator, privacy notice.",
  snapshot: "Financial snapshot dashboard — goal readiness score, key insights, and a CTA to book a call with you.",
  matching: "Advisor matching results — your profile, experience, ratings, and a calendar to book a call.",
  discovery: "Video call interface — services & plan presentation, Q&A.",
  "detailed-data": "Secure data connection flow — account aggregation UI, consent screens, KYC verification.",
  "plan-generated": "Financial blueprint dashboard / PDF — goal-based recommendations, plan comparison.",
  subscribe: "Plan selection page — payment gateway, welcome screen, onboarding checklist.",
};

/* ---- Intelligence Summary — the 2x2 "what we know / learned /
   missing / do next" that opens the detail page's right column.
   Every fact is source-tagged so AI inference never reads as an
   unexplained claim. ---- */

export type DataSource = "client-provided" | "advisor-observed" | "system-derived" | "verified" | "uploaded" | "connected";

export interface KnownFact {
  id: string;
  fact: string;
  source: DataSource;
}

export const WHAT_WE_KNOW: KnownFact[] = [
  { id: "k1", fact: "Income range ₹15–25L", source: "client-provided" },
  { id: "k2", fact: "Risk comfort: moderate", source: "client-provided" },
  { id: "k3", fact: "Home purchase goal, target ₹40L", source: "client-provided" },
  { id: "k4", fact: "Goal readiness score: 58", source: "system-derived" },
];

export interface LearnedInsight {
  id: string;
  text: string;
  confidence: "high" | "medium" | "low";
}

export const WHAT_WE_LEARNED: LearnedInsight[] = [
  { id: "l1", text: "High engagement — completed her quick profile and snapshot within 24 hours of first visit.", confidence: "high" },
  { id: "l2", text: "Initial risk profile reads moderate, but the full goal-gap analysis is still pending verified financial data.", confidence: "medium" },
];

export interface MissingItem {
  id: string;
  item: string;
  whyItMatters: string;
  actionLabel: string;
}

export const WHATS_MISSING: MissingItem[] = [
  { id: "m1", item: "Verified income", whyItMatters: "Needed for an accurate goal-gap analysis", actionLabel: "Guide to connect accounts" },
  { id: "m2", item: "Emergency fund status", whyItMatters: "Needed for protection planning", actionLabel: "Ask in the discovery call" },
];

export const MISSING_IMPACT = { current: 25, projected: 65 };

export const NEXT_BEST_ACTION = {
  text: "Book the discovery call — she hasn't scheduled one yet. Her snapshot shows a savings-rate gap that's worth opening the conversation with.",
  evidence: ["Snapshot generated 20 May 2025", "₹18L goal gap flagged", "No call booked in 2 days since"],
  ctaLabel: "Book Discovery Call",
  confidence: "high" as "high" | "medium" | "low",
};
