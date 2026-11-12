/* ============================================================
   Home — cross-pipeline summary.
   Every number here is computed from the same data the Reports,
   Meetings and Leads pages themselves render, so Home can never
   claim something those pages contradict (same discipline as
   Leads' CONVERSION_BRIEF — see AiConversionBrief.tsx).
   ============================================================ */

import { REPORTS, matchesSavedView, sortReportsByUrgency, workPlanReports } from "@/components/report-queue/data";
import { MEETINGS, MEETING_ATTENTION_STATS } from "@/components/meeting-desk/data";
import { PIPELINE_LEADS } from "@/components/leads/pipeline-data";
import { CLIENTS, CONTENT_ITEMS, TOPIC_LABEL, type Client, type Topic, type WorkshopContent } from "@/components/client-suggestions/content-data";
import type { AIInsight } from "@/components/finny/ai-pattern";
import type { PlanTier } from "@/components/report-queue/data";
import { REVIEW_QUEUE, needsCheckCount, seedContentItems } from "@/components/client-suggestions/delivery-data";
import { estimateMinutes, planReason } from "@/components/report-queue/data";

/** The prototype's fixed "today" (matches MOCK_TODAY / MEETINGS_TODAY). */
export const HOME_TODAY_LABEL = "Monday, 19 May 2025";

/* ---- Reports ---- */
const reportsNeedingAttention = REPORTS.filter((r) => matchesSavedView(r, "needs-attention"));
const reportsBlockingMeetings = REPORTS.filter((r) => matchesSavedView(r, "meeting-blockers"));

/* ---- Meetings ---- */
const meetingsNeedingPrep = MEETINGS.filter((m) => m.status === "needs-prep");

/* ---- Leads ---- */
const staleLeads = PIPELINE_LEADS.filter((l) => l.lastActivitySort >= 5);
const leadsNeedingFollowup = PIPELINE_LEADS.filter((l) => l.stage === "needs-followup");

export type HomeInsightId = "meeting-blockers" | "needs-attention" | "needs-prep" | "stale-leads";

/** Where clicking an insight should take the advisor. */
export const HOME_INSIGHT_HREF: Record<HomeInsightId, string> = {
  "meeting-blockers": "/reports",
  "needs-attention": "/reports",
  "needs-prep": "/meetings",
  "stale-leads": "/leads",
};

/** Ranked high → low; only real, non-zero conditions make the list, same
    rule the Leads/Meetings KPI cards follow ("what's next" is computed,
    never decorative). */
export const HOME_INSIGHTS: AIInsight[] = [
  reportsBlockingMeetings.length > 0 && {
    id: "meeting-blockers",
    severity: "high",
    primary: `${reportsBlockingMeetings.length} report${reportsBlockingMeetings.length === 1 ? "" : "s"} blocking an upcoming meeting`,
    supporting: `Next: ${sortReportsByUrgency(reportsBlockingMeetings)[0].client.name}, ${sortReportsByUrgency(reportsBlockingMeetings)[0].reviewBy.label}`,
  },
  reportsNeedingAttention.length > 0 && {
    id: "needs-attention",
    severity: "high",
    primary: `${reportsNeedingAttention.length} report${reportsNeedingAttention.length === 1 ? "" : "s"} flagged with data gaps or compliance issues`,
    supporting: "Review Reports to resolve before they reach the client.",
  },
  meetingsNeedingPrep.length > 0 && {
    id: "needs-prep",
    severity: "medium",
    primary: `${meetingsNeedingPrep.length} meeting${meetingsNeedingPrep.length === 1 ? "" : "s"} without a ready pre-meeting brief`,
    supporting: `Today: ${MEETING_ATTENTION_STATS.today} meeting${MEETING_ATTENTION_STATS.today === 1 ? "" : "s"} scheduled.`,
  },
  staleLeads.length > 0 && {
    id: "stale-leads",
    severity: "low",
    primary: `${staleLeads.length} lead${staleLeads.length === 1 ? "" : "s"} stale for 5+ days`,
    supporting: `${leadsNeedingFollowup.length} already flagged as needing follow-up.`,
  },
].filter((x): x is AIInsight => Boolean(x));

/* ---- Today's meetings ---- */

export const TODAYS_MEETINGS = MEETINGS.filter((m) => m.dateLabel.startsWith("Today"));

/* ---- Today's Work Plan — a read-only preview of the same work-plan set
   the Reports page's My Work Plan builds from (workPlanReports), capped to
   the top items by urgency. Opening the full plan (with reorder) stays on
   /reports — Home only launches into it. ---- */

export const TODAYS_WORK_PLAN = workPlanReports(REPORTS).slice(0, 4);

/* ---- Client engagement, by subscription tier ----
   Tier totals are real and constant (the same 14-client roster
   Reports/Meetings share: 7 Gold, 4 Platinum, 3 Silver) — the roster
   doesn't change with the filter. What moves per Week/Month/Year is
   the engagement band within each tier: a shorter look-back window
   is a stricter bar (fewer clients have had enough touchpoints yet to
   count as Highly Engaged), a longer one is more generous. All three
   are this feature's own authored data — there's no cross-client
   engagement score computed anywhere else yet — but every band still
   sums to that real tier total, for every period. */

export interface TierEngagement {
  tier: PlanTier;
  highlyEngaged: number;
  engaged: number;
  needsAttention: number;
}

export type EngagementPeriod = "week" | "month" | "year";

export const ENGAGEMENT_PERIOD_LABEL: Record<EngagementPeriod, string> = {
  week: "Week",
  month: "Month",
  year: "Year",
};

export const ENGAGEMENT_BY_TIER_BY_PERIOD: Record<EngagementPeriod, TierEngagement[]> = {
  week: [
    { tier: "Platinum", highlyEngaged: 1, engaged: 2, needsAttention: 1 },
    { tier: "Gold", highlyEngaged: 2, engaged: 3, needsAttention: 2 },
    { tier: "Silver", highlyEngaged: 0, engaged: 2, needsAttention: 1 },
  ],
  month: [
    { tier: "Platinum", highlyEngaged: 2, engaged: 2, needsAttention: 0 },
    { tier: "Gold", highlyEngaged: 3, engaged: 3, needsAttention: 1 },
    { tier: "Silver", highlyEngaged: 1, engaged: 1, needsAttention: 1 },
  ],
  year: [
    { tier: "Platinum", highlyEngaged: 3, engaged: 1, needsAttention: 0 },
    { tier: "Gold", highlyEngaged: 4, engaged: 2, needsAttention: 1 },
    { tier: "Silver", highlyEngaged: 1, engaged: 2, needsAttention: 0 },
  ],
};

export const ENGAGEMENT_TOTAL_CLIENTS = ENGAGEMENT_BY_TIER_BY_PERIOD.month.reduce(
  (sum, t) => sum + t.highlyEngaged + t.engaged + t.needsAttention,
  0
);

/* ---- Client queries ---- */

export interface ClientQuery {
  id: string;
  clientName: string;
  initials: string;
  date: string;
  question: string;
  status: "pending" | "answered";
  /** Present only once answered. */
  reply?: string;
}

export const CLIENT_QUERIES: ClientQuery[] = [
  {
    id: "q1",
    clientName: "Anika Rao",
    initials: "AR",
    date: "18 May",
    question: "Can my retirement target change if I retire at 58 instead of 60?",
    status: "pending",
  },
  {
    id: "q2",
    clientName: "Sanjay Patel",
    initials: "SP",
    date: "17 May",
    question: "Is the revised SIP amount already reflected in this month's statement?",
    status: "pending",
  },
  {
    id: "q4",
    clientName: "Rohan Kumar",
    initials: "RK",
    date: "16 May",
    question: "Does the blueprint already account for the retirement age preference I shared last week?",
    status: "pending",
  },
  {
    id: "q3",
    clientName: "Meera Nair",
    initials: "MN",
    date: "15 May",
    question: "Could you confirm if my equity allocation changed after the April review?",
    status: "answered",
    reply: "No changes were made — allocation remains at 60/40 as agreed.",
  },
  {
    id: "q5",
    clientName: "Kavya Shah",
    initials: "KS",
    date: "14 May",
    question: "Will the tax planning report cover HRA exemptions too?",
    status: "answered",
    reply: "Yes — both HRA and 80C deductions are included in the draft.",
  },
  {
    id: "q6",
    clientName: "Neha Suri",
    initials: "NS",
    date: "13 May",
    question: "Can I see the early-retirement numbers before our review?",
    status: "answered",
    reply: "Sharing the simulation output a day ahead of our meeting.",
  },
  {
    id: "q7",
    clientName: "Deepak Malhotra",
    initials: "DM",
    date: "12 May",
    question: "Is my risk profile still accurate after the recent market swings?",
    status: "answered",
    reply: "Yes — the compliance-cleared reassessment confirms it's unchanged.",
  },
  { id: "q8", clientName: "Kavitha Reddy", initials: "KR", date: "17 May", question: "Should I move my fixed deposit maturity into the retirement plan?", status: "pending" },
  { id: "q9", clientName: "Suresh Kumar", initials: "SK", date: "18 May", question: "Does the insurance review change my retirement date estimate?", status: "pending" },
  { id: "q10", clientName: "Deepak Mehta", initials: "DM", date: "15 May", question: "Can I split my yearly tax-saving amount across two funds?", status: "pending" },
  { id: "q11", clientName: "Priya Sharma", initials: "PS", date: "18 May", question: "When will my next review meeting be confirmed?", status: "pending" },
  { id: "q12", clientName: "Nikhil Bose", initials: "NB", date: "14 May", question: "How long does my query support run after the first month?", status: "pending" },
  { id: "q13", clientName: "Arjun Nair", initials: "AN", date: "17 May", question: "Which workshop is best for someone just starting to invest?", status: "pending" },
];

/* ---- Upcoming workshops ----
   Pulled directly from the Content Management library (CONTENT_ITEMS) —
   workshops that haven't finished running yet (scheduled or still in
   draft), so "materials preparation status" is a real compliance-review
   state, not a field invented just for this card. */

export const UPCOMING_WORKSHOPS = CONTENT_ITEMS.filter(
  (item): item is WorkshopContent => item.category === "workshop" && item.publication !== "published" && item.publication !== "archived"
);

/* ---- Query urgency ----
   How long a query has waited against the reply target for the client's subscription. Shared by the
   Client Queries card and the work plan. The targets are placeholders (same day, one day, two days)
   until real service levels are set. "Today" is the newest query, since the sample queries carry no year. */
export const QUERY_TARGET_DAYS: Record<PlanTier, number> = { Platinum: 0, Gold: 1, Silver: 2 };
export type QueryLevel = "overdue" | "due-today" | "on-track";
export const queryDayNumber = (date: string) => Math.floor(new Date(`${date} 2026`).getTime() / 86_400_000);
const QUERIES_TODAY_DAY = Math.max(...CLIENT_QUERIES.map((q) => queryDayNumber(q.date)));

export function queryLevel(query: ClientQuery): QueryLevel | null {
  const plan = planOfClient(query.clientName);
  if (!plan) return null;
  const waiting = QUERIES_TODAY_DAY - queryDayNumber(query.date);
  const target = QUERY_TARGET_DAYS[plan];
  return waiting > target ? "overdue" : waiting === target ? "due-today" : "on-track";
}

/** The subscription tier a client query came from, read from the report and client records. */
export function planOfClient(name: string): PlanTier | null {
  return REPORTS.find((r) => r.client.name === name)?.client.plan ?? CLIENTS.find((c) => c.name === name)?.plan ?? null;
}

/* ---- Silver clients who could move up ----
   The advisory plan is small by design: one or two small goals, a month of query support, then
   promotional messages with content and workshop links. A Silver client who outgrows that shows it
   in how they use the service, so Finny reads five signals from data the app already holds:

     1. Goals beyond the plan   a goal like retirement, tax, insurance, or wealth building
     2. Steady engagement       active or highly engaged
     3. Reading and joining     has started, finished or registered for content or a workshop
     4. Asking questions        has a query in the Client Queries list
     5. Past the first month    the included query support has ended, the natural moment to talk

   Two or more of them, with the client not inactive, marks a client worth a wealth management
   conversation. It is a prompt for the advisor, not a decision. */

const BIGGER_GOALS = new Set<Topic>(["retirement", "wealth-creation", "child-education", "home-purchase", "insurance", "tax-planning"]);
const ACTIVE_CONTENT_STATES = new Set(["Completed", "Started", "Attended", "Registered"]);
const queriedNames = new Set(CLIENT_QUERIES.map((q) => q.clientName));

const contentTouches = new Map<string, number>();
for (const item of CONTENT_ITEMS) {
  for (const c of item.engagement.clients) {
    if (ACTIVE_CONTENT_STATES.has(c.state)) contentTouches.set(c.clientId, (contentTouches.get(c.clientId) ?? 0) + 1);
  }
}

export interface SilverOpportunity {
  client: Client;
  signals: string[];
}

function upgradeSignals(c: Client): string[] {
  const out: string[] = [];
  const big = c.goals.find((g) => BIGGER_GOALS.has(g));
  if (big) out.push(`Goal beyond the plan: ${TOPIC_LABEL[big].toLowerCase()}`);
  else if (c.goals.length > 2) out.push("More goals than the plan covers");
  if (c.engagement === "highly-engaged" || c.engagement === "active") out.push("Steadily engaged");
  if ((contentTouches.get(c.id) ?? 0) > 0) out.push("Reading and joining sessions");
  if (queriedNames.has(c.name)) out.push("Asking questions");
  if (!c.advisoryContext.includes("new-client")) out.push("Past the first month");
  return out;
}

export const SILVER_CLIENTS = CLIENTS.filter((c) => c.plan === "Silver");
export const SILVER_ENGAGED = SILVER_CLIENTS.filter((c) => c.engagement === "highly-engaged" || c.engagement === "active");

/** Strongest first. */
export const SILVER_OPPORTUNITIES: SilverOpportunity[] = SILVER_CLIENTS.map((client) => ({ client, signals: upgradeSignals(client) }))
  .filter((o) => o.signals.length >= 2 && o.client.engagement !== "inactive")
  .sort((a, b) => b.signals.length - a.signals.length);

/* ---- Clients by plan, and Silver plans that are ending ----
   Silver is the advisory plan (one or two small goals, a month of query support, then promotional
   messages); Gold and Platinum are wealth management. The tier counts are the same advisor-specified
   numbers the client mix chart uses, so the two cannot disagree. The plan end dates and the
   "approached" history are authored for the sample Silver clients: nothing in the app tracks a plan's
   end date or an approach after it yet. */

export const CLIENTS_BY_PLAN: Record<PlanTier, number> = { Platinum: 34, Gold: 36, Silver: 16 };

export interface SilverPlanRow {
  client: Client;
  /** Days until the plan ends; negative once it has ended. */
  endsInDays: number;
  /** Days since the advisor approached them after the plan ended, if they have. */
  approachedDaysAgo?: number;
}

const SILVER_PLAN_DATES: Record<string, { endsInDays: number; approachedDaysAgo?: number }> = {
  C12350: { endsInDays: 21 },
  C12354: { endsInDays: 6 },
  C12357: { endsInDays: -12, approachedDaysAgo: 9 },
  C12360: { endsInDays: -20, approachedDaysAgo: 14 },
  C12362: { endsInDays: 25 },
  C12366: { endsInDays: 4 },
  C12368: { endsInDays: -9, approachedDaysAgo: 5 },
  C12372: { endsInDays: -3 },
  C12376: { endsInDays: 14 },
  C12380: { endsInDays: 9 },
  C12384: { endsInDays: 7 },
  C12388: { endsInDays: -15, approachedDaysAgo: 10 },
  C12391: { endsInDays: 28 },
};

/** Days until a Silver client's plan ends (negative once it has), or null for any other client. */
export const silverPlanEndsInDays = (clientId: string): number | null => SILVER_PLAN_DATES[clientId]?.endsInDays ?? null;

const SILVER_PLAN_ROWS: SilverPlanRow[] = SILVER_CLIENTS.flatMap((client) => {
  const d = SILVER_PLAN_DATES[client.id];
  return d ? [{ client, ...d }] : [];
});

/** How soon counts as "going to end". */
export const PLAN_ENDING_WITHIN_DAYS = 10;
/** An approach with no reply for this long counts as gone stale. */
export const STALE_AFTER_DAYS = 7;

/** Plans ending in the next few days, soonest first. */
export const SILVER_ENDING_SOON = SILVER_PLAN_ROWS.filter((r) => r.endsInDays >= 0 && r.endsInDays <= PLAN_ENDING_WITHIN_DAYS).sort(
  (a, b) => a.endsInDays - b.endsInDays
);

/** Plans that ended, were approached, and have not answered for a week or more. Longest silent first. */
export const SILVER_NO_RESPONSE = SILVER_PLAN_ROWS.filter(
  (r) => r.endsInDays < 0 && r.approachedDaysAgo !== undefined && r.approachedDaysAgo >= STALE_AFTER_DAYS
).sort((a, b) => (b.approachedDaysAgo ?? 0) - (a.approachedDaysAgo ?? 0));

/* ---- Lead → wealth management funnel ----
   Two service tiers sit behind this: Silver clients are advisory clients, Gold and
   Platinum clients are wealth management clients. So the funnel runs Lead → Subscribed →
   Advisory client → Engaged → Wealth opportunity (an advisory client ready to be
   offered wealth management) → Wealth client (moved up to Gold or Platinum). The first
   three stages are the advisory journey, the last two the wealth management journey.

   For the "month" period, Lead and Client are real (PIPELINE_LEADS.length
   and the 14-client roster Reports/Meetings share); the stages between
   and after them — Subscribed, Engaged, Opportunity — don't have a
   computed source yet, so they're authored for this feature, same as
   before. The week/year variants scale that same shape up and down
   (smaller volume, similar conversion rates) rather than inventing an
   unrelated set of numbers — there's no per-period lead/client log to
   compute from yet. Trend-vs-previous-period is authored throughout;
   nothing in the app tracks period-over-period history yet either. */

export interface FunnelStage {
  id: string;
  label: string;
  description: string;
  count: number;
  /** What the conversion-from-previous-stage badge says, e.g.
      "converted to subscribed" — null only for the first stage. */
  conversionCaption: string | null;
  /** Percentage-point change vs the previous period; null for the
      first stage, which has nothing upstream to have changed. */
  trend: number | null;
}

export const WEALTH_OPPORTUNITY_FUNNEL_BY_PERIOD: Record<EngagementPeriod, FunnelStage[]> = {
  week: [
    { id: "lead", label: "Leads", description: "New inquiries", count: 7, conversionCaption: null, trend: null },
    { id: "client", label: "Advisory clients", description: "Onboarded on Silver", count: 3, conversionCaption: "became advisory clients", trend: 6 },
    { id: "engaged", label: "Engaged", description: "Active this period", count: 2, conversionCaption: "became engaged", trend: -4 },
    { id: "opportunity", label: "Wealth opportunity", description: "Ready for a wealth discussion", count: 1, conversionCaption: "ready for a wealth discussion", trend: 5 },
    { id: "wealth-client", label: "Wealth clients", description: "Moved up to Gold or Platinum", count: 0, conversionCaption: "moved up to wealth management", trend: 2 },
  ],
  month: [
    { id: "lead", label: "Leads", description: "New inquiries", count: PIPELINE_LEADS.length, conversionCaption: null, trend: null },
    { id: "client", label: "Advisory clients", description: "Onboarded on Silver", count: SILVER_CLIENTS.length, conversionCaption: "became advisory clients", trend: 12 },
    { id: "engaged", label: "Engaged", description: "Active this period", count: SILVER_ENGAGED.length, conversionCaption: "became engaged", trend: -6 },
    { id: "opportunity", label: "Wealth opportunity", description: "Ready for a wealth discussion", count: SILVER_OPPORTUNITIES.length, conversionCaption: "ready for a wealth discussion", trend: 10 },
    { id: "wealth-client", label: "Wealth clients", description: "Moved up to Gold or Platinum", count: 1, conversionCaption: "moved up to wealth management", trend: 4 },
  ],
  year: [
    { id: "lead", label: "Leads", description: "New inquiries", count: 340, conversionCaption: null, trend: null },
    { id: "client", label: "Advisory clients", description: "Onboarded on Silver", count: 165, conversionCaption: "became advisory clients", trend: 18 },
    { id: "engaged", label: "Engaged", description: "Active this period", count: 108, conversionCaption: "became engaged", trend: 4 },
    { id: "opportunity", label: "Wealth opportunity", description: "Ready for a wealth discussion", count: 46, conversionCaption: "ready for a wealth discussion", trend: 22 },
    { id: "wealth-client", label: "Wealth clients", description: "Moved up to Gold or Platinum", count: 21, conversionCaption: "moved up to wealth management", trend: 9 },
  ],
};

/* ---- Home KPI row ----
   Six advisor-facing summary cards. Where a number already has a real
   source elsewhere on this page, it's wired to that same source so it
   can't drift out of sync:
     - Today's Meetings:  count + "needs prep" from the real MEETINGS set
     - Client Queries:    count + unanswered from the real CLIENT_QUERIES set
     - Work Due Today:    the "reports" half from the real TODAYS_WORK_PLAN
     - Finny Insights:    CTA target from the real top-ranked HOME_INSIGHTS
   The rest (Active Clients, New Leads, and the headline Finny/Work-due
   counts) are advisor-specified figures with no computed source yet —
   kept exactly as given rather than silently reconciled to the smaller
   real numbers shown elsewhere (e.g. the 14-client roster below). */

const todaysMeetingsNeedingPrep = MEETINGS.filter((m) => m.dateLabel.startsWith("Today") && m.status === "needs-prep").length;
const queriesUnanswered = CLIENT_QUERIES.filter((q) => q.status === "pending").length;
const topInsightHref = HOME_INSIGHTS[0] ? HOME_INSIGHT_HREF[HOME_INSIGHTS[0].id as HomeInsightId] : "/reports";

export interface HomeKpiCard {
  id: "active-clients" | "new-leads" | "todays-meetings" | "client-queries" | "work-due-today" | "finny-insights";
  label: string;
  count: number;
  detail: string;
  cta: string;
  href: string;
  emphasis: "default" | "warning" | "ai";
}

export const HOME_KPI_CARDS: HomeKpiCard[] = [
  {
    id: "active-clients",
    label: "Active Clients",
    count: 86,
    detail: "+4 this quarter",
    cta: "View Clients",
    href: "/clients",
    emphasis: "default",
  },
  {
    id: "new-leads",
    label: "New Leads",
    count: 4,
    detail: "2 need follow-up",
    cta: "Open Pipeline",
    href: "/leads",
    emphasis: "warning",
  },
  {
    id: "todays-meetings",
    label: "Today's Meetings",
    count: MEETING_ATTENTION_STATS.today,
    detail: `${todaysMeetingsNeedingPrep} needs prep`,
    cta: "View Schedule",
    href: "/meetings",
    emphasis: todaysMeetingsNeedingPrep > 0 ? "warning" : "default",
  },
  {
    id: "client-queries",
    label: "Client Queries",
    count: CLIENT_QUERIES.length,
    detail: `${queriesUnanswered} unanswered`,
    cta: "View Queries",
    href: "#client-queries",
    emphasis: queriesUnanswered > 0 ? "warning" : "default",
  },
  {
    id: "work-due-today",
    label: "Work Due Today",
    count: 10,
    detail: `${TODAYS_WORK_PLAN.length} reports · 6 actions`,
    cta: "View Work Plan",
    href: "#todays-work-plan",
    emphasis: "warning",
  },
  {
    id: "finny-insights",
    label: "Finny Insights",
    count: 8,
    detail: "3 attention · 5 opportunities",
    cta: "Review",
    href: topInsightHref,
    emphasis: "ai",
  },
];

/* ---- Today's work plan ----
   An advisor's day is more than reports, so the plan mixes every kind of work, each read from the
   place it lives: reports to write, client queries to answer, content to send for compliance,
   Finny's suggested sends to approve, and leads to follow up. Minutes for everything but reports are
   placeholder estimates per item until the app tracks real effort. */

export type WorkKind = "report" | "queries" | "compliance" | "send" | "leads";

export interface WorkItem {
  id: string;
  kind: WorkKind;
  title: string;
  detail: string;
  minutes: number;
  href: string;
  /** Urgent items go first. */
  urgent: boolean;
}

const MINUTES_PER = { query: 4, draft: 5, send: 3, lead: 5 };

function buildWorkPlan(): WorkItem[] {
  const items: WorkItem[] = [];

  const topReport = TODAYS_WORK_PLAN[0];
  if (topReport) {
    const more = TODAYS_WORK_PLAN.length - 1;
    items.push({
      id: "w-report",
      kind: "report",
      title: topReport.reportName,
      detail: `${topReport.client.name} · ${planReason(topReport)}${more > 0 ? ` · +${more} more report${more === 1 ? "" : "s"}` : ""}`,
      minutes: TODAYS_WORK_PLAN.reduce((sum, r) => sum + estimateMinutes(r), 0),
      href: "/reports",
      urgent: true,
    });
  }

  const pendingQueries = CLIENT_QUERIES.filter((q) => q.status === "pending");
  if (pendingQueries.length > 0) {
    const overdue = pendingQueries.filter((q) => queryLevel(q) === "overdue").length;
    items.push({
      id: "w-queries",
      kind: "queries",
      title: `Reply to ${pendingQueries.length} client ${pendingQueries.length === 1 ? "query" : "queries"}`,
      detail: overdue > 0 ? `${overdue} overdue, Platinum and Gold first` : "Platinum and Gold first",
      minutes: pendingQueries.length * MINUTES_PER.query,
      href: "#client-queries",
      urgent: overdue > 0,
    });
  }

  const drafts = needsCheckCount(seedContentItems(CONTENT_ITEMS));
  if (drafts > 0) {
    items.push({
      id: "w-compliance",
      kind: "compliance",
      title: `Finish ${drafts} content ${drafts === 1 ? "draft" : "drafts"} and send for compliance`,
      detail: "Drafts and items with open flags",
      minutes: drafts * MINUTES_PER.draft,
      href: "/content-management",
      urgent: false,
    });
  }

  if (REVIEW_QUEUE.length > 0) {
    items.push({
      id: "w-send",
      kind: "send",
      title: `Approve ${REVIEW_QUEUE.length} suggested ${REVIEW_QUEUE.length === 1 ? "send" : "sends"}`,
      detail: "Finny's suggestions waiting for your decision",
      minutes: REVIEW_QUEUE.length * MINUTES_PER.send,
      href: "/content-management",
      urgent: false,
    });
  }

  const followUps = PIPELINE_LEADS.filter((l) => l.stage === "needs-followup").length;
  if (followUps > 0) {
    items.push({
      id: "w-leads",
      kind: "leads",
      title: `Follow up with ${followUps} ${followUps === 1 ? "lead" : "leads"}`,
      detail: "No details received within the buffer time",
      minutes: followUps * MINUTES_PER.lead,
      href: "/leads",
      urgent: false,
    });
  }

  /* Urgent first; within each group the order above stands. */
  return [...items].sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

export const HOME_WORK_PLAN: WorkItem[] = buildWorkPlan();
