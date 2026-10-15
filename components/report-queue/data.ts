/* ============================================================
   Report Queue — Data Model
   An AI-assisted advisor work queue, not a document library: AI gathers
   client context, drafts the report and flags issues; the advisor reviews,
   resolves and approves. Five concerns are deliberately kept separate
   instead of one "priority" field — see each type's comment:
     Status            → where the report is in the pipeline
     Review By         → when the advisor must act
     Meeting Dependency→ why it's urgent (which meeting it serves)
     AI Flags          → what needs human attention
     Readiness         → whether it can move forward at all
   ============================================================ */

export type PlanTier = "Gold" | "Platinum" | "Silver";

export const PLAN_LABELS: Record<PlanTier, string> = {
  Silver: "Silver — One-Time Blueprint",
  Gold: "Gold — Annual Guide",
  Platinum: "Platinum — Family Wealth",
};

export type ClientStatus = "new-client" | "active-client" | "needs-attention" | "inactive";

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  "new-client": "New Client",
  "active-client": "Active Client",
  "needs-attention": "Needs Attention",
  inactive: "Inactive",
};

/* ---- Status: where is the report in the pipeline? ---- */

export type ReportStatus =
  | "generating"
  | "ai-draft-ready"
  | "advisor-review"
  | "needs-attention"
  | "approved"
  | "shared"
  | "archived";

export type StatusBadgeColor = "gray" | "brand" | "error" | "warning" | "success" | "gray-blue";

export const STATUS_LABELS: Record<ReportStatus, string> = {
  generating: "Generating",
  "ai-draft-ready": "AI Draft Ready",
  "advisor-review": "Advisor Review",
  "needs-attention": "Needs Attention",
  approved: "Approved",
  shared: "Shared",
  archived: "Archived",
};

export const STATUS_COLORS: Record<ReportStatus, StatusBadgeColor> = {
  generating: "gray",
  "ai-draft-ready": "brand",
  "advisor-review": "warning",
  "needs-attention": "error",
  approved: "success",
  shared: "gray-blue",
  archived: "gray",
};

/** The one primary action a status implies — shared by the table and the
    Work Plan's task list, so both say the same thing about the same row. */
export function primaryAction(status: ReportStatus): { label: string; variant: "primary" | "secondary" } {
  if (status === "generating") return { label: "Create Report", variant: "primary" };
  if (status === "ai-draft-ready" || status === "advisor-review" || status === "needs-attention")
    return { label: "Continue Editing", variant: "primary" };
  return { label: "View Report", variant: "secondary" }; // approved, shared, archived
}

export const STATUS_OPTIONS: ReportStatus[] = [
  "generating",
  "ai-draft-ready",
  "advisor-review",
  "needs-attention",
  "approved",
  "shared",
  "archived",
];

/* ---- Report type: what the report is ---- */

export type ReportTypeId =
  | "financial-health"
  | "retirement-readiness"
  | "goal-progress"
  | "portfolio-review"
  | "risk-profile"
  | "tax-opportunity";

export const REPORT_TYPE_LABELS: Record<ReportTypeId, string> = {
  "financial-health": "Financial Health Report",
  "retirement-readiness": "Retirement Readiness",
  "goal-progress": "Goal Progress Report",
  "portfolio-review": "Portfolio Review",
  "risk-profile": "Risk Profile Report",
  "tax-opportunity": "Tax Opportunity Report",
};

export const REPORT_TYPE_GROUPS: { group: string; options: ReportTypeId[] }[] = [
  {
    group: "Core Reports",
    options: [
      "financial-health",
      "retirement-readiness",
      "goal-progress",
      "portfolio-review",
      "risk-profile",
      "tax-opportunity",
    ],
  },
];

/* ---- Meeting: what the report serves, and why it's urgent ---- */

export type MeetingType =
  | "Discovery Session"
  | "Blueprint Presentation"
  | "Financial Plan Kickoff"
  | "Investment Strategy Meeting"
  | "Portfolio Strategy Meeting"
  | "Quarterly Review"
  | "Annual Review"
  | "Mid-Year Strategy Session"
  | "Year-End Financial Review"
  | "Plan Renewal Discussion"
  | "Other / Purpose-driven Meeting";

export const MEETING_TYPE_OPTIONS: MeetingType[] = [
  "Discovery Session",
  "Blueprint Presentation",
  "Financial Plan Kickoff",
  "Investment Strategy Meeting",
  "Portfolio Strategy Meeting",
  "Quarterly Review",
  "Annual Review",
  "Mid-Year Strategy Session",
  "Year-End Financial Review",
  "Plan Renewal Discussion",
  "Other / Purpose-driven Meeting",
];

export type MeetingTiming = "today" | "tomorrow" | "this-week" | "next-week" | "none";

export const MEETING_TIMING_LABELS: Record<MeetingTiming, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  "this-week": "This Week",
  "next-week": "Next Week",
  none: "No Upcoming Meeting",
};

export type MeetingDependency =
  | "meeting-today"
  | "meeting-tomorrow"
  | "meeting-this-week"
  | "blocking-meeting"
  | "no-upcoming-meeting"
  | "no-meeting-linked";

export const MEETING_DEPENDENCY_LABELS: Record<MeetingDependency, string> = {
  "meeting-today": "Meeting Today",
  "meeting-tomorrow": "Meeting Tomorrow",
  "meeting-this-week": "Meeting This Week",
  "blocking-meeting": "Blocking a Meeting",
  "no-upcoming-meeting": "No Upcoming Meeting",
  "no-meeting-linked": "No Meeting Linked",
};

export interface ReportMeeting {
  type: MeetingType;
  /** Display label — the specific meeting instance, e.g. "Quarterly Review #2" */
  label: string;
}

/* ---- Review By: when must the advisor act? (distinct from the meeting itself) ---- */

export type ReviewByCategory =
  | "overdue"
  | "due-today"
  | "due-tomorrow"
  | "due-3-days"
  | "due-7-days"
  | "no-deadline";

export const REVIEW_BY_LABELS: Record<ReviewByCategory, string> = {
  overdue: "Overdue",
  "due-today": "Due Today",
  "due-tomorrow": "Due Tomorrow",
  "due-3-days": "Due in 3 Days",
  "due-7-days": "Due in 7 Days",
  "no-deadline": "No Deadline",
};

export interface ReviewBy {
  label: string; // "Today, 5:00 PM", "Tomorrow", "No Deadline"...
  category: ReviewByCategory;
  date: string | null; // ISO
}

/** Urgency colour used by the shared MeetingWhen chip — derived, not stored. */
export function reviewByUrgency(category: ReviewByCategory): "urgent" | "soon" | "upcoming" | null {
  if (category === "overdue" || category === "due-today") return "urgent";
  if (category === "due-tomorrow") return "soon";
  if (category === "due-3-days" || category === "due-7-days") return "upcoming";
  return null;
}

/* ---- AI Flags: what needs human attention, and why ---- */

export type AIFlagType =
  | "data-gap"
  | "conflicting-data"
  | "stale-data"
  | "assumption"
  | "compliance-review"
  | "exception"
  | "suggestion";

export const AI_FLAG_TYPE_LABELS: Record<AIFlagType, string> = {
  "data-gap": "Data Gap",
  "conflicting-data": "Conflicting Data",
  "stale-data": "Stale Data",
  assumption: "Assumption",
  "compliance-review": "Compliance Review",
  exception: "Exception Detected",
  suggestion: "Finny Suggestion",
};

export interface AIFlag {
  type: AIFlagType;
  label: string;
  explanation: string;
  source: string;
  suggestedResolution: string;
}

/** Lower = more severe. Drives which flag a crowded cell leads with, and
    sort order inside the drawer. Suggestions are opportunities, not
    problems, so they rank lowest. */
export const AI_FLAG_SEVERITY: Record<AIFlagType, number> = {
  "compliance-review": 0,
  exception: 0,
  "conflicting-data": 1,
  "data-gap": 1,
  "stale-data": 2,
  assumption: 2,
  suggestion: 3,
};

export function mostSevereFlag(flags: AIFlag[]): AIFlag | null {
  if (flags.length === 0) return null;
  return [...flags].sort((a, b) => AI_FLAG_SEVERITY[a.type] - AI_FLAG_SEVERITY[b.type])[0];
}

/** The decision an advisor makes on a flag — the specific verb depends on
    flag type (see FLAG_ACTIONS in ReportDrawer), but any of them counts as
    "handled" for the pre-approval gate. */
export type FlagDecision = "accepted" | "dismissed" | "confirmed" | "changed" | "requested" | "continued" | "resolved";

export const FLAG_DECISION_LABELS: Record<FlagDecision, string> = {
  accepted: "Accepted",
  dismissed: "Dismissed",
  confirmed: "Confirmed",
  changed: "Changed",
  requested: "Update requested",
  continued: "Continuing with assumption",
  resolved: "Resolved",
};

/* ---- Readiness: can this report move forward? ---- */

export type ReadinessCategory = "ready" | "mostly-ready" | "missing-data" | "blocked";

export const READINESS_LABELS: Record<ReadinessCategory, string> = {
  ready: "Ready",
  "mostly-ready": "Mostly Ready",
  "missing-data": "Missing Data",
  blocked: "Blocked",
};

export function readinessCategory(value: number): ReadinessCategory {
  if (value >= 90) return "ready";
  if (value >= 70) return "mostly-ready";
  if (value >= 50) return "missing-data";
  return "blocked";
}

/* ---- Created by: who produced this report? ---- */

export type CreatedBy = "ai-generated" | "ai-assisted" | "advisor-created" | "regenerated";

export const CREATED_BY_LABELS: Record<CreatedBy, string> = {
  "ai-generated": "AI-generated",
  "ai-assisted": "AI-assisted",
  "advisor-created": "Advisor-created",
  regenerated: "Regenerated by AI",
};

/* ---- Report ---- */

export interface Report {
  id: string;
  client: {
    name: string;
    id: string;
    plan: PlanTier;
    status: ClientStatus;
  };
  reportName: string;
  reportType: ReportTypeId;
  generatedAt: string; // ISO
  meeting: ReportMeeting | null;
  meetingTiming: MeetingTiming;
  meetingDependency: MeetingDependency;
  reviewBy: ReviewBy;
  aiFlags: AIFlag[];
  readiness: number; // 0–100
  status: ReportStatus;
  createdBy: CreatedBy;
}

export function reportCategoryLabel(r: Report): string {
  return REPORT_TYPE_LABELS[r.reportType];
}

export const REPORTS: Report[] = [
  {
    id: "R001",
    client: { name: "Anika Rao", id: "C12345", plan: "Platinum", status: "active-client" },
    reportName: "Goal Progress Report",
    reportType: "goal-progress",
    generatedAt: "2025-05-19T09:10:00",
    meeting: { type: "Quarterly Review", label: "Quarterly Review #2" },
    meetingTiming: "today",
    meetingDependency: "blocking-meeting",
    reviewBy: { label: "Today, 5:00 PM", category: "due-today", date: "2025-05-19T17:00:00" },
    aiFlags: [
      {
        type: "suggestion",
        label: "Retirement contribution adjustment",
        explanation: "Projected corpus trails the retirement goal by 12% at the current SIP rate.",
        source: "Goal tracker · Retirement",
        suggestedResolution: "Consider increasing the monthly SIP by ₹10,000.",
      },
      {
        type: "suggestion",
        label: "Asset rebalancing opportunity",
        explanation: "Equity allocation has drifted 8% above the target band since the last rebalance.",
        source: "Portfolio holdings · synced today",
        suggestedResolution: "Review and confirm the rebalancing trade before sending.",
      },
    ],
    readiness: 90,
    status: "advisor-review",
    createdBy: "ai-generated",
  },
  {
    id: "R002",
    client: { name: "Sanjay Patel", id: "C12312", plan: "Gold", status: "active-client" },
    reportName: "Financial Health Report",
    reportType: "financial-health",
    generatedAt: "2025-05-19T08:40:00",
    meeting: { type: "Annual Review", label: "Annual Review" },
    meetingTiming: "today",
    meetingDependency: "meeting-today",
    reviewBy: { label: "Today, 2:00 PM", category: "due-today", date: "2025-05-19T14:00:00" },
    aiFlags: [
      {
        type: "data-gap",
        label: "Missing income update",
        explanation: "Monthly income hasn't been confirmed since the last annual review.",
        source: "Client profile · Income field",
        suggestedResolution: "Request an updated income figure from the client before finalizing.",
      },
    ],
    readiness: 80,
    status: "needs-attention",
    createdBy: "ai-generated",
  },
  {
    id: "R003",
    client: { name: "Meera Nair", id: "C12111", plan: "Gold", status: "new-client" },
    reportName: "Retirement Readiness",
    reportType: "retirement-readiness",
    generatedAt: "2025-05-18T16:30:00",
    meeting: { type: "Other / Purpose-driven Meeting", label: "Retirement Planning" },
    meetingTiming: "tomorrow",
    meetingDependency: "meeting-tomorrow",
    reviewBy: { label: "Tomorrow", category: "due-tomorrow", date: "2025-05-20T00:00:00" },
    aiFlags: [],
    readiness: 95,
    status: "ai-draft-ready",
    createdBy: "ai-assisted",
  },
  {
    id: "R004",
    client: { name: "Rohan Kumar", id: "C12456", plan: "Silver", status: "needs-attention" },
    reportName: "Portfolio Review",
    reportType: "portfolio-review",
    generatedAt: "2025-05-17T11:00:00",
    meeting: { type: "Investment Strategy Meeting", label: "Investment Strategy Meeting" },
    meetingTiming: "this-week",
    meetingDependency: "meeting-this-week",
    reviewBy: { label: "In 3 days", category: "due-3-days", date: "2025-05-22T00:00:00" },
    aiFlags: [
      {
        type: "assumption",
        label: "Retirement age assumption",
        explanation: "The report assumes a retirement age of 60, carried over from the prior plan.",
        source: "Previous plan · Retirement module",
        suggestedResolution: "Confirm the retirement age preference still holds before approving.",
      },
    ],
    readiness: 70,
    status: "needs-attention",
    createdBy: "ai-generated",
  },
  {
    id: "R005",
    client: { name: "Deepak Iyer", id: "C11976", plan: "Silver", status: "active-client" },
    reportName: "Financial Health Report",
    reportType: "financial-health",
    generatedAt: "2025-05-19T07:00:00",
    meeting: null,
    meetingTiming: "none",
    meetingDependency: "no-meeting-linked",
    reviewBy: { label: "No Deadline", category: "no-deadline", date: null },
    aiFlags: [],
    readiness: 85,
    status: "ai-draft-ready",
    createdBy: "ai-generated",
  },
  {
    id: "R006",
    client: { name: "Kavya Shah", id: "C12587", plan: "Gold", status: "active-client" },
    reportName: "Goal Progress Report",
    reportType: "goal-progress",
    generatedAt: "2025-05-19T10:00:00",
    meeting: { type: "Quarterly Review", label: "Quarterly Review" },
    meetingTiming: "this-week",
    meetingDependency: "meeting-this-week",
    reviewBy: { label: "In 6 days", category: "due-7-days", date: "2025-05-25T00:00:00" },
    aiFlags: [
      {
        type: "suggestion",
        label: "Tax-saving investment gap",
        explanation: "Section 80C utilisation is at 60% with 4 months left in the financial year.",
        source: "Tax module · FY24-25",
        suggestedResolution: "Suggest an ELSS or PPF top-up to close the gap.",
      },
    ],
    readiness: 60,
    status: "generating",
    createdBy: "ai-generated",
  },
  {
    id: "R007",
    client: { name: "Vikram Tandon", id: "C12890", plan: "Platinum", status: "active-client" },
    reportName: "Portfolio Review",
    reportType: "portfolio-review",
    generatedAt: "2025-05-12T11:30:00",
    meeting: null,
    meetingTiming: "none",
    meetingDependency: "no-meeting-linked",
    reviewBy: { label: "No Deadline", category: "no-deadline", date: null },
    aiFlags: [],
    readiness: 100,
    status: "shared",
    createdBy: "ai-generated",
  },
  {
    id: "R008",
    client: { name: "Neha Suri", id: "C12765", plan: "Gold", status: "active-client" },
    reportName: "Tax Opportunity Report",
    reportType: "tax-opportunity",
    generatedAt: "2025-05-16T15:10:00",
    meeting: { type: "Other / Purpose-driven Meeting", label: "Tax Planning" },
    meetingTiming: "next-week",
    meetingDependency: "meeting-this-week",
    reviewBy: { label: "In 8 days", category: "due-7-days", date: "2025-05-27T00:00:00" },
    aiFlags: [
      {
        type: "suggestion",
        label: "LTCG harvesting window",
        explanation: "₹1.1L of long-term capital gains room remains unused this financial year.",
        source: "Portfolio holdings · Equity (direct)",
        suggestedResolution: "Suggest harvesting gains within the ₹1.25L exemption limit.",
      },
      {
        type: "suggestion",
        label: "Old vs new tax regime",
        explanation: "Current deductions suggest the old regime saves ₹18,000 more this year.",
        source: "Tax module · Regime comparison",
        suggestedResolution: "Flag the comparison for the client's final decision.",
      },
      {
        type: "compliance-review",
        label: "Regime comparison wording",
        explanation: "The LTCG harvesting language reads close to a specific buy/sell instruction, which needs compliance sign-off before it goes to a client.",
        source: "Compliance · Suitability wording check",
        suggestedResolution: "Soften to an observation rather than an instruction, or route to compliance for sign-off.",
      },
    ],
    readiness: 75,
    status: "advisor-review",
    createdBy: "regenerated",
  },
];

/* ---- Default queue sort — urgency, not alphabetical ----
   Meeting-blocking reports first, then by review deadline, then by whether
   anything needs human attention. */

const DEPENDENCY_RANK: Record<MeetingDependency, number> = {
  "blocking-meeting": 0,
  "meeting-today": 1,
  "meeting-tomorrow": 2,
  "meeting-this-week": 3,
  "no-upcoming-meeting": 4,
  "no-meeting-linked": 5,
};

const REVIEW_BY_RANK: Record<ReviewByCategory, number> = {
  overdue: 0,
  "due-today": 1,
  "due-tomorrow": 2,
  "due-3-days": 3,
  "due-7-days": 4,
  "no-deadline": 5,
};

function attentionRank(r: Report): number {
  if (r.status === "needs-attention") return 0;
  if (r.aiFlags.length > 0) return 1;
  return 2;
}

export function sortReportsByUrgency(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => {
    const dep = DEPENDENCY_RANK[a.meetingDependency] - DEPENDENCY_RANK[b.meetingDependency];
    if (dep !== 0) return dep;
    const rb = REVIEW_BY_RANK[a.reviewBy.category] - REVIEW_BY_RANK[b.reviewBy.category];
    if (rb !== 0) return rb;
    const att = attentionRank(a) - attentionRank(b);
    if (att !== 0) return att;
    return a.readiness - b.readiness;
  });
}

/* ---- Saved views ---- */

export type SavedView = "my-queue" | "due-today" | "meeting-blockers" | "needs-attention" | "all-reports";

export const SAVED_VIEWS: { id: SavedView; label: string }[] = [
  { id: "my-queue", label: "My Queue" },
  { id: "due-today", label: "Due Today" },
  { id: "meeting-blockers", label: "Meeting Blockers" },
  { id: "needs-attention", label: "Needs Attention" },
  { id: "all-reports", label: "All Reports" },
];

export function matchesSavedView(r: Report, view: SavedView): boolean {
  switch (view) {
    case "my-queue":
      return r.status !== "shared" && r.status !== "archived";
    case "due-today":
      return r.reviewBy.category === "overdue" || r.reviewBy.category === "due-today";
    case "meeting-blockers":
      return r.meetingDependency === "blocking-meeting";
    case "needs-attention":
      return r.status === "needs-attention";
    case "all-reports":
      return true;
  }
}

export const EMPTY_STATE_COPY: Record<SavedView, { title: string; body: string }> = {
  "my-queue": { title: "You're all caught up.", body: "No reports currently require your attention." },
  "due-today": { title: "No reports are due today.", body: "Nothing on today's review deadline." },
  "meeting-blockers": {
    title: "No reports are currently blocking a meeting.",
    body: "Every upcoming meeting has what it needs.",
  },
  "needs-attention": { title: "No reports have unresolved issues.", body: "Everything is clear." },
  "all-reports": { title: "No reports found.", body: "Try adjusting your search or filter criteria." },
};

/* ---- Summary strip — derived live from REPORTS, not a second hardcoded source ---- */

export function computeQueueStats(reports: Report[]) {
  const toReview = reports.filter((r) => r.status === "ai-draft-ready" || r.status === "advisor-review");
  const dueSoon = reports.filter(
    (r) => r.reviewBy.category === "due-today" || r.reviewBy.category === "due-tomorrow"
  );
  const needsAttention = reports.filter((r) => r.status === "needs-attention");
  const aiAssisted = reports.filter((r) => r.aiFlags.length > 0);

  const dueToday = reports.filter((r) => r.reviewBy.category === "due-today").length;
  const blocking = reports.filter((r) => r.meetingDependency === "blocking-meeting").length;

  const soonest = [...dueSoon].sort(
    (a, b) => REVIEW_BY_RANK[a.reviewBy.category] - REVIEW_BY_RANK[b.reviewBy.category]
  )[0];

  const dataGaps = reports.flatMap((r) => r.aiFlags).filter((f) => f.type === "data-gap").length;
  const assumptions = reports.flatMap((r) => r.aiFlags).filter((f) => f.type === "assumption").length;
  const compliance = reports.flatMap((r) => r.aiFlags).filter((f) => f.type === "compliance-review").length;
  const suggestions = reports.flatMap((r) => r.aiFlags).filter((f) => f.type === "suggestion").length;

  return {
    toReview: {
      count: toReview.length,
      detail: `${dueToday} due today · ${blocking} blocking a meeting`,
    },
    dueSoon: {
      count: dueSoon.length,
      detail: soonest ? `Next due: ${soonest.reviewBy.label}` : "Nothing due soon",
    },
    needsAttention: {
      count: needsAttention.length,
      detail: `${dataGaps} data gaps · ${assumptions} assumption${assumptions === 1 ? "" : "s"} · ${compliance} compliance`,
    },
    aiAssistance: {
      count: aiAssisted.length,
      detail: `${suggestions} suggestion${suggestions === 1 ? "" : "s"} across ${aiAssisted.length} reports`,
    },
  };
}

/* ---- Finny Queue Summary — one AI strip, not a dashboard ----
   "Needs attention" reuses the My Queue definition so this number never
   disagrees with the saved-views chip right below it. */

export function computeFinnySummary(reports: Report[]) {
  const needsAttention = reports.filter((r) => matchesSavedView(r, "my-queue"));
  const meetingBlockers = reports.filter((r) => r.meetingDependency === "blocking-meeting").length;
  const readyForReview = reports.filter((r) => r.status === "ai-draft-ready" || r.status === "advisor-review").length;
  const dataIssues = reports.filter((r) =>
    r.aiFlags.some((f) => f.type === "data-gap" || f.type === "conflicting-data" || f.type === "stale-data")
  ).length;
  const complianceReview = reports.filter((r) => r.aiFlags.some((f) => f.type === "compliance-review")).length;

  return {
    total: needsAttention.length,
    meetingBlockers,
    readyForReview,
    dataIssues,
    complianceReview,
  };
}

/* ---- My Work Plan — the planning layer over the same records ----
   Not a second table: just the my-queue set, urgency-sorted, with a
   rough duration estimate attached so a day has a shape, not just a list. */

/** This mock's fixed "today" — a Monday, so the week view has somewhere to
    anchor Mon–Fri against. Every reviewBy date in REPORTS is relative to it. */
export const MOCK_TODAY = "2025-05-19";

export function estimateMinutes(report: Report): number {
  const base = 15;
  const flagMinutes = report.aiFlags.length * 5;
  const readinessPenalty = report.readiness < 70 ? 10 : 0;
  return base + flagMinutes + readinessPenalty;
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}min`;
}

/** The one-line "why this is on today's plan" — same urgency signal the
    sort already used, put into words. */
export function planReason(r: Report): string {
  if (r.meetingDependency === "blocking-meeting") return `Blocking ${r.meeting?.label ?? "a meeting"}`;
  if (r.meetingDependency === "meeting-today") return `Meeting today${r.meeting ? ` · ${r.meeting.label}` : ""}`;
  if (r.meetingDependency === "meeting-tomorrow") return `Meeting tomorrow${r.meeting ? ` · ${r.meeting.label}` : ""}`;
  if (r.status === "needs-attention") return "Needs attention before it can move forward";
  if (r.aiFlags.length > 0) return "AI draft ready to review";
  return "No immediate deadline";
}

export function inWorkPlan(r: Report, addedIds: Set<string>): boolean {
  return matchesSavedView(r, "my-queue") || addedIds.has(r.id);
}

/** Local-naive "YYYY-MM-DD" — never via toISOString(), which converts
    through UTC and would shift the date in any timezone ahead of it (the
    reviewBy dates are plain local strings with no timezone of their own,
    so this has to match that same local-naive convention, not UTC). */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export interface PlanDay {
  iso: string;
  weekday: string;
  date: number;
}

/** The 5 weekdays the Work Plan's week view can actually show — the single
    list both the table's day picker and the week calendar read, so a date
    chosen in one always has a column to land in in the other. */
export function weekDates(): PlanDay[] {
  const base = new Date(MOCK_TODAY + "T00:00:00");
  const dow = base.getDay(); // 1 = Monday
  const monday = new Date(base);
  monday.setDate(base.getDate() - (dow - 1));
  return WEEKDAYS.map((weekday, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { iso: isoDate(d), weekday, date: d.getDate() };
  });
}

/** The my-queue set, plus any report the advisor has explicitly pulled in
    from All Reports — e.g. a shared/archived report they want to follow up
    on even though it wouldn't surface here on its own. */
export function workPlanReports(reports: Report[], addedIds: Set<string> = new Set()): Report[] {
  return sortReportsByUrgency(
    reports.filter((r) => matchesSavedView(r, "my-queue") || addedIds.has(r.id))
  );
}
