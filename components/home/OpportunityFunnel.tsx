"use client";

/* ============================================================
   OpportunityFunnel — Lead → Subscribed → Client → Engaged →
   Wealth Management Opportunity, filterable by Week/Month/Year
   like the Client Engagement widget. For "Month", Lead and Client
   are real counts (the Lead Pipeline and the shared client
   roster); everything else — the stages between/after, the
   conversion captions and the period-over-period trend — is
   authored for this card. See home-data.ts
   (WEALTH_OPPORTUNITY_FUNNEL_BY_PERIOD) for exactly which numbers
   are grounded and which aren't.

   Each stage is a plain proportional-width bar (count / first-stage
   count), not a decorative 3D funnel shape. Stages are connected by
   a dotted line carrying the real conversion rate between them —
   the number that actually explains the drop, rather than leaving
   the reader to divide two counts themselves.
   ============================================================ */

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { buttonVariants } from "@/components/fincaree/button";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import {
  WEALTH_OPPORTUNITY_FUNNEL_BY_PERIOD,
  ENGAGEMENT_PERIOD_LABEL,
  type EngagementPeriod,
  type FunnelStage,
} from "./home-data";

const PERIOD_OPTIONS: EngagementPeriod[] = ["week", "month", "year"];

/** SelectField only shows the right label on the closed trigger when
    given this value→label map directly — Select.Value doesn't read
    SelectItem's own children for that (see select.tsx's SelectItem
    comment). */
const PERIOD_SELECT_LABEL: Record<EngagementPeriod, string> = {
  week: `This ${ENGAGEMENT_PERIOD_LABEL.week}`,
  month: `This ${ENGAGEMENT_PERIOD_LABEL.month}`,
  year: `This ${ENGAGEMENT_PERIOD_LABEL.year}`,
};

/* Darkest at the top of the funnel, lightest at the bottom — same
   direction the funnel narrows in, so color reinforces the shape. */
const BAR_COLORS = [
  "var(--color-success-700)",
  "var(--color-success-600)",
  "var(--color-success-500)",
  "var(--color-success-400)",
  "var(--color-success-300)",
];

function TrendPill({ trend }: { trend: number | null }) {
  if (trend === null) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-6 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)] shrink-0">
        <Minus size={12} strokeWidth={2} />
      </span>
    );
  }
  const positive = trend >= 0;
  return (
    <span
      className={cnPill(positive)}
    >
      {positive ? <TrendingUp size={11} strokeWidth={2.25} /> : <TrendingDown size={11} strokeWidth={2.25} />}
      {Math.abs(trend)}%
    </span>
  );
}

function cnPill(positive: boolean): string {
  return [
    "inline-flex items-center gap-0.5 px-2 h-6 rounded-full text-xs font-semibold shrink-0",
    positive
      ? "bg-[var(--bg-status-success-subtle)] text-[var(--text-status-success)]"
      : "bg-[var(--bg-status-error-subtle)] text-[var(--text-status-error)]",
  ].join(" ");
}

function ConversionConnector({ stage, prevCount }: { stage: FunnelStage; prevCount: number }) {
  const pct = Math.round((stage.count / prevCount) * 100);
  return (
    <div className="flex items-stretch gap-4">
      <div className="w-36 shrink-0" aria-hidden="true" />
      <div className="flex-1 flex items-center gap-2.5 py-1.5 pl-[1px]">
        <div className="flex flex-col items-center self-stretch shrink-0" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-secondary)]" />
          <span className="flex-1 w-px border-l border-dashed border-[var(--border-secondary)]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-secondary)]" />
        </div>
        <span className="inline-flex items-center px-2 h-6 rounded-full bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-primary)] shrink-0 tabular-nums">
          {pct}%
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">{stage.conversionCaption}</span>
      </div>
      <div className="w-14 shrink-0" aria-hidden="true" />
      <div className="w-28 shrink-0" aria-hidden="true" />
    </div>
  );
}

export function OpportunityFunnel() {
  const [period, setPeriod] = useState<EngagementPeriod>("month");
  const data = WEALTH_OPPORTUNITY_FUNNEL_BY_PERIOD[period];
  const max = data[0].count;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="text-base font-semibold text-[var(--text-primary)]">Lead → Wealth Management Opportunity</span>
        <div className="flex items-center gap-2 shrink-0">
          <SelectField
            size="sm"
            value={period}
            onValueChange={(v: unknown) => setPeriod(v as EngagementPeriod)}
            aria-label="Filter funnel by time range"
            className="w-[140px] shrink-0"
            items={PERIOD_SELECT_LABEL}
          >
            {PERIOD_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {PERIOD_SELECT_LABEL[p]}
              </SelectItem>
            ))}
          </SelectField>
          <Link href="/leads" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
              <span className="fc-btn-label">View All</span>
            </span>
          </Link>
        </div>
      </div>

      <div>
        {data.map((stage, i) => {
          const pct = Math.max((stage.count / max) * 100, 4);
          return (
            <div key={stage.id}>
              {i > 0 && <ConversionConnector stage={stage} prevCount={data[i - 1].count} />}
              <div className="flex items-center gap-4">
                <div className="w-36 shrink-0">
                  <div className="text-sm font-bold text-[var(--text-primary)] leading-snug">{stage.label}</div>
                  <div className="text-xs text-[var(--text-tertiary)] leading-snug">{stage.description}</div>
                </div>
                <div className="flex-1 h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right">
                  <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{stage.count}</span>
                </div>
                <div className="w-28 shrink-0 flex items-center justify-end gap-1.5">
                  {i > 0 && (
                    <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
                      {Math.round((stage.count / data[i - 1].count) * 100)}%
                    </span>
                  )}
                  <TrendPill trend={stage.trend} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
