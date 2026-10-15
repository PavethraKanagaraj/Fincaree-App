"use client";

/* ============================================================
   SimulationStudio — the "Simulation" drawer tab

   Two modes, because a simulation is one of two things:

   TEMPLATE      generic and reusable. The advisor sets the
                 starting variables. No client, no target.

   PERSONALIZED  bound to one client. Variables are seeded from
                 that client's actual goal and the plan the
                 advisor recommended, so the projection the
                 client explores is measured against real advice.

   In personalized mode the numbers are live: every slider move
   recomputes the projected corpus and the gap to target, and
   the panel always shows how the client's current position
   compares to the advisor's recommendation.
   ============================================================ */

import { useMemo, useState } from "react";
import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { Avatar } from "@/components/fincaree/avatar";
import { cn } from "@/lib/utils";
import type { SimulationContent, SimulationVariable, ClientGoalPlan } from "./content-data";
import { TOPIC_LABEL, CLIENT_GOAL_PLANS, projectCorpus, formatINR } from "./content-data";
import { Sparkles, RefreshCw, RotateCcw, Target, TrendingUp, Link2, Users, ChevronRight } from "lucide-react";

interface SimulationStudioProps {
  item: SimulationContent;
  /** Commits the current slider positions as the template's defaults. */
  onSaveDefaults: (itemId: string, values: Record<string, number>) => void;
  /** Derives a new, client-bound simulation from this template. */
  onPersonalize: (itemId: string, plan: ClientGoalPlan) => void;
}

function formatVar(v: SimulationVariable, value: number): string {
  if (v.unit === "currency") return formatINR(value);
  if (v.unit === "percent") return `${value}%`;
  return `${value} ${value === 1 ? "year" : "years"}`;
}

/* ─────────── One slider ─────────── */
function VariableSlider({
  variable,
  value,
  onChange,
}: {
  variable: SimulationVariable;
  value: number;
  onChange: (v: number) => void;
}) {
  const offRecommendation = variable.recommended !== undefined && value !== variable.recommended;
  /* Filled track — a flat grey rail gives no sense of where in the range you are. */
  const pct = ((value - variable.min) / (variable.max - variable.min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-xs text-[var(--text-secondary)]">{variable.label}</span>
        <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{formatVar(variable, value)}</span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        step={variable.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fc-range"
        style={{
          background: `linear-gradient(to right, var(--bg-brand-primary) 0%, var(--bg-brand-primary) ${pct}%, var(--bg-secondary) ${pct}%, var(--bg-secondary) 100%)`,
        }}
        aria-label={variable.label}
        aria-valuetext={formatVar(variable, value)}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-[var(--text-tertiary)]">{formatVar(variable, variable.min)}</span>
        {variable.recommended !== undefined && (
          <span className={cn("text-xs", offRecommendation ? "text-[var(--text-status-warning)] font-medium" : "text-[var(--text-tertiary)]")}>
            {offRecommendation ? `Recommended ${formatVar(variable, variable.recommended)}` : "At recommendation"}
          </span>
        )}
        <span className="text-xs text-[var(--text-tertiary)]">{formatVar(variable, variable.max)}</span>
      </div>
    </div>
  );
}

/* ─────────── Projection readout ─────────── */
function Projection({
  projected,
  target,
  recommendedProjection,
  isAtRecommendation,
}: {
  projected: number;
  target?: number;
  recommendedProjection?: number;
  isAtRecommendation: boolean;
}) {
  const gap = target !== undefined ? target - projected : null;
  const pct = target ? Math.min(100, Math.round((projected / target) * 100)) : null;
  const shortfall = gap !== null && gap > 0;

  return (
    <div className="-mx-4 px-4 py-4 bg-[var(--bg-secondary)]">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Projected corpus</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">{formatINR(projected)}</p>
        </div>
        {target !== undefined && (
          <div className="text-right">
            <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Target</p>
            <p className="text-lg font-semibold text-[var(--text-secondary)] mt-1 tabular-nums">{formatINR(target)}</p>
          </div>
        )}
      </div>

      {pct !== null && (
        <>
          <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden mb-2">
            <div
              className={cn("h-full rounded-full transition-[width] duration-200", shortfall ? "bg-[var(--color-warning-500)]" : "bg-[var(--color-success-500)]")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">{pct}% of target</span>
            <span className={cn("text-xs font-semibold", shortfall ? "text-[var(--text-status-warning)]" : "text-[var(--text-status-success)]")}>
              {shortfall ? `${formatINR(gap!)} short` : `${formatINR(Math.abs(gap!))} ahead`}
            </span>
          </div>
        </>
      )}

      {recommendedProjection !== undefined && !isAtRecommendation && (
        <p className="text-xs text-[var(--text-tertiary)] mt-3 pt-3 border-t border-[var(--border-tertiary)]">
          At your recommendation this projects{" "}
          <span className="font-semibold text-[var(--text-secondary)]">{formatINR(recommendedProjection)}</span> — the client is currently{" "}
          {projected >= recommendedProjection ? "above" : "below"} that by {formatINR(Math.abs(projected - recommendedProjection))}.
        </p>
      )}
    </div>
  );
}

/* ─────────── Client picker for personalization ─────────── */
function PersonalizePanel({ onPick }: { onPick: (plan: ClientGoalPlan) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="-mx-4 px-4 py-4 bg-[var(--bg-brand-subtle)]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <p className="text-xs font-semibold text-[var(--text-brand-primary)]">Personalise for a client</p>
        </div>
        <p className="text-xs text-[var(--text-brand-secondary)] mb-3 leading-relaxed">
          Finny will seed this simulation from a client&apos;s goal and your current plan recommendation, so the numbers they explore are their own.
        </p>
        <Button variant="primary" size="sm" leadingIcon={<Users size={13} strokeWidth={1.75} />} onClick={() => setOpen(true)}>
          Choose a client
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-[var(--border-tertiary)]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-[var(--text-primary)]">Which client&apos;s goal should this use?</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
          Cancel
        </button>
      </div>
      <div className="-mx-4 divide-y divide-[var(--border-tertiary)]">
        {CLIENT_GOAL_PLANS.map((plan) => (
          <button
            key={`${plan.clientId}-${plan.goalTopic}`}
            type="button"
            onClick={() => onPick(plan)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Avatar size="xs" initials={plan.initials} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{plan.clientName}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {plan.goalName} · {formatINR(plan.targetAmount)} by {plan.targetYear}
              </p>
            </div>
            <Badge size="sm" color={plan.status === "on-track" ? "success" : plan.status === "at-risk" ? "warning" : "error"}>
              {plan.status === "on-track" ? "On track" : plan.status === "at-risk" ? "At risk" : "Off track"}
            </Badge>
            <ChevronRight size={13} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Studio ─────────── */
export function SimulationStudio({ item, onSaveDefaults, onPersonalize }: SimulationStudioProps) {
  const model = item.model;

  /* Live slider values — start from the model, so a personalized sim opens
     exactly where the advisor's recommendation sits. */
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(model.variables.map((v) => [v.id, v.value]))
  );

  const setValue = (id: string, v: number) => setValues((prev) => ({ ...prev, [id]: v }));

  const get = (id: string) => values[id] ?? model.variables.find((v) => v.id === id)?.value ?? 0;

  const projected = useMemo(
    () =>
      projectCorpus({
        lumpsum: get("lumpsum"),
        monthly: get("monthly"),
        years: get("years"),
        annualReturn: get("return"),
      }),
    [values, model.variables]
  );

  const recommendedProjection = useMemo(() => {
    const rec = model.variables.every((v) => v.recommended !== undefined);
    if (!rec) return undefined;
    const r = (id: string) => model.variables.find((v) => v.id === id)?.recommended ?? 0;
    return projectCorpus({ lumpsum: r("lumpsum"), monthly: r("monthly"), years: r("years"), annualReturn: r("return") });
  }, [model.variables]);

  const isAtRecommendation = model.variables.every((v) => v.recommended === undefined || get(v.id) === v.recommended);

  function resetToRecommendation() {
    setValues(Object.fromEntries(model.variables.map((v) => [v.id, v.recommended ?? v.value])));
  }

  const isPersonalized = model.kind === "personalized";

  return (
    <div className="space-y-5">
      {/* Mode header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Badge size="sm" color={isPersonalized ? "brand" : "gray"}>
              {isPersonalized ? "Personalised" : "Template"}
            </Badge>
            <span className="text-xs text-[var(--text-tertiary)]">{TOPIC_LABEL[model.goalTopic]}</span>
          </div>
          {isPersonalized ? (
            <p className="text-sm font-semibold text-[var(--text-primary)]">Built for {model.clientName}</p>
          ) : (
            <p className="text-sm font-semibold text-[var(--text-primary)]">Reusable across clients</p>
          )}
        </div>
      </div>

      {/* Synced plan data — "the client table should be synced" */}
      {isPersonalized && model.syncedFrom && (
        <div className="pb-4 border-b border-[var(--border-tertiary)]">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Link2 size={12} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Synced from plan</p>
            </div>
            <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline">
              <RefreshCw size={10} strokeWidth={2} />
              Re-sync
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-[var(--text-tertiary)]">Goal</span>
              <span className="text-xs font-medium text-[var(--text-primary)]">{model.syncedFrom.goalName}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-[var(--text-tertiary)]">Target</span>
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {formatINR(model.syncedFrom.targetAmount)} by {model.syncedFrom.targetYear}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-[var(--text-tertiary)]">Last synced</span>
              <span className="text-xs font-medium text-[var(--text-primary)]">{model.syncedFrom.syncedAt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Finny's draft note */}
      {isPersonalized && model.aiNote && (
        <div className="-mx-4 px-4 py-4 bg-[var(--bg-brand-subtle)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
            <p className="text-xs font-semibold text-[var(--text-brand-primary)]">Finny drafted this environment</p>
            {model.aiDraftedAt && <span className="text-xs text-[var(--text-brand-secondary)] ml-auto">{model.aiDraftedAt}</span>}
          </div>
          <p className="text-xs text-[var(--text-brand-secondary)] leading-relaxed">{model.aiNote}</p>
        </div>
      )}

      {/* Live projection */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Projection</p>
        </div>
        <Projection
          projected={projected}
          target={model.syncedFrom?.targetAmount}
          recommendedProjection={recommendedProjection}
          isAtRecommendation={isAtRecommendation}
        />
      </div>

      {/* The environment the client toggles */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Target size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
            <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              {isPersonalized ? "What the client can change" : "Template starting values"}
            </p>
          </div>
          {isPersonalized && !isAtRecommendation && (
            <button
              type="button"
              onClick={resetToRecommendation}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
            >
              <RotateCcw size={10} strokeWidth={2} />
              Reset to recommendation
            </button>
          )}
        </div>
        <div className="space-y-4">
          {model.variables.map((v) => (
            <VariableSlider key={v.id} variable={v} value={get(v.id)} onChange={(nv) => setValue(v.id, nv)} />
          ))}
        </div>
      </div>

      {/* Mode-specific footer action */}
      {isPersonalized ? (
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          This is the environment {model.clientName?.split(" ")[0]} sees. Their changes are exploratory — they don&apos;t alter the plan, and
          anything they try is reported back to you under Engagement.
        </p>
      ) : (
        <div className="space-y-3">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => onSaveDefaults(item.id, values)}>
            Save as template defaults
          </Button>
          <PersonalizePanel onPick={(plan) => onPersonalize(item.id, plan)} />
        </div>
      )}
    </div>
  );
}
