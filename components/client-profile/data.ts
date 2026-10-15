/* ============================================================
   Client Profile — Mock Data
   Advisor-side "living client context" for a single client.

   Continuous with the Report Queue data (same client, C12345 —
   Anika Rao, R001 "Retirement Plan Review") so the two surfaces
   tell one coherent story rather than diverging demo data.
   ============================================================ */

export type Severity = "high" | "medium" | "low";
export type ConfidenceLevel = "high" | "medium" | "low";
export type GoalStatus = "on-track" | "needs-review" | "needs-validation";

/* ---- Identity ---- */

export interface ClientIdentity {
  name: string;
  id: string;
  plan: "Gold" | "Platinum" | "Silver";
  lifeStage: string;
  age: number;
  familyContext: string;
  clientStatus: string;
  relationshipStage: string;
  clientSince: string;
}

export const CLIENT_IDENTITY: ClientIdentity = {
  name: "Anika Rao",
  id: "C12345",
  plan: "Platinum",
  lifeStage: "Pre-Retirement",
  age: 55,
  familyContext: "Married · 1 daughter (25)",
  clientStatus: "Active client",
  relationshipStage: "Ongoing advisory relationship",
  clientSince: "March 2023",
};

/* ---- What the client told us ---- */

export interface ClientToldUs {
  primaryGoals: string[];
  priorities: string[];
  riskPreference: string;
  liquidityPreference: string;
  concerns: string[];
  requests: string[];
  source: string; // where this came from
}

export const CLIENT_TOLD_US: ClientToldUs = {
  primaryGoals: [
    "Retirement income security",
    "Daughter's wedding",
    "Capital protection",
    "Healthcare / protection",
  ],
  priorities: [
    "Protecting family's financial security",
    "Maintaining current lifestyle post-retirement",
  ],
  riskPreference: "Moderate — balanced growth with capital protection",
  liquidityPreference: "Prefers 6+ months of expenses held in a liquid reserve",
  concerns: [
    "Rising healthcare costs",
    "Market volatility close to retirement",
  ],
  requests: [
    "Wants a clear retirement income plan in place before her daughter's wedding",
  ],
  source: "Discovery intake form · Submitted 12 May 2025",
};

/* ---- Financial picture ---- */

export interface FinancialPicture {
  netWorth: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  monthlySurplus: string;
  investments: string;
  insuranceCover: string;
  debt: string;
  planningHorizon: string;
  suggestedReserve: string;
}

export const FINANCIAL_PICTURE: FinancialPicture = {
  netWorth: "₹1.42 Cr",
  monthlyIncome: "₹1,85,000",
  monthlyExpenses: "₹92,000",
  monthlySurplus: "₹93,000",
  investments: "₹89 L",
  insuranceCover: "₹1.2 Cr (life)",
  debt: "₹18 L",
  planningHorizon: "8 years to target retirement (age 63)",
  suggestedReserve: "₹5.5 L (6 months of expenses)",
};

/* ---- Goals ---- */

export interface Goal {
  id: string;
  name: string;
  target: string;
  timeline: string;
  currentPosition: string;
  estimatedRequirement: string;
  gap: string | null;
  status: GoalStatus;
  aiObservation: string;
  levers: string[];
  progress: number; // 0-100, current / estimated requirement
}

export const GOALS: Goal[] = [
  {
    id: "retirement",
    name: "Retirement",
    target: "Retirement income corpus",
    timeline: "8 years",
    currentPosition: "₹1.8 Cr (projected)",
    estimatedRequirement: "₹3 Cr",
    gap: "₹1.2 Cr",
    status: "needs-review",
    aiObservation:
      "Current contribution levels, projected over the stated timeline, may not fully support the retirement income objective. Based on information provided — needs validation with the client.",
    levers: ["Review contribution level", "Review timeline", "Review target"],
    progress: 60,
  },
  {
    id: "wedding",
    name: "Daughter's Wedding",
    target: "₹25 L",
    timeline: "2 years",
    currentPosition: "₹9 L",
    estimatedRequirement: "₹27 L (inflation-adjusted)",
    gap: "₹18 L",
    status: "needs-validation",
    aiObservation:
      "Target amount and timeline were captured at intake and have not been reconfirmed since. Consider reviewing both before the next meeting.",
    levers: ["Review target amount", "Review timeline", "Review current allocation"],
    progress: 33,
  },
  {
    id: "protection",
    name: "Protection / Healthcare",
    target: "Adequate life & health coverage for family",
    timeline: "Ongoing",
    currentPosition: "₹1.2 Cr life cover on file",
    estimatedRequirement: "Not yet established",
    gap: null,
    status: "needs-review",
    aiObservation:
      "Current information does not establish whether existing health coverage is sufficient — health insurance was not captured at intake. Potential gap, needs validation.",
    levers: ["Review existing policies", "Discuss coverage adequacy"],
    progress: 0,
  },
];

/* ---- Open Questions ----
   One source of truth, rendered two ways:
   - issueTitle/issueBlurb + attentionAction → Needs Attention (states the gap: what/why/action)
   - questionText + questionAction           → Open Questions (phrased as a question to ask)
   - reason/evidence/suggestedQuestion       → kept for anywhere the fuller context is still useful */

export interface OpenQuestion {
  id: string;
  severity: Severity;
  issueTitle: string;
  issueBlurb: string;
  attentionAction: string;
  questionText: string;
  questionAction: string;
  reason: string;
  evidence: string[];
  suggestedQuestion: string;
  relatedGoalId: string | null;
}

export const OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: "q-retirement-gap",
    severity: "high",
    issueTitle: "Retirement funding gap",
    issueBlurb: "Projected retirement income is below target",
    attentionAction: "Review projection",
    questionText: "Retirement income target?",
    questionAction: "Ask client",
    reason:
      "Stated capital and monthly surplus, projected over an 8-year horizon, may not fully support the stated retirement income objective.",
    evidence: [
      "Net worth: ₹1.42 Cr",
      "Monthly surplus: ₹93,000",
      "Stated retirement target: ₹3 Cr in 8 years",
    ],
    suggestedQuestion: "What monthly retirement income would make you feel financially comfortable?",
    relatedGoalId: "retirement",
  },
  {
    id: "q-wedding-validation",
    severity: "high",
    issueTitle: "Wedding goal needs validation",
    issueBlurb: "Goal amount has not been confirmed",
    attentionAction: "Validate goal",
    questionText: "Wedding budget confirmed?",
    questionAction: "Validate",
    reason:
      "Target amount (₹25 L) and 2-year timeline were provided at intake but have not been confirmed or reviewed since.",
    evidence: ["Discovery form response, 12 May 2025", "No follow-up confirmation on file"],
    suggestedQuestion: "Has the target amount or timeline for your daughter's wedding changed recently?",
    relatedGoalId: "wedding",
  },
  {
    id: "q-protection-incomplete",
    severity: "medium",
    issueTitle: "Protection information incomplete",
    issueBlurb: "Coverage information is missing",
    attentionAction: "Request details",
    questionText: "Current protection coverage?",
    questionAction: "Request details",
    reason:
      "Existing health insurance coverage was not captured during intake — only life cover (₹1.2 Cr) is currently on file.",
    evidence: ["Discovery form — health insurance field left blank"],
    suggestedQuestion: "Are there existing insurance policies not included in the information we have on file?",
    relatedGoalId: "protection",
  },
];

/* ---- Next Meeting (Client Snapshot header) ---- */

export interface NextMeeting {
  label: string; // "In 3 days" — relative, matches NEXT_BEST_ACTION's language
  date: string;
  time: string;
  purpose: string;
}

export const NEXT_MEETING: NextMeeting = {
  label: "In 3 days",
  date: "22 May 2025",
  time: "10:30 AM",
  purpose: "Retirement Plan Review",
};

/* ============================================================
   Advisory Journey
   The client's progression through the FinCAREe advisory
   relationship — one consistent page structure, five stages of
   content priority, not five different layouts.
   ============================================================ */

export type AdvisoryStage = "onboarded" | "assessment" | "proposal" | "plan" | "review";

export interface StageInfo {
  id: AdvisoryStage;
  number: string;
  label: string;
}

export const ADVISORY_STAGES: StageInfo[] = [
  { id: "onboarded", number: "01", label: "Onboarded" },
  { id: "assessment", number: "02", label: "Assessment" },
  { id: "proposal", number: "03", label: "Proposal" },
  { id: "plan", number: "04", label: "Plan" },
  { id: "review", number: "05", label: "Review" },
];

// A real build would compute this from where the client actually is (has an
// active plan + a review meeting on the calendar → review). Anika has been
// through all four prior stages and her upcoming meeting is a plan review,
// so "review" is the current stage — see ADVISORY_STAGE_STATE for the
// per-stage completed/current/upcoming read used to render the stepper.
export const CURRENT_STAGE: AdvisoryStage = "review";

export function stageStatus(stage: AdvisoryStage): "completed" | "current" | "upcoming" {
  const order = ADVISORY_STAGES.map((s) => s.id);
  const currentIndex = order.indexOf(CURRENT_STAGE);
  const stageIndex = order.indexOf(stage);
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "current";
  return "upcoming";
}

/* ---- Stage 1 — Onboarded ---- */

export const ONBOARDING_NEXT_ACTION = {
  headline: "Complete discovery, then prepare the initial assessment",
  ctaLabel: "Prepare Initial Assessment",
};

/* ---- Stage 2 — Assessment ----
   Findings reuse OPEN_QUESTIONS — they're the same underlying gaps,
   read here as "what the assessment found" rather than "what's open". */

export const ASSESSMENT_FINNY_SUMMARY = "3 planning gaps identified from discovery and assessment.";

/* ---- Stage 3 — Proposal ---- */

export interface RecommendedPlan {
  name: string;
  subscription: string;
  scope: string[];
  rationale: string;
  pendingStatus: string;
}

export const RECOMMENDED_PLAN: RecommendedPlan = {
  name: "Comprehensive Financial Plan",
  subscription: "Annual advisory · Platinum tier",
  scope: [
    "Retirement income planning",
    "Goal-based investing (wedding, protection)",
    "Protection coverage review",
    "Scheduled plan reviews",
  ],
  rationale:
    "Client's retirement funding gap and unconfirmed protection coverage both need ongoing planning, not a one-time recommendation.",
  pendingStatus: "Subscribed · 18 May 2025",
};

/* ---- Stage 4 — Plan ---- */

export interface ActionPlanItem {
  action: string;
  owner: "Advisor" | "Client";
  status: "in-progress" | "pending" | "completed";
}

export const ACTION_PLAN: ActionPlanItem[] = [
  { action: "Confirm retirement income target with client", owner: "Advisor", status: "in-progress" },
  { action: "Provide updated health insurance policy details", owner: "Client", status: "pending" },
  { action: "Review SIP contribution increase", owner: "Advisor", status: "pending" },
];

export interface PendingDecision {
  item: string;
  detail: string;
}

export const PENDING_DECISIONS: PendingDecision[] = [
  { item: "Retirement contribution level", detail: "Current SIP may not meet target — awaiting advisor recommendation" },
  { item: "Wedding goal allocation", detail: "Target amount pending client confirmation" },
];

export const PLAN_FINNY_SUPPORT = "Retirement and wedding goals both carry unresolved assumptions — see Pending Decisions.";

/* ---- Stage 5 — Review ---- */

export interface ReviewChange {
  what: string;
  status: string;
  why: string;
  action: string;
}

export const REVIEW_CHANGES: ReviewChange[] = [
  {
    what: "Retirement funding gap",
    status: "Improved 8%",
    why: "Recent SIP increase is closing the projected shortfall",
    action: "Confirm updated projection",
  },
  {
    what: "Healthcare cost estimate",
    status: "Changed",
    why: "Rising healthcare costs flagged as a growing concern",
    action: "Review protection coverage",
  },
  {
    what: "Wedding goal",
    status: "Updated",
    why: "Target amount may need reconfirmation",
    action: "Validate with client",
  },
];

export interface ReviewBriefData {
  summary: string;
  basedOn: string[];
  changeCount: number;
}

export const REVIEW_BRIEF: ReviewBriefData = {
  summary: "4 meaningful changes since the previous review, most notably an improving retirement funding gap and an updated wedding goal amount.",
  basedOn: ["Previous review", "Recent activity", "Current client data"],
  changeCount: 4,
};

/* ---- Relationship Timeline ----
   Meaningful milestones, not routine system events — "how did we
   get to the current state?", read top-to-bottom oldest first. */

export interface RelationshipEvent {
  date: string;
  title: string;
  description: string;
}

export const RELATIONSHIP_TIMELINE: RelationshipEvent[] = [
  { date: "12 May 2025", title: "Discovery completed", description: "Client identified retirement income as primary priority." },
  { date: "13 May 2025", title: "Initial assessment discussed", description: "Retirement funding and protection gaps identified." },
  { date: "15 May 2025", title: "Proposal presented", description: "Comprehensive Financial Plan recommended." },
  { date: "18 May 2025", title: "Plan subscribed", description: "Client accepted the Comprehensive Financial Plan." },
  { date: "19 May 2025", title: "First plan review completed", description: "Retirement Plan Review shared; wedding goal and retirement funding discussed." },
];

/* ---- Recent Activity — split Advisor vs Client ---- */

export interface ActivityItem {
  time: string;
  event: string;
  type: "client" | "ai" | "advisor";
}

// Only meaningful advisor events — system/AI-generation events are noise the
// advisor doesn't need in a timeline of what actually happened.
export const ADVISOR_ACTIVITY: ActivityItem[] = [
  { time: "13 May 2025 · 9:15 AM", event: "Advisor reviewed client information", type: "advisor" },
  { time: "18 May 2025 · 2:00 PM", event: "Meeting held — retirement plan discussed", type: "advisor" },
  { time: "22 May 2025 · 10:30 AM", event: "Next meeting scheduled", type: "advisor" },
];

// Client-side activity — things the client themselves did.
export const CLIENT_ACTIVITY: ActivityItem[] = [
  { time: "12 May 2025 · 3:40 PM", event: "Discovery form submitted", type: "client" },
  { time: "20 May 2025 · 11:02 AM", event: "Opened Retirement Plan Review report", type: "client" },
  { time: "20 May 2025 · 11:06 AM", event: "Asked a question about SIP flexibility", type: "client" },
  { time: "21 May 2025 · 6:20 PM", event: "Started Retirement Planning Essentials learning path", type: "client" },
];

/* ---- Submitted Discovery Form ----
   The exact client-facing intake form, question by question, as
   submitted — not the advisor-side synthesis in ClientToldUs above.
   `answer: null` marks a question the client left unanswered. */

export interface SubmittedFormField {
  section: string;
  question: string;
  answer: string | null;
}

export const SUBMITTED_FORM_SUBMITTED_AT = "12 May 2025 · 3:40 PM";

export const SUBMITTED_FORM: SubmittedFormField[] = [
  { section: "About You", question: "What life stage best describes you?", answer: "Pre-retirement — approaching retirement in the next 5–10 years" },
  { section: "About You", question: "What is your age?", answer: "55" },
  { section: "About You", question: "Tell us about your family", answer: "Married, 1 daughter (25)" },
  { section: "Financial Snapshot", question: "What is your approximate net worth / starting capital?", answer: "₹1.42 Cr" },
  { section: "Financial Snapshot", question: "What is your monthly income?", answer: "₹1,85,000" },
  { section: "Financial Snapshot", question: "What are your monthly expenses?", answer: "₹92,000" },
  { section: "Goals", question: "What are your top financial goals?", answer: "Retirement income security, Daughter's wedding, Capital protection, Healthcare / protection" },
  { section: "Goals", question: "What is your planning horizon for retirement?", answer: "8 years" },
  { section: "Goals", question: "What is your target amount for your daughter's wedding?", answer: "₹25,00,000" },
  { section: "Goals", question: "By when do you need this amount?", answer: "2 years" },
  { section: "Risk & Liquidity", question: "How would you describe your risk tolerance?", answer: "Moderate — balanced growth with capital protection" },
  { section: "Risk & Liquidity", question: "How much liquidity / emergency reserve would make you comfortable?", answer: "6+ months of expenses" },
  { section: "Protection", question: "Do you have existing life insurance coverage?", answer: "Yes, ₹1.2 Cr cover" },
  { section: "Protection", question: "Do you have existing health insurance coverage?", answer: null },
  { section: "Openness to Advice", question: "Are there specific concerns you'd like to discuss?", answer: "Rising healthcare costs, market volatility close to retirement" },
  { section: "Openness to Advice", question: "How open are you to advisor recommendations?", answer: null },
  { section: "Discovery Call", question: "What would you like to cover in your first meeting?", answer: "Wants a clear retirement income plan in place before her daughter's wedding" },
];

/* ---- Client Engagement ----
   Factual usage data — report reads, questions asked, simulation and
   learning-path activity. Not an AI inference; just what happened. */

export interface ReportEngagement {
  reportName: string;
  status: "read" | "unread" | "partially-read";
  detail: string;
  date: string;
}

export const REPORT_ENGAGEMENT: ReportEngagement[] = [
  { reportName: "Retirement Plan Review", status: "read", detail: "3 min on page", date: "20 May 2025" },
  { reportName: "FY24 Annual Summary", status: "unread", detail: "Not yet opened", date: "18 May 2025" },
];

export interface ClientQuery {
  question: string;
  askedAt: string;
  status: "answered" | "pending";
}

export const CLIENT_QUERIES: ClientQuery[] = [
  { question: "Can I increase my SIP amount mid-year?", askedAt: "20 May 2025", status: "pending" },
  { question: "What happens to my plan if I retire a year early?", askedAt: "14 May 2025", status: "answered" },
];

export interface SimulationActivity {
  name: string;
  suggestedOn: string;
  status: "completed" | "in-progress" | "not-started";
}

export const SIMULATION_ACTIVITY: SimulationActivity[] = [
  { name: "Retirement Corpus Simulator", suggestedOn: "19 May 2025", status: "in-progress" },
  { name: "Wedding Goal Planner", suggestedOn: "19 May 2025", status: "not-started" },
];

export interface LearningActivity {
  path: string;
  suggestedOn: string;
  progress: number; // 0-100
  status: "completed" | "in-progress" | "not-started";
}

export const LEARNING_ACTIVITY: LearningActivity[] = [
  { path: "Retirement Planning Essentials", suggestedOn: "15 May 2025", progress: 50, status: "in-progress" },
  { path: "Understanding Term Insurance", suggestedOn: "20 May 2025", progress: 0, status: "not-started" },
];

/* ---- Last Contact ----
   Answers "when did I last speak to them?" without opening the
   Engagement tab or the sidebar activity log. */

export interface LastContact {
  date: string;
  daysAgo: number;
  summary: string;
}

export const LAST_CONTACT: LastContact = {
  date: "20 May 2025",
  daysAgo: 3,
  summary: "Plan Discussion — retirement projection reviewed",
};

/* ---- Financial Health Snapshot ----
   The "under 10 seconds" answer to "how healthy is this client's
   financial position right now?" — distinct from the full detail
   in Financial Picture, which stays the supporting tab. */

export type HealthStatus = "on-track" | "needs-attention" | "at-risk";

export interface FinancialHealthSnapshot {
  aum: string;
  healthScore: number; // 0-100
  healthStatus: HealthStatus;
  riskLevel: string;
  portfolioReturn: string;
}

export const FINANCIAL_HEALTH_SNAPSHOT: FinancialHealthSnapshot = {
  aum: "₹1.42 Cr",
  healthScore: 62,
  healthStatus: "needs-attention",
  riskLevel: "Moderate",
  portfolioReturn: "+8.2% YTD",
};

/* ---- Life Events ----
   Upcoming and past milestones — each linked to the goal it
   funds where one exists, so a wedding date and the wedding
   goal read as one story, not two disconnected records. */

export type LifeEventStatus = "upcoming" | "past";

export interface LifeEvent {
  id: string;
  title: string;
  date: string;
  status: LifeEventStatus;
  relatedGoalId: string | null;
}

export const LIFE_EVENTS: LifeEvent[] = [
  { id: "le-1", title: "Daughter's wedding", date: "March 2027", status: "upcoming", relatedGoalId: "wedding" },
  { id: "le-2", title: "Planned retirement", date: "2033 · Age 63", status: "upcoming", relatedGoalId: "retirement" },
  { id: "le-3", title: "Daughter graduated college", date: "June 2023", status: "past", relatedGoalId: null },
];

/* ---- Documents ----
   Kept simple per the Foundation scope — status and provenance,
   not full versioning or e-signature workflow. */

export type DocumentStatus = "valid" | "pending" | "expired";

export interface ClientDocument {
  id: string;
  name: string;
  type: "KYC" | "Risk Profile" | "Agreement" | "Statement";
  status: DocumentStatus;
  detail: string;
}

export const CLIENT_DOCUMENTS: ClientDocument[] = [
  { id: "doc-1", name: "KYC Verification", type: "KYC", status: "valid", detail: "Valid till Mar 2028" },
  { id: "doc-2", name: "Risk Profile Assessment", type: "Risk Profile", status: "pending", detail: "Due for renewal · Jun 2025" },
  { id: "doc-3", name: "Advisory Agreement", type: "Agreement", status: "valid", detail: "Signed 18 May 2025" },
  { id: "doc-4", name: "Q1 FY25 Portfolio Statement", type: "Statement", status: "valid", detail: "Uploaded 5 Apr 2025" },
  { id: "doc-5", name: "Q4 FY24 Portfolio Statement", type: "Statement", status: "valid", detail: "Uploaded 10 Jan 2025" },
];

/* ---- Fee / Billing ----
   Kept simple per the Foundation scope — current structure and
   status, not a full invoicing ledger. */

export interface FeeStructure {
  type: string;
  rate: string;
  annualFee: string;
  lastPaid: string;
  nextBilling: string;
  overdue: boolean;
}

export const FEE_STRUCTURE: FeeStructure = {
  type: "AUM Percentage",
  rate: "1.5% of AUM annually",
  annualFee: "₹21,300",
  lastPaid: "18 May 2025",
  nextBilling: "18 May 2026",
  overdue: false,
};

/* ---- SEBI Compliance ----
   The three checks a RIA is expected to keep current for every
   client — surfaced here so the advisor never has to leave the
   profile to check standing. */

export type ComplianceItemStatus = "complete" | "due-soon" | "overdue";

export interface ComplianceItem {
  label: string;
  status: ComplianceItemStatus;
  detail: string;
}

export const COMPLIANCE_STATUS: ComplianceItem[] = [
  { label: "KYC", status: "complete", detail: "Verified · valid till Mar 2028" },
  { label: "Risk Profile", status: "due-soon", detail: "Due for renewal · Jun 2025" },
  { label: "Advisory Agreement", status: "complete", detail: "Signed · 18 May 2025" },
];
