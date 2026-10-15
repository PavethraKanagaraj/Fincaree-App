/* ============================================================
   Lead Pipeline — mock data.
   Pre-plan-selection conversion journey only. A prospect enters
   this pipeline once they've booked a Discovery Call (the free
   AI snapshot lives on the customer-facing side, not here) and
   leaves it the moment they select a plan — KYC and onboarding
   belong to the Client Workspace, not this board.
   ============================================================ */

import { Compass, MessageCircle, AlertTriangle, CheckCircle2, HandCoins, LucideIcon } from "lucide-react";

export type PipelineStageId =
  | "discovery-call"
  | "awaiting-details"
  | "needs-followup"
  | "ready-for-advice"
  | "plan-discussion"
  | "decision-pending";

export type StageType = "touchpoint" | "client-action" | "attention" | "ready" | "decision";

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
  { id: "decision-pending", number: "06", title: "Decision Pending", type: "decision", typeLabel: "Decision", typeIcon: HandCoins, subtitle: "Plan shared, client considering", accent: "var(--color-error-500)" },
  { id: "plan-discussion", number: "05", title: "Plan Discussion", type: "touchpoint", typeLabel: "Advisor Touchpoint", typeIcon: MessageCircle, subtitle: "Financial Blueprint meetings", accent: "var(--bg-brand-primary)" },
  { id: "ready-for-advice", number: "04", title: "Ready for Advice", type: "ready", typeLabel: "Ready", typeIcon: CheckCircle2, subtitle: "Sufficient data to create a personalised plan", accent: "var(--color-success-700)" },
  { id: "needs-followup", number: "03", title: "Needs Follow-up", type: "attention", typeLabel: "Needs Attention", typeIcon: AlertTriangle, subtitle: "No details received within buffer time", accent: "var(--color-warning-700)" },
  { id: "awaiting-details", number: "02", title: "Awaiting Client Details", type: "client-action", typeLabel: "Client Action", typeIcon: HandCoins, subtitle: "Waiting for financial information", accent: "var(--color-grey-600)" },
  { id: "discovery-call", number: "01", title: "Discovery Call", type: "touchpoint", typeLabel: "Advisor Touchpoint", typeIcon: Compass, subtitle: "Scheduled calls with clients", accent: "var(--bg-brand-primary)" },
];

export function pipelineStageIndex(stage: PipelineStageId): number {
  return PIPELINE_STAGES.findIndex((s) => s.id === stage);
}

/* ---- Lead card — fields are stage-shaped, not one generic record.
   A Discovery Call card doesn't carry a completeness bar, and a
   Ready for Advice card doesn't carry a meeting time — each stage
   only fills the fields it actually has. ---- */

export interface PipelineLead {
  id: string;
  slug: string;
  name: string;
  initials: string;
  goal: string;
  timeline: string;
  stage: PipelineStageId;

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

export const PIPELINE_LEADS: PipelineLead[] = [
  // ---- 01 Discovery Call ----
  { id: "P1", slug: "anita-thomas", name: "Anita Thomas", initials: "AT", goal: "Wealth building", timeline: "10 yrs", stage: "discovery-call", meetingLabel: "Today, 11:00 AM", meetingFacts: ["Wealth growth", "Moderate risk", "Income range: ₹15–25L"], statusTag: "High intent", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P2", slug: "arjun-nair", name: "Arjun Nair", initials: "AN", goal: "Buy a home", timeline: "5 yrs", stage: "discovery-call", meetingLabel: "Today, 2:30 PM", meetingFacts: ["Home purchase", "Conservative risk", "Income range: ₹10–15L"], statusTag: "First-time buyer", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: false, meetingThisWeek: true },
  { id: "P3", slug: "meera-iyer", name: "Meera Iyer", initials: "MI", goal: "Buy a home", timeline: "6 yrs", stage: "discovery-call", meetingLabel: "Tomorrow, 10:00 AM", meetingFacts: ["Home purchase", "Moderate risk", "Income range: ₹20–30L"], statusTag: "Referred by client", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: false, meetingThisWeek: true },
  { id: "P4", slug: "rohit-sharma", name: "Rohit Sharma", initials: "RS", goal: "Wealth building", timeline: "12 yrs", stage: "discovery-call", meetingLabel: "Today, 3:00 PM", meetingFacts: ["Wealth growth", "Aggressive risk", "Income range: ₹30–40L"], statusTag: "High intent", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P5", slug: "divya-menon", name: "Divya Menon", initials: "DM", goal: "Retirement", timeline: "18 yrs", stage: "discovery-call", meetingLabel: "Fri, 19 Sep · 9:30 AM", meetingFacts: ["Retirement income", "Conservative risk", "Income range: ₹15–25L"], statusTag: "Early planner", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: false, meetingThisWeek: true },
  { id: "P6", slug: "aman-gupta", name: "Aman Gupta", initials: "AG", goal: "Child's education", timeline: "8 yrs", stage: "discovery-call", meetingLabel: "Mon, 22 Sep · 1:00 PM", meetingFacts: ["Education fund", "Moderate risk", "Income range: ₹25–35L"], statusTag: "New parent", ctaLabel: "Prepare for meeting →", lastActivitySort: 2, highIntent: false, meetingThisWeek: true },
  { id: "P7", slug: "pooja-reddy", name: "Pooja Reddy", initials: "PR", goal: "Buy a home", timeline: "4 yrs", stage: "discovery-call", meetingLabel: "Wed, 24 Sep · 11:30 AM", meetingFacts: ["Home purchase", "Moderate risk", "Income range: ₹18–28L"], statusTag: "Comparing advisors", ctaLabel: "Prepare for meeting →", lastActivitySort: 2, highIntent: false, meetingThisWeek: true },
  { id: "P8", slug: "sameer-khan", name: "Sameer Khan", initials: "SK2", goal: "Wealth building", timeline: "7 yrs", stage: "discovery-call", meetingLabel: "Thu, 25 Sep · 4:30 PM", meetingFacts: ["Wealth growth", "Moderate risk", "Income range: ₹22–32L"], statusTag: "High intent", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: true, meetingThisWeek: true },

  // ---- 02 Awaiting Client Details ----
  { id: "P9", slug: "karan-singh", name: "Karan Singh", initials: "KS", goal: "Retirement", timeline: "15 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 3 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 2, statusTag: "2 reminders sent", ctaLabel: "View details →", lastActivitySort: 3, highIntent: false, meetingThisWeek: false },
  { id: "P10", slug: "devang-shah", name: "Devang Shah", initials: "DS", goal: "Wealth building", timeline: "10 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 4 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 0, statusTag: "Awaiting response", ctaLabel: "View details →", lastActivitySort: 4, highIntent: false, meetingThisWeek: false },
  { id: "P11", slug: "priyanka-rao", name: "Priyanka Rao", initials: "PR2", goal: "Buy a home", timeline: "5 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 2 days ago", checklist: ["Connect bank accounts", "Upload documents"], remindersSent: 1, statusTag: "Awaiting response", ctaLabel: "View details →", lastActivitySort: 2, highIntent: false, meetingThisWeek: false },
  { id: "P12", slug: "vivek-malhotra", name: "Vivek Malhotra", initials: "VM", goal: "Retirement", timeline: "20 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 5 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 2, statusTag: "2 reminders sent", ctaLabel: "View details →", lastActivitySort: 5, highIntent: false, meetingThisWeek: false },
  { id: "P13", slug: "anjali-desai", name: "Anjali Desai", initials: "AD", goal: "Wealth building", timeline: "9 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 1 day ago", checklist: ["Connect bank accounts", "Upload documents"], remindersSent: 0, statusTag: "Just started", ctaLabel: "View details →", lastActivitySort: 1, highIntent: false, meetingThisWeek: false },
  { id: "P14", slug: "rajesh-kumar", name: "Rajesh Kumar", initials: "RK", goal: "Child's education", timeline: "10 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 3 days ago", checklist: ["Connect bank accounts", "Upload documents", "Verify identity (optional)"], remindersSent: 1, statusTag: "Awaiting response", ctaLabel: "View details →", lastActivitySort: 3, highIntent: false, meetingThisWeek: false },
  { id: "P15", slug: "neha-joshi", name: "Neha Joshi", initials: "NJ", goal: "Buy a home", timeline: "6 yrs", stage: "awaiting-details", completedNote: "Discovery completed · 6 days ago", checklist: ["Connect bank accounts", "Upload documents"], remindersSent: 2, statusTag: "2 reminders sent", ctaLabel: "View details →", lastActivitySort: 6, highIntent: false, meetingThisWeek: false },

  // ---- 03 Needs Follow-up ----
  { id: "P16", slug: "rahul-verma", name: "Rahul Verma", initials: "RV", goal: "Wealth building", timeline: "8 yrs", stage: "needs-followup", noResponseNote: "No response for 7 days", lastActivityNote: "Last activity: 9 Sep", followUpAttempts: 2, statusTag: "Follow-up due", ctaLabel: "Send reminder →", lastActivitySort: 7, highIntent: false, meetingThisWeek: false },
  { id: "P17", slug: "sneha-kulkarni", name: "Sneha Kulkarni", initials: "SK3", goal: "Buy a home", timeline: "5 yrs", stage: "needs-followup", noResponseNote: "No response for 6 days", lastActivityNote: "Last activity: 10 Sep", followUpAttempts: 1, statusTag: "Follow-up due", ctaLabel: "Send reminder →", lastActivitySort: 6, highIntent: false, meetingThisWeek: false },
  { id: "P18", slug: "ajay-bhatt", name: "Ajay Bhatt", initials: "AB", goal: "Retirement", timeline: "15 yrs", stage: "needs-followup", noResponseNote: "No response for 8 days", lastActivityNote: "Last activity: 8 Sep", followUpAttempts: 2, statusTag: "Follow-up due", ctaLabel: "Send reminder →", lastActivitySort: 8, highIntent: false, meetingThisWeek: false },

  // ---- 04 Ready for Advice ----
  { id: "P19", slug: "rhea-malhotra", name: "Rhea Malhotra", initials: "RM", goal: "Retirement", timeline: "15 yrs", stage: "ready-for-advice", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 90, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },
  { id: "P20", slug: "vikram-patel", name: "Vikram Patel", initials: "VP", goal: "Wealth building", timeline: "10 yrs", stage: "ready-for-advice", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 85, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },
  { id: "P21", slug: "kavya-nair", name: "Kavya Nair", initials: "KN", goal: "Buy a home", timeline: "5 yrs", stage: "ready-for-advice", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 95, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 0, highIntent: true, meetingThisWeek: false },
  { id: "P22", slug: "suresh-iyer", name: "Suresh Iyer", initials: "SI", goal: "Retirement", timeline: "15 yrs", stage: "ready-for-advice", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 88, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 2, highIntent: false, meetingThisWeek: false },
  { id: "P23", slug: "ishita-sharma", name: "Ishita Sharma", initials: "IS", goal: "Wealth building", timeline: "10 yrs", stage: "ready-for-advice", readyChecklist: ["Accounts connected", "KYC verified", "Financial data complete"], completeness: 92, statusTag: "Ready for planning", ctaLabel: "View profile →", lastActivitySort: 1, highIntent: true, meetingThisWeek: false },

  // ---- 05 Plan Discussion ----
  { id: "P24", slug: "tanvi-agarwal", name: "Tanvi Agarwal", initials: "TA", goal: "Buy a home", timeline: "5 yrs", stage: "plan-discussion", meetingLabel: "Fri, 19 Sep · 11:00 AM", meetingFacts: ["Plan ready", "Goal gap: ₹25L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P25", slug: "nikhil-bhat", name: "Nikhil Bhat", initials: "NB", goal: "Wealth building", timeline: "10 yrs", stage: "plan-discussion", meetingLabel: "Tomorrow, 4:00 PM", meetingFacts: ["Plan ready", "Goal gap: ₹18L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 0, highIntent: true, meetingThisWeek: true },
  { id: "P26", slug: "kabir-mehta", name: "Kabir Mehta", initials: "KM", goal: "Retirement", timeline: "15 yrs", stage: "plan-discussion", meetingLabel: "Mon, 22 Sep · 10:00 AM", meetingFacts: ["Plan ready", "Goal gap: ₹32L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: false, meetingThisWeek: true },
  { id: "P27", slug: "simran-kaur", name: "Simran Kaur", initials: "SK4", goal: "Buy a home", timeline: "5 yrs", stage: "plan-discussion", meetingLabel: "Wed, 24 Sep · 3:30 PM", meetingFacts: ["Plan ready", "Goal gap: ₹15L"], statusTag: "Meeting scheduled", ctaLabel: "Prepare for meeting →", lastActivitySort: 1, highIntent: false, meetingThisWeek: true },

  // ---- 06 Decision Pending ----
  { id: "P28", slug: "neha-bansal", name: "Neha Bansal", initials: "NB2", goal: "Retirement", timeline: "15 yrs", stage: "decision-pending", planSharedNote: "Plan shared 5 days ago", decisionNote: "Comparing 2 options", statusTag: "High intent", ctaLabel: "View plan →", lastActivitySort: 5, highIntent: true, meetingThisWeek: false },
  { id: "P29", slug: "abhishek-reddy", name: "Abhishek Reddy", initials: "AR", goal: "Wealth building", timeline: "10 yrs", stage: "decision-pending", planSharedNote: "Plan shared 1 week ago", decisionNote: "Discussing with spouse", statusTag: "Medium intent", ctaLabel: "View plan →", lastActivitySort: 7, highIntent: false, meetingThisWeek: false },
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
