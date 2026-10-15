/* ============================================================
   Client Profile Mock Data — Anika Rao (Gold Plan subscriber)
   ============================================================ */

export type PlanType = "silver" | "gold" | "platinum";

/** The single lifecycle-stage model for a client — drives the header badge, the Advisory
    Journey tracker and the dev prototype switcher, so all three always agree. */
export type RelationshipStage = "onboarding" | "active-client" | "ongoing-advisory" | "closed";

export interface ClientIdentity {
  id: string;
  clientId: string;
  name: string;
  initials: string;
  age: number;
  maritalStatus: string;
  children: number;
  location: string;
  relationshipStage: RelationshipStage;
  relationshipSince: string;
  riskProfile: "conservative" | "moderate" | "aggressive";
  riskLastAssessed: string;
  riskReviewDue?: string;
}

export interface ClientGoal {
  id: string;
  name: string;
  category: "retirement" | "education" | "wealth" | "protection" | "tax";
  target?: string;
  projected?: string;
  gap?: string;
  targetAge?: number;
  timeline?: string;
  progress: number;
  priority: "high" | "medium" | "low";
  status: "on-track" | "needs-review" | "needs-attention";
  /** Rupees per month currently directed at this goal, drawn from the monthly surplus. */
  monthlyContribution?: number;
  lastUpdated: string;
}

/** ₹ in Indian notation — 65000 → ₹65K, 165000 → ₹1.65L, 18000000 → ₹1.8Cr */
export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${parseFloat((amount / 10000000).toFixed(2))}Cr`;
  if (amount >= 100000) return `₹${parseFloat((amount / 100000).toFixed(2))}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export interface ClientMeeting {
  id: string;
  type: "discovery" | "proposal" | "review" | "quarterly";
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  mode: "in-person" | "video" | "phone";
  lastMeeting?: string;
}

/** Every significant financial value carries where it came from — this is the evidence layer. */
export type DataSource = "client-provided" | "account-synced" | "advisor-entered" | "ai-estimated" | "needs-verification";

export const DATA_SOURCE_LABEL: Record<DataSource, string> = {
  "client-provided": "Client provided",
  "account-synced": "Account synced",
  "advisor-entered": "Advisor entered",
  "ai-estimated": "AI estimated",
  "needs-verification": "Needs verification",
};

export interface SourcedValue {
  value: string;
  source: DataSource;
}

export interface ConnectedAccount {
  name: string;
  institution: string;
  status: "connected" | "sync-issue";
  lastSynced: string;
}

export interface PortfolioAllocation {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
}

export interface ProtectionPolicy {
  type: "Life Insurance" | "Health Insurance";
  status: "active" | "incomplete";
  coverageAmount?: string;
  renewalDate?: string;
}

export interface FinancialData {
  monthlyIncome: SourcedValue;
  monthlyExpenses: SourcedValue;
  /** Rupees. Numeric so goal contributions can be shown as shares of it. */
  monthlySurplus: number;
  netWorth: SourcedValue;
  totalInvestments: string;
  portfolioAllocation: PortfolioAllocation;
  portfolioChangeLabel: string;
  accounts: ConnectedAccount[];
  protection: ProtectionPolicy[];
}

export interface PlanInfo {
  id: PlanType;
  name: string;
  tier: string;
  since: string;
  activatedDate: string;
  renewalDate: string;
  status: "active" | "expiring-soon" | "expired";
  capabilities: string[];
}

export interface NeedsAttentionItem {
  id: string;
  issue: string;
  type: "discussion" | "validation" | "pending" | "review";
  severity: "critical" | "warning" | "info";
  detail?: string;
  relatedGoal?: string;
  lastUpdated: string;
  suggestedAction: string;
}

/** Exhaustive audit categories — deliberately different from Engagement's timeline
    types, since Activity groups by what kind of record it is, not the relationship
    story. "Advice" here covers both AI-surfaced and advisor-authored items. */
export type ActivityCategory = "meeting" | "advice" | "financial" | "learning" | "communication" | "task";
export type ActivityActor = "client" | "advisor" | "ai" | "system";

export interface ActivityRecord {
  id: string;
  date: string;
  time: string;
  sortDateTime: string;
  actor: ActivityActor;
  category: ActivityCategory;
  title: string;
  description?: string;
  source?: string;
}

export const ACTIVITY_CATEGORY_LABEL: Record<ActivityCategory, string> = {
  meeting: "Meetings",
  advice: "Advice",
  financial: "Financial",
  learning: "Learning",
  communication: "Communication",
  task: "Tasks",
};

export interface DiscoveryContext {
  date: string;
  initialGoals: string[];
}

export interface AdvisoryReadiness {
  kycStatus: "verified" | "pending" | "incomplete";
  panVerified: boolean;
  financialDataCompletion: number;
  accountsConnected: number;
  accountAggregationStatus: "connected" | "partial" | "not-connected";
  portfolioSyncStatus: "synced" | "stale" | "not-synced";
  lastPortfolioSync: string;
  pendingBlockers: string[];
}

export interface ClientProfileData {
  identity: ClientIdentity;
  financialData: FinancialData;
  plan: PlanInfo;
  nextMeeting: ClientMeeting;
  goals: ClientGoal[];
  needsAttention: NeedsAttentionItem[];
  activity: ActivityRecord[];
  discoveryContext: DiscoveryContext;
  openActions: number;
  lastInteraction: string;
  learning: LearningPath[];
  simulations: SimulationRecord[];
  advisoryReadiness: AdvisoryReadiness;
}

export interface LearningPath {
  id: string;
  name: string;
  completed: number;
  total: number;
  category: string;
}

export interface SimulationRecord {
  id: string;
  name: string;
  type: string;
  status: "completed" | "abandoned" | "in-progress";
  date: string;
}

/** Fixed "today" reference for this prototype — keeps countdowns, date-range filters
    and "days ago" labels consistent across every tab without re-deriving it per file. */
export const TODAY_ISO = "2025-08-24";

/* ---- Mock Data for Anika Rao ---- */

export const ANIKA_RAO: ClientProfileData = {
  identity: {
    id: "client-anika-rao",
    clientId: "CL-2025-0842",
    name: "Anika Rao",
    initials: "AR",
    age: 35,
    maritalStatus: "Married",
    children: 1,
    location: "Bengaluru, Karnataka",
    relationshipStage: "ongoing-advisory",
    relationshipSince: "May 2025",
    riskProfile: "moderate",
    riskLastAssessed: "12 Jun 2025",
  },
  financialData: {
    monthlyIncome: { value: "₹3.75L", source: "client-provided" },
    monthlyExpenses: { value: "₹2.1L", source: "account-synced" },
    monthlySurplus: 165000,
    netWorth: { value: "₹1.65Cr", source: "account-synced" },
    totalInvestments: "₹1.2Cr",
    portfolioAllocation: { equity: 58, debt: 30, gold: 7, cash: 5 },
    portfolioChangeLabel: "+6.2% since last review",
    accounts: [
      { name: "Savings & Salary Account", institution: "HDFC Bank", status: "connected", lastSynced: "2 hours ago" },
      { name: "Mutual Fund Folio", institution: "SBI Mutual Fund", status: "connected", lastSynced: "2 hours ago" },
      { name: "Demat & Trading Account", institution: "Zerodha", status: "connected", lastSynced: "3 days ago" },
      { name: "Life Insurance Policy", institution: "LIC", status: "sync-issue", lastSynced: "14 days ago" },
    ],
    protection: [
      { type: "Life Insurance", status: "incomplete" },
      { type: "Health Insurance", status: "active", coverageAmount: "₹10L", renewalDate: "15 Mar 2026" },
    ],
  },
  plan: {
    id: "gold",
    name: "Gold",
    tier: "Annual Guide Plan",
    since: "May 2025",
    activatedDate: "2025-05-20",
    renewalDate: "20 May 2026",
    status: "active",
    capabilities: [
      "Financial Planning",
      "Goal-based Planning",
      "Investment Strategy",
      "Portfolio Review",
      "Learning Paths",
      "Simulations",
      "Periodic Review Meetings",
    ],
  },
  nextMeeting: {
    id: "meeting-annual-review-2025",
    type: "quarterly",
    title: "Quarterly Review",
    description: "Review progress on goals, discuss changes and agree on next steps.",
    date: "28 Aug 2025",
    time: "10:30 AM",
    duration: "45 minutes",
    mode: "video",
  },
  goals: [
    {
      id: "goal-retirement",
      name: "Retirement Planning",
      category: "retirement",
      target: "₹1.8Cr",
      projected: "₹1.72Cr",
      gap: "₹8.4L",
      targetAge: 58,
      progress: 72,
      priority: "high",
      status: "needs-review",
      monthlyContribution: 65000,
      lastUpdated: "20 May 2025",
    },
    {
      id: "goal-education",
      name: "Child Education",
      category: "education",
      target: "₹35L",
      gap: "₹12L",
      timeline: "10-year horizon",
      progress: 45,
      priority: "high",
      status: "needs-attention",
      monthlyContribution: 40000,
      lastUpdated: "15 Aug 2025",
    },
    {
      id: "goal-wealth",
      name: "Wealth Creation",
      category: "wealth",
      target: "₹1Cr",
      timeline: "Long-term growth",
      progress: 58,
      priority: "medium",
      status: "on-track",
      monthlyContribution: 25000,
      lastUpdated: "20 May 2025",
    },
  ],
  needsAttention: [
    {
      id: "issue-retirement-gap",
      issue: "Retirement goal is off track",
      type: "discussion",
      severity: "critical",
      detail: "Potential ₹8.4L gap",
      relatedGoal: "goal-retirement",
      lastUpdated: "15 Aug 2025",
      suggestedAction: "Discuss gap closure strategy and contribution increase in next review",
    },
    {
      id: "issue-protection",
      issue: "Insurance information incomplete",
      type: "pending",
      severity: "warning",
      detail: "Existing coverage needs validation",
      lastUpdated: "01 Aug 2025",
      suggestedAction: "Request updated insurance coverage details",
    },
    {
      id: "issue-education-amount",
      issue: "Education goal amount",
      type: "validation",
      severity: "info",
      detail: "Client to validate target amount based on inflation assumptions",
      relatedGoal: "goal-education",
      lastUpdated: "12 Aug 2025",
      suggestedAction: "Client to validate target amount based on inflation assumptions",
    },
  ],
  activity: [
    {
      id: "act-1", date: "22 Aug 2025", time: "3:15 PM", sortDateTime: "2025-08-22T15:15",
      actor: "client", category: "financial", title: "Salary information updated", source: "Client",
    },
    {
      id: "act-2", date: "22 Aug 2025", time: "2:45 PM", sortDateTime: "2025-08-22T14:45",
      actor: "advisor", category: "advice", title: "Reviewed AI insight", description: "Retirement funding gap flagged for discussion",
    },
    {
      id: "act-3", date: "22 Aug 2025", time: "2:40 PM", sortDateTime: "2025-08-22T14:40",
      actor: "ai", category: "advice", title: "Retirement gap identified", description: "Potential ₹8.4L shortfall detected from updated projection",
    },
    {
      id: "act-4", date: "18 Aug 2025", time: "10:00 AM", sortDateTime: "2025-08-18T10:00",
      actor: "client", category: "advice", title: "Goal updated", description: "Retirement target age changed 60 → 58",
    },
    {
      id: "act-5", date: "15 Aug 2025", time: "9:30 AM", sortDateTime: "2025-08-15T09:30",
      actor: "advisor", category: "advice", title: "Simulation shared", description: "Retirement Scenario — comparing age 58 and 60",
    },
    {
      id: "act-6", date: "12 Aug 2025", time: "6:00 PM", sortDateTime: "2025-08-12T18:00",
      actor: "client", category: "learning", title: "Workshop attended", description: "Retirement Planning Workshop",
    },
    {
      id: "act-7", date: "10 Aug 2025", time: "4:20 PM", sortDateTime: "2025-08-10T16:20",
      actor: "client", category: "learning", title: "Learning module completed", description: "Retirement Planning — Module 3: Inflation",
    },
    {
      id: "act-8", date: "08 Aug 2025", time: "2:10 PM", sortDateTime: "2025-08-08T14:10",
      actor: "advisor", category: "communication", title: "Follow-up email sent", description: "Requested review of updated retirement scenario",
    },
    {
      id: "act-9", date: "06 Aug 2025", time: "3:30 PM", sortDateTime: "2025-08-06T15:30",
      actor: "advisor", category: "communication", title: "Query answered", description: "Explained retirement target impact of retiring at 58",
    },
    {
      id: "act-10", date: "06 Aug 2025", time: "11:00 AM", sortDateTime: "2025-08-06T11:00",
      actor: "client", category: "communication", title: "Query raised", description: "“How does the retirement target change if I retire at 58?”",
    },
    {
      id: "act-11", date: "01 Aug 2025", time: "9:00 AM", sortDateTime: "2025-08-01T09:00",
      actor: "system", category: "financial", title: "Portfolio synced", source: "Account aggregation",
    },
    {
      id: "act-12", date: "25 Jul 2025", time: "10:15 AM", sortDateTime: "2025-07-25T10:15",
      actor: "advisor", category: "task", title: "Task assigned", description: "Upload latest insurance policy details",
    },
    {
      id: "act-13", date: "18 Jul 2025", time: "11:00 AM", sortDateTime: "2025-07-18T11:00",
      actor: "advisor", category: "meeting", title: "Quarterly Review completed", description: "2 actions created",
    },
    {
      id: "act-14", date: "10 Jul 2025", time: "3:00 PM", sortDateTime: "2025-07-10T15:00",
      actor: "client", category: "advice", title: "Simulation explored", description: "Education Funding Scenario — not completed",
    },
    {
      id: "act-15", date: "04 Jul 2025", time: "9:45 AM", sortDateTime: "2025-07-04T09:45",
      actor: "advisor", category: "learning", title: "Learning path assigned", description: "Retirement Planning Path",
    },
    {
      id: "act-16", date: "20 May 2025", time: "2:00 PM", sortDateTime: "2025-05-20T14:00",
      actor: "advisor", category: "meeting", title: "Plan Discussion completed", description: "Gold Plan activated",
    },
  ],
  discoveryContext: {
    date: "15 May 2025",
    initialGoals: ["Retirement planning", "Child education planning", "Wealth creation"],
  },
  openActions: 3,
  lastInteraction: "18 Sep 2025",
  advisoryReadiness: {
    kycStatus: "verified",
    panVerified: true,
    financialDataCompletion: 82,
    accountsConnected: 3,
    accountAggregationStatus: "connected",
    portfolioSyncStatus: "synced",
    lastPortfolioSync: "3 days ago",
    pendingBlockers: ["Insurance policy missing", "Updated salary slip unavailable", "LIC account hasn't synced for 14 days"],
  },
  learning: [
    { id: "lp-retirement", name: "Retirement Learning Path", completed: 3, total: 5, category: "Retirement" },
    { id: "lp-tax", name: "Tax Planning", completed: 1, total: 4, category: "Tax" },
  ],
  simulations: [
    { id: "sim-retirement", name: "Retirement Simulation", type: "Retirement", status: "completed", date: "10 Sep 2025" },
    { id: "sim-downturn", name: "Market Downturn Simulation", type: "Scenario", status: "abandoned", date: "05 Sep 2025" },
    { id: "sim-education", name: "Education Funding Simulation", type: "Education", status: "in-progress", date: "10 Jul 2025" },
    { id: "sim-tax", name: "Tax Scenario Simulation", type: "Tax", status: "completed", date: "02 Jul 2025" },
  ],
};

export const PLAN_CAPABILITIES: Record<PlanType, string[]> = {
  silver: ["Financial Planning", "Goal-based Planning"],
  gold: [
    "Financial Planning",
    "Goal-based Planning",
    "Investment Strategy",
    "Portfolio Review",
    "Learning Paths",
    "Simulations",
    "Periodic Review Meetings",
  ],
  platinum: [
    "Financial Planning",
    "Goal-based Planning",
    "Investment Strategy",
    "Portfolio Review",
    "Learning Paths",
    "Simulations",
    "Periodic Review Meetings",
    "Family Planning",
    "Estate Planning",
    "Tax Optimization",
    "Wealth Transfer",
    "Priority Support",
  ],
};

export const RELATIONSHIP_STAGE_LABELS: Record<RelationshipStage, string> = {
  onboarding: "Onboarding",
  "active-client": "Active Client",
  "ongoing-advisory": "Ongoing Advisory",
  closed: "Relationship Closed",
};
