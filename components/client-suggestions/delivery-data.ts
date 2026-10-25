/* ============================================================
   Delivery & approval — data model and guards

   Content Management runs jobs with different rules, and this
   file keeps them apart:

   1. Plan-linked content for subscribed clients — personalised,
      tied to the plan, and logged. Nothing goes out without the
      advisor's approval.
   2. Marketing content for leads who did not convert after the
      discovery call.
   3. Public content — social and website posts.

   The audience is chosen first and decides the rules. Content for
   one audience is never sent to another.

   Content has exactly four statuses — Draft, Needs fixes, Approved,
   Expired — derived from the review state. "Checked" means the
   automatic check ran; the advisor stays responsible, so the UI
   never says "compliant".
   ============================================================ */

import {
  LEARNING_FORMAT_LABEL,
  openIssueCount,
  type ComplianceCheckId,
  type ComplianceIssue,
  type ContentAudience,
  type ContentIntent,
  type ContentItem,
  type LearningFormat,
} from "./content-data";

export type { ContentAudience, ContentIntent };

/* ---- Today, for review-by dates ---- */

/** Fixed "today" for the prototype, matching the rest of Content Management. */
const TODAY = new Date("2026-09-18");

/** PLACEHOLDER — how long an approval lasts before re-review. The interval is meant to be
    configurable in Settings; 12 months is a stand-in, not a rule. */
export const REVIEW_INTERVAL_MONTHS = 12;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** The date an approval lapses: the explicit review-by date, or approval plus the interval. */
export function reviewByDate(item: ContentItem): Date | null {
  const explicit = item.reviewBy ? new Date(item.reviewBy) : null;
  if (explicit && !isNaN(explicit.getTime())) return explicit;
  const approvedAt = item.compliance.approvedAt ? new Date(item.compliance.approvedAt) : null;
  if (!approvedAt || isNaN(approvedAt.getTime())) return null;
  const d = new Date(approvedAt);
  d.setMonth(d.getMonth() + REVIEW_INTERVAL_MONTHS);
  return d;
}

export const reviewByLabel = (item: ContentItem) => {
  const d = reviewByDate(item);
  return d ? formatDate(d) : "—";
};

/* ---- The four statuses ---- */

export type ContentStatus = "draft" | "needs-fixes" | "approved" | "expired";

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  "needs-fixes": "Needs fixes",
  approved: "Approved",
  expired: "Expired",
};

/** Draft: not yet approved and nothing flagged (including checked content waiting on the
    advisor). Needs fixes: checked, with open flags. Approved: the advisor approved it and
    the review-by date has not passed. Expired: approved, but past its review-by date. */
export function contentStatus(item: ContentItem): ContentStatus {
  const review = item.compliance;
  if (review.status === "approved-for-use") {
    const due = reviewByDate(item);
    return due && due.getTime() < TODAY.getTime() ? "expired" : "approved";
  }
  return openIssueCount(review) > 0 || review.status === "changes-required" ? "needs-fixes" : "draft";
}

/** Open flags that stop approval — advisory flags don't. */
export const blockingOpenCount = (item: ContentItem) =>
  item.compliance.issues.filter((i) => i.resolution === "open" && issueSeverity(i) === "blocking").length;

/* ---- Audience ---- */

export const audienceOf = (item: ContentItem): ContentAudience => item.forAudience ?? "clients";

export const CONTENT_AUDIENCE_LABEL: Record<ContentAudience, string> = {
  clients: "Subscribed clients",
  leads: "Leads",
  public: "Public",
};

export const CONTENT_AUDIENCE_TAG: Record<ContentAudience, string> = {
  clients: "Clients",
  leads: "Leads",
  public: "Public",
};

export const CONTENT_AUDIENCE_HINT: Record<ContentAudience, string> = {
  clients: "Plan-linked, personalised content",
  leads: "Marketing for prospects who haven't converted",
  public: "Social and website content",
};

/* ---- Who may receive what ---- */

const isApproved = (item: ContentItem) => contentStatus(item) === "approved";

/** Only Approved content, written for subscribed clients, can be sent to a client. */
export const isSendableToClients = (item: ContentItem) => isApproved(item) && audienceOf(item) === "clients";

/** Only Approved content, written for leads, can go into a nurture sequence. */
export const isSendableToLeads = (item: ContentItem) => isApproved(item) && audienceOf(item) === "leads";

/** Why content can't be sent to this audience right now — shown next to greyed-out items. */
export function holdReason(item: ContentItem, to: ContentAudience = "clients"): string | null {
  const status = contentStatus(item);
  if (status === "needs-fixes") {
    const n = openIssueCount(item.compliance);
    return n > 0 ? `Needs fixes — ${n} open flag${n === 1 ? "" : "s"}` : "Needs fixes";
  }
  if (status === "draft") return "Draft — not approved yet";
  if (status === "expired") return "Expired — needs re-review";
  if (audienceOf(item) !== to) return `For ${CONTENT_AUDIENCE_LABEL[audienceOf(item)].toLowerCase()}, not ${CONTENT_AUDIENCE_LABEL[to].toLowerCase()}`;
  return null;
}

/* ---- Learn or Explore — never "Advice" ---- */

export const CONTENT_INTENT_LABEL: Record<ContentIntent, string> = {
  learn: "Learn",
  explore: "Explore",
};

/** The advisor's choice, or by default: simulations let the client explore, the rest teach. */
export const contentIntent = (item: ContentItem): ContentIntent =>
  item.intent ?? (item.category === "simulation" ? "explore" : "learn");

export const isAiLabelled = (item: ContentItem) => Boolean(item.aiAssisted) || item.createdVia === "finny";

/* ---- One canonical type list ---- */

export type ContentTypeKey = LearningFormat | "simulation" | "workshop";

export const CONTENT_TYPE_LABEL: Record<ContentTypeKey, string> = {
  ...LEARNING_FORMAT_LABEL,
  simulation: "Simulation",
  workshop: "Workshop",
};

/** The Create modal and the Library type filter both read this list, so they cannot drift. */
export const CONTENT_TYPE_GROUPS: { group: string; types: ContentTypeKey[] }[] = [
  { group: "Learning", types: ["learning-path", "course", "video", "pdf"] },
  { group: "Interactive", types: ["simulation"] },
  { group: "Live", types: ["workshop"] },
  { group: "Marketing", types: ["image-post", "presentation"] },
  { group: "Communication", types: ["message"] },
];

export const CONTENT_TYPE_KEYS = CONTENT_TYPE_GROUPS.flatMap((g) => g.types);

export const contentTypeKey = (item: ContentItem): ContentTypeKey =>
  item.category === "learning" ? item.format : item.category;

/** Types that don't apply to the chosen audience are shown disabled, with the reason. */
export function typeDisabledReason(type: ContentTypeKey, audience: ContentAudience): string | null {
  if (type === "simulation" && audience !== "clients") return "Subscribed clients only";
  if ((type === "image-post" || type === "presentation") && audience === "clients") return "Leads or public only";
  return null;
}

/* ---- Checks ---- */

export type FlagSeverity = "blocking" | "advisory";

/** PLACEHOLDER mapping — which flags block approval. Rules must be confirmed with a
    compliance professional before this ships. */
const BLOCKING_CHECKS: ComplianceCheckId[] = [
  "guaranteed-return-language",
  "performance-claims",
  "risk-language",
  "registration-information",
];

export const issueSeverity = (issue: ComplianceIssue): FlagSeverity =>
  BLOCKING_CHECKS.includes(issue.checkId) ? "blocking" : "advisory";

export interface TypeCheck {
  id: string;
  label: string;
  /** The automatic check this reads from. Unset: the advisor confirms it. */
  source?: ComplianceCheckId;
}

/** PLACEHOLDER rules by type — to be confirmed with a compliance professional. */
export const CHECKS_BY_TYPE: Record<ContentTypeKey, TypeCheck[]> = {
  simulation: [
    { id: "illustrative", label: "Marked as illustrative", source: "disclosure-language" },
    { id: "assumptions", label: "Return assumptions disclosed", source: "disclosure-language" },
    { id: "no-guarantee", label: "No guaranteed outcomes", source: "guaranteed-return-language" },
  ],
  video: [
    { id: "disclaimer", label: "Risk disclaimer", source: "risk-language" },
    { id: "registration", label: "Registration number", source: "registration-information" },
    { id: "data-source", label: "Data source and date", source: "disclosure-language" },
    { id: "no-assured", label: "No assured returns", source: "guaranteed-return-language" },
  ],
  course: [],
  pdf: [],
  "learning-path": [],
  "image-post": [
    { id: "disclaimer", label: "Disclaimer", source: "risk-language" },
    { id: "registration", label: "Registration number", source: "registration-information" },
    { id: "no-performance", label: "No performance claims", source: "performance-claims" },
  ],
  presentation: [],
  workshop: [
    { id: "no-selling", label: "No product selling", source: "educational-vs-personalised" },
    { id: "fees", label: "Fees disclosed" },
    { id: "recording", label: "Recording stored" },
  ],
  message: [
    { id: "logged", label: "Logged to the client record" },
    { id: "advice-routed", label: "Recommendations routed to the Advice flow", source: "educational-vs-personalised" },
  ],
};
// Courses, PDFs and learning paths share the video checks; presentations share the image-post checks.
CHECKS_BY_TYPE.course = CHECKS_BY_TYPE.video;
CHECKS_BY_TYPE.pdf = CHECKS_BY_TYPE.video;
CHECKS_BY_TYPE["learning-path"] = CHECKS_BY_TYPE.video;
CHECKS_BY_TYPE.presentation = CHECKS_BY_TYPE["image-post"];

/* ---- Education versus advice guard ---- */

const ADVICE_PATTERN =
  /\b(you should (?:buy|sell|invest|switch|redeem|stop|increase|reduce)|we recommend|i recommend|buy|sell|redeem|switch (?:to|from)|stop your sip|increase your sip)\b/i;

/** Returns the phrase that reads as a recommendation, or null. A recommendation belongs
    in the Advice flow, where it is recorded as advice, not in an educational message. */
export function adviceLanguage(text: string): string | null {
  const match = text.match(ADVICE_PATTERN);
  return match ? match[0] : null;
}

const ASSURED_PATTERN = /\b(guaranteed|assured returns?|risk[- ]free|sure[- ]shot|no risk)\b/i;

/** The phrase that promises an outcome, or null — used by the automatic check. */
export function assuredReturnLanguage(text: string): string | null {
  const match = text.match(ASSURED_PATTERN);
  return match ? match[0] : null;
}

/* ---- Seed data for the prototype ---- */

const LEADS_ITEMS = ["ct-001", "ct-006", "ct-007", "ct-013"];
const PUBLIC_ITEMS = ["ct-014"];
/** Emergency Fund Essentials was approved a while ago and is now past its review-by date. */
const REVIEW_BY_OVERRIDES: Record<string, string> = { "ct-008": "01 Sep 2026" };

/** One advisory flag, so an item can be Needs fixes without being blocked from approval. */
const ADVISORY_FLAGS: Record<string, ComplianceIssue> = {
  "ct-012": {
    id: "iss-ct-012-1",
    checkId: "disclosure-language",
    title: "Return assumption isn't labelled",
    original: "Assumes an 11% annual return throughout",
    suggestion: "Add “Illustrative — assumes 11% a year; actual returns will differ.” beside the result.",
    location: "Result panel · assumptions line",
    resolution: "open",
  },
};

/** Applies audience, review-by dates and a sample advisory flag to the base content for the prototype. */
export function seedContentItems(items: ContentItem[]): ContentItem[] {
  return items.map((item) => {
    const flag = ADVISORY_FLAGS[item.id];
    return {
      ...item,
      forAudience: LEADS_ITEMS.includes(item.id) ? "leads" : PUBLIC_ITEMS.includes(item.id) ? "public" : "clients",
      reviewBy: REVIEW_BY_OVERRIDES[item.id],
      compliance: flag
        ? {
            ...item.compliance,
            status: "advisor-review-required",
            failedChecks: [...item.compliance.failedChecks, flag.checkId],
            issues: [...item.compliance.issues, flag],
          }
        : item.compliance,
    };
  });
}

/** Items that need the advisor's attention: Draft + Needs fixes. */
export const needsCheckCount = (items: ContentItem[]) =>
  items.filter((i) => ["draft", "needs-fixes"].includes(contentStatus(i))).length;

/* ---- Meetings and post-meeting packages ---- */

export interface MeetingRef {
  id: string;
  title: string;
  date: string;
}

export interface MeetingTemplate {
  id: string;
  /** What the meeting was for — the key that picks the template. */
  purpose: string;
  title: string;
  note: string;
  contentIds: string[];
}

export const MEETING_TEMPLATES: MeetingTemplate[] = [
  {
    id: "mt-quarterly",
    purpose: "Quarterly review",
    title: "Quarterly review follow-up",
    note: "Thank you for your time at our review. Here are a few resources to look through before we next speak, and a simulation to explore with your own numbers.",
    contentIds: ["ct-005", "ct-018"],
  },
  {
    id: "mt-plan",
    purpose: "Plan discussion",
    title: "Plan discussion follow-up",
    note: "It was good to walk through your plan together. These resources go over what we covered, so you can come back to any part of it.",
    contentIds: ["ct-004", "ct-015"],
  },
  {
    id: "mt-goals",
    purpose: "Goal and protection check-in",
    title: "Goal check-in follow-up",
    note: "Following our check-in, here is some material on the goals and protection topics we discussed.",
    contentIds: ["ct-009", "ct-010"],
  },
];

/** Recent meetings per client. A package links back to one of these. */
export const RECENT_MEETINGS: Record<string, MeetingRef[]> = {
  C12345: [
    { id: "mtg-2041", title: "Plan Discussion", date: "16 Sep 2026" },
    { id: "mtg-1987", title: "Quarterly Review", date: "12 Jun 2026" },
  ],
  C12346: [{ id: "mtg-2038", title: "Quarterly Review", date: "10 Sep 2026" }],
  C12347: [{ id: "mtg-2033", title: "Plan Discussion", date: "05 Sep 2026" }],
  C12348: [{ id: "mtg-2029", title: "Goal Check-in", date: "01 Sep 2026" }],
};

/* ---- Review queue — AI-suggested sends waiting for the advisor ---- */

export type SendTrigger = "meeting-follow-up" | "client-query" | "difficulty-detected" | "portfolio-drop";

export const SEND_TRIGGER_LABEL: Record<SendTrigger, string> = {
  "meeting-follow-up": "Meeting follow-up",
  "client-query": "Client query",
  "difficulty-detected": "Difficulty detected",
  "portfolio-drop": "Portfolio drop",
};

export interface ReviewQueueItem {
  id: string;
  clientId: string;
  trigger: SendTrigger;
  raisedAt: string;
  /** What Finny saw — shown so the advisor can judge the suggestion. */
  evidence: string[];
  contentIds: string[];
  message: string;
  meeting?: MeetingRef;
}

export const REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    id: "rq-1",
    clientId: "C12345",
    trigger: "meeting-follow-up",
    raisedAt: "Today · 9:10 AM",
    evidence: [
      "Plan Discussion held on 16 Sep — retirement target moved from age 60 to 58",
      "Retirement goal is now 8% behind the earlier projection",
    ],
    contentIds: ["ct-005", "ct-018"],
    message:
      "Thank you for your time on Wednesday. Here are two resources on the retirement timeline we discussed, so you can look at the numbers yourself before we meet again.",
    meeting: { id: "mtg-2041", title: "Plan Discussion", date: "16 Sep 2026" },
  },
  {
    id: "rq-2",
    clientId: "C12346",
    trigger: "client-query",
    raisedAt: "Yesterday · 6:32 PM",
    evidence: ["Asked in chat on 17 Sep: “How does the ELSS lock-in work?”", "No tax-saving content has been shared with this client yet"],
    contentIds: ["ct-003"],
    message: "You asked about the ELSS lock-in. This short piece explains how it works and where it fits in tax planning.",
  },
  {
    id: "rq-3",
    clientId: "C12347",
    trigger: "difficulty-detected",
    raisedAt: "Yesterday · 11:05 AM",
    evidence: [
      "Stopped at step 2 of Retirement Basics, 9 days ago",
      "Opened the SIP step-up simulation 3 times without saving a result",
    ],
    contentIds: ["ct-015"],
    message: "If the retirement material felt dense, this course starts from the basics of goal-based investing and builds up step by step.",
  },
  {
    id: "rq-4",
    clientId: "C12348",
    trigger: "portfolio-drop",
    raisedAt: "Today · 8:45 AM",
    evidence: [
      "Connected portfolio is down 6.4% over 5 days (Nifty 50: down 4.1%)",
      "Client connected accounts and consented to monitoring on 02 Jun 2026",
    ],
    contentIds: ["ct-016", "ct-015"],
    message:
      "Markets have been uneven this week. This short explainer looks at how corrections have played out over time. I'm glad to talk it through whenever you like.",
  },
];

/** Triggers Finny raised but did not queue — shown so the advisor knows why. */
export const SKIPPED_TRIGGERS = [
  {
    id: "sk-1",
    clientName: "Rahul Singh",
    trigger: "portfolio-drop" as SendTrigger,
    reason: "Accounts not connected — no consent for portfolio monitoring",
  },
];

/* ---- Marketing — leads who did not convert after the discovery call ---- */

export interface NurtureStep {
  /** Days after the lead joins the sequence. */
  day: number;
  contentId: string;
  /** Results so far, across every lead who has reached this step. */
  sent: number;
  opened: number;
}

export interface NurtureLead {
  id: string;
  name: string;
  /** Where the lead came from, e.g. the discovery call. */
  source: string;
  joined: string;
  /** Messages already sent to them. The next one is steps[sentCount]. */
  sentCount: number;
  nextSend: string | null;
  /** The advisor paused this lead only; the rest of the loop carries on. */
  held?: boolean;
  /** Messages the advisor skipped for this lead (counted in sentCount, never sent). */
  skipped?: number;
  /** The lead opted out. Final: the advisor cannot resume them. */
  optedOut?: boolean;
}

export interface NurtureSequence {
  id: string;
  name: string;
  description: string;
  /** Who joins, in plain words. */
  audience: string;
  leads: number;
  converted: number;
  /** "scheduled": created by the advisor, not started yet. */
  status: "active" | "paused" | "scheduled";
  /** Scheduled loops only: the day Day 1 goes out (YYYY-MM-DD) and the time of day (HH:mm). */
  startsOn?: string;
  sendTime?: string;
  steps: NurtureStep[];
  /** Every lead inside, most recent first. Filled in by `withLeads` below. */
  leadList: NurtureLead[];
}

const RAW_SEQUENCES: NurtureSequence[] = [
  {
    id: "ns-1",
    name: "After discovery — retirement focus",
    description: "Three short messages that build the case for starting a retirement plan.",
    audience: "Leads whose discovery call centred on retirement",
    leads: 14,
    converted: 3,
    status: "active",
    steps: [
      { day: 2, contentId: "ct-001", sent: 17, opened: 12 },
      { day: 7, contentId: "ct-006", sent: 11, opened: 6 },
      { day: 14, contentId: "ct-013", sent: 5, opened: 2 },
    ],
    leadList: [],
  },
  {
    id: "ns-2",
    name: "After discovery — getting started",
    description: "For people who wanted to start investing but did not subscribe yet.",
    audience: "Leads who wanted to start investing",
    leads: 9,
    converted: 1,
    status: "paused",
    steps: [
      { day: 3, contentId: "ct-006", sent: 10, opened: 5 },
      { day: 10, contentId: "ct-001", sent: 6, opened: 3 },
      { day: 21, contentId: "ct-007", sent: 2, opened: 1 },
    ],
    leadList: [],
  },
];

const LEAD_NAMES = [
  "Karan Singh", "Devang Shah", "Rahul Verma", "Kiran Bhat", "Pallavi Naik", "Tanvi Deshpande", "Amit Rathore",
  "Soumya Pillai", "Harsha Reddy", "Nisha Menon", "Vivek Anand", "Charu Bansal", "Deepti Shah", "Gaurav Mehra",
  "Ishita Roy", "Jatin Kapoor", "Lavanya Iyer", "Mukesh Tiwari", "Namrata Sen", "Omkar Joshi", "Preeti Nair", "Rohan Dutta",
];

/* Spread each sequence's leads across its schedule, newest first, so every state
   (waiting, mid-way, finished) appears. Deterministic: no randomness. */
function withLeads(seq: NurtureSequence, offset: number, paused: boolean): NurtureSequence {
  const n = seq.steps.length;
  const leadList: NurtureLead[] = Array.from({ length: seq.leads }, (_, i) => {
    const sentCount = Math.min(n, Math.floor((i * (n + 1)) / seq.leads));
    const joinedDay = 15 - Math.floor((i * 28) / seq.leads);
    return {
      id: `${seq.id}-ld-${i + 1}`,
      name: LEAD_NAMES[(i + offset) % LEAD_NAMES.length],
      source: "Discovery call",
      joined: joinedDay > 0 ? `${String(joinedDay).padStart(2, "0")} Oct` : `${String(30 + joinedDay).padStart(2, "0")} Sep`,
      sentCount,
      nextSend: sentCount >= n ? null : `${String(18 + (i % 9)).padStart(2, "0")} Oct`,
    };
  });
  return { ...seq, leadList, status: paused ? "paused" : seq.status };
}

export const NURTURE_SEQUENCES: NurtureSequence[] = RAW_SEQUENCES.map((s, i) => withLeads(s, i * 5, s.status === "paused"));

/** Rules every sequence follows. Shown on the page so advisors can see what is guaranteed. */
export const NURTURE_RULES = [
  "Stops automatically when a lead subscribes",
  "Every message carries an opt-out link",
  "Cannot be sent to subscribed clients",
  "Only Approved content written for leads can be added",
];
