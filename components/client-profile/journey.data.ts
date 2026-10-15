/* ============================================================
   Progressive Client Story — 9-stage journey data model.
   Replaces the 5-stage AdvisoryJourney. Every meeting, form,
   or system event progressively fills in one layer of the same
   profile — this file is that layered story for Anika Rao,
   continuous with the facts already in data.ts.
   ============================================================ */

import type { SubscriptionTier } from "./meeting-context.data";

export type JourneyStageId =
  | "discover"
  | "quick-profile"
  | "snapshot"
  | "matching"
  | "discovery"
  | "share-data"
  | "plan"
  | "subscribe"
  | "ongoing";

export interface JourneyStageInfo {
  id: JourneyStageId;
  number: string;
  label: string;
  profileState: string;
  completeness: number; // cumulative % once this stage is reached
}

export const JOURNEY_STAGES: JourneyStageInfo[] = [
  { id: "discover", number: "01", label: "Discover", profileState: "Lead", completeness: 5 },
  { id: "quick-profile", number: "02", label: "Quick Profile", profileState: "Prospect", completeness: 15 },
  { id: "snapshot", number: "03", label: "Financial Snapshot", profileState: "Prospect (enriched)", completeness: 25 },
  { id: "matching", number: "04", label: "Advisor Matching", profileState: "Matched Prospect", completeness: 30 },
  { id: "discovery", number: "05", label: "Discovery Call", profileState: "Discovery Profile", completeness: 45 },
  { id: "share-data", number: "06", label: "Share Detailed Data", profileState: "Verified Client", completeness: 65 },
  { id: "plan", number: "07", label: "Personalised Plan", profileState: "Advised Client", completeness: 80 },
  { id: "subscribe", number: "08", label: "Subscribe", profileState: "Active Client", completeness: 85 },
  { id: "ongoing", number: "09", label: "Ongoing Engagement", profileState: "Actively Managed Client", completeness: 96 },
];

// Anika has an active Platinum subscription and a completed plan review —
// she is well into ongoing engagement. A real build derives this from
// which stage events actually exist on the account.
export const CURRENT_JOURNEY_STAGE: JourneyStageId = "ongoing";

export function journeyStageIndex(stage: JourneyStageId): number {
  return JOURNEY_STAGES.findIndex((s) => s.id === stage);
}

export function journeyStageStatus(stage: JourneyStageId): "completed" | "current" | "upcoming" {
  const currentIndex = journeyStageIndex(CURRENT_JOURNEY_STAGE);
  const stageIndex = journeyStageIndex(stage);
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "current";
  return "upcoming";
}

/* ---- Plan-specific depth ----
   Silver caps the story at Advised Client (~80%) and closes; Gold can
   reach 100%; Platinum can exceed it with the deepest layers. */

export const PLAN_COMPLETENESS_CAP: Record<SubscriptionTier, number> = {
  silver: 80,
  gold: 100,
  platinum: 115,
};

export const PROFILE_COMPLETENESS = 96; // Anika's actual current completeness

/* ---- Journey timeline — the Story tab's chronological narrative ---- */

export type TimelineActor = "Client" | "Advisor" | "AI" | "System";

export interface TimelineEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  stageId: JourneyStageId;
  actor: TimelineActor;
  isAI: boolean;
}

export const JOURNEY_TIMELINE: TimelineEntry[] = [
  { id: "t1", date: "2 May 2025", time: "11:20 AM", title: "Lead captured", description: "Visited pricing and retirement calculator pages · referred via Google search.", stageId: "discover", actor: "System", isAI: false },
  { id: "t2", date: "9 May 2025", time: "4:05 PM", title: "Quick Profile submitted", description: "Goals, life stage and risk comfort captured — pre-retirement, moderate risk.", stageId: "quick-profile", actor: "Client", isAI: false },
  { id: "t3", date: "9 May 2025", time: "4:08 PM", title: "Financial snapshot generated", description: "AI-generated snapshot flagged a retirement funding gap and an unconfirmed protection need.", stageId: "snapshot", actor: "AI", isAI: true },
  { id: "t4", date: "10 May 2025", time: "9:30 AM", title: "Advisor matched", description: "Matched to Aditya Sharma — 94% match on retirement planning experience and communication style.", stageId: "matching", actor: "AI", isAI: true },
  { id: "t5", date: "12 May 2025", time: "3:40 PM", title: "Discovery form submitted", description: "Client identified retirement income as the primary priority.", stageId: "discovery", actor: "Client", isAI: false },
  { id: "t6", date: "13 May 2025", time: "9:15 AM", title: "Discovery call completed", description: "Advisor captured why each goal matters, urgency, and rising healthcare costs as a key concern.", stageId: "discovery", actor: "Advisor", isAI: false },
  { id: "t7", date: "16 May 2025", time: "10:00 AM", title: "Accounts connected", description: "Bank, mutual fund and insurance accounts linked · data completeness 92%.", stageId: "share-data", actor: "Client", isAI: false },
  { id: "t8", date: "16 May 2025", time: "10:04 AM", title: "Data verification completed", description: "KYC re-verified, risk profile confirmed as Moderate, goal readiness calculated.", stageId: "share-data", actor: "System", isAI: false },
  { id: "t9", date: "15 May 2025", time: "2:30 PM", title: "Financial plan generated", description: "Comprehensive Financial Plan drafted — retirement, wedding goal, protection review.", stageId: "plan", actor: "AI", isAI: true },
  { id: "t10", date: "15 May 2025", time: "5:00 PM", title: "Plan reviewed with client", description: "Walked through scope and rationale · client asked about SIP flexibility.", stageId: "plan", actor: "Advisor", isAI: false },
  { id: "t11", date: "18 May 2025", time: "2:00 PM", title: "Plan subscribed", description: "Client subscribed to the Platinum annual advisory plan.", stageId: "subscribe", actor: "Client", isAI: false },
  { id: "t12", date: "18 May 2025", time: "2:15 PM", title: "Onboarding completed", description: "Advisory agreement signed, billing set up, engagement schedule confirmed.", stageId: "subscribe", actor: "System", isAI: false },
  { id: "t13", date: "19 May 2025", time: "2:00 PM", title: "Meeting completed — Retirement Plan Review", description: "Retirement funding gap and wedding goal discussed · 2 action items created.", stageId: "ongoing", actor: "Advisor", isAI: false },
  { id: "t14", date: "20 May 2025", time: "11:02 AM", title: "AI generated pre-meeting brief", description: "Brief prepared for the 22 May plan review, summarising open questions and recent activity.", stageId: "ongoing", actor: "AI", isAI: true },
  { id: "t15", date: "21 May 2025", time: "6:20 PM", title: "Learning module started", description: "Client started Retirement Planning Essentials.", stageId: "ongoing", actor: "Client", isAI: false },
  { id: "t16", date: "21 May 2025", time: "7:05 PM", title: "Simulation run", description: "Retirement Corpus Simulator run with updated SIP assumptions.", stageId: "ongoing", actor: "Client", isAI: false },
];

export type TimelineFilter = "all" | "meetings" | "goals" | "actions" | "documents" | "ai";

/* ---- Client emotion at each stage (design-time reference, not tracked live) ---- */

export const EMOTION_BY_STAGE: Record<JourneyStageId, { emoji: string; label: string }> = {
  discover: { emoji: "😊", label: "Curious — “Is this for me?”" },
  "quick-profile": { emoji: "🤔", label: "Interested — “This looks relevant”" },
  snapshot: { emoji: "😃", label: "Encouraged — “This is helpful”" },
  matching: { emoji: "🤞", label: "Hopeful — “Found a good option”" },
  discovery: { emoji: "😌", label: "Reassured — “They understand me”" },
  "share-data": { emoji: "😟", label: "Cautious — “My data is safe, right?”" },
  plan: { emoji: "😊", label: "Confident — “This makes sense”" },
  subscribe: { emoji: "🤩", label: "Excited — “Let's get started!”" },
  ongoing: { emoji: "😌", label: "Satisfied — “I'm on track”" },
};

/* ---- Stage-relevant metrics — only the current stage's set is shown ---- */

export const STAGE_METRICS: Partial<Record<JourneyStageId, { label: string; value: string }[]>> = {
  "share-data": [
    { label: "Account connection success", value: "100%" },
    { label: "Data completeness", value: "92%" },
  ],
  plan: [
    { label: "Plan acceptance rate", value: "1 of 1" },
    { label: "Time to generate plan", value: "4 hrs" },
  ],
  ongoing: [
    { label: "Retention rate", value: "100%" },
    { label: "Engagement rate", value: "High" },
    { label: "Goal achievement rate", value: "60%" },
  ],
};

/* ---- Pain points + opportunities — shown for the current stage only ---- */

export const PAIN_OPPORTUNITY: Partial<Record<JourneyStageId, { pain: string; opportunity: string; action: string }>> = {
  "share-data": {
    pain: "Data connection failures and security concerns are common at this step.",
    opportunity: "Simplify the connection flow and explain clearly what data is used for.",
    action: "Guide client through connection",
  },
  ongoing: {
    pain: "Engagement naturally dips between scheduled reviews.",
    opportunity: "Proactive nudges — a completed simulation or a life event is a natural reason to reach out.",
    action: "Send a check-in based on recent activity",
  },
};

/* ---- AI Client Summary — Story tab ---- */

export const AI_CLIENT_SUMMARY = {
  text: "Anika is a 55-year-old pre-retiree focused on securing retirement income and funding her daughter's wedding. She subscribed to the Platinum plan in May 2025 and has completed her first plan review. Her retirement funding is projected ₹1.2 Cr below target, and the wedding goal still needs amount confirmation — both are open discussion points for the next meeting.",
  updatedAt: "20 May 2025",
};

/* ---- Who They Are — human context captured at discovery, editable over time ---- */

export interface WhoTheyAreEntry {
  id: string;
  label: string;
  detail: string;
  addedAfter: string;
}

export const WHO_THEY_ARE: WhoTheyAreEntry[] = [
  { id: "w1", label: "Why retirement matters to her", detail: "Wants certainty that her lifestyle won't change after she stops working — has seen peers underprepared.", addedAfter: "Discovery Call" },
  { id: "w2", label: "Why the wedding goal matters", detail: "Wants to fund her daughter's wedding without dipping into retirement savings.", addedAfter: "Discovery Call" },
  { id: "w3", label: "Expectations from advisor", detail: "Prefers clear numbers over jargon; wants to review progress every quarter, not just annually.", addedAfter: "Discovery Call" },
  { id: "w4", label: "Life circumstances", detail: "Daughter's wedding likely in 2027; husband recently reduced work hours ahead of his own retirement.", addedAfter: "Retirement Plan Review" },
];

/* ---- Advisor notes — private, not visible to the client ---- */

export interface AdvisorNote {
  id: string;
  date: string;
  note: string;
  relatedMeeting?: string;
}

export const ADVISOR_NOTES: AdvisorNote[] = [
  { id: "n1", date: "13 May 2025", note: "Responds well to visual projections rather than spreadsheets — lead with charts in the next review.", relatedMeeting: "Discovery Call" },
  { id: "n2", date: "19 May 2025", note: "Hesitant about increasing SIP without seeing the exact retirement-age impact — bring a side-by-side comparison next time.", relatedMeeting: "Retirement Plan Review" },
];

export const AI_SUGGESTED_OBSERVATIONS = [
  "Client asked about SIP flexibility twice in the last month — consider proactively addressing it in the next meeting.",
  "Emergency fund goal has not been discussed since discovery — may be worth revisiting given the protection gap.",
];

/* ---- Relationship health ---- */

export const RELATIONSHIP_HEALTH: { score: number; trend: "improving" | "stable" | "declining" } = {
  score: 82,
  trend: "improving",
};

/* ---- AI Next Best Action ---- */

export const AI_NEXT_BEST_ACTION = {
  text: "Schedule the Q2 review — 2 action items are still pending from the last meeting.",
  confidence: "high" as "high" | "medium" | "low",
};

/* ---- Quick facts (left column) ---- */

export const QUICK_FACTS = {
  lifeStage: "Pre-Retirement",
  location: "Mumbai, Maharashtra",
  incomeRange: "₹1.8 L – ₹2 L / month",
  riskProfile: "Moderate",
  activeGoals: 3,
  planType: "Platinum",
  nextMeetingDate: "22 May 2025",
  daysSinceLastInteraction: 3,
};

/* ---- Stale data — sections untouched for 90+ days ---- */

export const STALE_SECTIONS: string[] = []; // none currently stale for Anika

/* ---- Meetings tab — this client's meeting history only ---- */

export interface ClientMeeting {
  id: string;
  date: string;
  time: string;
  purpose: string;
  goalsCovered: string[];
  status: "completed" | "scheduled" | "cancelled";
  planAtTime: string;
  profileLayerAdded: string;
}

export const CLIENT_MEETINGS: ClientMeeting[] = [
  { id: "m1", date: "13 May 2025", time: "9:15 AM", purpose: "Discovery Call", goalsCovered: ["Retirement", "Wedding"], status: "completed", planAtTime: "Prospect", profileLayerAdded: "Added: human context, goal urgency" },
  { id: "m2", date: "15 May 2025", time: "5:00 PM", purpose: "Proposal Walkthrough", goalsCovered: ["Retirement", "Protection"], status: "completed", planAtTime: "Prospect", profileLayerAdded: "Added: recommended plan, rationale" },
  { id: "m3", date: "19 May 2025", time: "2:00 PM", purpose: "Retirement Plan Review", goalsCovered: ["Retirement", "Wedding"], status: "completed", planAtTime: "Platinum", profileLayerAdded: "Updated: goal progress, strategy adjustment" },
  { id: "m4", date: "22 May 2025", time: "10:30 AM", purpose: "Retirement Plan Review", goalsCovered: ["Retirement"], status: "scheduled", planAtTime: "Platinum", profileLayerAdded: "Not yet held" },
];

export const MEETING_STATS = {
  total: 4,
  thisQuarter: 3,
  avgFrequencyDays: 21,
  attendedVsCancelled: "3 of 3",
};

/* ---- Learning tab ---- */

export interface LearningResource {
  id: string;
  title: string;
  type: "Article" | "Video" | "Module";
  relatedGoal: string;
  recommendedAfter: string;
  estMinutes: number;
  progress: number;
  status: "recommended" | "in-progress" | "completed";
  completedOn?: string;
}

export const LEARNING_RESOURCES: LearningResource[] = [
  { id: "l1", title: "Retirement Planning Essentials", type: "Module", relatedGoal: "Retirement", recommendedAfter: "Discovery Call", estMinutes: 25, progress: 50, status: "in-progress" },
  { id: "l2", title: "Understanding Term Insurance", type: "Article", relatedGoal: "Protection", recommendedAfter: "Retirement Plan Review", estMinutes: 8, progress: 0, status: "recommended" },
  { id: "l3", title: "How SIPs Work", type: "Video", relatedGoal: "Retirement", recommendedAfter: "Discovery Call", estMinutes: 6, progress: 100, status: "completed", completedOn: "16 May 2025" },
];

export const LEARNING_AI_SUGGESTIONS = [
  { id: "ls1", title: "Tax-Efficient Withdrawal Strategies", relatedGoal: "Retirement" },
];

/* ---- Simulations tab ---- */

export interface SimulationRecord {
  id: string;
  type: string;
  date: string;
  runBy: "Advisor" | "Client" | "AI";
  keyInputs: string;
  keyOutput: string;
  relatedGoal: string;
  relatedMeeting: string;
}

export const SIMULATION_RECORDS: SimulationRecord[] = [
  { id: "s1", type: "Retirement Corpus Simulator", date: "21 May 2025", runBy: "Client", keyInputs: "SIP ₹45,000/mo, 8yr horizon, 11% returns", keyOutput: "Projected corpus ₹1.8 Cr vs ₹3 Cr target", relatedGoal: "Retirement", relatedMeeting: "Retirement Plan Review" },
];

export const AVAILABLE_SIMULATORS = ["Retirement Simulator", "SIP Calculator", "Emergency Fund Planner", "Education Goal Planner"];

/* ---- Actions tab ---- */

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: "Advisor" | "Client";
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  createdIn: string;
  goal: string | null;
}

export const CLIENT_ACTION_ITEMS: ActionItem[] = [
  { id: "a1", task: "Confirm retirement income target with client", assignedTo: "Advisor", dueDate: "24 May 2025", status: "in-progress", createdIn: "Retirement Plan Review", goal: "Retirement" },
  { id: "a2", task: "Provide updated health insurance policy details", assignedTo: "Client", dueDate: "23 May 2025", status: "pending", createdIn: "Retirement Plan Review", goal: "Protection" },
  { id: "a3", task: "Review SIP contribution increase", assignedTo: "Advisor", dueDate: "18 May 2025", status: "overdue", createdIn: "Discovery Call", goal: "Retirement" },
  { id: "a4", task: "Sign advisory agreement", assignedTo: "Client", dueDate: "18 May 2025", status: "completed", createdIn: "Proposal Walkthrough", goal: null },
];

/* ---- Compliance tab ---- */

export interface ComplianceAuditEvent {
  id: string;
  date: string;
  actor: TimelineActor;
  action: string;
  reasonCode?: string;
}

export const COMPLIANCE_AUDIT_TRAIL: ComplianceAuditEvent[] = [
  { id: "c1", date: "12 May 2025", actor: "Client", action: "KYC submitted" },
  { id: "c2", date: "13 May 2025", actor: "System", action: "KYC verified" },
  { id: "c3", date: "16 May 2025", actor: "Client", action: "Data consent granted" },
  { id: "c4", date: "16 May 2025", actor: "System", action: "Accounts connected" },
  { id: "c5", date: "16 May 2025", actor: "System", action: "Risk profile assessed — Moderate" },
  { id: "c6", date: "15 May 2025", actor: "AI", action: "Financial plan generated" },
  { id: "c7", date: "18 May 2025", actor: "Advisor", action: "Plan approved for client delivery" },
  { id: "c8", date: "19 May 2025", actor: "Advisor", action: "Approved AI-generated meeting brief" },
];

export interface SuitabilityLogEntry {
  id: string;
  recommendation: string;
  rationale: string;
  riskProfileAtTime: string;
  clientResponse: "accepted" | "declined" | "modified";
  advisor: string;
  date: string;
}

export const SUITABILITY_LOG: SuitabilityLogEntry[] = [
  { id: "sl1", recommendation: "Comprehensive Financial Plan — Platinum tier", rationale: "Retirement funding gap and unconfirmed protection coverage need ongoing planning, not a one-time recommendation.", riskProfileAtTime: "Moderate", clientResponse: "accepted", advisor: "Aditya Sharma", date: "18 May 2025" },
];
