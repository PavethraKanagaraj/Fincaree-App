"use client";

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { LEAD_ACTIVITY, LEAD_STAGES, LeadActivityFilter, LeadActor } from "./data";
import { Sparkles, UserPlus, ClipboardList, BarChart3, Users, MessageCircle, Link2, FileText, CreditCard, History } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_ICON: Record<string, typeof UserPlus> = {
  discover: UserPlus,
  "quick-profile": ClipboardList,
  snapshot: BarChart3,
  matching: Users,
  discovery: MessageCircle,
  "detailed-data": Link2,
  "plan-generated": FileText,
  subscribe: CreditCard,
};

const FILTERS: { id: LeadActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mine", label: "My Actions" },
  { id: "prospect", label: "Prospect Actions" },
  { id: "ai", label: "AI" },
  { id: "system", label: "System" },
];

const actorFilterMatch: Record<LeadActivityFilter, LeadActor | null> = {
  all: null,
  mine: "Advisor",
  prospect: "Client",
  ai: "AI",
  system: "System",
};

const actorSurface: Record<LeadActor, string> = {
  AI: "bg-[var(--bg-brand-subtle)]",
  Advisor: "bg-[var(--bg-primary)]",
  Client: "bg-[var(--bg-secondary)]",
  System: "bg-[var(--bg-tertiary)]",
};

export function LeadActivityTimeline() {
  const [filter, setFilter] = useState<LeadActivityFilter>("all");
  const match = actorFilterMatch[filter];
  const entries = LEAD_ACTIVITY.filter((e) => !match || e.actor === match);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <History size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Lead Activity Timeline</h2>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-2.5 py-1 rounded-[var(--radius-md)] text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-[var(--bg-brand-primary)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ol className="space-y-0">
        {entries.map((entry, i) => {
          const Icon = entry.isAI ? Sparkles : STAGE_ICON[entry.stageId];
          const stage = LEAD_STAGES.find((s) => s.id === entry.stageId);
          const isLast = i === entries.length - 1;
          return (
            <li key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0 w-6">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border shrink-0",
                    entry.isAI
                      ? "border-[var(--border-brand-secondary)] text-[var(--icon-brand-primary)] bg-[var(--bg-brand-subtle)]"
                      : "border-[var(--border-tertiary)] text-[var(--icon-tertiary)] bg-[var(--bg-secondary)]"
                  )}
                >
                  <Icon size={12} strokeWidth={2} />
                </span>
                {!isLast && <span className="w-px flex-1 bg-[var(--border-tertiary)] my-1" />}
              </div>
              <div className={cn("flex-1 min-w-0 pb-4 rounded-[var(--radius-md)] px-3 py-2 -mt-1", actorSurface[entry.actor])}>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{entry.title}</span>
                  {entry.isAI && <Badge color="brand" size="sm">AI</Badge>}
                  {stage && <Badge color="gray" size="sm">{stage.label}</Badge>}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-0.5">{entry.description}</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">{entry.date} · {entry.time} · {entry.actor}</p>
              </div>
            </li>
          );
        })}
        {entries.length === 0 && (
          <p className="text-sm text-[var(--text-tertiary)] py-2">No activity matches this filter.</p>
        )}
      </ol>
    </section>
  );
}
