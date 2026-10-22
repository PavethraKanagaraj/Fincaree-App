/* ============================================================
   Lead Pipeline — mock data.
   Pre-plan-selection conversion journey only. Leads arrive from the
   Fincaree customer platform two ways: Fincaree suggests the advisor
   (the lead starts in Suggested until the advisor accepts), or the
   client books a Discovery Call themselves (the lead starts at
   Discovery Call). An advisor can also invite their own contacts; they wait in Invited until they join. Direct subscribers never appear here — they go
   straight to Clients. A lead leaves the board the moment they select
   a plan — KYC and onboarding belong to the Client Workspace.
   ============================================================ */

import { Sparkles, Send, Compass, MessageCircle, AlertTriangle, CheckCircle2, HandCoins, LucideIcon } from "lucide-react";

export type PipelineStageId =
  | "suggested"
  | "invited"
  | "discovery-call"
  | "awaiting-details"
  | "needs-followup"
  | "ready-for-advice"
  | "plan-discussion"
  | "decision-pending";

export type StageType = "inbound" | "touchpoint" | "client-action" | "attention" | "ready" | "decision";

export interface PipelineStageInfo {
  id: PipelineStageId;
  number: string;
  title: string;
  type: StageType;
  typeLabel: string;
  typeIcon: LucideIcon;
  subtitle: string;
  accent: string;
}

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  { id: "suggested", number: "01", title: "Suggested", type: "inbound", typeLabel: "New from Fincaree", typeIcon: Sparkles, subtitle: "Matched to you by Fincaree, not yet booked", accent: "var(--color-blue-600)" },
  { id: "invited", number: "02", title: "Invited", type: "client-action", typeLabel: "Client Action", typeIcon: Send, subtitle: "Invited by you, waiting for them to join", accent: "var(--color-blue-400)" },
  { id: "discovery-call", number: "03", title: "Discovery Call", type: "touchpoint", typeLabel: "Advisor Touchpoint", typeIcon: Compass, subtitle: "Booked, or being scheduled, with clients", accent: "var(--bg-brand-primary)" },
  { id: "awaiting-details", number: "04", title: "Awaiting Client Details", type: "client-action", typeLabel: "Client Action", typeIcon: HandCoins, subtitle: "Waiting for financial information", accent: "var(--color-grey-500)" },
  { id: "needs-followup", number: "05", title: "Needs Follow-up", type: "attention", typeLabel: "Needs Attention", typeIcon: AlertTriangle, subtitle: "No details received within buffer time", accent: "var(--color-warning-700)" },
  { id: "ready-for-advice", number: "06", title: "Ready for Advice", type: "ready", typeLabel: "Ready", typeIcon: CheckCircle2, subtitle: "Sufficient data to create a personalised plan", accent: "var(--color-success-700)" },
  { id: "plan-discussion", number: "07", title: "Plan Discussion", type: "touchpoint", typeLabel: "Advisor Touchpoint", typeIcon: MessageCircle, subtitle: "Financial Blueprint meetings", accent: "var(--bg-brand-primary)" },
  { id: "decision-pending", number: "08", title: "Decision Pending", type: "decision", typeLabel: "Decision", typeIcon: HandCoins, subtitle: "Plan shared, client considering", accent: "var(--color-error-500)" },
];

export function pipelineStageIndex(stage: PipelineStageId): number {
  return PIPELINE_STAGES.findIndex((s) => s.id === stage);
}

/* ---- Lead card — fields are stage-shaped, not one generic record.
   A Discovery Call card doesn't carry a completeness bar, and a
   Ready for Advice card doesn't carry a meeting time — each stage
   only fills the fields it actually has. ---- */

/** Where the lead came from. An own contact is invited by the advisor. Direct subscribers skip this pipeline and go straight to Clients. */
export type LeadSource = "suggested" | "self-booked" | "own-contact";

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  suggested: "Suggested by Fincaree",
  "self-booked": "Self-booked",
  "own-contact": "Own contact",
};

export interface PipelineLead {
  id: string;
  slug: string;
  name: string;
  initials: string;
  /** Primary goal — also what search, briefs and AI copy read. */
  goal: string;
  /** Every goal the lead named, primary first. Falls back to [goal]. */
  goals?: string[];
  timeline: string;
  stage: PipelineStageId;
  source: LeadSource;

  // suggested
  matchReasons?: string[];
  suggestedLabel?: string;

  // discovery-call / plan-discussion (meeting touchpoints)
  meetingLabel?: string;
  meetingFacts?: string[];

  // awaiting-details
  completedNote?: string;
  checklist?: string[];
  remindersSent?: number;

  // needs-followup
  noResponseNote?: string;
  lastActivityNote?: string;
  followUpAttempts?: number;

  // ready-for-advice
  readyChecklist?: string[];
  completeness?: number;

  // decision-pending
  planSharedNote?: string;
  decisionNote?: string;

  statusTag: string;
  ctaLabel: string;

  lastActivitySort: number; // days ago, for search/filter
  highIntent: boolean;
  meetingThisWeek: boolean;
}

/** All of a lead's goals, primary first. */
export function leadGoals(lead: PipelineLead): string[] {
  return lead.goals ?? (lead.goal ? [lead.goal] : []);
}

export const PIPELINE_LEADS: PipelineLead[] = [
  // ---- 01 Suggested (matched by Fincaree, awaiting advisor accept) ----
  { id: "S1", slug: "ritika-bose", name: "Ritika Bose", initials: "RB", goal: "Retirement", goals: ["Retirement", "Wealth building"], timeline: "20 yrs", stage: "suggested", source: "suggested", suggestedLabel: "Matched today, 8:40 AM", matchReasons: ["Retirement goal matches your focus", "Income range: ₹25–35L", "Moderate risk"], statusTag: "New today", ctaLabel: "Review match →", lastActivitySort: 0, highIntent: true, meetingThisWeek: false },
  { id: "S2", slug: "harsh-vora", name: "Harsh Vora", initials: "HV", goal: "Buy a home", timeline: "4 yrs", stage: "suggested", source: "suggested", suggestedLabel: "Matched today, 9:15 AM", matchReasons: ["Home purchase goal matches your focus", "Income range: ₹18–25L", "Conservative risk"], statusTag: "New today", ctaLabel: "Review match →", lastActivitySort: 0, highIntent: false, meetingThisWeek: false },
  { id: "S3", slug: "lavanya-pillai", name: "Lavanya Pillai", initials: "LP", goal: "Child's education", goals: ["Child's education", "Buy a home"], timeline: "9 yrs", stage: "suggested", source: "suggested", suggestedLabel: "Matched today, 10:05 AM", matchReasons: ["Education planning is in your top goals", "Income range: ₹20–30L", "Moderate risk"], statusTag: "New today", ctaLabel: "Review match →", lastActivitySort: 0, highIntent: false, meetingThisWeek: false },
  { id: "S4", slug: "dev-chawla", name: "Dev Chawla", initials: "DC", goal: "Wealth building", goals: ["Wealth building", "Buy a home", "Retirement"], timeline: "12 yrs", stage: "suggested", source: "suggested", suggestedLabel: "Matched yesterday, 5:30 PM", matchReasons: ["Wealth growth matches your focus", "Income range: ₹35–50L", "Aggressive risk"], statusTag: "Waiting 1 day", ctaLabel: "Review match →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },
  { id: "S5", slug: "isha-menon", name: "Isha Menon", initials: "IM", goal: "Retirement", timeline: "16 yrs", stage: "suggested", source: "suggested", suggestedLabel: "Matched yesterday, 2:10 PM", matchReasons: ["Retirement goal matches your focus", "Income range: ₹15–22L", "Conservative risk"], statusTag: "Waiting 1 day", ctaLabel: "Review match →", lastActivitySort: 1, highIntent: false, meetingThisWeek: false },

  // ---- 02 Invited (advisor's own contacts, waiting to join Fincaree) ----
  { id: "I1", slug: "nandini-rao", name: "Nandini Rao", initials: "NR", goal: "Retirement", timeline: "", stage: "invited", source: "own-contact", completedNote: "Invite sent · 2 days ago", checklist: ["Join Fincaree", "Complete profile", "Share consent"], remindersSent: 0, statusTag: "Invite sent", ctaLabel: "Resend invite →", lastActivitySort: 2, highIntent: false, meetingThisWeek: false },
  { id: "I2", slug: "farhan-qureshi", name: "Farhan Qureshi", initials: "FQ", goal: "", timeline: "", stage: "invited", source: "own-contact", completedNote: "Invite sent · 6 days ago", checklist: ["Join Fincaree", "Complete profile", "Share consent"], remindersSent: 1, statusTag: "Not opened yet", ctaLabel: "Resend invite →", lastActivitySort: 6, highIntent: false, meetingThisWeek: false },

  // ---- 03 Discovery Call ----
  { id: "P1", slug: "anita-thomas", name: "Anita Thomas", initials: "AT", goal: "Wealth building", goals: ["Wealth building", "Retirement", "Child's education"], timeline: "10 yrs", stage: "discovery-call", source: "self-booked", meetingLabel: "Today, 11:00 AM", meetingFacts: ["Moderate risk", "Income range: ₹15–25L"], statusTag: "High intent", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P2", slug: "arjun-nair", name: "Arjun Nair", initials: "AN", goal: "Buy a home", timeline: "5 yrs", stage: "discovery-call", source: "suggested", meetingLabel: "Today, 2:30 PM", meetingFacts: ["Conservative risk", "Income range: ₹10–15L"], statusTag: "First-time buyer", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: false, meetingThisWeek: true },
  { id: "P3", slug: "meera-iyer", name: "Meera Iyer", initials: "MI", goal: "Buy a home", goals: ["Buy a home", "Child's education"], timeline: "6 yrs", stage: "discovery-call", source: "self-booked", meetingLabel: "Tomorrow, 10:00 AM", meetingFacts: ["Moderate risk", "Income range: ₹20–30L"], statusTag: "Referred by client", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: false, meetingThisWeek: true },
  { id: "P4", slug: "rohit-sharma", name: "Rohit Sharma", initials: "RS", goal: "Wealth building", goals: ["Wealth building", "Retirement", "Buy a home"], timeline: "12 yrs", stage: "discovery-call", source: "self-booked", meetingLabel: "Today, 3:00 PM", meetingFacts: ["Aggressive risk", "Income range: ₹30–40L"], statusTag: "High intent", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P5", slug: "divya-menon", name: "Divya Menon", initials: "DM", goal: "Retirement", timeline: "18 yrs", stage: "discovery-call", source: "suggested", meetingLabel: "Fri, 19 Sep · 9:30 AM", meetingFacts: ["Conservative risk", "Income range: ₹15–25L"], statusTag: "Early planner", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: false, meetingThisWeek: true },
  { id: "P6", slug: "aman-gupta", name: "Aman Gupta", initials: "AG", goal: "Child's education", goals: ["Child's education", "Wealth building"], timeline: "8 yrs", stage: "discovery-call", source: "self-booked", meetingLabel: "Mon, 22 Sep · 1:00 PM", meetingFacts: ["Moderate risk", "Income range: ₹25–35L"], statusTag: "New parent", ctaLabel: "Prepare for meeting →", lastActivitySort: 2, highIntent: false, meetingThisWeek: true },
  { id: "P7", slug: "pooja-reddy", name: "Pooja Reddy", initials: "PR", goal: "Buy a home", timeline: "4 yrs", stage: "discovery-call", source: "self-booked", meetingLabel: "Wed, 24 Sep · 11:30 AM", meetingFacts: ["Moderate risk", "Income range: ₹18–28L"], statusTag: "Comparing advisors", ctaLabel: "Prepare for meeting →", lastActivitySort: 2, highIntent: false, meetingThisWeek: true },
  { id: "P8", slug: "sameer-khan", name: "Sameer Khan", initials: "SK2", goal: "Wealth building", goals: ["Wealth building", "Retirement"], timeline: "7 yrs", stage: "discovery-call", source: "self-booked", meetingLabel: "Thu, 25 Sep · 4:30 PM", meetingFacts: ["Moderate risk", "Income range: ₹22–32L"], statusTag: "High intent", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: true, meetingThisWeek: true },

  // ---- 04 Awaiting Client Details ----
  { id: "P9", slug: "karan-singh", name: "Karan Singh", initials: "KS", goal: "Retirement", timeline: "15 yrs", stage: "awaiting-details", source: "suggested", completedNote: "Discovery completed · 3 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 2, statusTag: "2 reminders sent", ctaLabel: "View details →", lastActivitySort: 3, highIntent: false, meetingThisWeek: false },
  { id: "P10", slug: "devang-shah", name: "Devang Shah", initials: "DS", goal: "Wealth building", goals: ["Wealth building", "Child's education", "Retirement"], timeline: "10 yrs", stage: "awaiting-details", source: "self-booked", completedNote: "Discovery completed · 4 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 0, statusTag: "Awaiting response", ctaLabel: "View details →", lastActivitySort: 4, highIntent: false, meetingThisWeek: false },
  { id: "P11", slug: "priyanka-rao", name: "Priyanka Rao", initials: "PR2", goal: "Buy a home", goals: ["Buy a home", "Retirement"], timeline: "5 yrs", stage: "awaiting-details", source: "self-booked", completedNote: "Discovery completed · 2 days ago", checklist: ["Connect bank accounts", "Upload documents"], remindersSent: 1, statusTag: "Awaiting response", ctaLabel: "View details →", lastActivitySort: 2, highIntent: false, meetingThisWeek: false },
  { id: "P12", slug: "vivek-malhotra", name: "Vivek Malhotra", initials: "VM", goal: "Retirement", timeline: "20 yrs", stage: "awaiting-details", source: "self-booked", completedNote: "Discovery completed · 5 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 2, statusTag: "2 reminders sent", ctaLabel: "View details →", lastActivitySort: 5, highIntent: false, meetingThisWeek: false },
  { id: "P13", slug: "anjali-desai", name: "Anjali Desai", initials: "AD", goal: "Wealth building", timeline: "9 yrs", stage: "awaiting-details", source: "self-booked", completedNote: "Discovery completed · 1 day ago", checklist: ["Connect bank accounts", "Upload documents"], remindersSent: 0, statusTag: "Just started", ctaLabel: "View details →", lastActivitySort: 1, highIntent: false, meetingThisWeek: false },
  { id: "P14", slug: "rajesh-kumar", name: "Rajesh Kumar", initials: "RK", goal: "Child's education", timeline: "10 yrs", stage: "awaiting-details", source: "self-booked", completedNote: "Discovery completed · 3 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 1, statusTag: "Awaiting response", ctaLabel: "View details →", lastActivitySort: 3, highIntent: false, meetingThisWeek: false },
  { id: "P15", slug: "neha-joshi", name: "Neha Joshi", initials: "NJ", goal: "Buy a home", timeline: "6 yrs", stage: "awaiting-details", source: "self-booked", completedNote: "Discovery completed · 6 days ago", checklist: ["Connect bank accounts", "Upload documents"], remindersSent: 2, statusTag: "2 reminders sent", ctaLabel: "View details →", lastActivitySort: 6, highIntent: false, meetingThisWeek: false },

  // ---- 05 Needs Follow-up ----
  { id: "P16", slug: "rahul-verma", name: "Rahul Verma", initials: "RV", goal: "Wealth building", goals: ["Wealth building", "Buy a home"], timeline: "8 yrs", stage: "needs-followup", source: "self-booked", noResponseNote: "No response for 7 days", lastActivityNote: "Last activity: 9 Sep", followUpAttempts: 2, statusTag: "Follow-up due", ctaLabel: "Send reminder →", lastActivitySort: 7, highIntent: false, meetingThisWeek: false },
  { id: "P17", slug: "sneha-kulkarni", name: "Sneha Kulkarni", initials: "SK3", goal: "Buy a home", timeline: "5 yrs", stage: "needs-followup", source: "self-booked", noResponseNote: "No response for 6 days", lastActivityNote: "Last activity: 10 Sep", followUpAttempts: 1, statusTag: "Follow-up due", ctaLabel: "Send reminder →", lastActivitySort: 6, highIntent: false, meetingThisWeek: false },
  { id: "P18", slug: "ajay-bhatt", name: "Ajay Bhatt", initials: "AB", goal: "Retirement", goals: ["Retirement", "Child's education", "Wealth building"], timeline: "15 yrs", stage: "needs-followup", source: "self-booked", noResponseNote: "No response for 8 days", lastActivityNote: "Last activity: 8 Sep", followUpAttempts: 2, statusTag: "Follow-up due", ctaLabel: "Send reminder →", lastActivitySort: 8, highIntent: false, meetingThisWeek: false },

  // ---- 06 Ready for Advice ----
  { id: "P19", slug: "rhea-malhotra", name: "Rhea Malhotra", initials: "RM", goal: "Retirement", goals: ["Retirement", "Buy a home"], timeline: "15 yrs", stage: "ready-for-advice", source: "self-booked", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 90, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },
  { id: "P20", slug: "vikram-patel", name: "Vikram Patel", initials: "VP", goal: "Wealth building", goals: ["Wealth building", "Retirement", "Buy a home"], timeline: "10 yrs", stage: "ready-for-advice", source: "suggested", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 85, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },
  { id: "P21", slug: "kavya-nair", name: "Kavya Nair", initials: "KN", goal: "Buy a home", timeline: "5 yrs", stage: "ready-for-advice", source: "self-booked", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 95, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 0, highIntent: true, meetingThisWeek: false },
  { id: "P22", slug: "suresh-iyer", name: "Suresh Iyer", initials: "SI", goal: "Retirement", timeline: "15 yrs", stage: "ready-for-advice", source: "self-booked", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 88, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 2, highIntent: false, meetingThisWeek: false },
  { id: "P23", slug: "ishita-sharma", name: "Ishita Sharma", initials: "IS", goal: "Wealth building", timeline: "10 yrs", stage: "ready-for-advice", source: "self-booked", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 92, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },

  // ---- 07 Plan Discussion ----
  { id: "P24", slug: "tanvi-agarwal", name: "Tanvi Agarwal", initials: "TA", goal: "Buy a home", goals: ["Buy a home", "Wealth building"], timeline: "5 yrs", stage: "plan-discussion", source: "suggested", meetingLabel: "Fri, 19 Sep · 11:00 AM", meetingFacts: ["Plan ready", "Goal gap: ₹25L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P25", slug: "nikhil-bhat", name: "Nikhil Bhat", initials: "NB", goal: "Wealth building", timeline: "10 yrs", stage: "plan-discussion", source: "self-booked", meetingLabel: "Tomorrow, 4:00 PM", meetingFacts: ["Plan ready", "Goal gap: ₹18L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P26", slug: "kabir-mehta", name: "Kabir Mehta", initials: "KM", goal: "Retirement", timeline: "15 yrs", stage: "plan-discussion", source: "self-booked", meetingLabel: "Mon, 22 Sep · 10:00 AM", meetingFacts: ["Plan ready", "Goal gap: ₹32L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: false, meetingThisWeek: true },
  { id: "P27", slug: "simran-kaur", name: "Simran Kaur", initials: "SK4", goal: "Buy a home", timeline: "5 yrs", stage: "plan-discussion", source: "self-booked", meetingLabel: "Wed, 24 Sep · 3:30 PM", meetingFacts: ["Plan ready", "Goal gap: ₹15L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: false, meetingThisWeek: true },

  // ---- 08 Decision Pending ----
  { id: "P28", slug: "neha-bansal", name: "Neha Bansal", initials: "NB2", goal: "Retirement", goals: ["Retirement", "Wealth building", "Child's education"], timeline: "15 yrs", stage: "decision-pending", source: "self-booked", planSharedNote: "Plan shared 5 days ago", decisionNote: "Comparing 2 options", statusTag: "High intent", ctaLabel: "View plan →", lastActivitySort: 5, highIntent: true, meetingThisWeek: false },
  { id: "P29", slug: "abhishek-reddy", name: "Abhishek Reddy", initials: "AR", goal: "Wealth building", timeline: "10 yrs", stage: "decision-pending", source: "self-booked", planSharedNote: "Plan shared 1 week ago", decisionNote: "Discussing with spouse", statusTag: "Medium intent", ctaLabel: "View plan →", lastActivitySort: 7, highIntent: false, meetingThisWeek: false },
];

/* ---- AI Conversion Brief ---- */

export const CONVERSION_BRIEF = {
  rate: 26,
  trendLabel: "↑ 8% vs last month",
  observations: [
    "6 leads at risk of going stale",
    "Leads with discovery calls are 3.2× more likely to convert",
    "Follow up with 4 leads who haven't submitted details in 5+ days",
    "Schedule 2 more plan discussions this week to hit your target",
  ],
};
