"use client";

import { Badge } from "@/components/fincaree/badge";
import { FINANCIAL_SNAPSHOT, GoalGapCard, LEAD_IDENTITY } from "./data";
import { Sparkles, Lightbulb, ArrowRight, Eye } from "lucide-react";

/* ============================================================
   Section 3 — Financial Snapshot (populated, Stage 3+)
   AI-generated the moment the quick profile is submitted, and
   surfaced automatically on the prospect's own dashboard — the
   advisor never sends it. This section mirrors what the
   prospect is already seeing, not a draft awaiting advisor
   action.
   ============================================================ */

const bandColor: Record<string, string> = {
  "on-track": "var(--color-success-500)",
  "at-risk": "var(--color-warning-500)",
  behind: "var(--color-error-500)",
};

const feasibilityColor: Record<GoalGapCard["feasibility"], "success" | "warning" | "error"> = {
  achievable: "success",
  tight: "warning",
  unlikely: "error",
};

function ReadinessDial({ score, tone }: { score: number; tone: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={tone} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{score}</span>
      </div>
    </div>
  );
}

export function FinancialSnapshotSection() {
  const tone = bandColor[FINANCIAL_SNAPSHOT.status];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <h2 className="text-base font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
            AI-Generated Financial Snapshot
          </h2>
        </div>
        <Badge color="gray" size="sm">Free Tier — based on self-reported data</Badge>
      </div>
      <p className="flex items-center gap-1.5 text-[12px] text-[var(--text-brand-secondary)] mb-1">
        <Eye size={11} strokeWidth={2} className="shrink-0" />
        {LEAD_IDENTITY.name.split(" ")[0]} can already see this on her dashboard — no need to send it. Use it to prepare, not to share.
      </p>

      {/* Goal readiness score */}
      <div className="flex items-center gap-4 my-4 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-primary)]">
        <ReadinessDial score={FINANCIAL_SNAPSHOT.goalReadinessScore} tone={tone} />
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Goal Readiness Score</p>
          <p className="text-xs text-[var(--text-tertiary)]">{FINANCIAL_SNAPSHOT.basis}</p>
        </div>
      </div>

      {/* Goal gap cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {FINANCIAL_SNAPSHOT.goalGaps.map((g) => (
          <div key={g.goal} className="rounded-[var(--radius-lg)] bg-[var(--bg-primary)] p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{g.goal}</span>
              <Badge color={feasibilityColor[g.feasibility]} size="sm">{g.feasibility}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs mb-1.5">
              <div>
                <span className="text-[var(--text-tertiary)]">Target: </span>
                <span className="text-[var(--text-primary)] font-medium">{g.target}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Gap: </span>
                <span className="text-[var(--text-primary)] font-medium">{g.gap}</span>
              </div>
            </div>
            <p className="text-[12px] text-[var(--text-tertiary)] italic">Estimate based on limited data</p>
          </div>
        ))}
      </div>

      {/* Key insights */}
      <div className="mb-4">
        <p className="text-[12px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider mb-2">Key Insights</p>
        <ul className="space-y-1.5">
          {FINANCIAL_SNAPSHOT.keyInsights.map((insight) => (
            <li key={insight} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-snug">
              <Lightbulb size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)] mt-0.5 shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* What the advisor should do next */}
      <div className="mb-4">
        <p className="text-[12px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider mb-2">What You Should Do Next</p>
        <ul className="space-y-1">
          {FINANCIAL_SNAPSHOT.advisorNextSteps.map((step) => (
            <li key={step} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <ArrowRight size={11} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0" />
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-[var(--border-brand-secondary)]">
        <p className="text-[12px] text-[var(--text-brand-secondary)]">
          These numbers are self-reported, not verified — treat the gap as a conversation starter, not a fact to quote back to her.
        </p>
      </div>
    </section>
  );
}
