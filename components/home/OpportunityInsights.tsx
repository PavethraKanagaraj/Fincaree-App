"use client";

/* ============================================================
   OpportunityInsights — two views on the same idea, Finny surfacing
   something across the whole client book rather than one client at
   a time: "Client Life Event" is the broad radar (how many clients
   are near a given life stage); "Client Signals" is the narrower,
   actionable subset Finny has already flagged as worth a look right
   now. A client can appear in both — e.g. in the Life Event radar's
   broader "Child education milestone" count and, if their goal is
   due soon enough to act on, in the Signals tab's narrower
   "Child education milestone approaching" — the two numbers aren't
   expected to match, they're different scopes.

   Every count here is an advisor-specified figure — there's no
   portfolio-wide life-event or signal detector computed anywhere in
   the app yet, same honesty note as Home's Active Clients/New Leads
   KPI cards and Practice Performance (see home-data.ts).
   ============================================================ */

import Link from "next/link";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/fincaree/button";
import { Badge, type BadgeColor } from "@/components/fincaree/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/fincaree/tooltip";
import {
  Lightbulb,
  Info,
  ChevronRight,
  Clock,
  GraduationCap,
  Home as HomeIcon,
  Heart,
  Landmark,
  HandCoins,
  Wallet,
  ShieldCheck,
} from "lucide-react";

/* ---- Tab 1: Client Life Event — the broad radar ---- */

interface LifeEvent {
  id: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  badgeBg: string;
  badgeFg: string;
  /** The event's colour, used for its share of the bar. */
  color: string;
}

const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "retirement",
    label: "Retirement approaching",
    count: 18,
    icon: <Clock size={15} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-warning-subtle)]",
    badgeFg: "text-[var(--icon-status-warning)]",
    color: "var(--icon-status-warning)",
  },
  {
    id: "education",
    label: "Child education milestone",
    count: 24,
    icon: <GraduationCap size={15} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-success-subtle)]",
    badgeFg: "text-[var(--icon-status-success)]",
    color: "var(--icon-status-success)",
  },
  {
    id: "home",
    label: "Home purchase planned",
    count: 16,
    icon: <HomeIcon size={15} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-info-subtle)]",
    badgeFg: "text-[var(--icon-status-info)]",
    color: "var(--icon-status-info)",
  },
  {
    id: "marriage",
    label: "Marriage / family change",
    count: 11,
    icon: <Heart size={15} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-error-subtle)]",
    badgeFg: "text-[var(--icon-status-error)]",
    color: "var(--icon-status-error)",
  },
  {
    id: "liquidity",
    label: "Significant liquidity change",
    count: 7,
    icon: <Landmark size={15} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-brand-subtle)]",
    badgeFg: "text-[var(--icon-brand-primary)]",
    color: "var(--icon-brand-primary)",
  },
];

/* ---- Tab 2: Client Signals — the narrower, actionable subset ---- */

const SIGNAL_STATS = [
  { id: "actionable", value: 25, label: "Actionable signals", description: "Needs advisor attention", color: "var(--text-status-warning)" },
  { id: "planning", value: 18, label: "Planning opportunities", description: "Goals or plan gaps", color: "var(--text-status-info)" },
  { id: "relationship", value: 7, label: "Relationship opportunities", description: "Deeper discussion possible", color: "var(--text-status-success)" },
];

interface OpportunitySignal {
  id: string;
  title: string;
  description: string;
  clientCount: number;
  icon: React.ReactNode;
  badgeBg: string;
  badgeFg: string;
  pillColor: BadgeColor;
}

const OPPORTUNITY_SIGNALS: OpportunitySignal[] = [
  {
    id: "retirement-gap",
    title: "Retirement gap needs review",
    description: "Goal projection is below target for 8 clients.",
    clientCount: 8,
    icon: <HandCoins size={17} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-success-subtle)]",
    badgeFg: "text-[var(--icon-status-success)]",
    pillColor: "success",
  },
  {
    id: "idle-cash",
    title: "Large idle cash balance",
    description: "₹48 L across savings and liquid funds in 5 clients.",
    clientCount: 5,
    icon: <Wallet size={17} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-warning-subtle)]",
    badgeFg: "text-[var(--icon-status-warning)]",
    pillColor: "warning",
  },
  {
    id: "insurance-gap",
    title: "Insurance coverage gap",
    description: "Current coverage may not match stated needs for 6 clients.",
    clientCount: 6,
    icon: <ShieldCheck size={17} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-info-subtle)]",
    badgeFg: "text-[var(--icon-status-info)]",
    pillColor: "gray-blue",
  },
  {
    id: "education-approaching",
    title: "Child education milestone approaching",
    description: "Education goal due in next 5 years for 4 clients.",
    clientCount: 4,
    icon: <GraduationCap size={17} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-brand-subtle)]",
    badgeFg: "text-[var(--icon-brand-primary)]",
    pillColor: "brand",
  },
  {
    id: "home-purchase",
    title: "Home purchase planned",
    description: "Down payment goal within 24 months for 3 clients.",
    clientCount: 3,
    icon: <HomeIcon size={17} strokeWidth={1.75} />,
    badgeBg: "bg-[var(--bg-status-error-subtle)]",
    badgeFg: "text-[var(--icon-status-error)]",
    pillColor: "error",
  },
];

function ClientLifeEventCard() {
  const total = LIFE_EVENTS.reduce((sum, e) => sum + e.count, 0);
  /* Biggest first, so the most common life event leads. */
  const events = [...LIFE_EVENTS].sort((a, b) => b.count - a.count);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 flex flex-col">
      <div>
        <span className="text-base font-semibold text-[var(--text-primary)]">Client Life Event</span>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Clients approaching each life stage</p>
      </div>

      {/* Just the numbers: how many clients, and that event's share of all of them. */}
      <ul className="mt-3 grid flex-1 auto-rows-fr grid-cols-2 gap-3">
        {events.map((event, i) => {
          const spansRow = i === events.length - 1 && events.length % 2 === 1;
          return (
            <li key={event.id} className={cn(spansRow && "col-span-2")}>
              <button
                type="button"
                className="flex h-full w-full flex-col justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] px-4 py-4 text-left transition-colors duration-150 hover:border-[var(--border-secondary)] hover:bg-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)] motion-reduce:transition-none"
              >
                <span className="flex items-center gap-2.5">
                  <span className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", event.badgeBg, event.badgeFg)}>{event.icon}</span>
                  <span className="text-sm font-medium text-[var(--text-secondary)] leading-snug">{event.label}</span>
                </span>
                <span className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-3xl font-bold leading-none text-[var(--text-primary)]"><CountUp value={event.count} delay={250 + i * 70} /></span>
                  <span className="text-sm text-[var(--text-tertiary)]">clients</span>
                  <span className="ml-auto rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                    {Math.round((event.count / total) * 100)}% of total
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ClientSignalsCard() {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <span className="text-base font-semibold text-[var(--text-primary)]">Client Signals</span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 mb-5">
        {SIGNAL_STATS.map((stat) => (
          <div key={stat.id} className="rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-4">
            <div className="text-3xl font-bold tabular-nums leading-none" style={{ color: stat.color }}>
              <CountUp value={stat.value} delay={250} />
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)] mt-2">{stat.label}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{stat.description}</div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="text-sm font-bold text-[var(--text-primary)]">Top opportunity insights</div>
        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Based on client profile, connected accounts and recent activity</div>
      </div>

      <div className="divide-y divide-[var(--border-tertiary)]">
        {OPPORTUNITY_SIGNALS.map((signal) => (
          <button
            key={signal.id}
            type="button"
            className={cn(
              "group relative flex w-full items-center gap-3 py-3 text-left outline-none",
              /* The same pale grey wash as the other dashboard cards, on a layer behind the row, so
                 nothing moves and the dividers stay straight. */
              "before:pointer-events-none before:absolute before:inset-y-0 before:-inset-x-2 before:rounded-[var(--radius-lg)]",
              "before:bg-[color-mix(in_srgb,var(--bg-secondary)_40%,transparent)] before:opacity-0",
              "before:transition-opacity before:duration-150 before:ease-out motion-reduce:before:transition-none",
              "hover:before:opacity-100 focus-visible:before:opacity-100",
              "focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)] focus-visible:ring-offset-2"
            )}
          >
            <span className={cn("relative w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0", signal.badgeBg, signal.badgeFg)}>
              {signal.icon}
            </span>
            <div className="relative flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-brand-primary)] transition-colors">
                {signal.title}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug">{signal.description}</div>
            </div>
            <Badge size="sm" color={signal.pillColor} className="relative shrink-0">
              {signal.clientCount} clients
            </Badge>
            <ChevronRight size={16} strokeWidth={1.75} className="relative shrink-0 text-[var(--icon-tertiary)] transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--icon-brand-primary)] motion-reduce:transition-none motion-reduce:transform-none" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function OpportunityInsights() {
  return (
    <section aria-label="Opportunity Insights" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      {/* The parent card: its header, then the two views of the same idea beneath it. */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--bg-status-warning-subtle)] text-[var(--icon-status-warning)] flex items-center justify-center shrink-0">
            <Lightbulb size={18} strokeWidth={1.75} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-[var(--text-primary)]">Opportunity Insights</span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button type="button" className="text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)]" aria-label="About this widget">
                      <Info size={14} strokeWidth={1.75} />
                    </button>
                  }
                />
                <TooltipContent side="top">
                  Client Life Event is the broad radar across your book; Client Signals is the narrower set Finny has already flagged as worth acting on.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-sm text-[var(--text-tertiary)] mt-0.5">Signals across your client relationships</div>
          </div>
        </div>
        <Link href="/clients" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">View All</span>
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ClientLifeEventCard />
        <ClientSignalsCard />
      </div>
    </section>
  );
}
