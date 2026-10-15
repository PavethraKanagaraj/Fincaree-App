"use client";

/* ============================================================
   ClientEngagementChart — client engagement, split by the same
   3 subscription tiers used across Reports/Meetings/Leads
   (Platinum/Gold/Silver), filterable by Week/Month/Year. Tier
   totals are the real 14-client roster and don't move with the
   filter; the engagement band within each tier is authored per
   period (see home-data.ts) since no cross-client engagement
   score exists elsewhere yet.

   Stats row (today's snapshot) → one 100%-stacked bar per tier
   (composition, not raw count) → a 0–100% scale → a legend that
   spells out what each band actually means. Built with plain
   flex/width bars rather than a chart library: the bars need a
   fixed-width tier label outside them and a white percentage
   label centered inside each segment, which is simpler to get
   exactly right by hand than through a charting API.
   ============================================================ */

import { useState } from "react";
import { Info } from "lucide-react";
import { ButtonGroup } from "@/components/fincaree/button-group";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/fincaree/tooltip";
import {
  ENGAGEMENT_BY_TIER_BY_PERIOD,
  ENGAGEMENT_PERIOD_LABEL,
  ENGAGEMENT_TOTAL_CLIENTS,
  type EngagementPeriod,
  type TierEngagement,
} from "./home-data";

type BandKey = "highlyEngaged" | "engaged" | "needsAttention";

/* One shade per band, used for the dot, the bar fill and the stat-row
   percentage text alike. The default --chart-* tokens (calibrated as
   light chart fills) don't hold 4.5:1 against either white overlay text
   or a white page background at normal text weight, so this picks the
   step in the same Fincaree color family that actually clears AA for
   all three uses rather than quietly failing contrast. */
const BANDS: { key: BandKey; label: string; description: string; color: string }[] = [
  { key: "highlyEngaged", label: "Highly Engaged", description: "Active and consistent engagement", color: "var(--color-success-600)" },
  { key: "engaged", label: "Engaged", description: "Some engagement", color: "var(--color-brand-600)" },
  { key: "needsAttention", label: "Needs Attention", description: "Low engagement or recent inactivity", color: "var(--color-warning-700)" },
];

const SCALE_TICKS = [0, 20, 40, 60, 80, 100];
const PERIOD_OPTIONS: EngagementPeriod[] = ["week", "month", "year"];

/** Hide a segment's own percentage label once the segment is too narrow
    to hold it legibly — the bar still shows the true proportion, just
    without text that would overflow or collide with its neighbor. */
const MIN_LABEL_PCT = 8;

function tierTotal(t: TierEngagement): number {
  return t.highlyEngaged + t.engaged + t.needsAttention;
}

/** Per-band widths for one tier's bar, rounded to whole percent but
    forced to sum to exactly 100 — independently rounding each band
    (e.g. 1/3 → 33% three times) leaves a 1–2% gap that the rounded
    bar end then renders as a flat edge instead of a curve, since
    nothing actually reaches the container's rounded corner. The last
    non-zero band absorbs the rounding remainder instead. */
function bandWidths(t: TierEngagement): { band: (typeof BANDS)[number]; pct: number }[] {
  const total = tierTotal(t);
  const nonZero = BANDS.filter((band) => t[band.key] > 0);
  const widths = nonZero.map((band, i) => ({
    band,
    pct: i === nonZero.length - 1 ? 0 : Math.round((t[band.key] / total) * 100),
  }));
  const roundedSum = widths.reduce((sum, w) => sum + w.pct, 0);
  if (widths.length > 0) widths[widths.length - 1].pct = 100 - roundedSum;
  return widths;
}

export function ClientEngagementChart() {
  const [period, setPeriod] = useState<EngagementPeriod>("month");
  const data = ENGAGEMENT_BY_TIER_BY_PERIOD[period];

  const totals = data.reduce(
    (acc, t) => ({
      highlyEngaged: acc.highlyEngaged + t.highlyEngaged,
      engaged: acc.engaged + t.engaged,
      needsAttention: acc.needsAttention + t.needsAttention,
    }),
    { highlyEngaged: 0, engaged: 0, needsAttention: 0 }
  );

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-[var(--text-primary)]">Client Engagement</span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button type="button" className="text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)]" aria-label="About this chart">
                    <Info size={14} strokeWidth={1.75} />
                  </button>
                }
              />
              <TooltipContent side="top">
                Engagement band reflects how recently and how often each client has interacted with you over the selected period.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
            By subscription tier · {ENGAGEMENT_TOTAL_CLIENTS} clients
          </div>
        </div>
        <ButtonGroup
          options={PERIOD_OPTIONS.map((p) => ({ value: p, label: ENGAGEMENT_PERIOD_LABEL[p] }))}
          value={period}
          onChange={(v) => setPeriod(v as EngagementPeriod)}
          aria-label="Filter client engagement by time range"
          className="shrink-0"
        />
      </div>

      {/* Stats row */}
      <div className="flex items-stretch divide-x divide-[var(--border-tertiary)] mb-6">
        <div className="pr-5">
          <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums leading-none">
            {ENGAGEMENT_TOTAL_CLIENTS}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1.5">Total clients</div>
        </div>
        {BANDS.map((band) => {
          const count = totals[band.key];
          const pct = Math.round((count / ENGAGEMENT_TOTAL_CLIENTS) * 100);
          return (
            <div key={band.key} className="px-5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: band.color }} aria-hidden="true" />
                <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums leading-none">{count}</span>
                <span className="text-sm font-semibold" style={{ color: band.color }}>
                  {pct}%
                </span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1.5">{band.label}</div>
            </div>
          );
        })}
      </div>

      {/* Per-tier 100%-stacked bars */}
      <div className="space-y-3">
        {data.map((t) => {
          const total = tierTotal(t);
          return (
            <div key={t.tier} className="flex items-center gap-3">
              <div className="w-20 shrink-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{t.tier}</div>
                <div className="text-xs text-[var(--text-tertiary)] leading-snug">{total} clients</div>
              </div>
              <div className="flex-1 h-9 rounded-[var(--radius-md)] overflow-hidden flex">
                {bandWidths(t).map(({ band, pct }) => (
                  <div
                    key={band.key}
                    className="h-full flex items-center justify-center shrink-0"
                    style={{ width: `${pct}%`, background: band.color }}
                  >
                    {pct >= MIN_LABEL_PCT && (
                      <span className="text-xs font-bold text-white">{pct}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 0–100% scale */}
      <div className="flex items-center gap-3 mt-2.5">
        <div className="w-20 shrink-0" aria-hidden="true" />
        <div className="flex-1 flex justify-between border-t border-[var(--border-tertiary)] pt-1.5">
          {SCALE_TICKS.map((tick) => (
            <span key={tick} className="text-xs text-[var(--text-tertiary)] tabular-nums">
              {tick}%
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-start divide-x divide-[var(--border-tertiary)] mt-5 pt-4 border-t border-[var(--border-tertiary)]">
        {BANDS.map((band) => (
          <div key={band.key} className="px-5 first:pl-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: band.color }} aria-hidden="true" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">{band.label}</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug">{band.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
