"use client";

import { ClientGoal, ClientProfileData, RELATIONSHIP_STAGE_LABELS, formatINR } from "../client-data";
import { Badge } from "@/components/fincaree/badge";
import { Sparkles, ArrowRight, TrendingUp, GraduationCap, Target } from "lucide-react";

const GOAL_STATUS_LABEL: Record<ClientGoal["status"], string> = {
  "on-track": "On track",
  "needs-review": "Needs review",
  "needs-attention": "Needs attention",
};
const GOAL_STATUS_COLOR: Record<ClientGoal["status"], "gray" | "brand" | "error" | "warning" | "success" | "gray-blue"> = {
  "on-track": "success",
  "needs-review": "warning",
  "needs-attention": "error",
};
const GOAL_ICONS: Record<string, any> = {
  retirement: TrendingUp,
  education: GraduationCap,
  wealth: TrendingUp,
  protection: Target,
  tax: Target,
};

/** Trade-offs are only meaningful for goals that actually need a decision —
    a goal that's on track doesn't need to be prompted with options. */
const GOAL_TRADEOFFS: Record<string, string[]> = {
  "goal-retirement": ["Increase monthly contribution", "Extend target timeline", "Revisit target amount"],
  "goal-education": ["Increase monthly contribution", "Extend funding timeline", "Consider partial funding + education loan"],
};

const GOAL_ACTIVITY = [
  { date: "18 Aug 2025", type: "Target changed", detail: "Retirement age 60 → 58" },
  { date: "18 Aug 2025", type: "Advisor recommendation", detail: "Review retirement contribution" },
  { date: "15 Aug 2025", type: "Simulation run", detail: "Retirement scenario — age 58 vs 60" },
  { date: "12 Aug 2025", type: "Target changed", detail: "Education goal ₹25L → ₹35L" },
  { date: "20 May 2025", type: "Goal created", detail: "Wealth Creation goal established" },
];

export function GoalsAndPlanTab({ client }: { client: ClientProfileData }) {
  const { goals, plan } = client;
  const relationshipStage = client.identity.relationshipStage;
  const surplus = client.financialData.monthlySurplus;
  const allocated = goals.reduce((sum, g) => sum + (g.monthlyContribution ?? 0), 0);
  const unallocated = Math.max(0, surplus - allocated);
  const contendingGoals = goals.filter((g) => g.monthlyContribution && g.status !== "on-track");
  const goalsNeedingReview = goals.filter((g) => g.status !== "on-track").length;
  const lastUpdated = goals.reduce((latest, g) => (new Date(g.lastUpdated) > new Date(latest) ? g.lastUpdated : latest), goals[0]?.lastUpdated ?? "");

  return (
    <div className="space-y-6">
      {/* 1. Plan Context */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <p className="text-base font-bold text-[var(--text-primary)]">{plan.name} — {plan.tier}</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-4">Plan period: {plan.since} → {plan.renewalDate}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-tertiary)]">
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Goals</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{goals.length}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Needing Review</p>
            <p className={`text-sm font-bold ${goalsNeedingReview > 0 ? "text-[var(--text-status-warning)]" : "text-[var(--text-primary)]"}`}>{goalsNeedingReview}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Plan Last Updated</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{lastUpdated}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Stage</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{RELATIONSHIP_STAGE_LABELS[relationshipStage]}</p>
          </div>
        </div>
      </div>

      {/* 2. Goal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const Icon = GOAL_ICONS[goal.category] || Target;
          const tradeoffs = GOAL_TRADEOFFS[goal.id];
          return (
            <div key={goal.id} className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={15} className="text-[var(--icon-brand-primary)] flex-shrink-0" />
                  <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">{goal.name}</h3>
                </div>
                <Badge size="sm" color={GOAL_STATUS_COLOR[goal.status]} className="flex-shrink-0">{GOAL_STATUS_LABEL[goal.status]}</Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">Target</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{goal.target ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">Target date</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{goal.targetAge ? `Age ${goal.targetAge}` : goal.timeline ?? "—"}</span>
                </div>
                {goal.projected && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">Current projection</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{goal.projected}</span>
                  </div>
                )}
                {goal.monthlyContribution && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">Contribution</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{formatINR(goal.monthlyContribution)}/mo</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">Gap</span>
                  <span className={`text-xs font-semibold ${goal.gap ? "text-[var(--text-status-warning)]" : "text-[var(--text-primary)]"}`}>{goal.gap ?? "None"}</span>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-1">
                <div className="h-full rounded-full bg-[var(--color-success-500)]" style={{ width: `${goal.progress}%` }} />
              </div>
              <p className="text-[13px] text-[var(--text-tertiary)] mb-3">{goal.progress}% funded</p>

              {tradeoffs && (
                <div className="pt-3 border-t border-[var(--border-tertiary)]">
                  <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Trade-offs</p>
                  <ul className="space-y-1">
                    {tradeoffs.map((t, i) => (
                      <li key={t} className="text-[13px] text-[var(--text-secondary)]">
                        {i > 0 && <span className="text-[var(--text-tertiary)]">or </span>}{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Goal Relationships + Goal Activity share a row — the contention and the
          record of changes that produced it read better next to each other. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* 3. Goal Relationships — the contention is shown, not asserted: one finite
            monthly surplus, split between goals that are all drawing from it. */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Goal Relationships</h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              Shared monthly surplus <span className="font-semibold text-[var(--text-primary)]">{formatINR(surplus)}</span>
            </p>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Every goal below draws from the same pool.</p>

          {/* Shared surplus split */}
          <div className="h-3 rounded-full overflow-hidden flex mb-3">
            {goals.map((goal, idx) => {
              const amount = goal.monthlyContribution ?? 0;
              if (!amount) return null;
              const shades = ["bg-[var(--bg-brand-primary)]", "bg-[var(--color-info-500)]", "bg-[var(--color-warning-500)]"];
              return <div key={goal.id} className={shades[idx % shades.length]} style={{ width: `${(amount / surplus) * 100}%` }} />;
            })}
            {unallocated > 0 && <div className="bg-[var(--bg-tertiary)]" style={{ width: `${(unallocated / surplus) * 100}%` }} />}
          </div>

          <div className="space-y-0 mb-4">
            {goals.map((goal, idx) => {
              const amount = goal.monthlyContribution ?? 0;
              if (!amount) return null;
              const shades = ["bg-[var(--bg-brand-primary)]", "bg-[var(--color-info-500)]", "bg-[var(--color-warning-500)]"];
              return (
                <div key={goal.id} className="flex items-center gap-2.5 py-2 border-b border-[var(--border-tertiary)] last:border-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${shades[idx % shades.length]}`} />
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex-1 min-w-0 truncate">{goal.name}</span>
                  <span className="text-[13px] text-[var(--text-tertiary)] flex-shrink-0">{Math.round((amount / surplus) * 100)}%</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] w-16 text-right flex-shrink-0">{formatINR(amount)}/mo</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2.5 py-2 border-t border-[var(--border-tertiary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--bg-tertiary)] flex-shrink-0" />
              <span className="text-xs text-[var(--text-tertiary)] flex-1">Unallocated headroom</span>
              <span className="text-[13px] text-[var(--text-tertiary)] flex-shrink-0">{Math.round((unallocated / surplus) * 100)}%</span>
              <span className="text-xs font-semibold text-[var(--text-tertiary)] w-16 text-right flex-shrink-0">{formatINR(unallocated)}/mo</span>
            </div>
          </div>

          {/* The specific contention this creates right now */}
          {contendingGoals.length >= 2 && (
            <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-3.5 mb-3">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-semibold text-[var(--text-primary)]">{contendingGoals[0].name}</span>
                <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider">competes with</span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{contendingGoals[1].name}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Only {formatINR(unallocated)}/mo is unallocated — increasing either goal&apos;s contribution means reducing the other,
                extending a timeline, or revisiting a target.
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 pt-3 border-t border-[var(--border-tertiary)]">
            <Sparkles size={12} className="text-[var(--icon-brand-primary)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-brand-primary)]">Finny observation —</span> both goals needing review draw
              from the same surplus, so their trade-offs cannot be resolved independently.
            </p>
          </div>
        </div>

        {/* 4. Goal Activity — rows stack so they stay readable at half width */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Goal Activity</h2>
          <div>
            {GOAL_ACTIVITY.map((item, idx) => (
              <div key={idx} className="py-2.5 border-b border-[var(--border-tertiary)] last:border-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wide">{item.type}</span>
                  <span className="text-[13px] text-[var(--text-tertiary)] ml-auto flex-shrink-0">{item.date}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Finny Goal Insight */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2 min-w-0">
          <Sparkles size={13} className="text-[var(--icon-brand-primary)] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[var(--text-primary)]">
            Retirement projection has decreased since the previous review, primarily due to the earlier target age and increased education funding needs.
          </p>
        </div>
        <button className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex items-center gap-1 flex-shrink-0">
          View calculation <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
