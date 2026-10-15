"use client";

import { PipelineCard } from "./PipelineCard";
import { PIPELINE_STAGES, PipelineLead } from "./pipeline-data";
import { cn } from "@/lib/utils";

/* ============================================================
   Pipeline Board — six columns, same shape as the Meeting Desk’s
   MeetingBoard: a soft-tinted column (no bordered box), a
   numbered accent circle + title + count pill in the header, and
   a thin accent bar underneath instead of a border. Cards carry
   no border accent of their own — status lives in the card body.
   ============================================================ */

const typeTextColor: Record<string, string> = {
  touchpoint: "text-[var(--text-brand-primary)]",
  "client-action": "text-[var(--text-tertiary)]",
  attention: "text-[var(--text-status-warning)]",
  ready: "text-[var(--text-status-success)]",
  decision: "text-[var(--text-brand-primary)]",
};

const typeIconColor: Record<string, string> = {
  touchpoint: "text-[var(--icon-brand-primary)]",
  "client-action": "text-[var(--icon-tertiary)]",
  attention: "text-[var(--icon-status-warning)]",
  ready: "text-[var(--icon-status-success-strong)]",
  decision: "text-[var(--icon-brand-primary)]",
};

interface PipelineBoardProps {
  leads: PipelineLead[];
  onOpenLead: (lead: PipelineLead) => void;
}

export function PipelineBoard({ leads, onOpenLead }: PipelineBoardProps) {
  return (
    <div className="fc-board-scroller">
      {PIPELINE_STAGES.map((stage) => {
        const Icon = stage.typeIcon;
        const columnLeads = leads.filter((l) => l.stage === stage.id);

        return (
          <section
            key={stage.id}
            aria-label={stage.title}
            className="flex-1 min-w-[320px] max-w-[420px] flex flex-col rounded-[var(--radius-xl)] bg-[var(--bg-subtle)]"
          >
            <header className="px-3 pt-3 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                  style={{ backgroundColor: stage.accent }}
                >
                  {stage.number}
                </span>
                <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">{stage.title}</h2>
                <span className="ml-auto text-[12px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-full px-2 py-0.5">
                  {columnLeads.length}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] leading-snug mt-1.5">{stage.subtitle}</p>
              <div className="mt-2.5 h-0.5 rounded-full" style={{ backgroundColor: stage.accent }} />
            </header>

            <div className="px-3 pb-3 flex flex-col gap-2.5 flex-1">
              {columnLeads.length === 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] py-8 text-center text-[12px] text-[var(--text-tertiary)]">
                  No leads at this stage
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <PipelineCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead)} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
