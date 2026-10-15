/* ============================================================
   Meeting Desk — Mock Data
   Same client roster as the Report Queue (Anika Rao, Sanjay
   Patel, etc.) so the two surfaces tell one coherent story
   rather than diverging demo data.
   ============================================================ */

export type MeetingType =
  | "Discovery Call"
  | "Financial Blueprint Review"
  | "Proposal Walkthrough"
  | "Annual Plan Review"
  | "Family Wealth Review"
  | "Follow-up Call";

export type MeetingStatus =
  // ① Needs prep
  | "needs-prep"
  // ② Upcoming (includes rescheduled — new slot, same pipeline)
  | "scheduled"
  | "prepped"
  | "rescheduled"
  // ③ Cancelled by client
  | "cancelled"
  // ④ Completed
  | "completed"
  | "follow-up-pending";

export type MeetingStageId = "needs-prep" | "upcoming" | "cancelled" | "follow-up" | "completed";

export interface MeetingStage {
  id: MeetingStageId;
  number: number;
  label: string;
  statuses: MeetingStatus[];
  accent: string;
}

export const MEETING_STAGES: MeetingStage[] = [
  {
    id: "needs-prep",
    number: 1,
    label: "Needs Prep",
    statuses: ["needs-prep"],
    accent: "var(--color-error-500)",
  },
  {
    id: "upcoming",
    number: 2,
    label: "Upcoming",
    statuses: ["scheduled", "prepped", "rescheduled"],
    accent: "var(--color-success-700)",
  },
  {
    id: "cancelled",
    number: 3,
    label: "Cancelled",
    statuses: ["cancelled"],
    accent: "var(--color-warning-700)",
  },
  {
    id: "follow-up",
    number: 4,
    label: "Follow-up",
    statuses: ["follow-up-pending"],
    accent: "var(--color-brand-600)",
  },
  {
    id: "completed",
    number: 5,
    label: "Completed",
    statuses: ["completed"],
    accent: "var(--color-grey-600)",
  },
];

export type StatusBadgeColor = "gray" | "brand" | "error" | "warning" | "success" | "gray-blue";

export const STATUS_LABELS: Record<MeetingStatus, string> = {
  "needs-prep": "Needs Prep",
  scheduled: "Scheduled",
  prepped: "Prepped & Ready",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
  completed: "Completed",
  "follow-up-pending": "Follow-up Pending",
};

export const STATUS_COLORS: Record<MeetingStatus, StatusBadgeColor> = {
  "needs-prep": "error",
  scheduled: "gray",
  prepped: "success",
  rescheduled: "gray-blue",
  cancelled: "warning",
  completed: "gray",
  "follow-up-pending": "warning",
};

const STATUS_TO_STAGE = new Map<MeetingStatus, MeetingStageId>(
  MEETING_STAGES.flatMap((stage) => stage.statuses.map((status) => [status, stage.id] as const))
);

export function stageForStatus(status: MeetingStatus): MeetingStageId {
  return STATUS_TO_STAGE.get(status) ?? "needs-prep";
}

export type PlanTier = "Gold" | "Platinum" | "Silver";

/* ---- Action items — Feature 3: structured, owned, dated, tracked ---- */

export interface ActionItem {
  id: string;
  text: string;
  owner: "Advisor" | "Client";
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
}

/* ---- Materials — Feature 6: relevant to goals, not generic ---- */

export interface SuggestedMaterial {
  name: string;
  type: "Video" | "Article" | "Workshop" | "Simulation" | "PDF Guide";
}

/** The expanded record behind a past meeting in the History tab — title,
    Finny's read on what mattered, and what got decided. Everything else
    the card shows (date, duration, mode, action items, the report) is
    read off the meeting's own fields rather than duplicated here, so
    there's one place that owns each piece of data. */
export interface LastMeetingDetail {
  title: string;
  finnyInsights: string[];
  decisions: string[];
}

/** One line in the client-communication log — a direct exchange
    ("Advisor → Client") or a logged event with one actor ("Client"
    uploading something, no reply expected). */
export interface CommunicationEntry {
  date: string;
  direction: string;
  message: string;
}

/** Finny's single best next-send recommendation for this meeting — why it
    matters and what it's inferred from. Null when nothing stands out
    (mirrors an empty suggestedMaterials list). */
export interface FinnySuggestion {
  title: string;
  reason: string;
  basedOn: string[];
}

/** A material or report already sent to the client, with whether they've
    engaged with it yet. */
export interface SentItem {
  name: string;
  type: "Report" | "Workshop" | "Article" | "Video" | "Simulation" | "PDF Guide" | "Learning Path";
  date: string;
  status: "viewed" | "in-progress";
}

export interface MeetingRecord {
  id: string;
  client: { name: string; id: string; plan: PlanTier };
  meetingType: MeetingType;
  date: string; // ISO
  dateLabel: string; // "Tomorrow", "Today 3:00 PM"
  urgency: "urgent" | "soon" | "upcoming" | null;
  duration: string;
  mode: "Video" | "In-person" | "Phone";
  status: MeetingStatus;

  /* Feature 2 — Pre-meeting brief */
  briefPoints: string[];
  alerts: string[];

  /* Feature 5 — last meeting context, answers "what did we discuss last time?" */
  lastMeetingSummary: string | null;
  lastMeetingDate: string | null;
  lastMeetingDetail: LastMeetingDetail | null;
  communicationLog: CommunicationEntry[];

  /* Feature 3 — action items, carried over from the previous meeting */
  actionItems: ActionItem[];

  /* Feature 6 — Feature 7 */
  suggestedMaterials: SuggestedMaterial[];
  materialsComplianceChecked: boolean;
  reportAttached: string | null;
  finnySuggestion: FinnySuggestion | null;
  recentlySent: SentItem[];

  /* Feature 8 — next best action */
  nextBestAction: string;

  /* Feature 9 — audit */
  complianceLogged: boolean;
  adviceNoteLogged: boolean;
}

/** The day the mock data's relative labels ("Today", "In 3 days") are written
    from. The calendar uses it to mark today. */
export const MEETINGS_TODAY = "2025-05-19";

export const MEETINGS: MeetingRecord[] = [
  {
    id: "M001",
    client: { name: "Anika Rao", id: "C12345", plan: "Platinum" },
    meetingType: "Annual Plan Review",
    date: "2025-05-20T10:30:00",
    dateLabel: "Tomorrow",
    urgency: "urgent",
    duration: "45 min",
    mode: "Video",
    status: "needs-prep",
    briefPoints: [
      "Retirement funding gap has improved 8% since the last review.",
      "Wedding goal amount needs reconfirmation.",
      "Protection information is still incomplete.",
    ],
    alerts: ["Retirement goal off-track", "Risk profile due for renewal"],
    lastMeetingSummary: "Plan Discussion — retirement target set at 60, insurance policy details still pending.",
    lastMeetingDate: "20 May 2025",
    lastMeetingDetail: {
      title: "Plan Discussion",
      finnyInsights: [
        "Retirement concern was the main discussion point.",
        "Client wanted a clearer understanding of portfolio allocation.",
        "Insurance coverage needs to be revisited.",
      ],
      decisions: ["Continue the current investment strategy.", "Review insurance coverage in the next meeting."],
    },
    communicationLog: [
      { date: "16 May", direction: "Advisor → Client", message: "Insurance policy document requested." },
      { date: "17 May", direction: "Client → Advisor", message: "“Will upload by the weekend.”" },
    ],
    actionItems: [
      { id: "a1", text: "Update retirement projection", owner: "Advisor", dueDate: "28 Aug", status: "in-progress" },
      { id: "a2", text: "Upload insurance policy", owner: "Client", dueDate: "01 Sep", status: "pending" },
    ],
    suggestedMaterials: [
      { name: "Retirement Planning Essentials", type: "Workshop" },
      { name: "Understanding Term Insurance", type: "Article" },
    ],
    materialsComplianceChecked: true,
    reportAttached: "Retirement Plan Review",
    finnySuggestion: {
      title: "Retirement Readiness Simulation",
      reason: "Client recently explored retirement projections and has not completed a retirement simulation.",
      basedOn: ["Retirement goal", "Recent engagement", "Previous meeting discussion"],
    },
    recentlySent: [
      { name: "Retirement Plan Review", type: "Report", date: "17 May", status: "viewed" },
      { name: "Retirement Planning Essentials", type: "Workshop", date: "15 May", status: "in-progress" },
      { name: "Understanding Term Insurance", type: "Article", date: "10 May", status: "viewed" },
    ],
    nextBestAction: "Prepare and send the Annual Plan Review report before the meeting.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M002",
    client: { name: "Sanjay Patel", id: "C12312", plan: "Gold" },
    meetingType: "Follow-up Call",
    date: "2025-05-19T15:00:00",
    dateLabel: "Today 3:00 PM",
    urgency: "urgent",
    duration: "20 min",
    mode: "Phone",
    status: "needs-prep",
    briefPoints: [
      "Education fund projection was flagged short by ₹4L last review.",
      "Client requested a follow-up call to confirm the revised SIP.",
    ],
    alerts: ["1 data gap in insurance details"],
    lastMeetingSummary: "Education Fund Planning review — client asked for a follow-up before committing to a higher SIP.",
    lastMeetingDate: "12 May 2025",
    lastMeetingDetail: {
      title: "Education Fund Planning Review",
      finnyInsights: [
        "Education fund projection was flagged short by ₹4L.",
        "Client wants to see the revised SIP amount before committing.",
      ],
      decisions: ["Hold off on increasing the SIP until the follow-up call."],
    },
    communicationLog: [
      { date: "13 May", direction: "Advisor → Client", message: "Revised SIP amount shared for confirmation." },
      { date: "15 May", direction: "Client", message: "No response yet — reminder due." },
    ],
    actionItems: [
      { id: "a1", text: "Validate insurance data", owner: "Advisor", dueDate: "Today", status: "pending" },
      { id: "a2", text: "Confirm revised SIP amount", owner: "Client", dueDate: "Today", status: "pending" },
    ],
    suggestedMaterials: [{ name: "Education Fund Planning Guide", type: "PDF Guide" }],
    materialsComplianceChecked: true,
    reportAttached: "Education Fund Planning",
    finnySuggestion: {
      title: "Education Fund Planning Guide",
      reason: "Client is weighing a higher SIP and hasn't reviewed the funding gap breakdown yet.",
      basedOn: ["Education fund gap", "Pending SIP decision", "Previous meeting discussion"],
    },
    recentlySent: [
      { name: "Education Fund Planning", type: "Report", date: "13 May", status: "viewed" },
      { name: "Education Fund Planning Guide", type: "PDF Guide", date: "12 May", status: "in-progress" },
    ],
    nextBestAction: "Confirm the revised SIP on the call and log it as a decision.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M003",
    client: { name: "Meera Nair", id: "C12111", plan: "Gold" },
    meetingType: "Annual Plan Review",
    date: "2025-05-20T00:00:00",
    dateLabel: "Tomorrow",
    urgency: "soon",
    duration: "40 min",
    mode: "Video",
    status: "prepped",
    briefPoints: [
      "Goal progress report shows 2 suggestions ready for discussion.",
      "No alerts — client is broadly on track.",
    ],
    alerts: [],
    lastMeetingSummary: "Goal Progress Report reviewed — both goals tracking within range.",
    lastMeetingDate: "18 Apr 2025",
    lastMeetingDetail: {
      title: "Goal Progress Review",
      finnyInsights: ["Both financial goals are tracking within range.", "No corrective action needed at this stage."],
      decisions: ["Continue the current contribution levels."],
    },
    communicationLog: [
      { date: "19 Apr", direction: "Advisor → Client", message: "Updated goal progress report shared." },
      { date: "19 Apr", direction: "Client → Advisor", message: "“Looks good, thank you.”" },
    ],
    actionItems: [
      { id: "a1", text: "Share updated goal progress report", owner: "Advisor", dueDate: "20 May", status: "completed" },
    ],
    suggestedMaterials: [{ name: "Goal-Based Investing Basics", type: "Article" }],
    materialsComplianceChecked: true,
    reportAttached: "Goal Progress Report",
    finnySuggestion: {
      title: "Goal-Based Investing Basics",
      reason: "Client is on track and may benefit from a primer before the next goal-setting conversation.",
      basedOn: ["Goal progress", "On-track status", "Upcoming review"],
    },
    recentlySent: [
      { name: "Goal Progress Report", type: "Report", date: "19 Apr", status: "viewed" },
      { name: "Goal-Based Investing Basics", type: "Article", date: "18 Apr", status: "viewed" },
    ],
    nextBestAction: "Walk through the 2 AI suggestions and agree next actions.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M004",
    client: { name: "Rohan Kumar", id: "C12456", plan: "Silver" },
    meetingType: "Financial Blueprint Review",
    date: "2025-05-19T16:00:00",
    dateLabel: "Today 4:00 PM",
    urgency: "urgent",
    duration: "35 min",
    mode: "Video",
    status: "scheduled",
    briefPoints: [
      "Blueprint highlights retirement as the highest-priority gap.",
      "Client hasn't confirmed retirement preference yet.",
    ],
    alerts: ["1 assumption unverified"],
    lastMeetingSummary: "Discovery call — client confirmed interest in a one-time blueprint.",
    lastMeetingDate: "10 May 2025",
    lastMeetingDetail: {
      title: "Discovery Call",
      finnyInsights: [
        "Client confirmed interest in a one-time financial blueprint.",
        "Retirement planning preference is still unconfirmed.",
      ],
      decisions: ["Proceed with preparing the Financial Blueprint Review."],
    },
    communicationLog: [
      { date: "11 May", direction: "Advisor → Client", message: "Asked for retirement age preference." },
      { date: "15 May", direction: "Client", message: "Still awaiting a reply." },
    ],
    actionItems: [
      { id: "a1", text: "Add retirement preference", owner: "Client", dueDate: "22 May", status: "pending" },
    ],
    suggestedMaterials: [{ name: "Financial Blueprint Explainer", type: "Video" }],
    materialsComplianceChecked: false,
    reportAttached: "Portfolio Review Report",
    finnySuggestion: {
      title: "Financial Blueprint Explainer",
      reason: "Client hasn't confirmed their retirement preference — a short explainer video may help them decide.",
      basedOn: ["Unconfirmed retirement preference", "Recent discovery call", "Blueprint in progress"],
    },
    recentlySent: [
      { name: "Financial Blueprint Explainer", type: "Video", date: "11 May", status: "in-progress" },
    ],
    nextBestAction: "Prompt the client to submit their retirement preference before the meeting.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M005",
    client: { name: "Deepak Iyer", id: "C11976", plan: "Silver" },
    meetingType: "Follow-up Call",
    date: "2025-05-14T14:00:00",
    dateLabel: "5 days ago",
    urgency: null,
    duration: "25 min",
    mode: "Phone",
    status: "follow-up-pending",
    briefPoints: ["Insurance review report was well received — client wants to proceed with implementation."],
    alerts: [],
    lastMeetingSummary: "Insurance Review Report walkthrough — client agreed with recommendations.",
    lastMeetingDate: "14 May 2025",
    lastMeetingDetail: {
      title: "Insurance Review Walkthrough",
      finnyInsights: [
        "Client agreed with the insurance recommendations presented.",
        "Client wants to compare top-up cover options before deciding.",
      ],
      decisions: ["Proceed with implementation of the recommended policy changes."],
    },
    communicationLog: [
      { date: "15 May", direction: "Advisor → Client", message: "Policy comparison document sent." },
      { date: "16 May", direction: "Client → Advisor", message: "“Comparing options, will decide this week.”" },
    ],
    actionItems: [
      { id: "a1", text: "Send policy comparison document", owner: "Advisor", dueDate: "16 May", status: "in-progress" },
      { id: "a2", text: "Decide on top-up cover", owner: "Client", dueDate: "20 May", status: "pending" },
    ],
    suggestedMaterials: [{ name: "Term vs Whole Life Insurance", type: "Article" }],
    materialsComplianceChecked: true,
    reportAttached: "Insurance Review Report",
    finnySuggestion: {
      title: "Term vs Whole Life Insurance",
      reason: "Client is comparing top-up cover options and hasn't reviewed the term-vs-whole comparison yet.",
      basedOn: ["Pending top-up decision", "Insurance review discussion", "Recent engagement"],
    },
    recentlySent: [
      { name: "Insurance Review Report", type: "Report", date: "15 May", status: "viewed" },
      { name: "Term vs Whole Life Insurance", type: "Article", date: "15 May", status: "viewed" },
    ],
    nextBestAction: "Follow up — client hasn't decided on the top-up cover in 5 days.",
    complianceLogged: true,
    adviceNoteLogged: true,
  },
  {
    id: "M006",
    client: { name: "Kavya Shah", id: "C12587", plan: "Gold" },
    meetingType: "Annual Plan Review",
    date: "2025-05-25T00:00:00",
    dateLabel: "In 6 days",
    urgency: "upcoming",
    duration: "45 min",
    mode: "Video",
    status: "scheduled",
    briefPoints: ["Tax planning report is still generating — will be ready 2 days before the meeting."],
    alerts: ["Advisory agreement due for renewal in 30 days"],
    lastMeetingSummary: "Plan kickoff — tax planning identified as the primary focus for this cycle.",
    lastMeetingDate: "28 Apr 2025",
    lastMeetingDetail: {
      title: "Plan Kickoff",
      finnyInsights: [
        "Tax planning identified as the primary focus for this cycle.",
        "Advisory agreement is due for renewal within 30 days.",
      ],
      decisions: ["Prioritise the tax planning report ahead of other materials."],
    },
    communicationLog: [
      { date: "29 Apr", direction: "Advisor → Client", message: "Confirmed tax planning as this cycle's focus." },
      { date: "29 Apr", direction: "Client → Advisor", message: "“Sounds good, send the report when ready.”" },
    ],
    actionItems: [
      { id: "a1", text: "Finalise tax planning report", owner: "Advisor", dueDate: "23 May", status: "in-progress" },
    ],
    suggestedMaterials: [{ name: "Tax-Saving Instruments 101", type: "Workshop" }],
    materialsComplianceChecked: false,
    reportAttached: "Tax Planning Report",
    finnySuggestion: {
      title: "Tax-Saving Instruments 101",
      reason: "Tax planning is this cycle's focus and the client hasn't explored tax-saving instruments yet.",
      basedOn: ["Tax planning focus", "Plan kickoff discussion", "Upcoming review"],
    },
    recentlySent: [
      { name: "Tax-Saving Instruments 101", type: "Workshop", date: "29 Apr", status: "in-progress" },
    ],
    nextBestAction: "Nothing to action yet — report is still generating.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M007",
    client: { name: "Vikram Tandon", id: "C12890", plan: "Platinum" },
    meetingType: "Family Wealth Review",
    date: "2025-05-10T11:00:00",
    dateLabel: "9 days ago",
    urgency: null,
    duration: "60 min",
    mode: "Video",
    status: "completed",
    briefPoints: ["Family wealth strategy reaffirmed — no changes to allocation."],
    alerts: [],
    lastMeetingSummary: "Family Wealth Review — long-term strategy aligned with family goals.",
    lastMeetingDate: "10 May 2025",
    lastMeetingDetail: {
      title: "Family Wealth Review",
      finnyInsights: [
        "Long-term strategy remains aligned with family goals.",
        "No changes required to the current asset allocation.",
      ],
      decisions: ["Maintain current allocation; revisit in 6 months."],
    },
    communicationLog: [
      { date: "12 May", direction: "Advisor → Client", message: "Financial Health Report shared." },
      { date: "12 May", direction: "Client → Advisor", message: "“Reviewed with the family, all good.”" },
    ],
    actionItems: [
      { id: "a1", text: "Share Financial Health Report", owner: "Advisor", dueDate: "12 May", status: "completed" },
    ],
    suggestedMaterials: [],
    materialsComplianceChecked: true,
    reportAttached: "Financial Health Report",
    finnySuggestion: null,
    recentlySent: [
      { name: "Financial Health Report", type: "Report", date: "12 May", status: "viewed" },
    ],
    nextBestAction: "Schedule the next strategic review in 6 months.",
    complianceLogged: true,
    adviceNoteLogged: true,
  },
  {
    id: "M008",
    client: { name: "Neha Suri", id: "C12765", plan: "Gold" },
    meetingType: "Annual Plan Review",
    date: "2025-05-27T00:00:00",
    dateLabel: "In 8 days",
    urgency: "upcoming",
    duration: "40 min",
    mode: "Video",
    status: "scheduled",
    briefPoints: ["Wealth projection report has 2 suggestions flagged for discussion."],
    alerts: [],
    lastMeetingSummary: "Scenario planning session — client explored early-retirement scenarios.",
    lastMeetingDate: "30 Mar 2025",
    lastMeetingDetail: {
      title: "Scenario Planning Session",
      finnyInsights: [
        "Client is seriously considering retiring at 55 instead of 60.",
        "The early-retirement scenario needs to be modelled in detail.",
      ],
      decisions: ["Model the early-retirement scenario before the next review."],
    },
    communicationLog: [
      { date: "2 Apr", direction: "Client → Advisor", message: "“Can we look at retiring at 55 instead?”" },
      { date: "3 Apr", direction: "Advisor → Client", message: "Early-retirement scenario modelling underway." },
    ],
    actionItems: [
      { id: "a1", text: "Model early-retirement scenario at 55", owner: "Advisor", dueDate: "25 May", status: "in-progress" },
    ],
    suggestedMaterials: [{ name: "Early Retirement Simulator", type: "Simulation" }],
    materialsComplianceChecked: true,
    reportAttached: "Wealth Projection Report",
    finnySuggestion: {
      title: "Early Retirement Simulator",
      reason: "Client is seriously considering retiring at 55 and hasn't run the early-retirement simulation yet.",
      basedOn: ["Early-retirement interest", "Previous meeting discussion", "Scenario modelling in progress"],
    },
    recentlySent: [
      { name: "Wealth Projection Report", type: "Report", date: "3 Apr", status: "viewed" },
      { name: "Early Retirement Simulator", type: "Simulation", date: "3 Apr", status: "in-progress" },
    ],
    nextBestAction: "Finish the early-retirement scenario model before the meeting.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M009",
    client: { name: "Arjun Bhatia", id: "C12902", plan: "Platinum" },
    meetingType: "Proposal Walkthrough",
    date: "2025-05-23T00:00:00",
    dateLabel: "In 4 days",
    urgency: "upcoming",
    duration: "30 min",
    mode: "Video",
    status: "needs-prep",
    briefPoints: ["Estate planning report is awaiting compliance sign-off on suitability wording."],
    alerts: ["Compliance review pending — blocks meeting prep"],
    lastMeetingSummary: "Financial Blueprint review — estate planning identified as a new priority.",
    lastMeetingDate: "1 May 2025",
    lastMeetingDetail: {
      title: "Financial Blueprint Review",
      finnyInsights: [
        "Estate planning surfaced as a new priority for the client.",
        "Suitability wording in the estate report needs compliance review.",
      ],
      decisions: ["Add estate planning as a workstream for this cycle."],
    },
    communicationLog: [
      { date: "2 May", direction: "Client → Advisor", message: "“We should also plan for the estate.”" },
      { date: "3 May", direction: "Advisor → Client", message: "Estate Planning Report scoped and queued." },
    ],
    actionItems: [
      { id: "a1", text: "Resolve compliance flag on suitability wording", owner: "Advisor", dueDate: "27 May", status: "pending" },
    ],
    suggestedMaterials: [{ name: "Estate Planning Basics for Indian Families", type: "Article" }],
    materialsComplianceChecked: false,
    reportAttached: "Estate Planning Report",
    finnySuggestion: {
      title: "Estate Planning Basics for Indian Families",
      reason: "Estate planning surfaced as a new priority and the client hasn't seen an introductory overview yet.",
      basedOn: ["New estate planning priority", "Previous meeting discussion", "Report pending compliance"],
    },
    recentlySent: [
      { name: "Estate Planning Basics for Indian Families", type: "Article", date: "3 May", status: "viewed" },
    ],
    nextBestAction: "Resolve the compliance flag before this meeting can be prepped.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M010",
    client: { name: "Sneha Kulkarni", id: "C12344", plan: "Gold" },
    meetingType: "Annual Plan Review",
    date: "2025-05-08T13:20:00",
    dateLabel: "11 days ago",
    urgency: null,
    duration: "45 min",
    mode: "In-person",
    status: "completed",
    briefPoints: ["Annual portfolio summary approved and shared with client."],
    alerts: [],
    lastMeetingSummary: "Annual review — portfolio performance discussed, no rebalancing needed.",
    lastMeetingDate: "8 May 2025",
    lastMeetingDetail: {
      title: "Annual Review",
      finnyInsights: ["Portfolio performance was discussed in detail.", "No rebalancing was required this cycle."],
      decisions: ["Keep the current portfolio allocation unchanged."],
    },
    communicationLog: [
      { date: "9 May", direction: "Advisor → Client", message: "Annual Portfolio Summary shared." },
      { date: "9 May", direction: "Client", message: "Acknowledged, no questions raised." },
    ],
    actionItems: [],
    suggestedMaterials: [],
    materialsComplianceChecked: true,
    reportAttached: "Annual Portfolio Summary",
    finnySuggestion: null,
    recentlySent: [
      { name: "Annual Portfolio Summary", type: "Report", date: "9 May", status: "viewed" },
    ],
    nextBestAction: "No further action — schedule next annual review.",
    complianceLogged: true,
    adviceNoteLogged: true,
  },
  {
    id: "M011",
    client: { name: "Deepak Malhotra", id: "C12010", plan: "Platinum" },
    meetingType: "Annual Plan Review",
    date: "2025-05-19T17:30:00",
    dateLabel: "Today 5:30 PM",
    urgency: "soon",
    duration: "45 min",
    mode: "Video",
    status: "prepped",
    briefPoints: ["Risk profile review cleared by compliance — ready to share and discuss."],
    alerts: [],
    lastMeetingSummary: "Risk tolerance reassessment requested by client after market volatility.",
    lastMeetingDate: "5 Apr 2025",
    lastMeetingDetail: {
      title: "Risk Tolerance Reassessment",
      finnyInsights: [
        "Client requested a reassessment after recent market volatility.",
        "Risk profile report has since been cleared by compliance.",
      ],
      decisions: ["Share the updated risk profile ahead of the next meeting."],
    },
    communicationLog: [
      { date: "6 Apr", direction: "Client → Advisor", message: "“The recent volatility has me worried.”" },
      { date: "27 May", direction: "Advisor → Client", message: "Compliance-cleared risk profile ready to share." },
    ],
    actionItems: [
      { id: "a1", text: "Share compliance-cleared risk profile report", owner: "Advisor", dueDate: "28 May", status: "completed" },
    ],
    suggestedMaterials: [{ name: "Understanding Market Volatility", type: "Video" }],
    materialsComplianceChecked: true,
    reportAttached: "Risk Profile Review",
    finnySuggestion: {
      title: "Understanding Market Volatility",
      reason: "Client raised concerns about recent volatility and hasn't seen an explainer on market swings yet.",
      basedOn: ["Volatility concerns", "Risk reassessment request", "Previous meeting discussion"],
    },
    recentlySent: [
      { name: "Risk Profile Review", type: "Report", date: "6 Apr", status: "in-progress" },
      { name: "Understanding Market Volatility", type: "Video", date: "6 Apr", status: "viewed" },
    ],
    nextBestAction: "Send the risk profile report ahead of the meeting so the client can review it.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
  {
    id: "M012",
    client: { name: "Lakshmi Venkat", id: "C12233", plan: "Silver" },
    meetingType: "Financial Blueprint Review",
    date: "2025-05-06T08:30:00",
    dateLabel: "13 days ago",
    urgency: null,
    duration: "35 min",
    mode: "Video",
    status: "follow-up-pending",
    briefPoints: ["Goal funding report shared — client to decide whether to proceed with implementation."],
    alerts: [],
    lastMeetingSummary: "Blueprint walkthrough — client engaged but undecided on next steps.",
    lastMeetingDate: "6 May 2025",
    lastMeetingDetail: {
      title: "Blueprint Walkthrough",
      finnyInsights: ["Client was engaged throughout the walkthrough.", "Client remains undecided on implementation support."],
      decisions: ["Wait for the client's decision before proceeding further."],
    },
    communicationLog: [
      { date: "7 May", direction: "Advisor → Client", message: "Goal Funding Report shared post-walkthrough." },
      { date: "13 May", direction: "Client", message: "No response in over a week — follow-up due." },
    ],
    actionItems: [
      { id: "a1", text: "Decide whether implementation support is needed", owner: "Client", dueDate: "Within 1 week", status: "pending" },
    ],
    suggestedMaterials: [{ name: "From Blueprint to Action", type: "Article" }],
    materialsComplianceChecked: true,
    reportAttached: "Goal Funding Report",
    finnySuggestion: {
      title: "From Blueprint to Action",
      reason: "Client is engaged but undecided on implementation — this guide breaks down the next steps.",
      basedOn: ["Pending implementation decision", "Blueprint walkthrough discussion", "No response in over a week"],
    },
    recentlySent: [
      { name: "Goal Funding Report", type: "Report", date: "7 May", status: "viewed" },
      { name: "From Blueprint to Action", type: "Article", date: "7 May", status: "in-progress" },
    ],
    nextBestAction: "Follow up — client hasn't responded on implementation in over a week.",
    complianceLogged: true,
    adviceNoteLogged: false,
  },
  {
    id: "M013",
    client: { name: "Farhan Qureshi", id: "C12781", plan: "Gold" },
    meetingType: "Follow-up Call",
    date: "2025-05-17T15:10:00",
    dateLabel: "2 days ago",
    urgency: null,
    duration: "20 min",
    mode: "Phone",
    status: "completed",
    briefPoints: ["Tax optimisation report acknowledged by client — no further questions."],
    alerts: [],
    lastMeetingSummary: "Tax optimisation report sent and reviewed on call.",
    lastMeetingDate: "21 May 2025",
    lastMeetingDetail: {
      title: "Tax Optimisation Review",
      finnyInsights: ["Client reviewed the tax optimisation report on the call.", "No further questions or concerns were raised."],
      decisions: ["No further action needed on tax optimisation this cycle."],
    },
    communicationLog: [
      { date: "21 May", direction: "Advisor → Client", message: "Tax optimisation report sent for review." },
      { date: "21 May", direction: "Client → Advisor", message: "“All clear, thanks for the quick turnaround.”" },
    ],
    actionItems: [],
    suggestedMaterials: [],
    materialsComplianceChecked: true,
    reportAttached: "Tax Optimisation Report",
    finnySuggestion: null,
    recentlySent: [
      { name: "Tax Optimisation Report", type: "Report", date: "17 May", status: "viewed" },
    ],
    nextBestAction: "No action needed — client acknowledged the report.",
    complianceLogged: true,
    adviceNoteLogged: true,
  },
  {
    id: "M014",
    client: { name: "Arun Singh", id: "C12466", plan: "Gold" },
    meetingType: "Follow-up Call",
    date: "2025-05-21T00:00:00",
    dateLabel: "In 2 days",
    urgency: "soon",
    duration: "20 min",
    mode: "Phone",
    status: "needs-prep",
    briefPoints: ["Client requested changes to the equity split in the asset allocation review."],
    alerts: ["Revision requested — equity split needs rework"],
    lastMeetingSummary: "Asset allocation review — client flagged the equity split as too aggressive.",
    lastMeetingDate: "20 May 2025",
    lastMeetingDetail: {
      title: "Asset Allocation Review",
      finnyInsights: ["Client flagged the equity split as too aggressive.", "Client wants a more conservative allocation mix."],
      decisions: ["Rework the equity split based on client feedback."],
    },
    communicationLog: [
      { date: "20 May", direction: "Client → Advisor", message: "“The equity allocation feels too aggressive for me.”" },
      { date: "21 May", direction: "Advisor → Client", message: "Reworked equity split in progress." },
    ],
    actionItems: [
      { id: "a1", text: "Rework equity split per client feedback", owner: "Advisor", dueDate: "23 May", status: "in-progress" },
    ],
    suggestedMaterials: [{ name: "Asset Allocation & Risk", type: "Article" }],
    materialsComplianceChecked: false,
    reportAttached: "Asset Allocation Review",
    finnySuggestion: {
      title: "Asset Allocation & Risk",
      reason: "Client flagged the equity split as too aggressive — this article explains the risk/return tradeoff in plain terms.",
      basedOn: ["Equity split concern", "Conservative allocation request", "Previous meeting discussion"],
    },
    recentlySent: [
      { name: "Asset Allocation Review", type: "Report", date: "20 May", status: "viewed" },
      { name: "Asset Allocation & Risk", type: "Article", date: "20 May", status: "in-progress" },
    ],
    nextBestAction: "Finish reworking the equity split before this call.",
    complianceLogged: false,
    adviceNoteLogged: false,
  },
];

export const MEETING_ATTENTION_STATS = {
  today: 3,
  needsPrep: MEETINGS.filter((m) => m.status === "needs-prep").length,
  followUpsPending: MEETINGS.filter((m) => m.status === "follow-up-pending").length,
  aiAssistance: MEETINGS.filter((m) => m.suggestedMaterials.length > 0 || m.alerts.length > 0).length,
};
