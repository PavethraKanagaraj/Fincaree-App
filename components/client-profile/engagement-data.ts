/* ============================================================
   Engagement Tab — Client ↔ Advisor Timeline Data
   The timeline is the primary experience. Everything else
   (summary strip, Finny, open loops, next meeting) orients
   the advisor around it — it does not replace it.
   ============================================================ */

export type TimelineActor = "client" | "advisor";

export type TimelineEventType =
  | "meeting"
  | "message"
  | "query"
  | "goal"
  | "financial"
  | "learning"
  | "simulation"
  | "workshop"
  | "report"
  | "task"
  | "followup";

export interface TimelineEventDetail {
  heading: string;
  fields: { label: string; value: string }[];
  body?: string;
  primaryActionLabel?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  dateGroup: string;
  sortDate: string;
  actor: TimelineActor;
  type: TimelineEventType;
  title: string;
  summary: string;
  outcome?: string;
  status?: string;
  relatedLabel?: string;
  linkLabel?: string;
  groupedItems?: string[];
  detail: TimelineEventDetail;
}

export const TIMELINE_TYPE_LABELS: Record<TimelineEventType, string> = {
  meeting: "Meeting",
  message: "Message",
  query: "Query",
  goal: "Goal",
  financial: "Financial",
  learning: "Learning",
  simulation: "Simulation",
  workshop: "Workshop",
  report: "Report",
  task: "Task",
  followup: "Follow-up",
};

/* ---- Timeline events, newest first. "Today" for filtering ≈ 24 Aug 2025 ---- */

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-report-viewed",
    date: "22 Aug 2025",
    dateGroup: "22 AUG 2025",
    sortDate: "2025-08-22",
    actor: "client",
    type: "report",
    title: "Report viewed",
    summary: "Goal Progress Report",
    status: "Viewed",
    relatedLabel: "Retirement",
    linkLabel: "View report",
    detail: {
      heading: "GOAL PROGRESS REPORT",
      fields: [
        { label: "Viewed", value: "22 Aug 2025" },
        { label: "Client", value: "Anika Rao" },
        { label: "Status", value: "Viewed" },
        { label: "Related Goal", value: "Retirement" },
      ],
      body: "Client opened the latest goal progress report covering retirement, education and wealth creation.",
      primaryActionLabel: "View Report",
    },
  },
  {
    id: "evt-goal-updated",
    date: "18 Aug 2025",
    dateGroup: "18 AUG 2025",
    sortDate: "2025-08-18",
    actor: "client",
    type: "goal",
    title: "Goal updated",
    summary: "Retirement age changed 60 → 58",
    outcome: "Retirement projection needs review",
    relatedLabel: "Retirement",
    linkLabel: "View goal",
    detail: {
      heading: "RETIREMENT GOAL UPDATED",
      fields: [
        { label: "Updated", value: "18 Aug 2025" },
        { label: "Client", value: "Anika Rao" },
        { label: "Change", value: "Target retirement age: 60 → 58" },
        { label: "Source", value: "Client update" },
        { label: "Outcome", value: "Retirement projection needs review" },
        { label: "Related Goal", value: "Retirement" },
      ],
      primaryActionLabel: "View Goal",
    },
  },
  {
    id: "evt-simulation-shared",
    date: "15 Aug 2025",
    dateGroup: "15 AUG 2025",
    sortDate: "2025-08-15",
    actor: "advisor",
    type: "simulation",
    title: "Simulation shared",
    summary: "Retirement Scenario",
    outcome: "Comparing retirement at 58 and 60",
    status: "Viewed",
    relatedLabel: "Retirement",
    linkLabel: "View simulation",
    detail: {
      heading: "RETIREMENT SIMULATION",
      fields: [
        { label: "Shared", value: "15 Aug 2025" },
        { label: "Client", value: "Anika Rao" },
        { label: "Scenario explored", value: "Retire at 58" },
        { label: "Alternative", value: "Retire at 60" },
        { label: "Outcome", value: "Client viewed projected corpus difference." },
        { label: "Related Goal", value: "Retirement" },
        { label: "Related Meeting", value: "Quarterly Review" },
      ],
      primaryActionLabel: "View Simulation",
    },
  },
  {
    id: "evt-workshop-attended",
    date: "12 Aug 2025",
    dateGroup: "12 AUG 2025",
    sortDate: "2025-08-12",
    actor: "client",
    type: "workshop",
    title: "Workshop attended",
    summary: "Retirement Planning Workshop",
    outcome: "Online · 12 Aug · 6:00 PM · Attended",
    status: "Attended",
    linkLabel: "View workshop",
    detail: {
      heading: "RETIREMENT PLANNING WORKSHOP",
      fields: [
        { label: "Date", value: "12 Aug 2025, 6:00 PM" },
        { label: "Mode", value: "Online" },
        { label: "Client", value: "Anika Rao" },
        { label: "Status", value: "Attended" },
      ],
      primaryActionLabel: "View Workshop",
    },
  },
  {
    id: "evt-learning-completed",
    date: "10 Aug 2025",
    dateGroup: "10 AUG 2025",
    sortDate: "2025-08-10",
    actor: "client",
    type: "learning",
    title: "Learning completed",
    summary: "Retirement Planning · Module 3 — Inflation",
    status: "Completed",
    relatedLabel: "Retirement",
    linkLabel: "View learning path",
    detail: {
      heading: "RETIREMENT PLANNING — MODULE 3",
      fields: [
        { label: "Completed", value: "10 Aug 2025" },
        { label: "Module", value: "Module 3 — Inflation" },
        { label: "Path progress", value: "3 of 5 modules complete" },
        { label: "Related Goal", value: "Retirement" },
      ],
      primaryActionLabel: "View Learning Path",
    },
  },
  {
    id: "evt-followup-sent",
    date: "08 Aug 2025",
    dateGroup: "08 AUG 2025",
    sortDate: "2025-08-08",
    actor: "advisor",
    type: "followup",
    title: "Follow-up sent",
    summary: "“Please review the updated retirement scenario before our next meeting.”",
    status: "Viewed",
    relatedLabel: "Quarterly Review",
    detail: {
      heading: "FOLLOW-UP",
      fields: [
        { label: "Sent", value: "08 Aug 2025" },
        { label: "Status", value: "Viewed" },
        { label: "Related Meeting", value: "Quarterly Review" },
      ],
      body: "“Please review the updated retirement scenario before our next meeting.”",
    },
  },
  {
    id: "evt-query-raised",
    date: "06 Aug 2025",
    dateGroup: "06 AUG 2025",
    sortDate: "2025-08-06",
    actor: "client",
    type: "query",
    title: "Query raised",
    summary: "“How does the retirement target change if I retire at 58?”",
    status: "Answered",
    linkLabel: "View query",
    detail: {
      heading: "CLIENT QUERY",
      fields: [
        { label: "Raised", value: "06 Aug 2025" },
        { label: "Status", value: "Answered" },
        { label: "Related Goal", value: "Retirement" },
      ],
      body: "“How does the retirement target change if I retire at 58?”",
      primaryActionLabel: "View Query",
    },
  },
  {
    id: "evt-financial-synced",
    date: "01 Aug 2025",
    dateGroup: "01 AUG 2025",
    sortDate: "2025-08-01",
    actor: "client",
    type: "financial",
    title: "Financial information updated",
    summary: "Portfolio synced",
    status: "Synced",
    detail: {
      heading: "PORTFOLIO SYNC",
      fields: [
        { label: "Synced", value: "01 Aug 2025" },
        { label: "Status", value: "Synced" },
      ],
      body: "Investment account data was refreshed from the connected portfolio feed.",
    },
  },
  {
    id: "evt-task-assigned",
    date: "25 Jul 2025",
    dateGroup: "25 JUL 2025",
    sortDate: "2025-07-25",
    actor: "advisor",
    type: "task",
    title: "Task assigned",
    summary: "Upload latest insurance details",
    status: "Pending",
    detail: {
      heading: "TASK ASSIGNED",
      fields: [
        { label: "Assigned", value: "25 Jul 2025" },
        { label: "Owner", value: "Client" },
        { label: "Status", value: "Pending" },
      ],
      body: "Client was asked to upload updated insurance coverage details.",
    },
  },
  {
    id: "evt-quarterly-review",
    date: "18 Jul 2025",
    dateGroup: "18 JUL 2025",
    sortDate: "2025-07-18",
    actor: "advisor",
    type: "meeting",
    title: "Quarterly Review",
    summary: "Meeting completed",
    groupedItems: [
      "2 actions created",
      "Retirement goal flagged for review",
      "Education goal discussed",
    ],
    linkLabel: "View meeting",
    detail: {
      heading: "QUARTERLY REVIEW",
      fields: [
        { label: "Date", value: "18 Jul 2025" },
        { label: "Mode", value: "Video" },
        { label: "Outcome", value: "Meeting completed, 2 actions created" },
      ],
      body: "Reviewed retirement projection and discussed the education goal timeline.",
      primaryActionLabel: "View Meeting",
    },
  },
  {
    id: "evt-simulation-education",
    date: "10 Jul 2025",
    dateGroup: "10 JUL 2025",
    sortDate: "2025-07-10",
    actor: "client",
    type: "simulation",
    title: "Simulation explored",
    summary: "Education Funding Scenario",
    outcome: "Domestic university option explored, not completed",
    status: "In Progress",
    relatedLabel: "Child Education",
    linkLabel: "View simulation",
    detail: {
      heading: "EDUCATION FUNDING SIMULATION",
      fields: [
        { label: "Last explored", value: "10 Jul 2025" },
        { label: "Scenario explored", value: "Domestic university" },
        { label: "Status", value: "In progress — not completed" },
        { label: "Related Goal", value: "Child Education" },
      ],
      primaryActionLabel: "View Simulation",
    },
  },
  {
    id: "evt-learning-assigned",
    date: "04 Jul 2025",
    dateGroup: "04 JUL 2025",
    sortDate: "2025-07-04",
    actor: "advisor",
    type: "learning",
    title: "Learning path assigned",
    summary: "Retirement Planning Path",
    status: "Assigned",
    relatedLabel: "Retirement",
    linkLabel: "View learning path",
    detail: {
      heading: "RETIREMENT PLANNING PATH",
      fields: [
        { label: "Assigned", value: "04 Jul 2025" },
        { label: "Status", value: "Assigned" },
        { label: "Related Goal", value: "Retirement" },
      ],
      primaryActionLabel: "View Learning Path",
    },
  },
  {
    id: "evt-plan-discussion",
    date: "20 May 2025",
    dateGroup: "20 MAY 2025",
    sortDate: "2025-05-20",
    actor: "advisor",
    type: "meeting",
    title: "Plan Discussion",
    summary: "Meeting completed",
    groupedItems: [
      "Gold Plan activated",
      "Goals prioritised",
      "SIP contribution increase agreed",
    ],
    linkLabel: "View meeting",
    detail: {
      heading: "PLAN DISCUSSION",
      fields: [
        { label: "Date", value: "20 May 2025" },
        { label: "Mode", value: "Video" },
        { label: "Outcome", value: "Gold Plan activated" },
      ],
      body: "First plan discussion — goals prioritised and Gold Annual Guide Plan activated.",
      primaryActionLabel: "View Meeting",
    },
  },
];

export const TIMELINE_FILTERS: { key: string; label: string; group: "actor" | "type" }[] = [
  { key: "client", label: "Client", group: "actor" },
  { key: "advisor", label: "Advisor", group: "actor" },
  { key: "meeting", label: "Meetings", group: "type" },
  { key: "learning", label: "Learning", group: "type" },
  { key: "simulation", label: "Simulations", group: "type" },
  { key: "workshop", label: "Workshops", group: "type" },
  { key: "goal", label: "Goals", group: "type" },
  { key: "financial", label: "Financial", group: "type" },
  { key: "query", label: "Queries", group: "type" },
  { key: "task", label: "Tasks", group: "type" },
];

/* ---- Compact orientation strip ---- */

export const ENGAGEMENT_SUMMARY = {
  lastClientInteraction: "2 days ago",
  lastAdvisorInteraction: "5 days ago",
  openClientActions: 2,
  pendingAdvisorActions: 1,
  learningCompleted: 3,
  simulationsCompleted: 2,
  contentViewed: 5,
  nextMeeting: "28 Aug",
};

/* ---- Workshops (current status, not history — the timeline above already
   has the "attended" event; this is "where do things stand right now") ---- */

export interface WorkshopStatus {
  name: string;
  status: "registered" | "attended" | "missed" | "recommended";
  date?: string;
}

export const WORKSHOPS: WorkshopStatus[] = [
  { name: "Retirement Planning Workshop", status: "attended", date: "12 Aug 2025" },
  { name: "Tax Planning for Families", status: "registered", date: "5 Sep 2025" },
  { name: "Estate Planning Essentials", status: "missed", date: "3 Jul 2025" },
  { name: "Portfolio Basics", status: "recommended" },
];

/* ---- Open loops ---- */

export interface OpenLoopItem {
  title: string;
  due?: string;
}

export const OPEN_LOOPS: { client: OpenLoopItem[]; advisor: OpenLoopItem[]; pending: OpenLoopItem[] } = {
  client: [{ title: "Review retirement simulation", due: "28 Aug" }],
  advisor: [{ title: "Prepare revised retirement scenario", due: "26 Aug" }],
  pending: [{ title: "Insurance details" }],
};

/* ---- Finny insight ---- */

export const FINNY_ENGAGEMENT_NOTE = {
  observation: "Retirement-related engagement increased over the last 30 days.",
  evidence: [
    "3 learning modules completed",
    "1 retirement simulation completed",
    "Retirement age updated",
    "Quarterly review approaching",
  ],
  suggestedAction: "Consider discussing the revised retirement timeline during the upcoming review.",
};

/* ---- Engagement signals (no score) ---- */

export interface EngagementSignalRow {
  label: string;
  value: string;
  direction: "up" | "down" | "stable" | "neutral";
}

export const ENGAGEMENT_SIGNALS: EngagementSignalRow[] = [
  { label: "Learning", value: "Increasing", direction: "up" },
  { label: "Simulation", value: "Increasing", direction: "up" },
  { label: "Advisor interaction", value: "Stable", direction: "stable" },
  { label: "Open actions", value: "2 pending", direction: "neutral" },
  { label: "Workshop participation", value: "Active", direction: "neutral" },
];

/* ---- Next meeting connection ---- */

export const NEXT_MEETING_CONTEXT = {
  title: "Quarterly Review",
  date: "28 Aug",
  time: "10:30 AM",
  relevantSince: [
    "Retirement goal updated",
    "Retirement simulation completed",
    "Education module unfinished",
    "Insurance information pending",
  ],
};
