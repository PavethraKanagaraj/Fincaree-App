"use client";

import { PipelineCard } from "./PipelineCard";
import { SuggestedLeadCard } from "./SuggestedLeadCard";
import { PIPELINE_STAGES, PipelineLead, PipelineStageId } from "./pipeline-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/fincaree/tabs";
import { cn } from "@/lib/utils";

/* ============================================================
   Pipeline Board — seven columns, same shape as the Meeting Desk’s
   MeetingBoard: a soft-tinted column (no bordered box), a
   numbered accent circle + title + count pill in the header, and
   a thin accent bar underneath instead of a border. Cards carry
   no border accent of their own — status lives in the card body.
   ============================================================ */

const typeTextColor: Record<string, string> = {
  inbound: "text-[var(--text-brand-primary)]",
  touchpoint: "text-[var(--text-brand-primary)]",
  "client-action": "text-[var(--text-tertiary)]",
  attention: "text-[var(--text-status-warning)]",
  ready: "text-[var(--text-status-success)]",
  decision: "text-[var(--text-brand-primary)]",
};

const typeIconColor: Record<string, string> = {
  inbound: "text-[var(--icon-brand-primary)]",
  touchpoint: "text-[var(--icon-brand-primary)]",
  "client-action": "text-[var(--icon-tertiary)]",
  attention: "text-[var(--icon-status-warning)]",
  ready: "text-[var(--icon-status-success-strong)]",
  decision: "text-[var(--icon-brand-primary)]",
};

/* Suggested and Invited are the same stage — a lead nobody has
   talked to yet — and differ only in who acts next (the advisor
   accepts a suggestion; the contact joins an invite). They share one
   "New leads" column with a tab for each source. */
export type NewLeadsTab = "suggested" | "invited";
const NEW_STAGE_IDS: PipelineStageId[] = ["suggested", "invited"];

export interface BoardColumn {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  stageIds: PipelineStageId[];
}

export const COLUMNS: BoardColumn[] = [
  {
    key: "new",
    title: "New leads",
    subtitle: "Matched to you or invited by you",
    accent: "var(--color-blue-600)",
    stageIds: NEW_STAGE_IDS,
  },
  ...PIPELINE_STAGES.filter((s) => !NEW_STAGE_IDS.includes(s.id)).map((s) => ({
    key: s.id,
    title: s.title,
    subtitle: s.subtitle,
    accent: s.accent,
    stageIds: [s.id],
  })),
];

interface PipelineBoardProps {
  leads: PipelineLead[];
  onOpenLead: (lead: PipelineLead) => void;
  onAcceptLead: (lead: PipelineLead) => void;
  onDeclineLead: (lead: PipelineLead) => void;
  newTab: NewLeadsTab;
  onNewTabChange: (tab: NewLeadsTab) => void;
}

export function PipelineBoard({ leads, onOpenLead, onAcceptLead, onDeclineLead, newTab, onNewTabChange }: PipelineBoardProps) {
  function renderCard(lead: PipelineLead) {
    return lead.stage === "suggested" ? (
      <SuggestedLeadCard
        key={lead.id}
        lead={lead}
        onOpen={() => onOpenLead(lead)}
        onAccept={() => onAcceptLead(lead)}
        onDecline={() => onDeclineLead(lead)}
      />
    ) : (
      <PipelineCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead)} />
    );
  }

  return (
    <div className="fc-board-scroller">
      {COLUMNS.map((col, i) => {
        const columnLeads = leads.filter((l) => col.stageIds.includes(l.stage));
        const isNew = col.key === "new";
        const visible = isNew ? columnLeads.filter((l) => l.stage === newTab) : columnLeads;
        const count = (id: PipelineStageId) => leads.filter((l) => l.stage === id).length;

        return (
          <section
            key={col.key}
            aria-label={col.title}
            id={`stage-${col.key}`}
            className="flex-1 min-w-[320px] max-w-[420px] flex flex-col rounded-[var(--radius-xl)] bg-[var(--bg-subtle)]"
          >
            <header className="px-3 pt-3 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                  style={{ backgroundColor: col.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">{col.title}</h2>
                <span className="ml-auto text-[12px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-full px-2 py-0.5">
                  {columnLeads.length}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] leading-snug mt-1.5">{col.subtitle}</p>
              <div className="mt-2.5 h-0.5 rounded-full" style={{ backgroundColor: col.accent }} />
              {isNew && (
                <Tabs value={newTab} onValueChange={(v) => onNewTabChange(v as NewLeadsTab)} className="mt-2.5">
                  <TabsList aria-label="New leads source">
                    <TabsTrigger value="suggested">Suggested · {count("suggested")}</TabsTrigger>
                    <TabsTrigger value="invited">Invited · {count("invited")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </header>

            <div className="px-3 pb-3 flex flex-col gap-2.5 flex-1">
              {visible.length === 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] py-8 text-center text-[12px] text-[var(--text-tertiary)]">
                  {isNew
                    ? newTab === "suggested" ? "No suggestions waiting" : "No pending invites"
                    : "No leads at this stage"}
                </div>
              ) : (
                visible.map(renderCard)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
