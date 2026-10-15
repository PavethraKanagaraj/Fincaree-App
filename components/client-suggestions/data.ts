/* ============================================================
   Content Studio — Master Data
   Create content, run AI compliance checks, and assign to an
   individual client or a client group. Not client-specific —
   this is the advisor's full content hub.
   ============================================================ */

export type MeetingStage = "discovery" | "assessment" | "proposal" | "plan" | "review";

export const MEETING_STAGE_LABELS: Record<MeetingStage, string> = {
  discovery: "Discovery",
  assessment: "Assessment",
  proposal: "Proposal",
  plan: "Plan",
  review: "Review",
};

/* ============================================================
   Content taxonomy

   Four categories an advisor actually creates and assigns.
   Learning is the one category with multiple formats — a video
   and a PDF are consumed completely differently, so format is
   a first-class field, not a tag. Meeting and Workshop share a
   shape (both are scheduled sessions, online or offline) but
   stay separate categories because they mean different things
   to a client: a meeting is 1:1 with their advisor, a workshop
   is a group session they attend.
   ============================================================ */

export type ContentCategory = "learning" | "simulation" | "meeting" | "workshop";
export type LearningFormat = "video" | "course-series" | "image-post" | "pdf";
export type SessionMode = "online" | "offline";

export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> = {
  learning: "Learning",
  simulation: "Simulation",
  meeting: "Meeting",
  workshop: "Workshop",
};

export const LEARNING_FORMAT_LABEL: Record<LearningFormat, string> = {
  video: "Video",
  "course-series": "Course Series",
  "image-post": "Image Post",
  pdf: "PDF",
};

/* ============================================================
   Compliance — an actual check, not a static label.

   A ComplianceRecord carries the evidence an AI review produced:
   which rules it checked against, what it found, where in the
   content it found it, and what it suggests. "Approved" without
   findings should mean the check ran and found nothing, not that
   no check happened — `checkedAt` is what distinguishes that
   from `not-reviewed`.
   ============================================================ */

export type ComplianceStatus = "approved" | "pending" | "flagged" | "not-reviewed";
export type FindingSeverity = "high" | "medium" | "low";

export interface ComplianceFinding {
  id: string;
  severity: FindingSeverity;
  rule: string;
  issue: string;
  location?: string;
  suggestion: string;
}

export interface ComplianceRecord {
  status: ComplianceStatus;
  ref?: string;
  checkedAt?: string;
  checkedBy?: "ai" | "compliance-team";
  summary?: string;
  findings: ComplianceFinding[];
}

const clean = (ref: string, summary: string): ComplianceRecord => ({
  status: "approved",
  ref,
  checkedAt: "22 May 2025 · 9:00 AM",
  checkedBy: "ai",
  summary,
  findings: [],
});

const notReviewed = (): ComplianceRecord => ({ status: "not-reviewed", findings: [] });

const pendingReview = (summary: string): ComplianceRecord => ({
  status: "pending",
  ref: undefined,
  checkedAt: "22 May 2025 · 8:30 AM",
  checkedBy: "ai",
  summary,
  findings: [],
});

const flaggedReview = (ref: string, findings: ComplianceFinding[]): ComplianceRecord => ({
  status: "flagged",
  ref,
  checkedAt: "22 May 2025 · 8:31 AM",
  checkedBy: "ai",
  summary: `${findings.length} issue${findings.length === 1 ? "" : "s"} found against SEBI advertising and advisory disclosure rules.`,
  findings,
});

/* ============================================================
   Content items
   ============================================================ */

export interface ContentItemBase {
  id: string;
  title: string;
  description?: string;
  category: ContentCategory;
  tags: string[];
  stages: MeetingStage[];
  creator: string;
  updatedAt: string;
  source: "my-content" | "firm-library";
  compliance: ComplianceRecord;
}

export interface LearningItem extends ContentItemBase {
  category: "learning";
  format: LearningFormat;
  duration?: string; // video
  moduleCount?: number; // course-series
  pageCount?: number; // pdf
}

export interface SimulationItem extends ContentItemBase {
  category: "simulation";
  simulationType: string;
  estimatedTime: string;
}

export interface SessionItem extends ContentItemBase {
  category: "meeting" | "workshop";
  mode: SessionMode;
  duration: string;
  date?: string;
  venue?: string; // offline
  location?: string; // offline
  joinLink?: string; // online
  capacity?: number; // workshop
  isRecorded?: boolean; // workshop
}

export type ContentItem = LearningItem | SimulationItem | SessionItem;

export const MY_CONTENT: ContentItem[] = [
  // ---- Learning: video ----
  {
    id: "c-001", title: "The Power of Compounding", category: "learning", format: "video",
    stages: ["discovery", "plan"], tags: ["Investment Basics", "Compounding"],
    updatedAt: "Updated May 10, 2025", duration: "8:15", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0401", "Checked against SEBI advertising code — no return guarantees or performance claims found."),
    description: "Explains how compounding works over long horizons — ideal for early-stage client conversations.",
  },
  {
    id: "c-002", title: "Understanding Retirement Corpus", category: "learning", format: "video",
    stages: ["assessment", "plan"], tags: ["Retirement Planning", "Corpus Building"],
    updatedAt: "Updated May 08, 2025", duration: "12:30", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0402", "Checked against SEBI advertising code — educational framing, no product mentions."),
    description: "Walks through how to calculate a retirement corpus target based on income needs and inflation.",
  },
  {
    id: "c-009", title: "SIP Flexibility – What You Can Change", category: "learning", format: "video",
    stages: ["plan", "review"], tags: ["SIP", "Investment"],
    updatedAt: "Updated May 22, 2025", duration: "8:00", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0409", "Checked against SEBI advertising code — no forward-looking statements found."),
    description: "Explains SIP pause, increase, decrease and step-up features — addresses common client queries.",
  },
  {
    id: "c-010", title: "Understanding Term Insurance", category: "learning", format: "video",
    stages: ["assessment", "proposal"], tags: ["Insurance", "Protection"],
    updatedAt: "Updated May 20, 2025", duration: "12:00", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0410", "Checked against IRDAI disclosure norms — coverage terms stated accurately."),
    description: "Breaks down term insurance coverage, sum assured calculation and riders.",
  },
  // ---- Learning: course-series ----
  {
    id: "c-021", title: "Retirement Readiness — 5 Part Series", category: "learning", format: "course-series",
    stages: ["assessment", "plan"], tags: ["Retirement Planning", "Structured Learning"],
    updatedAt: "Updated May 12, 2025", moduleCount: 5, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0421", "All 5 modules checked individually — consistent educational tone, no product bias."),
    description: "A five-module path from goal-setting through corpus calculation to income drawdown strategy.",
  },
  {
    id: "c-022", title: "First-Time Investor Foundations", category: "learning", format: "course-series",
    stages: ["discovery", "assessment"], tags: ["Investment Basics", "Beginner"],
    updatedAt: "Updated May 06, 2025", moduleCount: 4, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0422", "Reviewed for beginner-suitability language — no unsuitable-risk claims found."),
    description: "Four short modules covering asset classes, risk, diversification and getting started.",
  },
  {
    id: "c-023", title: "Tax Planning Masterclass", category: "learning", format: "course-series",
    stages: ["proposal", "plan"], tags: ["Tax Planning", "Structured Learning"],
    updatedAt: "Updated May 16, 2025", moduleCount: 3, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: pendingReview("Reviewing 80C/80D figures against FY 2025-26 limits before approval."),
    description: "Three-part series on 80C, 80D and NPS — currently being checked against this year's tax limits.",
  },
  // ---- Learning: image-post ----
  {
    id: "c-001b", title: "Start Early, Stay Ahead", category: "learning", format: "image-post",
    stages: ["discovery", "assessment"], tags: ["Goal Planning", "Early Investing"],
    updatedAt: "Updated May 08, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0402B", "Checked against SEBI advertising code — infographic figures verified against source."),
    description: "Visual infographic showing the power of starting investments early — great for discovery calls.",
  },
  {
    id: "c-024", title: "Where Your SIP Actually Goes", category: "learning", format: "image-post",
    stages: ["plan"], tags: ["SIP", "Visual"],
    updatedAt: "Updated May 14, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0424", "Checked against SEBI advertising code — allocation figures are illustrative, labelled as such."),
    description: "A one-page visual breaking down how a monthly SIP splits across equity, debt and expenses.",
  },
  {
    id: "c-025", title: "3 Signs You're Under-Insured", category: "learning", format: "image-post",
    stages: ["assessment"], tags: ["Insurance", "Protection"],
    updatedAt: "Updated May 18, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: flaggedReview("COMP-0425", [
      {
        id: "f-1", severity: "high", rule: "IRDAI Advertising Guidelines — Comparative Claims",
        issue: "Slide 2 references a competitor product by name in a comparison graphic.",
        location: "Slide 2", suggestion: "Remove the named comparison; state the coverage gap generically instead.",
      },
    ]),
    description: "Visual checklist for spotting protection gaps — flagged for a competitor product reference.",
  },
  // ---- Learning: pdf ----
  {
    id: "c-003", title: "Emergency Fund – How Much is Enough?", category: "learning", format: "pdf",
    stages: ["assessment", "plan"], tags: ["Financial Basics", "Emergency Fund"],
    updatedAt: "Updated May 07, 2025", pageCount: 4, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0403", "Checked against SEBI advertising code — no return projections found."),
    description: "Guide on sizing an emergency reserve based on household expenses and risk tolerance.",
  },
  {
    id: "c-008", title: "Managing Volatility Close to Retirement", category: "learning", format: "pdf",
    stages: ["plan", "review"], tags: ["Risk Management", "Retirement"],
    updatedAt: "Updated May 22, 2025", pageCount: 6, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: flaggedReview("COMP-0408", [
      {
        id: "f-2", severity: "high", rule: "SEBI Investment Advice Disclosure",
        issue: "Page 4 names a specific mutual fund scheme without the required risk disclosure.",
        location: "Page 4, paragraph 2", suggestion: "Remove the scheme name or add the standard mutual fund risk disclaimer beside it.",
      },
      {
        id: "f-3", severity: "low", rule: "House Style — Data Currency",
        issue: "Inflation assumption on page 2 cites 2023 data.",
        location: "Page 2", suggestion: "Update to the latest published inflation figures before re-sending.",
      },
    ]),
    description: "Covers de-risking strategies as clients near retirement. Flagged — product reference needs removal.",
  },
  {
    id: "c-026", title: "NRI Investment Checklist", category: "learning", format: "pdf",
    stages: ["discovery", "assessment"], tags: ["NRI", "Checklist"],
    updatedAt: "Updated May 02, 2025", pageCount: 3, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: notReviewed(),
    description: "Checklist covering FEMA, NRE/NRO accounts and repatriation basics — awaiting first review.",
  },

  // ---- Simulation ----
  {
    id: "c-011", title: "Retirement Corpus Simulator", category: "simulation",
    simulationType: "Retirement", estimatedTime: "5 min",
    stages: ["plan", "review"], tags: ["Retirement", "SIP", "Simulator"],
    updatedAt: "Updated May 19, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0411", "Checked — output framed as illustrative projection, not guaranteed return."),
    description: "Interactive sandbox — adjust SIP, rate, and timeline to see corpus projection in real time.",
  },
  {
    id: "c-012", title: "Wedding Goal Planner", category: "simulation",
    simulationType: "Goal Planning", estimatedTime: "4 min",
    stages: ["plan"], tags: ["Goal Planning", "Wedding"],
    updatedAt: "Updated May 19, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0412", "Checked — output framed as illustrative projection, not guaranteed return."),
    description: "Client-facing simulator for planning the wedding goal corpus with inflation and contributions.",
  },
  {
    id: "c-013", title: "Early Retirement Impact Calculator", category: "simulation",
    simulationType: "Scenario Planning", estimatedTime: "6 min",
    stages: ["plan", "review"], tags: ["Retirement", "Scenario Planning"],
    updatedAt: "Updated May 22, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0413", "Checked — assumptions panel discloses rate sensitivity, no guarantees implied."),
    description: "Shows how retiring 1–3 years earlier changes corpus requirements and monthly SIP needs.",
  },
  {
    id: "c-020", title: "Protection Coverage Calculator", category: "simulation",
    simulationType: "Protection", estimatedTime: "5 min",
    stages: ["assessment", "proposal"], tags: ["Protection", "Insurance", "Coverage Gap"],
    updatedAt: "Updated May 13, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: pendingReview("Checking output disclaimers against IRDAI advisory norms."),
    description: "Simulator to estimate required life and health cover based on income, family and goals.",
  },
  {
    id: "c-027", title: "Market Downturn Stress Test", category: "simulation",
    simulationType: "Scenario Planning", estimatedTime: "5 min",
    stages: ["review"], tags: ["Risk", "Scenario Planning"],
    updatedAt: "Updated May 20, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0427", "Checked — clearly labelled as a hypothetical stress scenario."),
    description: "Shows portfolio impact under a simulated 20–30% market correction, with recovery timelines.",
  },

  // ---- Meeting ----
  {
    id: "c-028", title: "Retirement Planning Consultation", category: "meeting",
    mode: "online", duration: "45 min", joinLink: "meet.fincaree.com/rn-retirement",
    stages: ["plan", "review"], tags: ["Retirement Planning", "1:1"],
    updatedAt: "Updated May 12, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0428", "Agenda template checked — no advice pre-committed before suitability assessment."),
    description: "Standard 1:1 template for a focused retirement-planning conversation — sent as a bookable slot.",
  },
  {
    id: "c-029", title: "Portfolio Review Session", category: "meeting",
    mode: "online", duration: "30 min", joinLink: "meet.fincaree.com/rn-review",
    stages: ["review"], tags: ["Portfolio", "Review"],
    updatedAt: "Updated May 15, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0429", "Agenda template checked — framed as review, not a solicitation to trade."),
    description: "Quarterly check-in template covering performance, rebalancing and any life changes.",
  },
  {
    id: "c-030", title: "In-Person Discovery Meeting", category: "meeting",
    mode: "offline", duration: "60 min", venue: "Fincaree Client Lounge", location: "Bengaluru",
    stages: ["discovery"], tags: ["Discovery", "1:1"],
    updatedAt: "Updated May 05, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0430", "Agenda template checked — no pre-suitability recommendations included."),
    description: "In-office first-meeting template for clients who prefer to open the relationship in person.",
  },

  // ---- Workshop ----
  {
    id: "c-004", title: "Retirement Planning — Live Webinar", category: "workshop",
    mode: "online", duration: "60 min", date: "May 28, 2025 · 11:00 AM", joinLink: "meet.fincaree.com/retirement-webinar",
    capacity: 40,
    stages: ["plan", "review"], tags: ["Retirement Planning", "Live Session"],
    updatedAt: "May 06, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0404", "Slide deck checked — educational framing throughout, no specific product recommendations."),
    description: "Interactive live session on retirement income strategies and portfolio rebalancing.",
  },
  {
    id: "c-031", title: "Women & Wealth — In-Person Evening", category: "workshop",
    mode: "offline", duration: "90 min", date: "Jun 05, 2025 · 6:00 PM", venue: "Fincaree Client Lounge", location: "Bengaluru",
    capacity: 25,
    stages: ["discovery", "assessment"], tags: ["Community", "Goal Planning"],
    updatedAt: "Updated May 18, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0431", "Slide deck checked — no return guarantees, all figures illustrative."),
    description: "In-person evening session on goal-based investing, with light refreshments and open Q&A.",
  },
  {
    id: "c-032", title: "Tax Season Prep Workshop", category: "workshop",
    mode: "online", duration: "45 min", date: "Jan 15, 2026 · 5:00 PM", joinLink: "meet.fincaree.com/tax-prep",
    capacity: 60,
    stages: ["proposal", "plan"], tags: ["Tax Planning", "Live Session"],
    updatedAt: "Updated May 21, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: pendingReview("Checking cited tax slabs against the FY 2025-26 notification before approval."),
    description: "Annual live session walking through tax-saving instruments ahead of the filing deadline.",
  },

  // ---- Report / spreadsheet stay under Learning as pdf/course-series equivalents where relevant ----
  {
    id: "c-014", title: "Financial Status Analysis Report", category: "learning", format: "pdf",
    stages: ["assessment"], tags: ["Assessment", "Portfolio Review"],
    updatedAt: "Updated May 13, 2025", pageCount: 5, creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0414", "Checked — factual snapshot, no forward-looking advice."),
    description: "Template for the post-assessment financial snapshot including income, networth and goals.",
  },
  {
    id: "c-015", title: "Comprehensive Plan Proposal", category: "learning", format: "course-series",
    stages: ["proposal"], tags: ["Proposal", "Subscription"], moduleCount: 3,
    updatedAt: "Updated May 15, 2025", creator: "Advisor — Rajiv Nair", source: "my-content",
    compliance: clean("COMP-0415", "Checked — fee disclosure present on the pricing section."),
    description: "Slide-based proposal walkthrough covering scope, fees, and the value of ongoing advisory.",
  },
];

export const FIRM_LIBRARY: ContentItem[] = [
  {
    id: "f-001", title: "Investment Fundamentals for Beginners", category: "learning", format: "video",
    stages: ["discovery", "assessment"], tags: ["Investment Basics", "Beginner"],
    updatedAt: "Updated Apr 15, 2025", duration: "15:00", creator: "Firm Content Team", source: "firm-library",
    compliance: clean("FIRM-0101", "Firm-wide approved asset — reviewed by Compliance Team, not AI."),
    description: "Firm-approved introduction to equities, debt, mutual funds and portfolio diversification.",
  },
  {
    id: "f-002", title: "SEBI Investor Charter 2025", category: "learning", format: "pdf",
    stages: ["discovery", "proposal"], tags: ["Compliance", "Regulatory", "SEBI"],
    updatedAt: "Updated Jan 01, 2025", pageCount: 2, creator: "Compliance Team", source: "firm-library",
    compliance: { status: "approved", ref: "FIRM-0102", checkedAt: "1 Jan 2025", checkedBy: "compliance-team", summary: "Mandatory regulatory document — reviewed and issued directly by Compliance.", findings: [] },
    description: "Mandatory SEBI Investor Charter — must be shared with every new client at onboarding.",
  },
  {
    id: "f-003", title: "Retirement Planning Framework", category: "learning", format: "course-series",
    stages: ["proposal", "plan"], tags: ["Retirement Planning", "Framework"], moduleCount: 4,
    updatedAt: "Updated Mar 10, 2025", creator: "Research Team", source: "firm-library",
    compliance: clean("FIRM-0103", "Firm-wide retirement methodology — reviewed by Compliance Team."),
    description: "Firm-wide retirement planning methodology — consistent framework for all advisors.",
  },
  {
    id: "f-005", title: "Understanding Mutual Funds – Firm Guide", category: "learning", format: "pdf",
    stages: ["discovery", "assessment"], tags: ["Mutual Funds", "Investment Basics"],
    updatedAt: "Updated Feb 20, 2025", pageCount: 8, creator: "Firm Content Team", source: "firm-library",
    compliance: clean("FIRM-0105", "Firm-wide approved asset — reviewed by Compliance Team, not AI."),
    description: "Comprehensive guide to mutual fund types, expense ratios, and selection criteria.",
  },
  {
    id: "f-006", title: "Market Volatility & Long-Term Investing", category: "learning", format: "image-post",
    stages: ["plan", "review"], tags: ["Market Outlook", "Risk Management"],
    updatedAt: "Updated May 01, 2025", creator: "Research Team", source: "firm-library",
    compliance: clean("FIRM-0106", "Evidence-based framing checked — no performance claims found."),
    description: "Evidence-based piece on staying invested through volatility — suitable for anxious clients.",
  },
  {
    id: "f-007", title: "Protection Planning Workshop — Recorded", category: "workshop",
    mode: "online", duration: "55 min", date: "Mar 05, 2025", isRecorded: true, joinLink: "library.fincaree.com/protection-workshop",
    stages: ["assessment", "proposal"], tags: ["Protection", "Insurance"],
    updatedAt: "Updated Mar 05, 2025", creator: "Firm Content Team", source: "firm-library",
    compliance: clean("FIRM-0107", "Recorded session checked — reviewed by Compliance Team."),
    description: "Recorded firm workshop on protection planning — suitable for sharing post-assessment.",
  },
  {
    id: "f-008", title: "Risk Profiling Simulator — Firm Standard", category: "simulation",
    simulationType: "Risk Profiling", estimatedTime: "6 min",
    stages: ["discovery", "assessment"], tags: ["Risk", "Standardised"],
    updatedAt: "Updated Apr 20, 2025", creator: "Research Team", source: "firm-library",
    compliance: clean("FIRM-0108", "Firm-standard risk questionnaire — reviewed by Compliance Team."),
    description: "Standardised risk-profiling tool used firm-wide to ensure consistent suitability assessment.",
  },
];

/* ============================================================
   Clients + Client Groups (assignment target)

   Assignment is to an individual client OR a client group —
   a group is either a fixed list of members (curated) or, for
   groups worth keeping current automatically, a live criteria
   description shown next to the member count.
   ============================================================ */

export interface Client {
  id: string;
  name: string;
  initials: string;
  plan: "Platinum" | "Gold" | "Silver";
  stage: MeetingStage;
  lifeStage: string;
}

export const CLIENTS: Client[] = [
  { id: "C12345", name: "Anika Rao", initials: "AR", plan: "Platinum", stage: "review", lifeStage: "Pre-Retirement" },
  { id: "C12346", name: "Deepak Mehta", initials: "DM", plan: "Gold", stage: "plan", lifeStage: "Mid-Career" },
  { id: "C12347", name: "Priya Sharma", initials: "PS", plan: "Silver", stage: "proposal", lifeStage: "Early Career" },
  { id: "C12348", name: "Suresh Kumar", initials: "SK", plan: "Platinum", stage: "assessment", lifeStage: "Pre-Retirement" },
  { id: "C12349", name: "Neha Joshi", initials: "NJ", plan: "Gold", stage: "plan", lifeStage: "Mid-Career" },
  { id: "C12350", name: "Rahul Singh", initials: "RS", plan: "Silver", stage: "discovery", lifeStage: "Early Career" },
  { id: "C12351", name: "Kavitha Reddy", initials: "KR", plan: "Platinum", stage: "review", lifeStage: "Retirement" },
  { id: "C12352", name: "Manoj Verma", initials: "MV", plan: "Gold", stage: "plan", lifeStage: "Mid-Career" },
];

export interface ClientGroup {
  id: string;
  name: string;
  description: string;
  criteria?: string; // shown as the "why" for a smart group
  memberIds: string[];
}

const idsWhere = (fn: (c: Client) => boolean) => CLIENTS.filter(fn).map((c) => c.id);

export const CLIENT_GROUPS: ClientGroup[] = [
  {
    id: "grp-platinum",
    name: "Platinum Clients",
    description: "All clients on the Platinum plan.",
    criteria: "Plan = Platinum",
    memberIds: idsWhere((c) => c.plan === "Platinum"),
  },
  {
    id: "grp-pre-retirement",
    name: "Pre-Retirement",
    description: "Clients within 10 years of their target retirement age.",
    criteria: "Life stage = Pre-Retirement",
    memberIds: idsWhere((c) => c.lifeStage === "Pre-Retirement"),
  },
  {
    id: "grp-plan-stage",
    name: "In Plan Stage",
    description: "Clients currently at the Plan stage of their advisory journey.",
    criteria: "Stage = Plan",
    memberIds: idsWhere((c) => c.stage === "plan"),
  },
  {
    id: "grp-early-career",
    name: "Early Career",
    description: "Clients in the early-accumulation phase — Silver/Gold, early career.",
    criteria: "Life stage = Early Career",
    memberIds: idsWhere((c) => c.lifeStage === "Early Career"),
  },
  {
    id: "grp-review-due",
    name: "Review Due This Quarter",
    description: "Curated list — clients whose quarterly review falls in the current cycle.",
    memberIds: ["C12345", "C12351", "C12348"],
  },
];

/* ============================================================
   Assignment target — individual clients OR one client group.
   ============================================================ */

export type AssignmentTarget =
  | { type: "individual"; clientIds: string[] }
  | { type: "group"; groupId: string };

/* ============================================================
   Suggestion Package (builder state persisted as drafts)
   ============================================================ */

export interface PackageItem {
  id: string;
  contentId: string;
}

export interface SuggestionPackage {
  id: string;
  name: string;
  description: string;
  stage: MeetingStage;
  items: PackageItem[];
  status: "draft" | "ready" | "sent";
  createdAt: string;
  assignment: AssignmentTarget | null;
}

export const DRAFT_PACKAGES: SuggestionPackage[] = [
  {
    id: "pkg-001",
    name: "Retirement Readiness Package",
    description: "A step-by-step guide to build retirement corpus and financial security.",
    stage: "plan",
    items: [
      { id: "pi-1", contentId: "c-001" },
      { id: "pi-2", contentId: "c-002" },
      { id: "pi-3", contentId: "c-011" },
      { id: "pi-4", contentId: "c-021" },
    ],
    status: "draft",
    createdAt: "19 May 2025",
    assignment: { type: "individual", clientIds: ["C12345"] },
  },
  {
    id: "pkg-002",
    name: "Discovery Call Bundle",
    description: "Initial discovery materials explaining service and next steps.",
    stage: "discovery",
    items: [
      { id: "pi-5", contentId: "c-022" },
      { id: "pi-6", contentId: "f-002" },
      { id: "pi-7", contentId: "c-001" },
    ],
    status: "ready",
    createdAt: "10 May 2025",
    assignment: { type: "group", groupId: "grp-early-career" },
  },
];

/* ============================================================
   Audit Log
   ============================================================ */

export type AuditAction =
  | "sent"
  | "suggested"
  | "removed"
  | "compliance-approved"
  | "compliance-flagged"
  | "viewed"
  | "ai-reviewed"
  | "package-created"
  | "package-assigned";

export type AuditActor = "advisor" | "ai" | "client";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  itemName: string;
  itemType: "content" | "simulation" | "session" | "package";
  actor: AuditActor;
  clientName?: string; // individual target
  groupName?: string; // group target
  complianceRef?: string;
  note?: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: "a-001", timestamp: "10 May 2025 · 9:00 AM", action: "compliance-approved", itemName: "Subscription Service Overview", itemType: "content", actor: "ai", complianceRef: "COMP-0415" },
  { id: "a-002", timestamp: "10 May 2025 · 9:01 AM", action: "compliance-approved", itemName: "The Power of Compounding", itemType: "content", actor: "ai", complianceRef: "COMP-0401" },
  { id: "a-003", timestamp: "12 May 2025 · 2:10 PM", action: "sent", itemName: "Subscription Service Overview", itemType: "content", actor: "advisor", clientName: "Anika Rao" },
  { id: "a-004", timestamp: "13 May 2025 · 10:15 AM", action: "compliance-approved", itemName: "Financial Status Analysis Report", itemType: "content", actor: "ai", complianceRef: "COMP-0414" },
  { id: "a-005", timestamp: "13 May 2025 · 10:20 AM", action: "sent", itemName: "Financial Status Analysis Report", itemType: "content", actor: "advisor", clientName: "Anika Rao" },
  { id: "a-006", timestamp: "15 May 2025 · 11:00 AM", action: "package-created", itemName: "Discovery Call Bundle", itemType: "package", actor: "advisor" },
  { id: "a-007", timestamp: "19 May 2025 · 9:00 AM", action: "package-created", itemName: "Retirement Readiness Package", itemType: "package", actor: "advisor" },
  { id: "a-008", timestamp: "19 May 2025 · 9:05 AM", action: "package-assigned", itemName: "Retirement Readiness Package", itemType: "package", actor: "advisor", clientName: "Anika Rao" },
  { id: "a-009", timestamp: "19 May 2025 · 9:10 AM", action: "sent", itemName: "Retirement Readiness Package", itemType: "package", actor: "advisor", clientName: "Anika Rao" },
  { id: "a-010", timestamp: "20 May 2025 · 11:02 AM", action: "viewed", itemName: "Quarterly Plan Review Report", itemType: "content", actor: "client", clientName: "Anika Rao" },
  { id: "a-011", timestamp: "21 May 2025 · 6:20 PM", action: "viewed", itemName: "Retirement Corpus Simulator", itemType: "simulation", actor: "client", clientName: "Anika Rao" },
  { id: "a-012", timestamp: "22 May 2025 · 8:30 AM", action: "ai-reviewed", itemName: "Protection Coverage Calculator", itemType: "simulation", actor: "ai", note: "Pending — checking output disclaimers against IRDAI advisory norms." },
  { id: "a-013", timestamp: "22 May 2025 · 8:31 AM", action: "compliance-flagged", itemName: "Managing Volatility Close to Retirement", itemType: "content", actor: "ai", complianceRef: "COMP-0408", note: "Fund scheme named on page 4 without required risk disclosure." },
  { id: "a-014", timestamp: "22 May 2025 · 8:32 AM", action: "compliance-flagged", itemName: "3 Signs You're Under-Insured", itemType: "content", actor: "ai", complianceRef: "COMP-0425", note: "Competitor product named in comparison graphic on slide 2." },
  { id: "a-015", timestamp: "22 May 2025 · 9:00 AM", action: "sent", itemName: "Market Outlook – Q2 2025", itemType: "content", actor: "advisor", clientName: "Kavitha Reddy" },
  { id: "a-016", timestamp: "22 May 2025 · 10:00 AM", action: "package-assigned", itemName: "Discovery Call Bundle", itemType: "package", actor: "advisor", groupName: "Early Career" },
];
