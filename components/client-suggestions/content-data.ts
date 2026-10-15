/* ============================================================
   Content Studio — data model

   Two deliberate separations that the previous model conflated:

   1. Compliance status ≠ publication status. A piece can be
      "Approved for Use" and still be a Draft; it can be
      "Changes Required" and never reach publication.
   2. AI review ≠ approval. Finny runs checks and produces
      findings; only the advisor can move something to
      "Approved for Use", and that decision is recorded with
      their name and date. There is no "AI Approved" state.
   ============================================================ */

/* ---- Taxonomy ---- */

export type ContentCategory = "learning" | "simulation" | "workshop";
export type LearningFormat = "video" | "course" | "image-post" | "pdf";
export type WorkshopMode = "online" | "offline";

export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> = {
  learning: "Learning",
  simulation: "Simulation",
  workshop: "Workshop",
};

export const LEARNING_FORMAT_LABEL: Record<LearningFormat, string> = {
  video: "Video",
  course: "Course",
  "image-post": "Image Post",
  pdf: "PDF",
};

/** Client relevance — also the Topic filter vocabulary. */
export type Topic =
  | "retirement"
  | "emergency-fund"
  | "investment-basics"
  | "tax-planning"
  | "insurance"
  | "child-education"
  | "home-purchase"
  | "cash-flow"
  | "debt-planning"
  | "wealth-creation"
  | "financial-planning"
  | "market-education";

export const TOPIC_LABEL: Record<Topic, string> = {
  retirement: "Retirement",
  "emergency-fund": "Emergency Fund",
  "investment-basics": "Investment Basics",
  "tax-planning": "Tax Planning",
  insurance: "Insurance",
  "child-education": "Child Education",
  "home-purchase": "Home Purchase",
  "cash-flow": "Cash Flow",
  "debt-planning": "Debt Planning",
  "wealth-creation": "Wealth Creation",
  "financial-planning": "Financial Planning",
  "market-education": "Market Education",
};

/** Optional metadata only — never navigation, never a required journey. */
export type AdvisoryStage = "discovery" | "planning" | "review" | "follow-up";

export const ADVISORY_STAGE_LABEL: Record<AdvisoryStage, string> = {
  discovery: "Discovery",
  planning: "Planning",
  review: "Review",
  "follow-up": "Follow-up",
};

/* ---- Compliance ---- */

export type ComplianceStatus =
  | "not-reviewed"
  | "ai-review-complete"
  | "advisor-review-required"
  | "changes-required"
  | "approved-for-use";

export const COMPLIANCE_STATUS_LABEL: Record<ComplianceStatus, string> = {
  "not-reviewed": "Not Reviewed",
  "ai-review-complete": "AI Review Complete",
  "advisor-review-required": "Advisor Review Required",
  "changes-required": "Changes Required",
  "approved-for-use": "Approved for Use",
};

export type PublicationStatus = "draft" | "scheduled" | "published" | "archived";

export const PUBLICATION_STATUS_LABEL: Record<PublicationStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

/** The seven checks Finny runs on every piece of content. */
export type ComplianceCheckId =
  | "advisor-identification"
  | "registration-information"
  | "disclosure-language"
  | "risk-language"
  | "performance-claims"
  | "guaranteed-return-language"
  | "educational-vs-personalised";

export const COMPLIANCE_CHECK_LABEL: Record<ComplianceCheckId, string> = {
  "advisor-identification": "Advisor identification",
  "registration-information": "Registration information",
  "disclosure-language": "Disclosure language",
  "risk-language": "Risk language",
  "performance-claims": "Performance claims",
  "guaranteed-return-language": "Guaranteed-return language",
  "educational-vs-personalised": "Educational vs personalised advice",
};

export const ALL_CHECK_IDS = Object.keys(COMPLIANCE_CHECK_LABEL) as ComplianceCheckId[];

export interface ComplianceIssue {
  id: string;
  checkId: ComplianceCheckId;
  title: string;
  /** The exact text Finny flagged. */
  original: string;
  /** Finny's proposed rewrite — a suggestion, never an edit. */
  suggestion: string;
  location?: string;
  resolution: "open" | "accepted" | "dismissed";
}

export interface ComplianceReview {
  status: ComplianceStatus;
  ref?: string;
  checkedAt?: string;
  /** Which of the seven checks passed. Failing checks have a matching issue. */
  failedChecks: ComplianceCheckId[];
  issues: ComplianceIssue[];
  /** Set only by an explicit advisor decision. */
  approvedBy?: string;
  approvedAt?: string;
}

export function passedCheckCount(review: ComplianceReview): number {
  return ALL_CHECK_IDS.length - review.failedChecks.length;
}

export function openIssueCount(review: ComplianceReview): number {
  return review.issues.filter((i) => i.resolution === "open").length;
}

/* ---- Engagement ----
   State vocabulary differs by category, so each item carries its own
   labelled states rather than forcing one shared enum. */

export interface EngagementState {
  label: string;
  count: number;
}

export interface ClientEngagement {
  clientId: string;
  clientName: string;
  initials: string;
  state: string;
}

export interface ContentEngagement {
  assignedCount: number;
  /** null where a completion rate isn't meaningful yet (unassigned, or a workshop before it runs). */
  completionRate: number | null;
  states: EngagementState[];
  clients: ClientEngagement[];
}

const noEngagement = (): ContentEngagement => ({ assignedCount: 0, completionRate: null, states: [], clients: [] });


/* ============================================================
   Simulations — template vs personalized instance

   A template is reusable and generic. A personalized instance is
   bound to one client and seeded from their actual goal and plan
   recommendation, so the numbers the client sees are their own.
   `syncedFrom` records exactly which plan values were pulled and
   when, so the advisor can tell whether it has drifted.

   The client's job in a personalized instance is to *explore*:
   move the sliders and watch the projected corpus and gap move.
   ============================================================ */

export type SimulationKind = "template" | "personalized";
export type VariableUnit = "currency" | "years" | "percent";

export interface SimulationVariable {
  id: "monthly" | "years" | "return" | "lumpsum";
  label: string;
  unit: VariableUnit;
  min: number;
  max: number;
  step: number;
  /** Template default, or the plan-synced starting point once personalized. */
  value: number;
  /** What the advisor's plan actually recommends — the client's slider starts here. */
  recommended?: number;
}

export interface GoalSync {
  goalName: string;
  goalTopic: Topic;
  targetAmount: number;
  targetYear: number;
  syncedAt: string;
}

export interface SimulationModel {
  kind: SimulationKind;
  goalTopic: Topic;
  variables: SimulationVariable[];
  /** Personalized only */
  clientId?: string;
  clientName?: string;
  syncedFrom?: GoalSync;
  aiDraftedAt?: string;
  aiNote?: string;
}

/** The advisor's plan for one client goal — the source the sim syncs from. */
export interface ClientGoalPlan {
  clientId: string;
  clientName: string;
  initials: string;
  goalName: string;
  goalTopic: Topic;
  targetAmount: number;
  targetYear: number;
  yearsToGoal: number;
  currentCorpus: number;
  recommendedMonthly: number;
  expectedReturn: number;
  status: "on-track" | "at-risk" | "off-track";
}

export const CLIENT_GOAL_PLANS: ClientGoalPlan[] = [
  {
    clientId: "C12345", clientName: "Anika Rao", initials: "AR",
    goalName: "Child Education", goalTopic: "child-education",
    targetAmount: 3_500_000, targetYear: 2036, yearsToGoal: 10,
    currentCorpus: 500_000, recommendedMonthly: 12_000, expectedReturn: 7,
    status: "at-risk",
  },
  {
    clientId: "C12348", clientName: "Suresh Kumar", initials: "SK",
    goalName: "Retirement", goalTopic: "retirement",
    targetAmount: 50_000_000, targetYear: 2034, yearsToGoal: 8,
    currentCorpus: 18_000_000, recommendedMonthly: 90_000, expectedReturn: 7,
    status: "off-track",
  },
  {
    clientId: "C12346", clientName: "Deepak Mehta", initials: "DM",
    goalName: "Retirement", goalTopic: "retirement",
    targetAmount: 40_000_000, targetYear: 2049, yearsToGoal: 23,
    currentCorpus: 4_200_000, recommendedMonthly: 45_000, expectedReturn: 7,
    status: "on-track",
  },
  {
    clientId: "C12349", clientName: "Neha Joshi", initials: "NJ",
    goalName: "Home Purchase", goalTopic: "home-purchase",
    targetAmount: 4_000_000, targetYear: 2031, yearsToGoal: 5,
    currentCorpus: 800_000, recommendedMonthly: 35_000, expectedReturn: 6,
    status: "at-risk",
  },
];

/** Future value of an existing corpus plus a monthly SIP. */
export function projectCorpus(opts: { lumpsum: number; monthly: number; years: number; annualReturn: number }): number {
  const { lumpsum, monthly, years, annualReturn } = opts;
  const r = annualReturn / 100;
  const months = Math.round(years * 12);
  const mr = r / 12;
  const fvLump = lumpsum * Math.pow(1 + r, years);
  const fvSip = mr === 0 ? monthly * months : monthly * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr);
  return Math.round(fvLump + fvSip);
}

/** ₹ in Indian notation — 1200000 → ₹12L, 35000000 → ₹3.5Cr */
export function formatINR(amount: number): string {
  const a = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (a >= 10_000_000) return `${sign}₹${parseFloat((a / 10_000_000).toFixed(2))}Cr`;
  if (a >= 100_000) return `${sign}₹${parseFloat((a / 100_000).toFixed(2))}L`;
  if (a >= 1_000) return `${sign}₹${Math.round(a / 1_000)}K`;
  return `${sign}₹${Math.round(a)}`;
}

/** Variable set every simulation starts from. */
export function defaultVariables(goalTopic: Topic): SimulationVariable[] {
  return [
    { id: "monthly", label: "Monthly investment", unit: "currency", min: 2_000, max: 200_000, step: 1_000, value: 20_000 },
    { id: "lumpsum", label: "Existing corpus", unit: "currency", min: 0, max: 50_000_000, step: 50_000, value: 0 },
    { id: "years", label: "Years to goal", unit: "years", min: 1, max: 35, step: 1, value: goalTopic === "retirement" ? 20 : 10 },
    { id: "return", label: "Expected return", unit: "percent", min: 4, max: 14, step: 0.5, value: 7 },
  ];
}

/** AI drafts a client-bound environment by seeding the variables from their plan. */
export function draftPersonalizedModel(plan: ClientGoalPlan): SimulationModel {
  return {
    kind: "personalized",
    goalTopic: plan.goalTopic,
    clientId: plan.clientId,
    clientName: plan.clientName,
    aiDraftedAt: "Just now",
    aiNote: `Seeded from ${plan.clientName.split(" ")[0]}'s ${plan.goalName} goal and the current plan recommendation. The starting position is the recommended contribution, so anything the client changes is measured against your advice.`,
    syncedFrom: {
      goalName: plan.goalName,
      goalTopic: plan.goalTopic,
      targetAmount: plan.targetAmount,
      targetYear: plan.targetYear,
      syncedAt: "Just now",
    },
    variables: [
      { id: "monthly", label: "Monthly investment", unit: "currency", min: 2_000, max: Math.max(200_000, plan.recommendedMonthly * 3), step: 1_000, value: plan.recommendedMonthly, recommended: plan.recommendedMonthly },
      { id: "lumpsum", label: "Existing corpus", unit: "currency", min: 0, max: Math.max(5_000_000, plan.currentCorpus * 2), step: 50_000, value: plan.currentCorpus, recommended: plan.currentCorpus },
      { id: "years", label: "Years to goal", unit: "years", min: 1, max: 35, step: 1, value: plan.yearsToGoal, recommended: plan.yearsToGoal },
      { id: "return", label: "Expected return", unit: "percent", min: 4, max: 14, step: 0.5, value: plan.expectedReturn, recommended: plan.expectedReturn },
    ],
  };
}

/* ---- Content items ---- */

export interface ContentItemBase {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  topic: Topic;
  tags: string[];
  intendedFor: string[];
  createdBy: string;
  createdVia: CreatedVia;
  createdOn: string;
  updatedAt: string;
  audience: Audience[];
  advisoryStage?: AdvisoryStage;
  publication: PublicationStatus;
  compliance: ComplianceReview;
  engagement: ContentEngagement;
}

export interface LearningContent extends ContentItemBase {
  category: "learning";
  format: LearningFormat;
  duration?: string;
  moduleCount?: number;
  pageCount?: number;
}

export interface SimulationContent extends ContentItemBase {
  category: "simulation";
  estimatedTime: string;
  model: SimulationModel;
}

export interface WorkshopContent extends ContentItemBase {
  category: "workshop";
  mode: WorkshopMode;
  duration: string;
  scheduledFor?: string;
  venue?: string;
  location?: string;
  capacity?: number;
}

export type ContentItem = LearningContent | SimulationContent | WorkshopContent;

/* ---- Compliance builders ---- */

const approved = (ref: string, on: string): ComplianceReview => ({
  status: "approved-for-use",
  ref,
  checkedAt: on,
  failedChecks: [],
  issues: [],
  approvedBy: "Anita Sharma",
  approvedAt: on,
});

const aiComplete = (ref: string, on: string): ComplianceReview => ({
  status: "ai-review-complete",
  ref,
  checkedAt: on,
  failedChecks: [],
  issues: [],
});

const notReviewed = (): ComplianceReview => ({ status: "not-reviewed", failedChecks: [], issues: [] });

/* ---- Seed content ---- */

export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "ct-001",
    title: "The Power of Compounding",
    description:
      "An eight-minute explainer on how compounding works over long horizons, using three worked examples at different starting ages.",
    category: "learning",
    format: "video",
    duration: "8:15",
    topic: "investment-basics",
    tags: ["Compounding", "Wealth Creation", "Long Term", "Basics"],
    intendedFor: ["Early Investors", "Working Professionals", "Retirement Planning"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Silver", "Gold", "Platinum"],
    createdOn: "02 Sep 2026",
    updatedAt: "12 Sep 2026",
    advisoryStage: "discovery",
    publication: "published",
    compliance: approved("COMP-1041", "12 Sep 2026"),
    engagement: {
      assignedCount: 24,
      completionRate: 82,
      states: [
        { label: "Completed", count: 20 },
        { label: "Started", count: 2 },
        { label: "Opened", count: 1 },
        { label: "Not Started", count: 1 },
      ],
      clients: [
        { clientId: "C12345", clientName: "Anika Rao", initials: "AR", state: "Completed" },
        { clientId: "C12346", clientName: "Deepak Mehta", initials: "DM", state: "Completed" },
        { clientId: "C12347", clientName: "Priya Sharma", initials: "PS", state: "Started" },
        { clientId: "C12350", clientName: "Rahul Singh", initials: "RS", state: "Not Started" },
      ],
    },
  },
  {
    id: "ct-002",
    title: "Retirement Planning Guide",
    description:
      "A twelve-page guide covering corpus calculation, drawdown sequencing and inflation assumptions for clients within ten years of retirement.",
    category: "learning",
    format: "pdf",
    pageCount: 12,
    topic: "retirement",
    tags: ["Retirement", "Corpus", "Drawdown"],
    intendedFor: ["Pre-Retirement", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Gold", "Platinum"],
    createdOn: "05 Sep 2026",
    updatedAt: "16 Sep 2026",
    advisoryStage: "planning",
    publication: "draft",
    compliance: {
      status: "advisor-review-required",
      ref: "COMP-1042",
      checkedAt: "16 Sep 2026",
      failedChecks: ["performance-claims"],
      issues: [
        {
          id: "iss-1",
          checkId: "performance-claims",
          title: "Potentially misleading claim",
          original: "This strategy will secure your retirement.",
          suggestion: "This strategy may support your retirement planning goals, depending on your circumstances.",
          location: "Page 3, closing paragraph",
          resolution: "open",
        },
      ],
    },
    engagement: noEngagement(),
  },
  {
    id: "ct-003",
    title: "Tax Saving Tips",
    description: "A single-page visual summary of 80C, 80D and NPS deduction limits for the current financial year.",
    category: "learning",
    format: "image-post",
    topic: "tax-planning",
    tags: ["Tax Planning", "80C", "Deductions"],
    intendedFor: ["Working Professionals", "Early Investors"],
    createdBy: "Anita Sharma",
    createdVia: "finny",
    audience: ["Silver", "Gold"],
    createdOn: "20 Aug 2026",
    updatedAt: "08 Sep 2026",
    publication: "published",
    compliance: approved("COMP-1043", "08 Sep 2026"),
    engagement: {
      assignedCount: 36,
      completionRate: 68,
      states: [
        { label: "Completed", count: 24 },
        { label: "Opened", count: 8 },
        { label: "Not Started", count: 4 },
      ],
      clients: [
        { clientId: "C12346", clientName: "Deepak Mehta", initials: "DM", state: "Completed" },
        { clientId: "C12349", clientName: "Neha Joshi", initials: "NJ", state: "Opened" },
        { clientId: "C12352", clientName: "Manoj Verma", initials: "MV", state: "Not Started" },
      ],
    },
  },
  {
    id: "ct-004",
    title: "Build Your Retirement Plan",
    description: "A five-module course taking the client from goal-setting through contribution schedule to review cadence.",
    category: "learning",
    format: "course",
    moduleCount: 5,
    topic: "retirement",
    tags: ["Retirement", "Structured Learning", "Goal Planning"],
    intendedFor: ["Working Professionals", "Pre-Retirement"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Gold", "Platinum"],
    createdOn: "18 Aug 2026",
    updatedAt: "10 Sep 2026",
    advisoryStage: "planning",
    publication: "published",
    compliance: approved("COMP-1044", "10 Sep 2026"),
    engagement: {
      assignedCount: 18,
      completionRate: 74,
      states: [
        { label: "Completed", count: 12 },
        { label: "Started", count: 4 },
        { label: "Opened", count: 1 },
        { label: "Not Started", count: 1 },
      ],
      clients: [
        { clientId: "C12345", clientName: "Anika Rao", initials: "AR", state: "Started" },
        { clientId: "C12348", clientName: "Suresh Kumar", initials: "SK", state: "Completed" },
      ],
    },
  },
  {
    id: "ct-005",
    title: "Retirement Readiness",
    description:
      "An interactive simulation where the client adjusts retirement age, monthly contribution and expected return to see the effect on projected corpus.",
    category: "simulation",
    model: {
      kind: "template",
      goalTopic: "retirement",
      variables: [
        { id: "monthly", label: "Monthly investment", unit: "currency", min: 5_000, max: 300_000, step: 5_000, value: 50_000 },
        { id: "lumpsum", label: "Existing corpus", unit: "currency", min: 0, max: 50_000_000, step: 100_000, value: 2_000_000 },
        { id: "years", label: "Years to retirement", unit: "years", min: 1, max: 35, step: 1, value: 20 },
        { id: "return", label: "Expected return", unit: "percent", min: 4, max: 14, step: 0.5, value: 7 },
      ],
    },
    estimatedTime: "6 min",
    topic: "retirement",
    tags: ["Retirement", "Scenario Planning", "Interactive"],
    intendedFor: ["Pre-Retirement", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Platinum"],
    createdOn: "22 Aug 2026",
    updatedAt: "14 Sep 2026",
    advisoryStage: "review",
    publication: "published",
    compliance: approved("COMP-1045", "14 Sep 2026"),
    engagement: {
      assignedCount: 27,
      completionRate: 61,
      states: [
        { label: "Completed", count: 16 },
        { label: "Started", count: 7 },
        { label: "Assigned", count: 4 },
      ],
      clients: [
        { clientId: "C12345", clientName: "Anika Rao", initials: "AR", state: "Completed" },
        { clientId: "C12351", clientName: "Kavitha Reddy", initials: "KR", state: "Started" },
        { clientId: "C12347", clientName: "Priya Sharma", initials: "PS", state: "Assigned" },
      ],
    },
  },
  {
    id: "ct-006",
    title: "Women & Wealth",
    description:
      "A ninety-minute in-person evening session on goal-based investing, followed by open Q&A. Held at the client lounge.",
    category: "workshop",
    mode: "offline",
    duration: "90 min",
    scheduledFor: "04 Oct 2026 · 6:00 PM",
    venue: "Fincaree Client Lounge",
    location: "Bengaluru",
    capacity: 50,
    topic: "investment-basics",
    tags: ["Community", "Goal Planning", "In Person"],
    intendedFor: ["Early Investors", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["client-group"],
    createdOn: "28 Aug 2026",
    updatedAt: "15 Sep 2026",
    publication: "scheduled",
    compliance: approved("COMP-1046", "15 Sep 2026"),
    engagement: {
      assignedCount: 48,
      completionRate: null,
      states: [
        { label: "Registered", count: 31 },
        { label: "Invited", count: 17 },
      ],
      clients: [
        { clientId: "C12347", clientName: "Priya Sharma", initials: "PS", state: "Registered" },
        { clientId: "C12349", clientName: "Neha Joshi", initials: "NJ", state: "Registered" },
        { clientId: "C12350", clientName: "Rahul Singh", initials: "RS", state: "Invited" },
      ],
    },
  },
  {
    id: "ct-007",
    title: "Understanding Market Volatility",
    description: "A short video on why markets move and why staying invested through a correction usually beats timing it.",
    category: "learning",
    format: "video",
    duration: "6:40",
    topic: "market-education",
    tags: ["Market Education", "Risk", "Behaviour"],
    intendedFor: ["Early Investors", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "finny",
    audience: ["Silver", "Gold"],
    createdOn: "01 Sep 2026",
    updatedAt: "17 Sep 2026",
    publication: "draft",
    compliance: {
      status: "changes-required",
      ref: "COMP-1047",
      checkedAt: "17 Sep 2026",
      failedChecks: ["guaranteed-return-language", "risk-language"],
      issues: [
        {
          id: "iss-2",
          checkId: "guaranteed-return-language",
          title: "Guaranteed-return language",
          original: "Markets always recover, so you will get your money back.",
          suggestion: "Markets have historically recovered over long periods, though past recovery patterns do not guarantee future outcomes.",
          location: "2:14",
          resolution: "open",
        },
        {
          id: "iss-3",
          checkId: "risk-language",
          title: "Missing risk disclosure",
          original: "No risk disclosure appears alongside the historical return chart.",
          suggestion: "Add a standard market-risk disclosure adjacent to the chart at 4:02.",
          location: "4:02",
          resolution: "open",
        },
      ],
    },
    engagement: noEngagement(),
  },
  {
    id: "ct-008",
    title: "Emergency Fund Essentials",
    description: "How to size an emergency reserve against household expenses, and where to hold it.",
    category: "learning",
    format: "pdf",
    pageCount: 5,
    topic: "emergency-fund",
    tags: ["Emergency Fund", "Liquidity", "Basics"],
    intendedFor: ["Early Investors", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Silver"],
    createdOn: "12 Aug 2026",
    updatedAt: "02 Sep 2026",
    advisoryStage: "discovery",
    publication: "published",
    compliance: approved("COMP-1048", "02 Sep 2026"),
    engagement: {
      assignedCount: 31,
      completionRate: 77,
      states: [
        { label: "Completed", count: 24 },
        { label: "Opened", count: 5 },
        { label: "Not Started", count: 2 },
      ],
      clients: [{ clientId: "C12350", clientName: "Rahul Singh", initials: "RS", state: "Completed" }],
    },
  },
  {
    id: "ct-009",
    title: "Child Education Funding Simulator",
    description: "Projects the corpus needed for undergraduate and postgraduate education under different inflation assumptions.",
    category: "simulation",
    model: {
      kind: "personalized",
      goalTopic: "child-education",
      clientId: "C12345",
      clientName: "Anika Rao",
      aiDraftedAt: "17 Sep 2026",
      aiNote:
        "Seeded from Anika's Child Education goal and the current plan recommendation. The starting position is the recommended \u20b912,000/mo, so anything she changes is measured against your advice.",
      syncedFrom: {
        goalName: "Child Education",
        goalTopic: "child-education",
        targetAmount: 3_500_000,
        targetYear: 2036,
        syncedAt: "17 Sep 2026",
      },
      variables: [
        { id: "monthly", label: "Monthly investment", unit: "currency", min: 2_000, max: 60_000, step: 1_000, value: 12_000, recommended: 12_000 },
        { id: "lumpsum", label: "Existing corpus", unit: "currency", min: 0, max: 5_000_000, step: 50_000, value: 500_000, recommended: 500_000 },
        { id: "years", label: "Years to goal", unit: "years", min: 1, max: 20, step: 1, value: 10, recommended: 10 },
        { id: "return", label: "Expected return", unit: "percent", min: 4, max: 12, step: 0.5, value: 7, recommended: 7 },
      ],
    },
    estimatedTime: "5 min",
    topic: "child-education",
    tags: ["Child Education", "Scenario Planning"],
    intendedFor: ["Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Gold", "Platinum"],
    createdOn: "30 Aug 2026",
    updatedAt: "11 Sep 2026",
    advisoryStage: "planning",
    publication: "published",
    compliance: approved("COMP-1049", "11 Sep 2026"),
    engagement: {
      assignedCount: 14,
      completionRate: 57,
      states: [
        { label: "Completed", count: 8 },
        { label: "Started", count: 4 },
        { label: "Assigned", count: 2 },
      ],
      clients: [{ clientId: "C12346", clientName: "Deepak Mehta", initials: "DM", state: "Started" }],
    },
  },
  {
    id: "ct-010",
    title: "Term Insurance Explained",
    description: "Coverage calculation, riders, and the difference between term and endowment products.",
    category: "learning",
    format: "video",
    duration: "11:20",
    topic: "insurance",
    tags: ["Insurance", "Protection", "Coverage"],
    intendedFor: ["Working Professionals", "Early Investors"],
    createdBy: "Anita Sharma",
    createdVia: "imported",
    audience: ["Silver", "Gold"],
    createdOn: "14 Aug 2026",
    updatedAt: "05 Sep 2026",
    publication: "published",
    compliance: approved("COMP-1050", "05 Sep 2026"),
    engagement: {
      assignedCount: 22,
      completionRate: 64,
      states: [
        { label: "Completed", count: 14 },
        { label: "Started", count: 5 },
        { label: "Not Started", count: 3 },
      ],
      clients: [{ clientId: "C12348", clientName: "Suresh Kumar", initials: "SK", state: "Completed" }],
    },
  },
  {
    id: "ct-011",
    title: "Tax Season Prep — Live Session",
    description: "An online walkthrough of deduction options and documentation ahead of the filing deadline.",
    category: "workshop",
    mode: "online",
    duration: "45 min",
    scheduledFor: "15 Jan 2027 · 5:00 PM",
    capacity: 80,
    topic: "tax-planning",
    tags: ["Tax Planning", "Live Session"],
    intendedFor: ["Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["client-group"],
    createdOn: "10 Sep 2026",
    updatedAt: "18 Sep 2026",
    publication: "draft",
    compliance: aiComplete("COMP-1051", "18 Sep 2026"),
    engagement: noEngagement(),
  },
  {
    id: "ct-012",
    title: "First Home Purchase Planner",
    description: "Down payment, EMI affordability and the trade-off against other goals.",
    category: "simulation",
    model: {
      kind: "template",
      goalTopic: "home-purchase",
      variables: [
        { id: "monthly", label: "Monthly investment", unit: "currency", min: 5_000, max: 150_000, step: 5_000, value: 30_000 },
        { id: "lumpsum", label: "Existing corpus", unit: "currency", min: 0, max: 10_000_000, step: 50_000, value: 500_000 },
        { id: "years", label: "Years to purchase", unit: "years", min: 1, max: 15, step: 1, value: 5 },
        { id: "return", label: "Expected return", unit: "percent", min: 4, max: 12, step: 0.5, value: 6 },
      ],
    },
    estimatedTime: "7 min",
    topic: "home-purchase",
    tags: ["Home Purchase", "Affordability"],
    intendedFor: ["Early Investors", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Silver", "Gold"],
    createdOn: "08 Sep 2026",
    updatedAt: "18 Sep 2026",
    publication: "draft",
    compliance: notReviewed(),
    engagement: noEngagement(),
  },
  {
    id: "ct-013",
    title: "Reading Your Portfolio Statement",
    description: "A visual guide to expense ratios, XIRR and what actually matters on a monthly statement.",
    category: "learning",
    format: "image-post",
    topic: "financial-planning",
    tags: ["Portfolio", "Basics", "Visual"],
    intendedFor: ["Early Investors"],
    createdBy: "Anita Sharma",
    createdVia: "finny",
    audience: ["Silver"],
    createdOn: "26 Aug 2026",
    updatedAt: "09 Sep 2026",
    publication: "published",
    compliance: approved("COMP-1053", "09 Sep 2026"),
    engagement: {
      assignedCount: 19,
      completionRate: 71,
      states: [
        { label: "Completed", count: 13 },
        { label: "Opened", count: 4 },
        { label: "Not Started", count: 2 },
      ],
      clients: [{ clientId: "C12352", clientName: "Manoj Verma", initials: "MV", state: "Completed" }],
    },
  },
  {
    id: "ct-014",
    title: "Retirement Income Strategies — Recorded",
    description: "A recorded session on drawdown sequencing, annuities and the bucket approach.",
    category: "workshop",
    mode: "online",
    duration: "55 min",
    scheduledFor: "12 Aug 2026",
    topic: "retirement",
    tags: ["Retirement", "Recorded", "Income"],
    intendedFor: ["Pre-Retirement", "Retired"],
    createdBy: "Anita Sharma",
    createdVia: "imported",
    audience: ["Platinum", "client-group"],
    createdOn: "12 Aug 2026",
    updatedAt: "01 Sep 2026",
    advisoryStage: "review",
    publication: "published",
    compliance: approved("COMP-1054", "01 Sep 2026"),
    engagement: {
      assignedCount: 26,
      completionRate: null,
      states: [
        { label: "Attended", count: 18 },
        { label: "Registered", count: 5 },
        { label: "Missed", count: 3 },
      ],
      clients: [
        { clientId: "C12351", clientName: "Kavitha Reddy", initials: "KR", state: "Attended" },
        { clientId: "C12348", clientName: "Suresh Kumar", initials: "SK", state: "Missed" },
      ],
    },
  },
  {
    id: "ct-015",
    title: "Goal-Based Investing Foundations",
    description: "A four-module introduction to mapping money to goals rather than chasing returns.",
    category: "learning",
    format: "course",
    moduleCount: 4,
    topic: "financial-planning",
    tags: ["Goal Planning", "Structured Learning", "Beginner"],
    intendedFor: ["Early Investors"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Silver"],
    createdOn: "06 Aug 2026",
    updatedAt: "30 Aug 2026",
    advisoryStage: "discovery",
    publication: "published",
    compliance: approved("COMP-1055", "30 Aug 2026"),
    engagement: {
      assignedCount: 21,
      completionRate: 66,
      states: [
        { label: "Completed", count: 13 },
        { label: "Started", count: 6 },
        { label: "Not Started", count: 2 },
      ],
      clients: [{ clientId: "C12347", clientName: "Priya Sharma", initials: "PS", state: "Started" }],
    },
  },
  {
    id: "ct-016",
    title: "Market Corrections in Context",
    description: "Historical drawdowns and recovery periods, presented without forward-looking claims.",
    category: "learning",
    format: "pdf",
    pageCount: 7,
    topic: "market-education",
    tags: ["Market Education", "History", "Risk"],
    intendedFor: ["Working Professionals", "Pre-Retirement"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Gold", "Platinum"],
    createdOn: "16 Sep 2026",
    updatedAt: "18 Sep 2026",
    publication: "draft",
    compliance: aiComplete("COMP-1056", "18 Sep 2026"),
    engagement: noEngagement(),
  },
  {
    id: "ct-017",
    title: "Retirement Basics",
    description:
      "A six-minute primer on what retirement readiness actually means — corpus, drawdown and the three levers a client can move.",
    category: "learning",
    format: "video",
    duration: "6:02",
    topic: "retirement",
    tags: ["Retirement", "Basics", "Readiness"],
    intendedFor: ["Working Professionals", "Pre-Retirement"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Silver", "Gold", "Platinum"],
    createdOn: "28 Aug 2026",
    updatedAt: "14 Sep 2026",
    advisoryStage: "discovery",
    publication: "published",
    compliance: approved("COMP-1038", "14 Sep 2026"),
    engagement: {
      assignedCount: 19,
      completionRate: 74,
      states: [
        { label: "Completed", count: 14 },
        { label: "Started", count: 3 },
        { label: "Not Started", count: 2 },
      ],
      clients: [
        { clientId: "C12347", clientName: "Priya Sharma", initials: "PS", state: "Completed" },
        { clientId: "C12348", clientName: "Suresh Kumar", initials: "SK", state: "Started" },
        { clientId: "C12371", clientName: "Gayatri Subramanian", initials: "GS", state: "Completed" },
        { clientId: "C12379", clientName: "Sunita Bedi", initials: "SB", state: "Not Started" },
      ],
    },
  },
  {
    id: "ct-018",
    title: "SIP Step-Up Explorer",
    description:
      "Lets a client see what raising their monthly contribution by a fixed percentage each year does to the end corpus.",
    category: "simulation",
    estimatedTime: "5 min",
    topic: "wealth-creation",
    tags: ["SIP", "Step-Up", "Wealth Creation"],
    intendedFor: ["Working Professionals", "Early Investors"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["Gold", "Platinum"],
    createdOn: "10 Sep 2026",
    updatedAt: "17 Sep 2026",
    advisoryStage: "planning",
    publication: "published",
    compliance: approved("COMP-1052", "17 Sep 2026"),
    engagement: {
      assignedCount: 8,
      completionRate: 63,
      states: [
        { label: "Completed", count: 5 },
        { label: "Started", count: 2 },
        { label: "Assigned", count: 1 },
      ],
      clients: [
        { clientId: "C12359", clientName: "Ritu Malhotra", initials: "RM", state: "Completed" },
        { clientId: "C12374", clientName: "Tarun Saxena", initials: "TS", state: "Started" },
        { clientId: "C12382", clientName: "Mohit Aggarwal", initials: "MA", state: "Assigned" },
      ],
    },
    model: { kind: "template", goalTopic: "wealth-creation", variables: defaultVariables("wealth-creation") },
  },
  {
    id: "ct-019",
    title: "Goal Planning Workshop",
    description:
      "A two-hour in-person session where clients map their goals to timelines and figure out which ones actually compete for the same money.",
    category: "workshop",
    mode: "offline",
    duration: "2 hrs",
    scheduledFor: "04 Oct 2026 · 10:00 AM",
    location: "Fincaree Office, Indiranagar",
    topic: "financial-planning",
    tags: ["Goals", "Planning", "In Person"],
    intendedFor: ["New Clients", "Working Professionals"],
    createdBy: "Anita Sharma",
    createdVia: "advisor",
    audience: ["client-group"],
    createdOn: "08 Sep 2026",
    updatedAt: "15 Sep 2026",
    advisoryStage: "planning",
    publication: "scheduled",
    compliance: approved("COMP-1049", "15 Sep 2026"),
    engagement: {
      assignedCount: 14,
      completionRate: null,
      states: [
        { label: "Registered", count: 9 },
        { label: "Invited", count: 5 },
      ],
      clients: [
        { clientId: "C12350", clientName: "Rahul Singh", initials: "RS", state: "Invited" },
        { clientId: "C12354", clientName: "Arjun Nair", initials: "AN", state: "Registered" },
        { clientId: "C12362", clientName: "Aditya Kulkarni", initials: "AK", state: "Invited" },
        { clientId: "C12370", clientName: "Imran Sheikh", initials: "IS", state: "Registered" },
      ],
    },
  },
];

/* ---- Clients + groups ----
   Client facets exist so a group can be *composed* from filters
   (plan / goal / engagement / life stage / advisory context),
   not just picked from a fixed list. */

export type ClientPlan = "Silver" | "Gold" | "Platinum";

/** Where a piece of content came from — drives the "Created by" advanced filter. */
export type CreatedVia = "advisor" | "finny" | "imported";

export const CREATED_VIA_LABEL: Record<CreatedVia, string> = {
  advisor: "Me",
  finny: "Finny",
  imported: "Imported",
};

/** Which client tiers a piece is written for — the "Audience" advanced filter. */
export type Audience = ClientPlan | "client-group";

export const AUDIENCE_LABEL: Record<Audience, string> = {
  Silver: "Silver",
  Gold: "Gold",
  Platinum: "Platinum",
  "client-group": "Client Group",
};

/** Engagement bands for the advanced filter — derived from completionRate. */
export type EngagementBand = "high" | "medium" | "low" | "none";

export const ENGAGEMENT_BAND_LABEL: Record<EngagementBand, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No engagement",
};

export function engagementBand(rate: number | null, assignedCount: number): EngagementBand {
  if (assignedCount === 0 || rate === null) return "none";
  if (rate >= 70) return "high";
  if (rate >= 45) return "medium";
  return "low";
}
export type EngagementState4 = "highly-engaged" | "active" | "needs-attention" | "inactive";
export type LifeStage = "working" | "pre-retirement" | "retired";
export type AdvisoryContext = "review-due" | "goal-off-track" | "new-client";

export const ENGAGEMENT_STATE_LABEL: Record<EngagementState4, string> = {
  "highly-engaged": "Highly Engaged",
  active: "Active",
  "needs-attention": "Needs Attention",
  inactive: "Inactive",
};

export const LIFE_STAGE_LABEL: Record<LifeStage, string> = {
  working: "Working",
  "pre-retirement": "Pre-retirement",
  retired: "Retired",
};

export const ADVISORY_CONTEXT_LABEL: Record<AdvisoryContext, string> = {
  "review-due": "Review Due",
  "goal-off-track": "Goal Off Track",
  "new-client": "New Client",
};

/** How assigned content actually reaches the client. */
export type DeliveryChannel = "portal" | "whatsapp" | "email";

export const DELIVERY_CHANNEL_LABEL: Record<DeliveryChannel, string> = {
  portal: "Client Portal",
  whatsapp: "WhatsApp",
  email: "Email",
};

export const DELIVERY_CHANNEL_HINT: Record<DeliveryChannel, string> = {
  portal: "Appears in their Fincaree portal — no notification noise",
  whatsapp: "Direct link on WhatsApp — highest open rate",
  email: "Email with a portal link",
};

export interface Client {
  id: string;
  name: string;
  initials: string;
  plan: ClientPlan;
  goals: Topic[];
  /** The goal this relationship is really organised around — shown in the subline. */
  primaryGoal: Topic;
  engagement: EngagementState4;
  lifeStage: LifeStage;
  advisoryContext: AdvisoryContext[];
  /** Days until the next scheduled review — drives "Next review: 5 days". */
  nextReviewInDays: number;
}

/* A solo RIA's book — 48 relationships. Group targeting only means
   something at this scale; with a handful of clients the facets are
   theatre. Counts shown in the UI are derived from this list. */
export const CLIENTS: Client[] = [
  { id: "C12345", name: "Anika Rao", initials: "AR", plan: "Platinum", goals: ["retirement", "child-education"], primaryGoal: "retirement", engagement: "highly-engaged", lifeStage: "pre-retirement", advisoryContext: ["review-due", "goal-off-track"], nextReviewInDays: 5 },
  { id: "C12346", name: "Deepak Mehta", initials: "DM", plan: "Gold", goals: ["retirement", "tax-planning"], primaryGoal: "retirement", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 34 },
  { id: "C12347", name: "Priya Sharma", initials: "PS", plan: "Gold", goals: ["retirement", "investment-basics"], primaryGoal: "retirement", engagement: "active", lifeStage: "working", advisoryContext: ["review-due"], nextReviewInDays: 5 },
  { id: "C12348", name: "Suresh Kumar", initials: "SK", plan: "Platinum", goals: ["retirement", "insurance"], primaryGoal: "retirement", engagement: "needs-attention", lifeStage: "pre-retirement", advisoryContext: ["review-due"], nextReviewInDays: 9 },
  { id: "C12349", name: "Neha Joshi", initials: "NJ", plan: "Gold", goals: ["home-purchase", "tax-planning"], primaryGoal: "home-purchase", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 41 },
  { id: "C12350", name: "Rahul Singh", initials: "RS", plan: "Silver", goals: ["emergency-fund"], primaryGoal: "emergency-fund", engagement: "inactive", lifeStage: "working", advisoryContext: ["new-client"], nextReviewInDays: 62 },
  { id: "C12351", name: "Kavitha Reddy", initials: "KR", plan: "Platinum", goals: ["retirement"], primaryGoal: "retirement", engagement: "highly-engaged", lifeStage: "retired", advisoryContext: ["review-due"], nextReviewInDays: 12 },
  { id: "C12352", name: "Manoj Verma", initials: "MV", plan: "Gold", goals: ["child-education", "insurance"], primaryGoal: "child-education", engagement: "needs-attention", lifeStage: "working", advisoryContext: ["goal-off-track"], nextReviewInDays: 18 },
  { id: "C12353", name: "Sneha Iyer", initials: "SI", plan: "Gold", goals: ["child-education", "retirement"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 27 },
  { id: "C12354", name: "Arjun Nair", initials: "AN", plan: "Silver", goals: ["investment-basics", "emergency-fund"], primaryGoal: "investment-basics", engagement: "active", lifeStage: "working", advisoryContext: ["new-client"], nextReviewInDays: 55 },
  { id: "C12355", name: "Divya Pillai", initials: "DP", plan: "Platinum", goals: ["child-education", "wealth-creation"], primaryGoal: "child-education", engagement: "highly-engaged", lifeStage: "working", advisoryContext: [], nextReviewInDays: 21 },
  { id: "C12356", name: "Vikram Desai", initials: "VD", plan: "Gold", goals: ["retirement", "wealth-creation"], primaryGoal: "retirement", engagement: "active", lifeStage: "pre-retirement", advisoryContext: ["review-due"], nextReviewInDays: 7 },
  { id: "C12357", name: "Meera Krishnan", initials: "MK", plan: "Silver", goals: ["emergency-fund", "cash-flow"], primaryGoal: "emergency-fund", engagement: "needs-attention", lifeStage: "working", advisoryContext: [], nextReviewInDays: 48 },
  { id: "C12358", name: "Sanjay Patel", initials: "SP", plan: "Gold", goals: ["child-education", "tax-planning"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 30 },
  { id: "C12359", name: "Ritu Malhotra", initials: "RM", plan: "Platinum", goals: ["wealth-creation", "retirement"], primaryGoal: "wealth-creation", engagement: "highly-engaged", lifeStage: "pre-retirement", advisoryContext: [], nextReviewInDays: 15 },
  { id: "C12360", name: "Harish Rao", initials: "HR", plan: "Silver", goals: ["debt-planning", "cash-flow"], primaryGoal: "debt-planning", engagement: "needs-attention", lifeStage: "working", advisoryContext: ["goal-off-track"], nextReviewInDays: 24 },
  { id: "C12361", name: "Lakshmi Menon", initials: "LM", plan: "Gold", goals: ["child-education", "emergency-fund"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 36 },
  { id: "C12362", name: "Aditya Kulkarni", initials: "AK", plan: "Silver", goals: ["investment-basics"], primaryGoal: "investment-basics", engagement: "inactive", lifeStage: "working", advisoryContext: ["new-client"], nextReviewInDays: 70 },
  { id: "C12363", name: "Pooja Bhatt", initials: "PB", plan: "Gold", goals: ["child-education", "insurance"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: ["review-due"], nextReviewInDays: 11 },
  { id: "C12364", name: "Ramesh Gupta", initials: "RG", plan: "Platinum", goals: ["retirement", "tax-planning"], primaryGoal: "retirement", engagement: "active", lifeStage: "retired", advisoryContext: [], nextReviewInDays: 44 },
  { id: "C12365", name: "Shalini Das", initials: "SD", plan: "Gold", goals: ["home-purchase", "emergency-fund"], primaryGoal: "home-purchase", engagement: "needs-attention", lifeStage: "working", advisoryContext: ["goal-off-track"], nextReviewInDays: 19 },
  { id: "C12366", name: "Nikhil Bose", initials: "NB", plan: "Silver", goals: ["investment-basics", "tax-planning"], primaryGoal: "investment-basics", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 51 },
  { id: "C12367", name: "Ananya Ghosh", initials: "AG", plan: "Gold", goals: ["child-education", "retirement"], primaryGoal: "child-education", engagement: "highly-engaged", lifeStage: "working", advisoryContext: [], nextReviewInDays: 33 },
  { id: "C12368", name: "Prakash Hegde", initials: "PH", plan: "Silver", goals: ["debt-planning"], primaryGoal: "debt-planning", engagement: "inactive", lifeStage: "working", advisoryContext: [], nextReviewInDays: 66 },
  { id: "C12369", name: "Swathi Rao", initials: "SR", plan: "Gold", goals: ["child-education", "cash-flow"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: ["review-due"], nextReviewInDays: 8 },
  { id: "C12370", name: "Imran Sheikh", initials: "IS", plan: "Gold", goals: ["home-purchase", "investment-basics"], primaryGoal: "home-purchase", engagement: "active", lifeStage: "working", advisoryContext: ["new-client"], nextReviewInDays: 58 },
  { id: "C12371", name: "Gayatri Subramanian", initials: "GS", plan: "Platinum", goals: ["retirement", "insurance"], primaryGoal: "retirement", engagement: "highly-engaged", lifeStage: "pre-retirement", advisoryContext: ["review-due"], nextReviewInDays: 13 },
  { id: "C12372", name: "Varun Chopra", initials: "VC", plan: "Silver", goals: ["emergency-fund", "debt-planning"], primaryGoal: "emergency-fund", engagement: "needs-attention", lifeStage: "working", advisoryContext: [], nextReviewInDays: 29 },
  { id: "C12373", name: "Rekha Nambiar", initials: "RN", plan: "Gold", goals: ["child-education", "retirement"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 39 },
  { id: "C12374", name: "Tarun Saxena", initials: "TS", plan: "Platinum", goals: ["wealth-creation", "tax-planning"], primaryGoal: "wealth-creation", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 46 },
  { id: "C12375", name: "Bhavna Shah", initials: "BS", plan: "Gold", goals: ["child-education", "home-purchase"], primaryGoal: "child-education", engagement: "needs-attention", lifeStage: "working", advisoryContext: ["goal-off-track"], nextReviewInDays: 22 },
  { id: "C12376", name: "Karthik Babu", initials: "KB", plan: "Silver", goals: ["investment-basics", "market-education"], primaryGoal: "investment-basics", engagement: "active", lifeStage: "working", advisoryContext: ["new-client"], nextReviewInDays: 60 },
  { id: "C12377", name: "Nandini Hegde", initials: "NH", plan: "Gold", goals: ["child-education", "insurance"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 31 },
  { id: "C12378", name: "Alok Mishra", initials: "AM", plan: "Platinum", goals: ["retirement", "wealth-creation"], primaryGoal: "retirement", engagement: "highly-engaged", lifeStage: "pre-retirement", advisoryContext: [], nextReviewInDays: 17 },
  { id: "C12379", name: "Sunita Bedi", initials: "SB", plan: "Gold", goals: ["retirement", "emergency-fund"], primaryGoal: "retirement", engagement: "active", lifeStage: "retired", advisoryContext: ["review-due"], nextReviewInDays: 10 },
  { id: "C12380", name: "Girish Kamath", initials: "GK", plan: "Silver", goals: ["cash-flow", "debt-planning"], primaryGoal: "cash-flow", engagement: "inactive", lifeStage: "working", advisoryContext: [], nextReviewInDays: 72 },
  { id: "C12381", name: "Trisha Fernandes", initials: "TF", plan: "Gold", goals: ["child-education", "financial-planning"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 26 },
  { id: "C12382", name: "Mohit Aggarwal", initials: "MA", plan: "Platinum", goals: ["wealth-creation", "retirement"], primaryGoal: "wealth-creation", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 42 },
  { id: "C12383", name: "Shweta Kapoor", initials: "SK", plan: "Gold", goals: ["child-education", "tax-planning"], primaryGoal: "child-education", engagement: "needs-attention", lifeStage: "working", advisoryContext: ["review-due"], nextReviewInDays: 14 },
  { id: "C12384", name: "Dinesh Yadav", initials: "DY", plan: "Silver", goals: ["emergency-fund", "insurance"], primaryGoal: "emergency-fund", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 53 },
  { id: "C12385", name: "Radhika Menon", initials: "RM", plan: "Platinum", goals: ["child-education", "wealth-creation"], primaryGoal: "child-education", engagement: "highly-engaged", lifeStage: "working", advisoryContext: [], nextReviewInDays: 20 },
  { id: "C12386", name: "Faisal Khan", initials: "FK", plan: "Gold", goals: ["home-purchase", "cash-flow"], primaryGoal: "home-purchase", engagement: "active", lifeStage: "working", advisoryContext: ["new-client"], nextReviewInDays: 57 },
  { id: "C12387", name: "Jyoti Deshmukh", initials: "JD", plan: "Gold", goals: ["child-education", "retirement"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 35 },
  { id: "C12388", name: "Naveen Prasad", initials: "NP", plan: "Silver", goals: ["investment-basics", "market-education"], primaryGoal: "investment-basics", engagement: "needs-attention", lifeStage: "working", advisoryContext: [], nextReviewInDays: 28 },
  { id: "C12389", name: "Aarti Trivedi", initials: "AT", plan: "Platinum", goals: ["retirement", "insurance"], primaryGoal: "retirement", engagement: "active", lifeStage: "pre-retirement", advisoryContext: ["review-due"], nextReviewInDays: 6 },
  { id: "C12390", name: "Sameer Joshi", initials: "SJ", plan: "Gold", goals: ["child-education", "emergency-fund"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: [], nextReviewInDays: 38 },
  { id: "C12391", name: "Vidya Sundaram", initials: "VS", plan: "Silver", goals: ["cash-flow", "financial-planning"], primaryGoal: "cash-flow", engagement: "inactive", lifeStage: "working", advisoryContext: [], nextReviewInDays: 68 },
  { id: "C12392", name: "Rohit Bhandari", initials: "RB", plan: "Gold", goals: ["child-education", "home-purchase"], primaryGoal: "child-education", engagement: "active", lifeStage: "working", advisoryContext: ["goal-off-track"], nextReviewInDays: 23 },
];

/* ---- Finny suggestions — who might benefit, and why ---- */

export interface FinnySuggestion {
  id: string;
  contentId: string;
  clientId: string;
  clientName: string;
  initials: string;
  reasons: string[];
}

export const FINNY_SUGGESTIONS: FinnySuggestion[] = [
  {
    id: "fs-1",
    contentId: "ct-005",
    clientId: "C12345",
    clientName: "Anika Rao",
    initials: "AR",
    reasons: [
      "Retirement goal is currently under review",
      "Client recently updated retirement timeline",
      "Client completed Retirement Basics",
      "Next review is in 5 days",
    ],
  },
  {
    id: "fs-2",
    contentId: "ct-002",
    clientId: "C12348",
    clientName: "Suresh Kumar",
    initials: "SK",
    reasons: ["Retirement goal flagged off track", "No retirement content assigned in 90 days", "Review due this month"],
  },
];

/* ---- Audit trail ---- */

export type AuditAction =
  | "created"
  | "simulation-personalised"
  | "ai-review-run"
  | "issue-accepted"
  | "issue-dismissed"
  | "advisor-approved"
  | "published"
  | "assigned"
  | "client-engaged";

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  created: "Created",
  "simulation-personalised": "Personalised for Client",
  "ai-review-run": "AI Review Run",
  "issue-accepted": "Suggestion Accepted",
  "issue-dismissed": "Suggestion Dismissed",
  "advisor-approved": "Approved by Advisor",
  published: "Published",
  assigned: "Assigned",
  "client-engaged": "Client Engaged",
};

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  itemName: string;
  actor: "advisor" | "ai" | "client";
  detail?: string;
  ref?: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: "au-1", timestamp: "12 Sep 2026 · 9:04 AM", action: "ai-review-run", itemName: "The Power of Compounding", actor: "ai", detail: "7 of 7 checks passed", ref: "COMP-1041" },
  { id: "au-2", timestamp: "12 Sep 2026 · 9:20 AM", action: "advisor-approved", itemName: "The Power of Compounding", actor: "advisor", detail: "Approved by Anita Sharma", ref: "COMP-1041" },
  { id: "au-3", timestamp: "12 Sep 2026 · 9:22 AM", action: "published", itemName: "The Power of Compounding", actor: "advisor" },
  { id: "au-4", timestamp: "14 Sep 2026 · 11:00 AM", action: "assigned", itemName: "Retirement Readiness", actor: "advisor", detail: "27 clients" },
  { id: "au-5", timestamp: "16 Sep 2026 · 4:12 PM", action: "ai-review-run", itemName: "Retirement Planning Guide", actor: "ai", detail: "6 of 7 checks passed · 1 issue needs advisor review", ref: "COMP-1042" },
  { id: "au-6", timestamp: "17 Sep 2026 · 10:30 AM", action: "ai-review-run", itemName: "Understanding Market Volatility", actor: "ai", detail: "5 of 7 checks passed · 2 issues", ref: "COMP-1047" },
  { id: "au-7", timestamp: "18 Sep 2026 · 8:45 AM", action: "ai-review-run", itemName: "Market Corrections in Context", actor: "ai", detail: "7 of 7 checks passed", ref: "COMP-1056" },
  { id: "au-8", timestamp: "18 Sep 2026 · 2:15 PM", action: "client-engaged", itemName: "Tax Saving Tips", actor: "client", detail: "Deepak Mehta completed" },
];
