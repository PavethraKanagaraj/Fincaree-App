"use client";

/* ============================================================
   OpportunityFunnel — Leads and subscriptions, kept simple.

   1. Who is on which plan: leads, then clients on Silver (advisory)
      and on Gold and Platinum (wealth management).
   2. Lead to client drop-off for the chosen period: how many leads
      became clients and how many dropped off on the way.
   3. Silver plans, in three tabs, because that is where the next
      conversation is:
        Ending soon       plans about to end
        Ready to upgrade  active, engaged clients showing signs of
                          outgrowing Silver (see home-data.ts)
        No response       approached after the plan ended, and gone quiet

   The counts, plan dates and approaches are the ones home-data.ts
   describes; the drop-off reads the lead and client stages of the
   funnel data for the period.
   ============================================================ */

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ui/count-up";
import { ArrowRight, Info, TrendingDown } from "lucide-react";
import { buttonVariants } from "@/components/fincaree/button";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Avatar } from "@/components/fincaree/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/fincaree/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/fincaree/tooltip";
import {
  CLIENTS_BY_PLAN,
  ENGAGEMENT_PERIOD_LABEL,
  SILVER_ENDING_SOON,
  SILVER_NO_RESPONSE,
  SILVER_OPPORTUNITIES,
  WEALTH_OPPORTUNITY_FUNNEL_BY_PERIOD,
  type EngagementPeriod,
} from "./home-data";

const PERIOD_OPTIONS: EngagementPeriod[] = ["week", "month", "year"];

/** SelectField only shows the right label on the closed trigger when given this map directly. */
const PERIOD_SELECT_LABEL: Record<EngagementPeriod, string> = {
  week: `This ${ENGAGEMENT_PERIOD_LABEL.week}`,
  month: `This ${ENGAGEMENT_PERIOD_LABEL.month}`,
  year: `This ${ENGAGEMENT_PERIOD_LABEL.year}`,
};

type SilverTab = "ending" | "upgrade" | "stale";

const ENGAGEMENT_LABEL: Record<string, string> = {
  "highly-engaged": "Highly engaged",
  active: "Active",
  "needs-attention": "Needs attention",
  inactive: "Inactive",
};

export function OpportunityFunnel() {
  const [period, setPeriod] = useState<EngagementPeriod>("month");
  const [tab, setTab] = useState<SilverTab>("ending");

  const stages = WEALTH_OPPORTUNITY_FUNNEL_BY_PERIOD[period];
  const leads = stages.find((s) => s.id === "lead")?.count ?? 0;
  const clients = stages.find((s) => s.id === "client")?.count ?? 0;
  const dropped = Math.max(leads - clients, 0);
  const convertedPct = leads === 0 ? 0 : Math.round((clients / leads) * 100);

  const totalClients = CLIENTS_BY_PLAN.Platinum + CLIENTS_BY_PLAN.Gold + CLIENTS_BY_PLAN.Silver;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="text-base font-semibold text-[var(--text-primary)]">Leads &amp; Subscriptions</span>
        <Link href="/leads" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">View All</span>
          </span>
        </Link>
      </div>

      {/* 1 — who is on which plan */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--border-tertiary)] rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] py-3">
        {[
          { label: "Leads", value: leads, note: "in the pipeline", dot: "var(--icon-brand-primary)" },
          { label: "Silver", value: CLIENTS_BY_PLAN.Silver, note: "Advisory clients", dot: "var(--icon-tertiary)" },
          { label: "Gold", value: CLIENTS_BY_PLAN.Gold, note: "Wealth management", dot: "var(--icon-status-warning)" },
          { label: "Platinum", value: CLIENTS_BY_PLAN.Platinum, note: "Wealth management", dot: "var(--icon-status-success)" },
        ].map((x) => (
          <div key={x.label} className="px-4 first:pl-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: x.dot }} />
              {x.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-[var(--text-primary)] leading-none"><CountUp value={x.value} delay={250} /></dd>
            <dd className="mt-1 text-xs text-[var(--text-tertiary)]">{x.note}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-[var(--text-tertiary)] tabular-nums">{totalClients} clients in total</p>

      {/* 2 — lead to client drop-off */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Lead to client</h3>
          <SelectField
            size="sm"
            value={period}
            onValueChange={(v: unknown) => setPeriod(v as EngagementPeriod)}
            aria-label="Filter by time range"
            className="w-[140px] shrink-0"
            items={PERIOD_SELECT_LABEL}
          >
            {PERIOD_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {PERIOD_SELECT_LABEL[p]}
              </SelectItem>
            ))}
          </SelectField>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-3xl font-bold leading-none tabular-nums text-[var(--text-primary)]"><CountUp value={convertedPct} delay={350} />%</span>
          <span className="text-sm text-[var(--text-secondary)] tabular-nums">
            became clients · {clients} of {leads} leads
          </span>
          {dropped > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--bg-status-error-subtle)] px-2.5 py-1 text-sm font-semibold tabular-nums text-[var(--text-status-error)]">
              <TrendingDown size={14} strokeWidth={2.25} aria-hidden="true" />
              {dropped} dropped off
            </span>
          )}
        </div>
        <div role="img" aria-label={`${clients} of ${leads} leads became clients`} className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
          <div className="fc-grow h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${convertedPct}%`, backgroundColor: "var(--color-success-600)", ["--rise-i" as string]: 1 }} />
        </div>
      </div>

      {/* 3 — Silver plans */}
      <div className="mt-6 border-t border-[var(--border-tertiary)] pt-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Silver plans</h3>
          <Tooltip>
            <TooltipTrigger
              render={
                <button type="button" className="text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)]" aria-label="How these are found">
                  <Info size={14} strokeWidth={1.75} />
                </button>
              }
            />
            <TooltipContent side="top">
              Ending soon: plans ending in the next 10 days. Ready to upgrade: active, engaged clients with two or more signs of outgrowing Silver, such as a bigger goal, content or workshops joined, or questions asked. No response: approached after the plan ended and quiet for a week or more.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as SilverTab)} variant="pill">
            <TabsList aria-label="Silver plans">
              <TabsTrigger value="ending">
                Ending soon
                <span className="ml-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">{SILVER_ENDING_SOON.length}</span>
              </TabsTrigger>
              <TabsTrigger value="upgrade">
                Ready to upgrade
                <span className="ml-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">{SILVER_OPPORTUNITIES.length}</span>
              </TabsTrigger>
              <TabsTrigger value="stale">
                No response
                <span className="ml-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">{SILVER_NO_RESPONSE.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ul className="mt-2 divide-y divide-[var(--border-tertiary)]">
          {tab === "ending" &&
            SILVER_ENDING_SOON.map((r) => (
              <Row
                key={r.client.id}
                initials={r.client.initials}
                name={r.client.name}
                line={`${ENGAGEMENT_LABEL[r.client.engagement] ?? r.client.engagement}`}
                aside={r.endsInDays === 0 ? "Ends today" : `Ends in ${r.endsInDays} day${r.endsInDays === 1 ? "" : "s"}`}
                urgent={r.endsInDays <= 5}
              />
            ))}

          {tab === "upgrade" &&
            SILVER_OPPORTUNITIES.slice(0, 4).map(({ client, signals }) => (
              <Row
                key={client.id}
                initials={client.initials}
                name={client.name}
                chips={signals}
                aside={`${signals.length} of 5 signals`}
              />
            ))}

          {tab === "stale" &&
            SILVER_NO_RESPONSE.map((r) => (
              <Row
                key={r.client.id}
                initials={r.client.initials}
                name={r.client.name}
                line={`Plan ended ${Math.abs(r.endsInDays)} days ago · approached ${r.approachedDaysAgo} days ago, no reply`}
                aside="Follow up or close"
              />
            ))}
        </ul>
      </div>
    </section>
  );
}

function Row({
  initials,
  name,
  line,
  chips,
  aside,
  urgent,
}: {
  initials: string;
  name: string;
  line?: string;
  chips?: string[];
  aside: string;
  urgent?: boolean;
}) {
  return (
    <li>
      <Link
        href="/client-profile"
        className="group flex items-center gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)] focus-visible:ring-offset-2"
      >
        <Avatar size="sm" initials={initials} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate transition-colors group-hover:text-[var(--text-brand-primary)]">{name}</p>
          {line && <p className="mt-0.5 text-xs text-[var(--text-tertiary)] truncate">{line}</p>}
          {chips && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span key={c} className="inline-flex items-center rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className={cn("shrink-0 text-xs font-semibold tabular-nums", urgent ? "text-[var(--text-status-error)]" : "text-[var(--text-status-warning)]")}>{aside}</span>
        <ArrowRight size={16} strokeWidth={1.75} className="shrink-0 text-[var(--icon-tertiary)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  );
}
