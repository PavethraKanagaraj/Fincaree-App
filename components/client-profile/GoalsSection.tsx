"use client";

import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Goal, GoalStatus } from "./data";
import { Sparkles, MessageCircle, Search, Plus, Target } from "lucide-react";

function IndexNumber({ index }: { index: number }) {
  return (
    <span className="text-xs font-semibold text-[var(--text-tertiary)] tabular-nums shrink-0">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/* ============================================================
   Goals
   Client goal + current position + estimated requirement =
   potential gap. Levers are discussion points, not instructions.

   One flat divided list, not a grid of cards inside a card —
   each goal is a row separated by a hairline, not its own boxed
   card nested inside the section's own border.
   ============================================================ */

const statusConfig: Record<GoalStatus, { label: string; color: "success" | "warning" | "error" }> = {
  "on-track": { label: "On track", color: "success" },
  "needs-review": { label: "Needs review", color: "warning" },
  "needs-validation": { label: "Needs validation", color: "error" },
};

const progressColor: Record<GoalStatus, string> = {
  "on-track": "var(--color-success-500)",
  "needs-review": "var(--color-warning-500)",
  "needs-validation": "var(--color-error-500)",
};

function GoalRow({ goal, index }: { goal: Goal; index: number }) {
  const status = statusConfig[goal.status];

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <IndexNumber index={index} />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{goal.name}</span>
        </div>
        <Badge color={status.color} size="sm">{status.label}</Badge>
      </div>

      {/* Progress: current vs estimated requirement */}
      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%`, backgroundColor: progressColor[goal.status] }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs mb-3">
        <div>
          <div className="text-[var(--text-tertiary)] mb-0.5">Timeline</div>
          <div className="text-[var(--text-primary)] font-medium">{goal.timeline}</div>
        </div>
        <div>
          <div className="text-[var(--text-tertiary)] mb-0.5">Target</div>
          <div className="text-[var(--text-primary)] font-medium">{goal.target}</div>
        </div>
        <div>
          <div className="text-[var(--text-tertiary)] mb-0.5">Current position</div>
          <div className="text-[var(--text-primary)] font-medium">{goal.currentPosition}</div>
        </div>
        <div>
          <div className="text-[var(--text-tertiary)] mb-0.5">Estimated requirement</div>
          <div className="text-[var(--text-primary)] font-medium">{goal.estimatedRequirement}</div>
        </div>
      </div>

      {goal.gap && (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--color-error-50)] mb-3">
          <span className="text-[11px] font-semibold text-[var(--color-error-700)]">
            Potential gap: {goal.gap}
          </span>
        </div>
      )}

      {/* AI observation */}
      <div className="flex items-start gap-2 mb-3 p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)]">
        <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--text-brand-primary)] leading-snug max-w-prose">{goal.aiObservation}</p>
      </div>

      {/* Levers — discussion points, not instructions. Plain text, not
          chips: real finance-app goal cards (Monarch, Copilot Money,
          Origin) keep secondary suggestions quiet — pills are reserved
          for status, not for every list of talking points. */}
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
          Potential levers to discuss
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-snug">
          {goal.levers.join(" · ")}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="secondary" size="sm" leadingIcon={<MessageCircle size={12} strokeWidth={2} />}>
          Discuss with client
        </Button>
        <Button variant="tertiary" size="sm" leadingIcon={<Search size={12} strokeWidth={2} />}>
          Review assumptions
        </Button>
        <Button variant="tertiary" size="sm" leadingIcon={<Plus size={12} strokeWidth={2} />}>
          Create advisor action
        </Button>
      </div>
    </div>
  );
}

export function GoalsSection({ goals }: { goals: Goal[] }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Target size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Goals</h2>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mb-1 max-w-prose">
        Client goal, current position and estimated requirement — together, a potential gap to discuss.
      </p>
      <div className="divide-y divide-[var(--border-tertiary)]">
        {goals.map((g, i) => (
          <GoalRow key={g.id} goal={g} index={i} />
        ))}
      </div>
    </section>
  );
}
