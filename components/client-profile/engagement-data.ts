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

/* The four kinds of client query that come out of Fincaree's own activity, each handled differently. */
export type QueryKind = "workshop-booking" | "workshop-followup" | "simulation" | "learning";

export interface QueryKindMeta {
  label: string;
  /** Short name for the filter chip. */
  chip: string;
  /** Where the query comes from. */
  source: string;
  /** What the advisor should do. */
  handle: string;
  /** "tier" means the reply target follows the client's plan; otherwise a fixed target. */
  urgency: "tier" | { level: string; target: string };
}

export const QUERY_KIND_META: Record<QueryKind, QueryKindMeta> = {
  "workshop-booking": {
    label: "Workshop booking",
    chip: "Workshop booking",
    source: "The workshop page, or a message about a workshop",
    handle: "Mostly self-service: seats, date and joining link. Send an automatic reply with the details, and bring in the advisor only for a special request.",
    urgency: { level: "Low", target: "Automatic reply the same day" },
  },
  "workshop-followup": {
    label: "After a workshop",
    chip: "After a workshop",
    source: "The workshop's attendee list",
    handle: "Reply with the recording, the slides and answers to the Q&A. Link the workshop so you can see what was covered.",
    urgency: { level: "Medium", target: "Within 1 to 2 days" },
  },
  simulation: {
    label: "Simulation doubt",
    chip: "Simulation doubts",
    source: "The simulation the client ran",
    handle: "Show the client's own numbers and scenario next to the question. Explain what the model does and does not promise.",
    urgency: "tier",
  },
  learning: {
    label: "Learning doubt",
    chip: "Learning doubts",
    source: "The content item that was sent",
    handle: "Show which content it was, when it was sent and how far the client got. Suggest the next piece of content.",
    urgency: "tier",
  },
};

/** The reply target for the client's plan, used when a query's urgency follows the tier. */
export const TIER_REPLY_TARGET: Record<string, string> = {
  Platinum: "Same day",
  Gold: "Within 1 day",
  Silver: "Within 2 days",
};

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
  /** For a client query: which kind it is, and the workshop, simulation or content it is about. */
  queryKind?: QueryKind;
  queryAbout?: string;
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

const RAW_TIMELINE_EVENTS: TimelineEvent[] = [
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
  {
    id: "evt-q-learning",
    date: "21 Aug 2025",
    dateGroup: "21 AUG 2025",
    sortDate: "2025-08-21",
    actor: "client",
    type: "query",
    title: "Doubt on content sent",
    summary: "“In Retirement Basics, what does ‘real return’ mean?”",
    status: "Answered",
    queryKind: "learning",
    queryAbout: "Content: Retirement Basics",
    linkLabel: "View query",
    detail: {
      heading: "CLIENT QUERY",
      fields: [
        { label: "Raised", value: "21 Aug 2025" },
        { label: "Status", value: "Answered" },
        { label: "About", value: "Content: Retirement Basics" },
      ],
      body: "“In Retirement Basics, what does ‘real return’ mean?”",
      primaryActionLabel: "Reply",
    },
  },
  {
    id: "evt-q-simulation",
    date: "19 Aug 2025",
    dateGroup: "19 AUG 2025",
    sortDate: "2025-08-19",
    actor: "client",
    type: "query",
    title: "Doubt on a simulation",
    summary: "“Why does the retire-at-58 scenario show a lower corpus than my plan?”",
    status: "Pending",
    queryKind: "simulation",
    queryAbout: "Simulation: Retirement Readiness",
    linkLabel: "View query",
    detail: {
      heading: "CLIENT QUERY",
      fields: [
        { label: "Raised", value: "19 Aug 2025" },
        { label: "Status", value: "Pending" },
        { label: "About", value: "Simulation: Retirement Readiness" },
      ],
      body: "“Why does the retire-at-58 scenario show a lower corpus than my plan?”",
      primaryActionLabel: "Reply",
    },
  },
  {
    id: "evt-q-workshop-after",
    date: "14 Aug 2025",
    dateGroup: "14 AUG 2025",
    sortDate: "2025-08-14",
    actor: "client",
    type: "query",
    title: "Question after a workshop",
    summary: "“Can I get the slides from the Retirement Planning Workshop?”",
    status: "Pending",
    queryKind: "workshop-followup",
    queryAbout: "Workshop: Retirement Planning Workshop",
    linkLabel: "View query",
    detail: {
      heading: "CLIENT QUERY",
      fields: [
        { label: "Raised", value: "14 Aug 2025" },
        { label: "Status", value: "Pending" },
        { label: "About", value: "Workshop: Retirement Planning Workshop" },
      ],
      body: "“Can I get the slides from the Retirement Planning Workshop?”",
      primaryActionLabel: "Reply",
    },
  },
  {
    id: "evt-q-workshop-booking",
    date: "08 Aug 2025",
    dateGroup: "08 AUG 2025",
    sortDate: "2025-08-08",
    actor: "client",
    type: "query",
    title: "Workshop booking query",
    summary: "“Can I bring my spouse to the Goal Planning Workshop on 4 Oct?”",
    status: "Answered",
    queryKind: "workshop-booking",
    queryAbout: "Workshop: Goal Planning Workshop",
    linkLabel: "View query",
    detail: {
      heading: "CLIENT QUERY",
      fields: [
        { label: "Raised", value: "08 Aug 2025" },
        { label: "Status", value: "Answered" },
        { label: "About", value: "Workshop: Goal Planning Workshop" },
      ],
      body: "“Can I bring my spouse to the Goal Planning Workshop on 4 Oct?”",
      primaryActionLabel: "Reply",
    },
  },
];

/** Newest first, whatever order they were written in, so the day groups come out right. */
export const TIMELINE_EVENTS: TimelineEvent[] = [...RAW_TIMELINE_EVENTS].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

export const TIMELINE_FILTERS: { key: string; label: string; group: "actor" | "type" }[] = [
  { key: "client", label: "Client", group: "actor" },
  { key: "advisor", label: "Advisor", group: "actor" },
  { key: "meeting", label: "Meetings", group: "type" },
  { key: "learning", label: "Learnings", group: "type" },
  { key: "simulation", label: "Simulations", group: "type" },
  { key: "workshop", label: "Workshops", group: "type" },
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
