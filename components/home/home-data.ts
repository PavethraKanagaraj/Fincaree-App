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
import { CONTENT_ITEMS, type WorkshopContent } from "@/components/client-suggestions/content-data";
import type { AIInsight } from "@/components/finny/ai-pattern";
import type { PlanTier } from "@/components/report-queue/data";

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
];

/* ---- Upcoming workshops ----
   Pulled directly from the Content Management library (CONTENT_ITEMS) —
   workshops that haven't finished running yet (scheduled or still in
   draft), so "materials preparation status" is a real compliance-review
   state, not a field invented just for this card. */

export const UPCOMING_WORKSHOPS = CONTENT_ITEMS.filter(
  (item): item is WorkshopContent => item.category === "workshop" && item.publication !== "published" && item.publication !== "archived"
);

/* ---- Lead → wealth-management-opportunity funnel ----
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
    { id: "subscribed", label: "Subscribed", description: "Started advisory", count: 4, conversionCaption: "converted to subscribed", trend: 3 },
    { id: "client", label: "Clients", description: "Onboarded", count: 3, conversionCaption: "converted to clients", trend: 6 },
    { id: "engaged", label: "Engaged", description: "Active this period", count: 2, conversionCaption: "became engaged", trend: -4 },
    { id: "opportunity", label: "Wealth Mgmt Opportunity", description: "Ready for wealth discussion", count: 1, conversionCaption: "visiting wealth management", trend: 5 },
  ],
  month: [
    { id: "lead", label: "Leads", description: "New inquiries", count: PIPELINE_LEADS.length, conversionCaption: null, trend: null },
    { id: "subscribed", label: "Subscribed", description: "Started advisory", count: 16, conversionCaption: "converted to subscribed", trend: 8 },
    { id: "client", label: "Clients", description: "Onboarded", count: ENGAGEMENT_TOTAL_CLIENTS, conversionCaption: "converted to clients", trend: 12 },
    { id: "engaged", label: "Engaged", description: "Active this period", count: 9, conversionCaption: "became engaged", trend: -6 },
    { id: "opportunity", label: "Wealth Mgmt Opportunity", description: "Ready for wealth discussion", count: 4, conversionCaption: "visiting wealth management", trend: 10 },
  ],
  year: [
    { id: "lead", label: "Leads", description: "New inquiries", count: 340, conversionCaption: null, trend: null },
    { id: "subscribed", label: "Subscribed", description: "Started advisory", count: 190, conversionCaption: "converted to subscribed", trend: 15 },
    { id: "client", label: "Clients", description: "Onboarded", count: 165, conversionCaption: "converted to clients", trend: 18 },
    { id: "engaged", label: "Engaged", description: "Active this period", count: 108, conversionCaption: "became engaged", trend: 4 },
    { id: "opportunity", label: "Wealth Mgmt Opportunity", description: "Ready for wealth discussion", count: 46, conversionCaption: "visiting wealth management", trend: 22 },
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
    href: "/client-profile",
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
