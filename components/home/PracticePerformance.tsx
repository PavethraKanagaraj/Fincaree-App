"use client";

/* ============================================================
   PracticePerformance — a bigger, dashboard-shaped widget: 4 quarter
   stat cards + a client-growth trend + a client-mix donut, in one
   card. Active Clients (86) and the Client Mix segments (summing to
   86) match the real figure already used elsewhere on Home (the
   Active Clients KPI card, Client Life Event Insights) — kept
   consistent rather than re-derived. Advisory Revenue, AUA, Client
   Retention, the 6-month growth trend and every "vs last quarter"
   delta are advisor-specified figures with no computed source in
   the app yet, same honesty note as the rest of Home's authored
   content (see home-data.ts).

   The period selector is real and now has all 6 options — but only
   drives the 4 stat cards (value + trend + comparison label) below,
   since that's the only part of the widget where "which period" is
   the right question: Client Growth is its own fixed trailing
   6-month trend, and Client Mix is a snapshot of the roster as it
   stands today, neither of which naturally changes by reporting
   period. "Custom range" doesn't get an authored dataset — there's
   no real date range behind it yet, so it shows a picker placeholder
   instead of fabricating numbers for whatever range someone might
   pick. ============================================================ */

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Info, Users, IndianRupee, Database, ShieldCheck, TrendingUp, CalendarRange } from "lucide-react";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/fincaree/tooltip";

/* ---- Period selector ---- */

type PerformancePeriod = "this-month" | "this-quarter" | "this-year" | "last-quarter" | "last-year" | "custom";

const PERIOD_OPTIONS: PerformancePeriod[] = ["this-month", "this-quarter", "this-year", "last-quarter", "last-year", "custom"];

const PERIOD_LABEL: Record<PerformancePeriod, string> = {
  "this-month": "This month",
  "this-quarter": "This quarter",
  "this-year": "This year",
  "last-quarter": "Last quarter",
  "last-year": "Last year",
  custom: "Custom range",
};

/* ---- Quarter stat cards — shell (icon/label) is period-independent;
   value/trend comes from PERIOD_METRICS below. ---- */

interface StatCardMeta {
  id: "active-clients" | "advisory-revenue" | "aua" | "retention";
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  iconFg: string;
}

const STAT_CARD_META: StatCardMeta[] = [
  {
    id: "active-clients",
    label: "Active Clients",
    icon: <Users size={18} strokeWidth={1.75} />,
    iconBg: "bg-[var(--bg-status-success-subtle)]",
    iconFg: "text-[var(--icon-status-success)]",
  },
  {
    id: "advisory-revenue",
    label: "Advisory Revenue",
    icon: <IndianRupee size={18} strokeWidth={1.75} />,
    iconBg: "bg-[var(--bg-status-info-subtle)]",
    iconFg: "text-[var(--icon-status-info)]",
  },
  {
    id: "aua",
    label: "Assets Under Advice (AUA)",
    icon: <Database size={18} strokeWidth={1.75} />,
    iconBg: "bg-[var(--bg-brand-subtle)]",
    iconFg: "text-[var(--icon-brand-primary)]",
  },
  {
    id: "retention",
    label: "Client Retention",
    icon: <ShieldCheck size={18} strokeWidth={1.75} />,
    iconBg: "bg-[var(--bg-status-warning-subtle)]",
    iconFg: "text-[var(--icon-status-warning)]",
  },
];

interface StatMetric {
  value: string;
  trend: number;
}

interface PeriodMetrics {
  comparisonLabel: string;
  "active-clients": StatMetric;
  "advisory-revenue": StatMetric;
  aua: StatMetric;
  retention: StatMetric;
}

/** "This quarter" matches the Active Clients figure used elsewhere on
    Home (86) — every other period is its own authored snapshot, not
    re-derived, since the practice's numbers genuinely were different
    a month/year/quarter ago. */
const PERIOD_METRICS: Record<Exclude<PerformancePeriod, "custom">, PeriodMetrics> = {
  "this-month": {
    comparisonLabel: "vs last month",
    "active-clients": { value: "86", trend: 2 },
    "advisory-revenue": { value: "₹8.9 L", trend: 3 },
    aua: { value: "₹152.4 Cr", trend: 2 },
    retention: { value: "96%", trend: 1 },
  },
  "this-quarter": {
    comparisonLabel: "vs last quarter",
    "active-clients": { value: "86", trend: 8 },
    "advisory-revenue": { value: "₹24.6 L", trend: 9 },
    aua: { value: "₹152.4 Cr", trend: 6 },
    retention: { value: "91%", trend: 4 },
  },
  "this-year": {
    comparisonLabel: "vs last year",
    "active-clients": { value: "86", trend: 22 },
    "advisory-revenue": { value: "₹96.8 L", trend: 28 },
    aua: { value: "₹152.4 Cr", trend: 19 },
    retention: { value: "89%", trend: 3 },
  },
  "last-quarter": {
    comparisonLabel: "vs quarter before",
    "active-clients": { value: "78", trend: 6 },
    "advisory-revenue": { value: "₹22.1 L", trend: 7 },
    aua: { value: "₹142.8 Cr", trend: 5 },
    retention: { value: "90%", trend: 3 },
  },
  "last-year": {
    comparisonLabel: "vs year before",
    "active-clients": { value: "63", trend: 15 },
    "advisory-revenue": { value: "₹71.2 L", trend: 18 },
    aua: { value: "₹118.6 Cr", trend: 14 },
    retention: { value: "87%", trend: 2 },
  },
};

/* ---- Client growth — one window per preset period. Each window ends at that
   period's Active Clients figure, and months shared between windows carry the
   same value so the timeline reads consistently whichever filter is chosen.
   baselineIndex is the point the period's "+N" is measured from. ---- */

interface GrowthPoint {
  label: string;
  clients: number;
}

interface GrowthView {
  subtitle: string;
  points: GrowthPoint[];
  baselineIndex: number;
  deltaLabel: string;
}

const GROWTH_BY_PERIOD: Record<Exclude<PerformancePeriod, "custom">, GrowthView> = {
  "this-month": {
    subtitle: "Active advisory clients, last 4 weeks",
    points: [
      { label: "Wk 1", clients: 84 },
      { label: "Wk 2", clients: 85 },
      { label: "Wk 3", clients: 85 },
      { label: "Wk 4", clients: 86 },
    ],
    baselineIndex: 0,
    deltaLabel: "this month",
  },
  "this-quarter": {
    subtitle: "Active advisory clients, Oct 2025 – Sep 2026",
    points: [
      { label: "Oct", clients: 58 },
      { label: "Nov", clients: 61 },
      { label: "Dec", clients: 63 },
      { label: "Jan", clients: 66 },
      { label: "Feb", clients: 68 },
      { label: "Mar", clients: 70 },
      { label: "Apr", clients: 72 },
      { label: "May", clients: 75 },
      { label: "Jun", clients: 78 },
      { label: "Jul", clients: 79 },
      { label: "Aug", clients: 83 },
      { label: "Sep", clients: 86 },
    ],
    baselineIndex: 8,
    deltaLabel: "this quarter",
  },
  "this-year": {
    subtitle: "Active advisory clients, Jan – Sep 2026",
    points: [
      { label: "Jan", clients: 66 },
      { label: "Feb", clients: 68 },
      { label: "Mar", clients: 70 },
      { label: "Apr", clients: 72 },
      { label: "May", clients: 75 },
      { label: "Jun", clients: 78 },
      { label: "Jul", clients: 79 },
      { label: "Aug", clients: 83 },
      { label: "Sep", clients: 86 },
    ],
    baselineIndex: 0,
    deltaLabel: "this year",
  },
  "last-quarter": {
    subtitle: "Active advisory clients, Jul 2025 – Jun 2026",
    points: [
      { label: "Jul", clients: 52 },
      { label: "Aug", clients: 55 },
      { label: "Sep", clients: 56 },
      { label: "Oct", clients: 58 },
      { label: "Nov", clients: 61 },
      { label: "Dec", clients: 63 },
      { label: "Jan", clients: 66 },
      { label: "Feb", clients: 68 },
      { label: "Mar", clients: 70 },
      { label: "Apr", clients: 72 },
      { label: "May", clients: 75 },
      { label: "Jun", clients: 78 },
    ],
    baselineIndex: 8,
    deltaLabel: "last quarter",
  },
  "last-year": {
    subtitle: "Active advisory clients, Jan – Dec 2025",
    points: [
      { label: "Jan", clients: 40 },
      { label: "Feb", clients: 43 },
      { label: "Mar", clients: 46 },
      { label: "Apr", clients: 48 },
      { label: "May", clients: 50 },
      { label: "Jun", clients: 51 },
      { label: "Jul", clients: 52 },
      { label: "Aug", clients: 55 },
      { label: "Sep", clients: 56 },
      { label: "Oct", clients: 58 },
      { label: "Nov", clients: 61 },
      { label: "Dec", clients: 63 },
    ],
    baselineIndex: 0,
    deltaLabel: "last year",
  },
};

/* ---- Client mix by subscription tier — segments sum to the real 86.
   Platinum/Gold/Silver → brand/warning/gray is the same tier-color
   convention the plan badges already use across Reports, Meetings
   and the Lead Pipeline (each page's own planColor() helper), reused
   here rather than inventing a separate chart palette for the same
   3 tiers. */

const CLIENT_MIX = [
  { id: "platinum", label: "Platinum", count: 34, color: "var(--chart-series-01)" },
  { id: "gold", label: "Gold", count: 36, color: "var(--chart-warning)" },
  { id: "silver", label: "Silver", count: 16, color: "var(--chart-neutral)" },
];
const CLIENT_MIX_TOTAL = CLIENT_MIX.reduce((sum, m) => sum + m.count, 0);

/** Rounded percentages that sum to exactly 100 — rounding each slice's
    share independently (e.g. 4/86 → 5%) can overshoot 100% in total;
    the last slice absorbs the remainder instead, same fix as the
    Client Engagement bars. */
const CLIENT_MIX_PCT: Record<string, number> = (() => {
  const result: Record<string, number> = {};
  let runningSum = 0;
  CLIENT_MIX.forEach((m, i) => {
    if (i === CLIENT_MIX.length - 1) {
      result[m.id] = 100 - runningSum;
    } else {
      const pct = Math.round((m.count / CLIENT_MIX_TOTAL) * 100);
      result[m.id] = pct;
      runningSum += pct;
    }
  });
  return result;
})();

export function PracticePerformance() {
  const [period, setPeriod] = useState<PerformancePeriod>("this-quarter");
  const metrics = period === "custom" ? null : PERIOD_METRICS[period];
  const growth = period === "custom" ? null : GROWTH_BY_PERIOD[period];
  const growthDelta = growth
    ? growth.points[growth.points.length - 1].clients - growth.points[growth.baselineIndex].clients
    : 0;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-[var(--text-primary)]">Practice Performance</span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button type="button" className="text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)]" aria-label="About this widget">
                      <Info size={14} strokeWidth={1.75} />
                    </button>
                  }
                />
                <TooltipContent side="top">
                  A snapshot of practice health — client base, revenue, assets under advice and retention — for the selected period.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-sm text-[var(--text-tertiary)] mt-0.5">Track the health and growth of your advisory practice</div>
          </div>
        </div>
        <SelectField
          size="sm"
          value={period}
          onValueChange={(v: unknown) => setPeriod(v as PerformancePeriod)}
          aria-label="Reporting period"
          className="w-[150px] shrink-0"
          items={PERIOD_LABEL}
        >
          {PERIOD_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>
              {PERIOD_LABEL[p]}
            </SelectItem>
          ))}
        </SelectField>
      </div>

      {/* Stat cards */}
      {metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {STAT_CARD_META.map((card) => {
            const stat = metrics[card.id];
            return (
              <div key={card.id} className="rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconFg}`}>
                    {card.icon}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{card.label}</span>
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums mb-2">{stat.value}</div>
                <span className="inline-flex items-center gap-0.5 px-2 h-6 rounded-full bg-[var(--bg-status-success-subtle)] text-xs font-semibold text-[var(--text-status-success)]">
                  <TrendingUp size={11} strokeWidth={2.25} />
                  {stat.trend}%
                </span>
                <div className="text-xs text-[var(--text-tertiary)] mt-1.5">{metrics.comparisonLabel}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] p-6 mb-5 flex flex-col items-center text-center gap-2">
          <span className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] text-[var(--icon-tertiary)] flex items-center justify-center">
            <CalendarRange size={16} strokeWidth={1.75} />
          </span>
          <p className="text-sm font-medium text-[var(--text-primary)]">Pick a custom date range</p>
          <p className="text-xs text-[var(--text-tertiary)] max-w-xs">
            Practice performance for a custom range isn&apos;t available in this preview — choose one of the preset periods above instead.
          </p>
        </div>
      )}

      {/* Client growth + client mix */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 lg:gap-0 lg:divide-x lg:divide-[var(--border-tertiary)] pt-5 border-t border-[var(--border-tertiary)]">
        {/* Client growth */}
        <div className="lg:pr-12">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <div className="text-base font-bold text-[var(--text-primary)]">Client Growth</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{growth?.subtitle ?? "Pick a preset period to see client growth"}</div>
            </div>
            {growth && (
              <span className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full bg-[var(--bg-status-success-subtle)] text-xs font-semibold text-[var(--text-status-success)] shrink-0">
                <TrendingUp size={12} strokeWidth={2.25} />
                +{growthDelta} clients {growth.deltaLabel}
              </span>
            )}
          </div>
          {growth ? (
          <div style={{ width: "100%", height: 200 }} className="mt-3">
            <ResponsiveContainer>
              <AreaChart data={growth.points} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientGrowthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-positive)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--chart-positive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border-tertiary)" />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--border-tertiary)" }} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} />
                <YAxis domain={[0, 120]} ticks={[0, 40, 80, 120]} tickLine={false} axisLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} width={36} />
                <ChartTooltip
                  contentStyle={{ background: "var(--bg-primary)", border: "1px solid var(--border-tertiary)", borderRadius: "var(--radius-md)", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="clients"
                  stroke="var(--chart-positive)"
                  strokeWidth={2.5}
                  fill="url(#clientGrowthFill)"
                  dot={{ r: 4, fill: "var(--chart-positive)", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  label={{ position: "top", offset: 10, fill: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] h-[200px] mt-3 flex items-center justify-center text-xs text-[var(--text-tertiary)]">
            Client growth is shown for preset periods only.
          </div>
          )}
        </div>

        {/* Client mix by plan */}
        <div className="lg:pl-12 lg:self-center lg:justify-self-end">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-[var(--text-primary)]">Client Mix by Tier</span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button type="button" className="text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)]" aria-label="About this chart">
                    <Info size={13} strokeWidth={1.75} />
                  </button>
                }
              />
              <TooltipContent side="top">Share of active advisory clients by subscription tier.</TooltipContent>
            </Tooltip>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5 mb-2">Based on active advisory clients</div>
          <div className="flex items-center gap-8">
            <div style={{ width: 200, height: 200 }} className="relative shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={CLIENT_MIX}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={64}
                    outerRadius={96}
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {CLIENT_MIX.map((m) => (
                      <Cell key={m.id} fill={m.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[var(--text-primary)] tabular-nums leading-none">{CLIENT_MIX_TOTAL}</span>
                <span className="text-xs text-[var(--text-tertiary)] mt-0.5">Clients</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              {CLIENT_MIX.map((m) => (
                <div key={m.id} className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ background: m.color }} aria-hidden="true" />
                  <span className="text-sm text-[var(--text-primary)] leading-snug">
                    {m.label}
                    <span className="block text-xs text-[var(--text-tertiary)]">
                      {m.count} ({CLIENT_MIX_PCT[m.id]}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
