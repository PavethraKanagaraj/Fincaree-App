"use client";

/* ============================================================
   PipelineSummaryCards — Home's 6-card KPI row: Active Clients,
   New Leads, Today's Meetings, Client Queries, Work Due Today,
   Finny Insights. Content and ordering as specified; see
   home-data.ts (HOME_KPI_CARDS) for exactly which numbers are
   wired to real data on this page and which are advisor-specified
   figures with no computed source yet.
   ============================================================ */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/fincaree/button";
import { Users, UserPlus, CalendarClock, MessageCircleQuestion, ListChecks, Sparkles, ArrowRight } from "lucide-react";
import { HOME_KPI_CARDS, type HomeKpiCard } from "./home-data";

const ICON: Record<HomeKpiCard["id"], React.ReactNode> = {
  "active-clients": <Users size={16} strokeWidth={1.75} />,
  "new-leads": <UserPlus size={16} strokeWidth={1.75} />,
  "todays-meetings": <CalendarClock size={16} strokeWidth={1.75} />,
  "client-queries": <MessageCircleQuestion size={16} strokeWidth={1.75} />,
  "work-due-today": <ListChecks size={16} strokeWidth={1.75} />,
  "finny-insights": <Sparkles size={16} strokeWidth={1.75} />,
};

/* Card framing stays neutral for every card — color is reserved for the
   count/icon/detail, the actual signal. A colored border on every card
   (when, realistically, most cards have *something* needing attention)
   reads as noise, not meaning: cards with colored borders in a row say
   nothing a plain border plus a colored number didn't already say.
   "Warning" uses the Fincaree brand green rather than amber — these are
   "worth a look" counts, not system alerts, so brand green keeps the
   tone consistent with the rest of the product's own data callouts. */
const emphasisConfig = {
  default: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-tertiary)]",
    icon: "bg-[var(--bg-secondary)] text-[var(--icon-tertiary)]",
    count: "text-[var(--text-primary)]",
    detail: "text-[var(--text-tertiary)]",
  },
  warning: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-tertiary)]",
    icon: "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]",
    count: "text-[var(--text-brand-primary)]",
    detail: "text-[var(--text-brand-primary)]",
  },
  ai: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-tertiary)]",
    icon: "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]",
    count: "text-[var(--text-primary)]",
    detail: "text-[var(--text-tertiary)]",
  },
};

function SummaryCard({ id, count, label, detail, cta, href, emphasis }: HomeKpiCard) {
  const cfg = emphasisConfig[emphasis];
  return (
    <div className={cn("rounded-[var(--radius-xl)] p-4", "transition-shadow hover:shadow-[var(--shadow-sm)]", cfg.card)}>
      {/* Header: icon beside label */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className={cn("w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0", cfg.icon)}>
          {ICON[id]}
        </span>
        <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug min-w-0">{label}</div>
      </div>

      {/* Value + supporting context */}
      <div className={cn("text-2xl font-bold leading-none tabular-nums", cfg.count)}>{count}</div>
      {detail && <div className={cn("text-xs leading-snug mt-1.5", cfg.detail)}>{detail}</div>}

      <Link href={href} className={cn(buttonVariants({ variant: "link-grey", size: "sm" }), "text-[12px] font-semibold mt-2.5")}>
        <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
          <span className="fc-btn-label">{cta}</span>
          <span className="fc-btn-icon shrink-0" aria-hidden="true">
            <ArrowRight size={12} strokeWidth={2.5} />
          </span>
        </span>
      </Link>
    </div>
  );
}

export function PipelineSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {HOME_KPI_CARDS.map((card) => (
        <SummaryCard key={card.id} {...card} />
      ))}
    </div>
  );
}
