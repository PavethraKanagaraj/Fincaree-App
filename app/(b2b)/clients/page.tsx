"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/fincaree/tabs";
import { DataTable, type DataTableColumn } from "@/components/fincaree/data-table";
import { CountUp } from "@/components/ui/count-up";
import { GOAL_LIMIT_BY_PLAN, clientSummary, formatRupees, type RiskProfile } from "@/components/client-profile/client-summary";
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, ChevronRight } from "lucide-react";
import {
  CLIENTS,
  ENGAGEMENT_STATE_LABEL,
  TOPIC_LABEL,
  type AdvisoryContext,
  type Client,
  type ClientPlan,
  type EngagementState4,
} from "@/components/client-suggestions/content-data";

/* ============================================================
   Clients — /clients
   Everyone you advise, across the three subscriptions. Silver is
   the advisory plan; Gold and Platinum are wealth management.

   A strip of four numbers says what needs doing across the clients
   shown. The tabs split the list by plan, and the plan column is only
   drawn on "All", since under a plan tab every row would say the same.
   Each row carries what an advisor scans for: main goal, engagement,
   anything needing attention, and when the next review is due. A row
   opens that client's profile.
   ============================================================ */

type PlanTab = "all" | ClientPlan;

const PLAN_ORDER: ClientPlan[] = ["Silver", "Gold", "Platinum"];
const PLAN_BADGE: Record<ClientPlan, "brand" | "warning" | "gray"> = { Platinum: "brand", Gold: "warning", Silver: "gray" };
const PLAN_DOT: Record<ClientPlan, string> = { Platinum: "var(--icon-brand-primary)", Gold: "var(--icon-status-warning)", Silver: "var(--icon-tertiary)" };
const PLAN_SERVICE: Record<ClientPlan, string> = { Platinum: "Wealth management", Gold: "Wealth management", Silver: "Advisory" };

/* The arrow says which way the relationship is leaning: up for highly engaged, down for inactive. */
const ENGAGEMENT_ARROW: Record<EngagementState4, { icon: typeof ArrowUp; color: string }> = {
  "highly-engaged": { icon: ArrowUp, color: "var(--icon-status-success)" },
  active: { icon: ArrowUpRight, color: "var(--icon-status-info)" },
  "needs-attention": { icon: ArrowDownRight, color: "var(--icon-status-warning)" },
  inactive: { icon: ArrowDown, color: "var(--icon-tertiary)" },
};

const LIFE_STAGE_LABEL: Record<Client["lifeStage"], string> = { working: "Working", "pre-retirement": "Pre-retirement", retired: "Retired" };

const ATTENTION: Record<AdvisoryContext, { label: string; color: "warning" | "error" | "brand" }> = {
  "review-due": { label: "Review due", color: "warning" },
  "goal-off-track": { label: "Goal off track", color: "error" },
  "new-client": { label: "New client", color: "brand" },
};

const RISK_LABEL: Record<RiskProfile, string> = { conservative: "Conservative", moderate: "Moderate", aggressive: "Aggressive" };
const RISK_DOT: Record<RiskProfile, string> = {
  conservative: "var(--icon-status-success)",
  moderate: "var(--icon-status-warning)",
  aggressive: "var(--icon-status-error)",
};
/* Only the Gold profile is built so far, so only Gold clients open it. The rest stay as plain rows
   until their profiles exist. */
const hasProfile = (c: Client) => c.plan === "Gold";

const countOf = (plan: ClientPlan) => CLIENTS.filter((c) => c.plan === plan).length;

function buildColumns(showPlan: boolean): DataTableColumn<Client>[] {
  const cols: DataTableColumn<Client>[] = [
    {
      id: "client",
      header: "Client",
      cell: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar size="md" initials={c.initials} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{c.name}</p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
              {c.id} · {LIFE_STAGE_LABEL[c.lifeStage]}
            </p>
          </div>
        </div>
      ),
    },
  ];
  if (showPlan) {
    cols.push({
      id: "plan",
      header: "Plan",
      width: "w-44",
      cell: (c) => (
        <div>
          <Badge size="sm" color={PLAN_BADGE[c.plan]} leadingIcon="dot">
            {c.plan}
          </Badge>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{PLAN_SERVICE[c.plan]}</p>
        </div>
      ),
    });
  }
  cols.push(
    {
      id: "aua",
      header: "Assets under advice",
      width: "w-44",
      className: "whitespace-nowrap",
      cell: (c) => <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">{formatRupees(clientSummary(c).assetsUnderAdvice)}</span>,
    },
    {
      id: "goal",
      header: "Goals",
      width: "w-72",
      cell: (c) => {
        const limit = GOAL_LIMIT_BY_PLAN[c.plan];
        const over = c.goals.length > limit;
        /* Every goal as a tag, the main one first and tinted; then how much of the plan's limit is used. */
        return (
          <div>
            <div className="flex flex-wrap gap-1.5">
              {c.goals.map((g) => (
                <span
                  key={g}
                  className={
                    g === c.primaryGoal
                      ? "inline-flex items-center rounded-full bg-[var(--bg-brand-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-brand-primary)]"
                      : "inline-flex items-center rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]"
                  }
                >
                  {TOPIC_LABEL[g]}
                </span>
              ))}
            </div>
            <p className={over ? "mt-1.5 text-xs font-semibold text-[var(--text-status-warning)] tabular-nums" : "mt-1.5 text-xs text-[var(--text-tertiary)] tabular-nums"}>
              {c.goals.length} of {limit} goals{over ? " · over the plan limit" : ""}
            </p>
          </div>
        );
      },
    },
    {
      id: "risk",
      header: "Risk profile",
      width: "w-40",
      cell: (c) => {
        const risk = clientSummary(c).risk;
        return (
          <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_DOT[risk] }} />
            {RISK_LABEL[risk]}
          </span>
        );
      },
    },
    {
      id: "engagement",
      header: "Engagement",
      width: "w-44",
      cell: (c) => {
        const { icon: Arrow, color } = ENGAGEMENT_ARROW[c.engagement];
        return (
          <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Arrow size={16} strokeWidth={2.25} aria-hidden="true" style={{ color }} />
            {ENGAGEMENT_STATE_LABEL[c.engagement]}
          </span>
        );
      },
    },
    {
      id: "attention",
      header: "Needs attention",
      width: "w-52",
      cell: (c) =>
        c.advisoryContext.length === 0 ? (
          <span className="text-sm text-[var(--text-tertiary)]">Nothing open</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {c.advisoryContext.map((a) => (
              <Badge key={a} size="sm" color={ATTENTION[a].color}>
                {ATTENTION[a].label}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      id: "renewal",
      header: "Renewal",
      width: "w-36",
      className: "whitespace-nowrap",
      cell: (c) => {
        const d = clientSummary(c).planInDays;
        const soon = d <= 30;
        return (
          <div>
            <p className={soon ? "text-sm font-semibold tabular-nums text-[var(--text-status-warning)]" : "text-sm tabular-nums text-[var(--text-secondary)]"}>
              {d < 0 ? `Ended ${Math.abs(d)} days ago` : c.plan === "Silver" ? `Ends in ${d} days` : `Renews in ${d} days`}
            </p>
          </div>
        );
      },
    },
    {
      id: "open",
      header: <span className="sr-only">Open profile</span>,
      width: "w-10",
      cell: (c) => (hasProfile(c) ? <ChevronRight size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" aria-hidden="true" /> : null),
    }
  );
  return cols;
}

export default function ClientsPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanTab>("all");

  const rows = useMemo(() => (plan === "all" ? CLIENTS : CLIENTS.filter((c) => c.plan === plan)), [plan]);
  const columns = useMemo(() => buildColumns(plan === "all"), [plan]);

  const stats = [
    { label: plan === "all" ? "Clients" : `${plan} clients`, value: rows.length },
    { label: "Highly engaged", value: rows.filter((c) => c.engagement === "highly-engaged").length },
    { label: "Plans renewing or ending in 30 days", value: rows.filter((c) => { const d = clientSummary(c).planInDays; return d >= 0 && d <= 30; }).length },
    { label: "Goals off track", value: rows.filter((c) => c.advisoryContext.includes("goal-off-track")).length },
  ];

  return (
    <AppShell>
      <PageFrame width="full" title="Clients" description="Everyone you advise, across Silver, Gold and Platinum">
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[var(--border-tertiary)] rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] py-4">
          {stats.map((x) => (
            <div key={x.label} className="px-5">
              <dd className="text-2xl font-bold leading-none tabular-nums text-[var(--text-primary)]">
                <CountUp key={`${plan}-${x.label}`} value={x.value} duration={600} />
              </dd>
              <dt className="mt-1.5 text-xs text-[var(--text-tertiary)]">{x.label}</dt>
            </div>
          ))}
        </dl>

        <Tabs value={plan} onValueChange={(v) => setPlan(v as PlanTab)} variant="pill">
          <TabsList aria-label="Plan">
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">{CLIENTS.length}</span>
            </TabsTrigger>
            {PLAN_ORDER.map((p) => (
              <TabsTrigger key={p} value={p}>
                <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: PLAN_DOT[p] }} />
                {p}
                <span className="ml-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">{countOf(p)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <DataTable
          key={plan}
          rows={rows}
          columns={columns}
          getRowId={(c) => c.id}
          noun="clients"
          pageSize={12}
          search={{ placeholder: "Search by name, ID or goal…", width: "w-[300px]", getText: (c) => [c.name, c.id, TOPIC_LABEL[c.primaryGoal], c.plan] }}
          onRowClick={(c) => router.push(`/client-profile?client=${c.id}`)}
          isRowClickable={hasProfile}
          aria-label="Clients"
        />
      </PageFrame>
    </AppShell>
  );
}
