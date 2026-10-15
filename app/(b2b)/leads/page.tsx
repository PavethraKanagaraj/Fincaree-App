"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Button } from "@/components/fincaree/button";
import { Search, Plus } from "lucide-react";

import { AiConversionBrief } from "@/components/leads/AiConversionBrief";
import { TodaysFocus } from "@/components/leads/TodaysFocus";
import { UpcomingMeetingsCard } from "@/components/leads/UpcomingMeetingsCard";
import { PipelineBoard } from "@/components/leads/PipelineBoard";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { PIPELINE_LEADS, PipelineLead } from "@/components/leads/pipeline-data";

/* ============================================================
   Lead Pipeline — /leads
   An AI-assisted advisor conversion workspace, not "a Kanban
   board that happens to contain leads." The AI brief and Today's
   Focus tell the advisor what needs attention; the board tells
   them where each prospect stands in the pre-plan-selection
   journey; a card click opens context without leaving the board.
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
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const leads = useMemo(() => {
    return PIPELINE_LEADS.filter((lead) => {
      if (search && !`${lead.name} ${lead.goal}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "today-meetings")  return !!lead.meetingLabel?.startsWith("Today");
      if (filter === "high-intent")     return lead.highIntent;
      if (filter === "ready-to-plan")   return lead.stage === "ready-for-advice";
      if (filter === "needs-followup")  return lead.stage === "needs-followup";
      if (filter === "awaiting-client") return lead.stage === "awaiting-details";
      if (filter === "decision-pending")return lead.stage === "decision-pending";
      if (filter === "stale")           return lead.lastActivitySort >= 5;
      return true;
    });
  }, [search, filter]);

  function openLead(lead: PipelineLead) {
    setSelectedLead(lead);
    setDrawerOpen(true);
  }

  return (
    <AppShell>
      <div className="px-6 py-5 max-w-[1440px] mx-auto space-y-4">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">Lead Pipeline</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Turn conversations into long-term client relationships</p>
        </div>

        {/* Upcoming Meetings | Today's Focus | AI Conversion Brief */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
          <UpcomingMeetingsCard onOpenLead={openLead} />
          <TodaysFocus
            onSelect={(f) => {
              setFilter(f);
              document.getElementById("pipeline-toolbar")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <AiConversionBrief onOpenLead={openLead} />
        </div>

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
          </div>
          <Button variant="primary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />}>
            Add Lead
          </Button>
        </div>

        {/* Pipeline board */}
        <PipelineBoard leads={leads} onOpenLead={openLead} />
      </div>

      <LeadDrawer lead={selectedLead} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </AppShell>
  );
}
