"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageFrame, PageGrid } from "@/components/layout/PageFrame";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { CalendarClock, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/fincaree/button";

import { AiConversionBrief } from "@/components/leads/AiConversionBrief";
import { TodaysFocus } from "@/components/leads/TodaysFocus";
import { UpcomingMeetingsCard } from "@/components/leads/UpcomingMeetingsCard";
import { PipelineBoard } from "@/components/leads/PipelineBoard";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { InviteContactDialog, ContactInvite } from "@/components/leads/InviteContactDialog";
import type { NewLeadsTab } from "@/components/leads/PipelineBoard";
import { ScheduleLoopDialog } from "@/components/client-suggestions/ScheduleLoopDialog";
import { MARKETING_CONTENT, marketing, useMarketing } from "@/components/client-suggestions/marketing-store";
import { isMarketable, loopAudiences, type LoopAudience } from "@/components/client-suggestions/marketing-intelligence";
import type { NurtureSequence } from "@/components/client-suggestions/delivery-data";
import { StageOverviewStrip } from "@/components/leads/StageOverviewStrip";
import { PIPELINE_LEADS, PipelineLead, LeadSource, LEAD_SOURCE_LABEL, leadGoals } from "@/components/leads/pipeline-data";

/* ============================================================
   Lead Pipeline — /leads
   An AI-assisted advisor conversion workspace, not "a Kanban
   board that happens to contain leads." The AI brief and Today's
   Focus tell the advisor what needs attention; the board tells
   them where each prospect stands in the pre-plan-selection
   journey; a card click opens context without leaving the board.
   Leads arrive from the Fincaree platform — suggested matches wait
   in the first column until the advisor accepts — so there is no
   manual "Add Lead". The advisor's own network comes in as an
   invite (Invite contact), and waits in Invited until the
   contact joins.
   ============================================================ */

type FilterOption =
  | "all"
  | "today-meetings"
  | "high-intent"
  | "ready-to-plan"
  | "needs-followup"
  | "awaiting-client"
  | "decision-pending"
  | "stale";

type SourceFilter = "all" | LeadSource;

const SOURCE_FILTER_LABEL: Record<SourceFilter, string> = {
  all: "All sources",
  suggested: LEAD_SOURCE_LABEL.suggested,
  "self-booked": LEAD_SOURCE_LABEL["self-booked"],
  "own-contact": LEAD_SOURCE_LABEL["own-contact"],
};

const FILTER_LABEL: Record<FilterOption, string> = {
  all:               "All Leads",
  "today-meetings":  "Today's Meetings",
  "high-intent":     "High Intent",
  "ready-to-plan":   "Ready to Plan",
  "needs-followup":  "Needs Follow-up",
  "awaiting-client": "Awaiting Client",
  "decision-pending":"Decision Pending",
  stale:             "Stale · 5+ days",
};

export default function LeadPipelinePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [newTab, setNewTab] = useState<NewLeadsTab>("suggested");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  /* Scheduling content for leads: the same loops and compliance-approved content as the Marketing tab. */
  const { loops } = useMarketing();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleKey, setScheduleKey] = useState(0);
  const [scheduleAudiences, setScheduleAudiences] = useState<LoopAudience[]>([]);
  const [allLeads, setAllLeads] = useState<PipelineLead[]>(PIPELINE_LEADS);
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const leads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (search && !`${lead.name} ${leadGoals(lead).join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "today-meetings")  return !!lead.meetingLabel?.startsWith("Today");
      if (filter === "high-intent")     return lead.highIntent;
      if (filter === "ready-to-plan")   return lead.stage === "ready-for-advice";
      if (filter === "needs-followup")  return lead.stage === "needs-followup";
      if (filter === "awaiting-client") return lead.stage === "awaiting-details";
      if (filter === "decision-pending")return lead.stage === "decision-pending";
      if (filter === "stale")           return lead.lastActivitySort >= 5;
      return true;
    });
  }, [allLeads, search, filter, sourceFilter]);

  const suggested = useMemo(() => leads.filter((l) => l.stage === "suggested"), [leads]);

  function acceptLead(lead: PipelineLead) {
    setAllLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? { ...l, stage: "discovery-call", statusTag: "Accepted · call not booked", ctaLabel: "Schedule call →" }
          : l
      )
    );
  }

  function declineLead(lead: PipelineLead) {
    setAllLeads((prev) => prev.filter((l) => l.id !== lead.id));
  }

  function inviteContact(invite: ContactInvite) {
    const initials = invite.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    const lead: PipelineLead = {
      id: `I${Date.now()}`,
      slug: invite.name.toLowerCase().trim().replace(/\s+/g, "-"),
      name: invite.name,
      initials,
      goal: invite.goal,
      timeline: "",
      stage: "invited",
      source: "own-contact",
      completedNote: "Invite sent · just now",
      checklist: ["Join Fincaree", "Complete profile", "Share consent"],
      remindersSent: 0,
      statusTag: "Invite sent",
      ctaLabel: "Resend invite →",
      lastActivitySort: 0,
      highIntent: false,
      meetingThisWeek: false,
    };
    setAllLeads((prev) => [...prev, lead]);
    setNewTab("invited");
    setInviteNotice(`Invite sent to ${invite.name}. They're in New leads › Invited until they join.`);
    window.setTimeout(() => setInviteNotice(null), 8000);
  }

  function goToColumn(key: string) {
    if (key === "new") setNewTab(suggested.length > 0 ? "suggested" : "invited");
    document.getElementById(`stage-${key}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  /* Leads in the current view who can take marketing and aren't in a loop yet. */
  const enrolled = new Set(loops.flatMap((s) => s.leadList.map((l) => l.name)));
  const eligibleInView = leads.filter((l) => isMarketable(l) && !enrolled.has(l.name));

  function openSchedule(audiences: LoopAudience[]) {
    setScheduleAudiences(audiences);
    setScheduleKey((k) => k + 1);
    setScheduleOpen(true);
  }

  /* A group with similar patterns: whatever the board is filtered to. */
  function scheduleForView() {
    const goals = new Set(eligibleInView.map((l) => l.goal));
    const view: LoopAudience = { key: "view", label: "Leads in this view", goal: goals.size === 1 ? [...goals][0] : null, leads: eligibleInView };
    openSchedule([view, ...loopAudiences(loops)]);
  }

  function scheduleForLead(lead: PipelineLead) {
    setDrawerOpen(false);
    openSchedule([{ key: `lead:${lead.id}`, label: lead.name, goal: lead.goal || null, leads: [lead] }]);
  }

  function onScheduled(loop: NurtureSequence) {
    marketing.scheduleLoop(loop);
    setInviteNotice(`“${loop.name}” is scheduled for ${loop.leads} lead${loop.leads === 1 ? "" : "s"}. Manage it in Content Management › Marketing.`);
    window.setTimeout(() => setInviteNotice(null), 8000);
  }

  function openLead(lead: PipelineLead) {
    setSelectedLead(lead);
    setDrawerOpen(true);
  }

  return (
    <AppShell>
      <PageFrame width="full" title="Lead Pipeline" description="Turn conversations into long-term client relationships" actions={
        <Button variant="primary" size="sm" leadingIcon={<UserPlus size={14} strokeWidth={2} />} onClick={() => setInviteOpen(true)}>
          Invite contact
        </Button>
      }>
        {/* Upcoming Meetings | Today's Focus | AI Conversion Brief */}
        <PageGrid>
          <div className="col-span-12 lg:col-span-4 *:h-full"><UpcomingMeetingsCard onOpenLead={openLead} /></div>
          <div className="col-span-12 lg:col-span-4 *:h-full">
          <TodaysFocus
            onSelect={(f) => {
              setFilter(f);
              document.getElementById("pipeline-toolbar")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          </div>
          <div className="col-span-12 lg:col-span-4 *:h-full"><AiConversionBrief onOpenLead={openLead} /></div>
        </PageGrid>

        <StageOverviewStrip leads={leads} onSelect={goToColumn} />

        {/* Pipeline toolbar — scopes the board below */}
        <div id="pipeline-toolbar" className="flex items-center justify-between gap-2 scroll-mt-4">
          <div className="flex items-center gap-2">
            <div className="w-[288px]">
              <Input
                size="sm"
                placeholder="Filter leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leadingIcon={<Search size={14} strokeWidth={1.75} />}
                aria-label="Filter leads"
              />
            </div>
            <SelectField
              size="sm"
              value={filter}
              onValueChange={(v: unknown) => setFilter(v as FilterOption)}
              className="w-[190px]"
              aria-label="Filter leads"
              items={FILTER_LABEL}
            >
              {(Object.keys(FILTER_LABEL) as FilterOption[]).map((f) => (
                <SelectItem key={f} value={f}>{FILTER_LABEL[f]}</SelectItem>
              ))}
            </SelectField>
            <SelectField
              size="sm"
              value={sourceFilter}
              onValueChange={(v: unknown) => setSourceFilter(v as SourceFilter)}
              className="w-[190px]"
              aria-label="Filter by source"
              items={SOURCE_FILTER_LABEL}
            >
              {(Object.keys(SOURCE_FILTER_LABEL) as SourceFilter[]).map((f) => (
                <SelectItem key={f} value={f}>{SOURCE_FILTER_LABEL[f]}</SelectItem>
              ))}
            </SelectField>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<CalendarClock size={14} strokeWidth={1.75} />}
            disabled={eligibleInView.length === 0}
            title={eligibleInView.length === 0 ? "No leads in this view can take follow-up messages yet" : undefined}
            onClick={scheduleForView}
          >
            Schedule content{eligibleInView.length > 0 ? ` for ${eligibleInView.length} lead${eligibleInView.length === 1 ? "" : "s"}` : ""}
          </Button>
        </div>
        <p role="status" aria-live="polite" className="text-xs text-[var(--text-secondary)] min-h-0 empty:hidden">{inviteNotice}</p>

        {/* Pipeline board */}
        <PipelineBoard leads={leads} onOpenLead={openLead} onAcceptLead={acceptLead} onDeclineLead={declineLead} newTab={newTab} onNewTabChange={setNewTab} />
      </PageFrame>

      <InviteContactDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={inviteContact} />
      <ScheduleLoopDialog
        key={scheduleKey}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        items={MARKETING_CONTENT}
        audiences={scheduleAudiences}
        initial={null}
        onSchedule={onScheduled}
      />
      <LeadDrawer lead={selectedLead} open={drawerOpen} onOpenChange={setDrawerOpen} onScheduleContent={scheduleForLead} />
    </AppShell>
  );
}
