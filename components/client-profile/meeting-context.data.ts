/* ============================================================
   Meeting Context — Mock Data
   Content for the four prototype-only demonstration states
   (Discovery → Financial Blueprint → Proposal → Subscription).

   Subscription is further split by plan tier (Silver / Gold /
   Platinum) — the depth and focus of the meeting content changes
   with the tier, not just the plan name. Gold reuses the same
   Anika Rao / retirement-review story already established in
   data.ts so the two stay consistent; Silver and Platinum are
   deliberately different in scope (one-time blueprint vs. broad
   family wealth) to make the tier upgrade legible.
   ============================================================ */

import type { Severity } from "./data";

export type MeetingProtoState = "discovery" | "blueprint" | "proposal" | "subscription";

export interface MeetingProtoStateInfo {
  id: MeetingProtoState;
  label: string;
}

export const MEETING_PROTO_STATES: MeetingProtoStateInfo[] = [
  { id: "discovery", label: "Discovery" },
  { id: "blueprint", label: "Financial Blueprint" },
  { id: "proposal", label: "Proposal" },
  { id: "subscription", label: "Subscription" },
];

export type SubscriptionTier = "silver" | "gold" | "platinum";

export interface SubscriptionTierInfo {
  id: SubscriptionTier;
  label: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTierInfo[] = [
  { id: "silver", label: "Silver — One-Time Blueprint Plan" },
  { id: "gold", label: "Gold — Annual Guide Plan" },
  { id: "platinum", label: "Platinum — Family Wealth Plan" },
];

export interface MeetingHeaderData {
  type: string;
  stageLine: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
}

export interface WhatMattersItem {
  id: string;
  what: string;
  why: string;
  action: string;
  severity: Severity;
}

export interface FinnyMeetingBrief {
  title: string;
  points: string[];
  basedOn: string[];
}

export interface DiscussionPriority {
  number: string;
  label: string;
  action: string;
}

export interface MeetingOpenQuestion {
  id: string;
  question: string;
  action: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  icon: "pdf" | "projection" | "notes" | "proposal" | "summary" | "simulation";
}

export interface AgendaItem {
  id: string;
  label: string;
  done: boolean;
}

export interface PreviousMeetingContext {
  meetingLabel: string;
  date: string;
  outcome: string;
  pending: string;
  actionsCompleted: number;
  actionsPending: number;
}

export interface FollowUpAction {
  action: string;
  owner: "Advisor" | "Client";
  due: string;
  status: "Pending" | "Waiting" | "Completed";
}

export interface NextMeetingSuggestion {
  timing: string;
  purpose: string;
}

export interface ReviewChangeSummary {
  what: string;
  change: string;
}

export interface MeetingContextForState {
  header: MeetingHeaderData;
  purpose: string;
  whatMatters: WhatMattersItem[];
  finnyBrief: FinnyMeetingBrief;
  discussionPriorities: DiscussionPriority[];
  openQuestions: MeetingOpenQuestion[];
  materials: MaterialItem[];
  agenda: AgendaItem[];
  previousMeeting: PreviousMeetingContext | null;
  primaryActionLabel: string;
  duringMeetingDetection: string;
  likelyDecisions: string[];
  followUpActions: FollowUpAction[];
  nextMeetingSuggestion: NextMeetingSuggestion;
  /** Sidebar label for the after-meeting "what happens next" card — varies by
      relationship type (a one-time engagement closes; an ongoing one reviews). */
  postMeetingFocusLabel: string;
  /** Shown once, quietly, under the meeting header — not a repeated badge. */
  relationshipNote?: string;
  /** Gold-only: the "what changed" snapshot that makes an annual review an
      annual review rather than a generic check-in. */
  changesSinceLastReview?: ReviewChangeSummary[];
  discoveryOutcomeOptions?: string[];
}

export const MEETING_CONTEXT: Record<"discovery" | "blueprint" | "proposal", MeetingContextForState> = {
  /* ---------------------------------------------------------
     Discovery — first conversation, prospect, no subscription
     --------------------------------------------------------- */
  discovery: {
    header: {
      type: "Discovery Call",
      stageLine: "Prospect · No subscription",
      date: "26 May 2025",
      time: "3:00 PM",
      duration: "30 min",
      mode: "Video",
    },
    purpose:
      "Understand why Anika is looking for advice, her needs and expectations, and explain how FinCAREe can help.",
    whatMatters: [
      {
        id: "wm-1",
        what: "No prior advisory relationship",
        why: "First conversation — establish trust and set expectations for how FinCAREe works.",
        action: "Introduce FinCAREe",
        severity: "low",
      },
      {
        id: "wm-2",
        what: "Reason for seeking advice not yet known",
        why: "Referral came through an existing client — motivation hasn't been captured yet.",
        action: "Ask what prompted this",
        severity: "medium",
      },
      {
        id: "wm-3",
        what: "Financial context not yet captured",
        why: "No intake form submitted — nothing on file to prepare against.",
        action: "Capture basics",
        severity: "medium",
      },
    ],
    finnyBrief: {
      title: "Discovery Brief",
      points: [
        "No prior financial data on file — this is a first conversation.",
        "Referral source: existing client referral.",
        "Initial inquiry mentioned retirement planning as an interest area.",
      ],
      basedOn: ["Inquiry form", "Referral notes"],
    },
    discussionPriorities: [
      { number: "01", label: "Why now / motivation", action: "Ask" },
      { number: "02", label: "Goals & expectations", action: "Understand" },
      { number: "03", label: "Financial context (basic)", action: "Capture" },
      { number: "04", label: "FinCAREe services", action: "Explain" },
    ],
    openQuestions: [
      { id: "oq-1", question: "What prompted you to look for financial advice now?", action: "Ask client" },
      { id: "oq-2", question: "What are your top 2–3 financial goals?", action: "Ask client" },
      { id: "oq-3", question: "Have you worked with an advisor before?", action: "Ask client" },
    ],
    materials: [
      { id: "m-1", name: "FinCAREe Services Overview.pdf", icon: "pdf" },
      { id: "m-2", name: "Discovery Call Checklist", icon: "notes" },
    ],
    agenda: [
      { id: "a-1", label: "Welcome & introductions", done: true },
      { id: "a-2", label: "Understand motivation", done: false },
      { id: "a-3", label: "Discuss goals & expectations", done: false },
      { id: "a-4", label: "Explain FinCAREe approach", done: false },
      { id: "a-5", label: "Next steps", done: false },
    ],
    previousMeeting: null,
    primaryActionLabel: "Start Discovery",
    duringMeetingDetection: "Client mentioned wanting to retire within the next 10 years.",
    likelyDecisions: ["Proceed to Financial Blueprint"],
    followUpActions: [
      { action: "Send FinCAREe intake form", owner: "Advisor", due: "Today", status: "Pending" },
      { action: "Complete detailed financial information", owner: "Client", due: "Before next meeting", status: "Waiting" },
    ],
    nextMeetingSuggestion: { timing: "After intake form submitted", purpose: "Initial Financial Snapshot Discussion" },
    postMeetingFocusLabel: "Next Step",
    discoveryOutcomeOptions: ["Interested", "Follow up", "Not a fit"],
  },

  /* ---------------------------------------------------------
     Financial Blueprint — assessment stage, no subscription yet
     --------------------------------------------------------- */
  blueprint: {
    header: {
      type: "Initial Financial Snapshot Discussion",
      stageLine: "Assessment · No subscription",
      date: "2 Jun 2025",
      time: "11:00 AM",
      duration: "40 min",
      mode: "Video",
    },
    purpose:
      "Walk Anika through her financial health score, key observations, and the planning gaps identified from her intake information.",
    whatMatters: [
      {
        id: "wm-1",
        what: "Financial health score: 62 / 100",
        why: "Below target, driven mainly by unconfirmed retirement funding and incomplete protection information.",
        action: "Review score",
        severity: "medium",
      },
      {
        id: "wm-2",
        what: "3 planning gaps identified",
        why: "Retirement, wedding goal, and protection all surfaced as gaps from the discovery intake.",
        action: "Walk through gaps",
        severity: "high",
      },
    ],
    finnyBrief: {
      title: "Snapshot Brief",
      points: [
        "Financial health score is 62/100 — moderate, with clear room to improve.",
        "Retirement and protection carry the largest planning gaps.",
        "No major red flags in spending or debt levels.",
      ],
      basedOn: ["Discovery intake", "Financial snapshot calculation"],
    },
    discussionPriorities: [
      { number: "01", label: "Financial health score", action: "Review" },
      { number: "02", label: "Key strengths", action: "Acknowledge" },
      { number: "03", label: "Planning gaps", action: "Explain" },
      { number: "04", label: "Suitable advisory plan", action: "Recommend" },
    ],
    openQuestions: [
      { id: "oq-1", question: "Any income sources not yet captured?", action: "Ask client" },
      { id: "oq-2", question: "Existing health insurance details?", action: "Request" },
      { id: "oq-3", question: "Comfortable with a moderate risk allocation?", action: "Confirm" },
    ],
    materials: [
      { id: "m-1", name: "Financial Snapshot.pdf", icon: "summary" },
      { id: "m-2", name: "Discovery Call Notes", icon: "notes" },
    ],
    agenda: [
      { id: "a-1", label: "Review previous conversation", done: true },
      { id: "a-2", label: "Present financial health score", done: false },
      { id: "a-3", label: "Walk through strengths", done: false },
      { id: "a-4", label: "Walk through planning gaps", done: false },
      { id: "a-5", label: "Introduce suitable plan", done: false },
    ],
    previousMeeting: {
      meetingLabel: "Discovery Call",
      date: "26 May 2025",
      outcome: "Interested — proceeding to snapshot",
      pending: "Detailed financial information",
      actionsCompleted: 1,
      actionsPending: 0,
    },
    primaryActionLabel: "Discuss Snapshot",
    duringMeetingDetection: "Client expressed concern about rising healthcare costs.",
    likelyDecisions: ["Suggested plan: Gold — Annual Guide Plan"],
    followUpActions: [
      { action: "Send proposal for Gold plan", owner: "Advisor", due: "Within 2 days", status: "Pending" },
      { action: "Review proposal", owner: "Client", due: "Before next meeting", status: "Waiting" },
    ],
    nextMeetingSuggestion: { timing: "Within 1 week", purpose: "Proposal Walkthrough" },
    postMeetingFocusLabel: "Next Step",
  },

  /* ---------------------------------------------------------
     Proposal — plan recommended, not yet subscribed
     --------------------------------------------------------- */
  proposal: {
    header: {
      type: "Proposal Walkthrough",
      stageLine: "Proposal · No subscription yet",
      date: "9 Jun 2025",
      time: "4:00 PM",
      duration: "30 min",
      mode: "Video",
    },
    purpose:
      "Walk Anika through the recommended Gold — Annual Guide Plan, its scope and pricing, and answer any questions before she decides.",
    whatMatters: [
      {
        id: "wm-1",
        what: "GOLD — Annual Guide Plan",
        why: "Matches retirement, goal planning and protection needs identified in the snapshot.",
        action: "Present plan",
        severity: "low",
      },
      {
        id: "wm-2",
        what: "Pricing & scope not yet confirmed",
        why: "Client hasn't seen formal pricing or the full scope of what's included.",
        action: "Explain scope & pricing",
        severity: "medium",
      },
    ],
    finnyBrief: {
      title: "Proposal Brief",
      points: [
        "Recommended plan matches all 3 identified planning needs.",
        "A pricing question is likely — have the comparison ready.",
        "No objections raised in the prior conversation.",
      ],
      basedOn: ["Snapshot discussion", "Identified planning needs"],
    },
    discussionPriorities: [
      { number: "01", label: "Planning needs recap", action: "Recap" },
      { number: "02", label: "Recommended plan", action: "Present" },
      { number: "03", label: "Scope & pricing", action: "Explain" },
      { number: "04", label: "Questions", action: "Address" },
    ],
    openQuestions: [
      { id: "oq-1", question: "Comfortable with an annual commitment?", action: "Ask client" },
      { id: "oq-2", question: "Any budget constraints to account for?", action: "Clarify" },
      { id: "oq-3", question: "Ready to decide today?", action: "Ask client" },
    ],
    materials: [
      { id: "m-1", name: "Proposal.pdf", icon: "proposal" },
      { id: "m-2", name: "Financial Snapshot.pdf", icon: "summary" },
      { id: "m-3", name: "Plan Comparison", icon: "summary" },
    ],
    agenda: [
      { id: "a-1", label: "Recap planning needs", done: true },
      { id: "a-2", label: "Present recommended plan", done: false },
      { id: "a-3", label: "Walk through scope", done: false },
      { id: "a-4", label: "Discuss pricing", done: false },
      { id: "a-5", label: "Address questions", done: false },
      { id: "a-6", label: "Close / next steps", done: false },
    ],
    previousMeeting: {
      meetingLabel: "Snapshot Discussion",
      date: "2 Jun 2025",
      outcome: "Gold — Annual Guide Plan suggested",
      pending: "Formal proposal",
      actionsCompleted: 1,
      actionsPending: 1,
    },
    primaryActionLabel: "Walk Through Proposal",
    duringMeetingDetection: "Client asked whether the plan covers her daughter's wedding goal.",
    likelyDecisions: ["Subscribed to Gold — Annual Guide Plan"],
    followUpActions: [
      { action: "Send subscription agreement", owner: "Advisor", due: "Today", status: "Pending" },
      { action: "Sign & activate subscription", owner: "Client", due: "Within 3 days", status: "Waiting" },
    ],
    nextMeetingSuggestion: { timing: "After subscription activated", purpose: "Plan Discussion — Kickoff" },
    postMeetingFocusLabel: "Next Step",
  },
};

/* ============================================================
   Subscription — active advisory relationship, split by plan
   tier. Same underlying client (Anika Rao), but the tier changes
   what the meeting is actually for: a one-time Silver engagement
   closes with a decision, a Gold review tracks progress, and a
   Platinum review widens to the whole family's wealth picture.
   ============================================================ */

export const SUBSCRIPTION_MEETING_CONTEXT: Record<SubscriptionTier, MeetingContextForState> = {
  /* ---- Silver — One-Time Blueprint Plan ---- */
  silver: {
    header: {
      type: "Blueprint Discussion",
      stageLine: "Silver · One-Time Blueprint Plan",
      date: "14 Jun 2025",
      time: "2:00 PM",
      duration: "35 min",
      mode: "Video",
    },
    purpose:
      "Review Anika's completed financial blueprint, clarify recommendations, and help her understand what to do next.",
    whatMatters: [
      {
        id: "wm-1",
        what: "Financial blueprint findings",
        why: "The completed blueprint highlights where Anika's plan is strong and where gaps remain.",
        action: "Review findings",
        severity: "low",
      },
      {
        id: "wm-2",
        what: "Key financial gaps",
        why: "Retirement funding and protection coverage were flagged as the two largest gaps.",
        action: "Explain gaps",
        severity: "high",
      },
      {
        id: "wm-3",
        what: "Priority improvements",
        why: "Three recommended improvements were identified from the blueprint analysis.",
        action: "Walk through",
        severity: "medium",
      },
      {
        id: "wm-4",
        what: "Implementation clarification",
        why: "Client may have questions about how to act on the recommendations.",
        action: "Clarify",
        severity: "low",
      },
    ],
    finnyBrief: {
      title: "Blueprint Brief",
      points: [
        "Retirement is the highest-priority planning gap.",
        "Protection coverage should be reviewed.",
        "Three recommended improvement areas require clarification.",
      ],
      basedOn: ["Financial Blueprint", "Client inputs"],
    },
    discussionPriorities: [
      { number: "01", label: "Review blueprint findings", action: "Review" },
      { number: "02", label: "Explain priority gaps", action: "Explain" },
      { number: "03", label: "Clarify recommendations", action: "Clarify" },
      { number: "04", label: "Agree immediate next steps", action: "Agree" },
    ],
    openQuestions: [
      { id: "oq-1", question: "Which recommendation needs clarification?", action: "Clarify" },
      { id: "oq-2", question: "Does the client want implementation guidance?", action: "Ask client" },
      { id: "oq-3", question: "Which actions will the client take first?", action: "Ask client" },
    ],
    materials: [
      { id: "m-1", name: "Financial Blueprint", icon: "proposal" },
      { id: "m-2", name: "Goal Summary", icon: "summary" },
      { id: "m-3", name: "Financial Health Report", icon: "summary" },
      { id: "m-4", name: "Recommendation Summary", icon: "summary" },
    ],
    agenda: [
      { id: "a-1", label: "Review blueprint", done: true },
      { id: "a-2", label: "Discuss key gaps", done: false },
      { id: "a-3", label: "Explain recommendations", done: false },
      { id: "a-4", label: "Clarify questions", done: false },
      { id: "a-5", label: "Agree next steps", done: false },
    ],
    previousMeeting: {
      meetingLabel: "Blueprint Build Session",
      date: "7 Jun 2025",
      outcome: "Financial blueprint completed",
      pending: "Client review of recommendations",
      actionsCompleted: 1,
      actionsPending: 0,
    },
    primaryActionLabel: "Review Blueprint",
    duringMeetingDetection: "Client asked whether the retirement recommendation accounts for her daughter's wedding goal.",
    likelyDecisions: ["Client to prioritize retirement and protection gaps first"],
    followUpActions: [
      { action: "Send blueprint summary as PDF", owner: "Advisor", due: "Today", status: "Pending" },
      { action: "Decide whether implementation support is needed", owner: "Client", due: "Within 1 week", status: "Waiting" },
    ],
    nextMeetingSuggestion: { timing: "Optional — only if implementation support is needed", purpose: "Follow-up / engagement close" },
    postMeetingFocusLabel: "Next Step / Close Engagement",
    relationshipNote: "One-time engagement — a defined blueprint delivery, not ongoing advisory.",
  },

  /* ---- Gold — Annual Guide Plan ---- */
  gold: {
    header: {
      type: "Annual Plan Review",
      stageLine: "Gold · Annual Guide Plan",
      date: "28 Aug 2025",
      time: "10:30 AM",
      duration: "45 min",
      mode: "Video",
    },
    purpose:
      "Review Anika's progress against her financial plan, identify what's changed, and agree the next set of actions.",
    whatMatters: [
      {
        id: "wm-1",
        what: "Goal progress",
        why: "Retirement funding gap has improved 8% since the last review.",
        action: "Review progress",
        severity: "medium",
      },
      {
        id: "wm-2",
        what: "Changes in financial situation",
        why: "A new healthcare cost consideration has emerged since the last review.",
        action: "Discuss change",
        severity: "medium",
      },
      {
        id: "wm-3",
        what: "Outstanding actions",
        why: "One action from the last review — insurance policy details — is still pending.",
        action: "Follow up",
        severity: "medium",
      },
      {
        id: "wm-4",
        what: "New planning needs",
        why: "Wedding goal amount needs reconfirmation given the updated timeline.",
        action: "Validate",
        severity: "high",
      },
    ],
    changesSinceLastReview: [
      { what: "Retirement target", change: "60 → 58" },
      { what: "Savings rate", change: "Increased" },
      { what: "Healthcare expense", change: "New" },
      { what: "Goal progress", change: "Retirement goal improved" },
    ],
    finnyBrief: {
      title: "Annual Review Brief",
      points: [
        "Retirement progress improved since the last review.",
        "Healthcare costs are a new planning consideration.",
        "Protection information remains incomplete.",
      ],
      basedOn: ["Previous review", "Current goals", "Recent financial data", "Client activity"],
    },
    discussionPriorities: [
      { number: "01", label: "Review goal progress", action: "Review" },
      { number: "02", label: "Discuss changes in financial situation", action: "Discuss" },
      { number: "03", label: "Validate planning assumptions", action: "Validate" },
      { number: "04", label: "Review outstanding actions", action: "Review" },
      { number: "05", label: "Agree next-period actions", action: "Agree" },
    ],
    openQuestions: [
      { id: "oq-1", question: "Has the retirement target changed?", action: "Ask client" },
      { id: "oq-2", question: "Have financial priorities changed?", action: "Ask client" },
      { id: "oq-3", question: "Are previous actions complete?", action: "Confirm" },
      { id: "oq-4", question: "Are new protection needs emerging?", action: "Ask client" },
    ],
    materials: [
      { id: "m-1", name: "Current Financial Plan", icon: "summary" },
      { id: "m-2", name: "Previous Review", icon: "notes" },
      { id: "m-3", name: "Goal Progress Report", icon: "summary" },
      { id: "m-4", name: "Retirement Projection", icon: "projection" },
      { id: "m-5", name: "Action Plan", icon: "summary" },
    ],
    agenda: [
      { id: "a-1", label: "Review previous actions", done: true },
      { id: "a-2", label: "Review goal progress", done: false },
      { id: "a-3", label: "Discuss financial changes", done: false },
      { id: "a-4", label: "Discuss new planning needs", done: false },
      { id: "a-5", label: "Agree next actions", done: false },
    ],
    previousMeeting: {
      meetingLabel: "Plan Discussion",
      date: "20 May 2025",
      outcome: "Retirement target set at 60",
      pending: "Insurance policy details",
      actionsCompleted: 2,
      actionsPending: 1,
    },
    primaryActionLabel: "Prepare Annual Review",
    duringMeetingDetection: "Client wants to revisit the retirement age assumption — considering 58 instead of 60.",
    likelyDecisions: ["Retirement target updated to 58", "Savings rate increase confirmed"],
    followUpActions: [
      { action: "Update retirement projection", owner: "Advisor", due: "28 Aug", status: "Pending" },
      { action: "Upload insurance policy", owner: "Client", due: "01 Sep", status: "Waiting" },
    ],
    nextMeetingSuggestion: { timing: "In 12 months", purpose: "Next Annual Plan Review" },
    postMeetingFocusLabel: "Next Review Date",
    relationshipNote: "Ongoing annual guidance — goals, progress, and plan updates throughout the year.",
  },

  /* ---- Platinum — Family Wealth Plan ---- */
  platinum: {
    header: {
      type: "Family Wealth Review",
      stageLine: "Platinum · Family Wealth Plan",
      date: "28 Aug 2025",
      time: "10:30 AM",
      duration: "60 min",
      mode: "Video",
    },
    purpose:
      "Review the family's broader financial position, goals, wealth priorities, and strategic needs.",
    whatMatters: [
      {
        id: "wm-1",
        what: "Family goals interacting with wealth strategy",
        why: "Retirement and the wedding goal are increasingly interconnected with the broader wealth strategy.",
        action: "Review interaction",
        severity: "medium",
      },
      {
        id: "wm-2",
        what: "Protection needs after a family change",
        why: "The daughter's upcoming wedding warrants a protection coverage review.",
        action: "Review protection",
        severity: "high",
      },
      {
        id: "wm-3",
        what: "Wealth-planning opportunity",
        why: "A potential wealth-planning opportunity has surfaced and needs advisor review before discussing with the client.",
        action: "Review opportunity",
        severity: "medium",
      },
      {
        id: "wm-4",
        what: "Intergenerational considerations",
        why: "Long-term family wealth transfer hasn't yet been discussed.",
        action: "Introduce topic",
        severity: "low",
      },
    ],
    finnyBrief: {
      title: "Family Wealth Brief",
      points: [
        "Retirement and family goals are interacting with the current wealth strategy.",
        "Protection coverage requires review after a recent family change.",
        "A potential wealth-planning opportunity requires advisor review.",
      ],
      basedOn: ["Client context", "Goals", "Financial information", "Previous meetings"],
    },
    discussionPriorities: [
      { number: "01", label: "Review family financial priorities", action: "Review" },
      { number: "02", label: "Review major goal changes", action: "Review" },
      { number: "03", label: "Discuss protection / planning considerations", action: "Discuss" },
      { number: "04", label: "Review wealth-related opportunities", action: "Review" },
      { number: "05", label: "Agree strategic next steps", action: "Agree" },
    ],
    openQuestions: [
      { id: "oq-1", question: "Has the family's financial structure changed?", action: "Ask client" },
      { id: "oq-2", question: "Are new family goals emerging?", action: "Ask client" },
      { id: "oq-3", question: "Have protection needs changed?", action: "Ask client" },
      { id: "oq-4", question: "Are there strategic planning opportunities to evaluate?", action: "Review" },
    ],
    materials: [
      { id: "m-1", name: "Family Financial Overview", icon: "summary" },
      { id: "m-2", name: "Goal Summary", icon: "summary" },
      { id: "m-3", name: "Previous Review", icon: "notes" },
      { id: "m-4", name: "Protection Summary", icon: "summary" },
      { id: "m-5", name: "Wealth / Portfolio Context", icon: "projection" },
      { id: "m-6", name: "Relevant Planning Reports", icon: "summary" },
    ],
    agenda: [
      { id: "a-1", label: "Review family priorities", done: true },
      { id: "a-2", label: "Review major changes", done: false },
      { id: "a-3", label: "Discuss protection / planning", done: false },
      { id: "a-4", label: "Discuss wealth priorities", done: false },
      { id: "a-5", label: "Agree strategic next steps", done: false },
    ],
    previousMeeting: {
      meetingLabel: "Family Wealth Review",
      date: "20 Feb 2025",
      outcome: "Long-term wealth strategy aligned with family goals",
      pending: "Protection review after family change",
      actionsCompleted: 3,
      actionsPending: 1,
    },
    primaryActionLabel: "Prepare Family Wealth Review",
    duringMeetingDetection: "Client raised a question about how her daughter's wedding fits into the family's broader wealth plan.",
    likelyDecisions: ["Wealth strategy reaffirmed with updated family goal priorities"],
    followUpActions: [
      { action: "Review wealth-planning opportunity in detail", owner: "Advisor", due: "Within 1 week", status: "Pending" },
      { action: "Provide updated family protection details", owner: "Client", due: "Within 2 weeks", status: "Waiting" },
    ],
    nextMeetingSuggestion: { timing: "In 6 months", purpose: "Next Strategic Review" },
    postMeetingFocusLabel: "Next Strategic Review",
    relationshipNote: "Comprehensive, ongoing guidance across the family's broader wealth needs.",
  },
};
