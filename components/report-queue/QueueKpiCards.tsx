"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/fincaree/button";
import { ArrowRight, Layers, Clock, CalendarClock, AlertTriangle } from "lucide-react";
import { Report, SavedView, matchesSavedView, sortReportsByUrgency } from "./data";

/* ============================================================
   Queue KPI cards — "how much work?" at a glance, same card
   language as the Meetings page's attention row: icon badge, big
   count, label + supporting text, an optional "what's next" line,
   a CTA. Clicking a card jumps to All Reports pre-filtered to
   that saved view.
   ============================================================ */

interface KpiCard {
  id: SavedView;
  icon: React.ReactNode;
  label: string;
  supporting: string;
  cta: string;
  emphasis: "default" | "critical" | "warning";
}

const CARDS: KpiCard[] = [
  {
    id: "my-queue",
    icon: <Layers size={18} strokeWidth={1.75} />,
    label: "My Queue",
    supporting: "Active reports needing your review",
    cta: "View queue",
    emphasis: "default",
  },
  {
    id: "due-today",
    icon: <Clock size={18} strokeWidth={1.75} />,
    label: "Due Today",
    supporting: "Reports due by end of day",
    cta: "Review now",
    emphasis: "warning",
  },
  {
    id: "meeting-blockers",
    icon: <CalendarClock size={18} strokeWidth={1.75} />,
    label: "Meeting Blockers",
    supporting: "Blocking an upcoming client meeting",
    cta: "Resolve now",
    emphasis: "critical",
  },
  {
    id: "needs-attention",
    icon: <AlertTriangle size={18} strokeWidth={1.75} />,
    label: "Needs Attention",
    supporting: "Data gaps or compliance flags to resolve",
    cta: "Review issues",
    emphasis: "warning",
  },
];

const emphasisConfig = {
  default: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-tertiary)]",
    icon: "bg-[var(--bg-secondary)] text-[var(--icon-tertiary)]",
    count: "text-[var(--text-primary)]",
    cta: "text-[var(--text-brand-primary)] hover:text-[var(--text-brand-primary)]",
    detail: "text-[var(--text-tertiary)]",
  },
  critical: {
    card: "bg-[var(--bg-primary)] border-2 border-[var(--border-status-error)]",
    icon: "bg-[var(--bg-status-error-subtle)] text-[var(--icon-status-error)]",
    count: "text-[var(--text-status-error)]",
    cta: "text-[var(--text-status-error)] hover:text-[var(--text-status-error)]",
    detail: "text-[var(--text-status-error)]",
  },
  warning: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-status-warning-subtle)]",
    icon: "bg-[var(--bg-status-warning-subtle)] text-[var(--icon-status-warning)]",
    count: "text-[var(--text-status-warning)]",
    cta: "text-[var(--text-status-warning)] hover:text-[var(--text-status-warning)]",
    detail: "text-[var(--text-tertiary)]",
  },
};

/** "Next: <client>, <when>" — the same genuinely-computed "what's next"
    line the meeting cards use, not a decorative placeholder. */
function nextDetail(matches: Report[]): string | undefined {
  if (matches.length === 0) return undefined;
  const [next] = sortReportsByUrgency(matches);
  return `Next: ${next.client.name}, ${next.reviewBy.label}`;
}

interface QueueKpiCardsProps {
  reports: Report[];
  onSelect: (view: SavedView) => void;
}

export function QueueKpiCards({ reports, onSelect }: QueueKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card) => {
        const matches = reports.filter((r) => matchesSavedView(r, card.id));
        const cfg = emphasisConfig[card.emphasis];
        const detail = card.id === "my-queue" ? undefined : nextDetail(matches);
        return (
          <div
            key={card.id}
            className={cn("rounded-[var(--radius-xl)] p-5", "transition-shadow hover:shadow-[var(--shadow-sm)]", cfg.card)}
          >
            {/* Header: icon beside label */}
            <div className="flex items-center gap-3 mb-3.5">
              <span className={cn("w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0", cfg.icon)}>
                {card.icon}
              </span>
              <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug min-w-0">{card.label}</div>
            </div>

            {/* Value + supporting context */}
            <span className={cn("block text-3xl font-bold leading-none tabular-nums", cfg.count)}>
              {matches.length}
            </span>

            {detail && (
              <div className={cn("text-xs leading-snug mt-2", cfg.detail)}>{detail}</div>
            )}

            <Button
              variant="link-grey"
              size="sm"
              trailingIcon={<ArrowRight size={12} strokeWidth={2.5} />}
              onClick={() => onSelect(card.id)}
              className={cn("text-[12px] font-semibold mt-3", cfg.cta)}
            >
              {card.cta}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
