"use client";

import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import {
  LEAD_IDENTITY,
  LEAD_STAGES,
  LeadStageId,
  leadStageStatus,
  DAYS_IN_CURRENT_STAGE,
  PROFILE_COMPLETENESS,
  completenessBand,
  NEXT_ACTION_BY_STAGE,
  CURRENT_LEAD_STAGE,
  LEAD_ENTRY_PATH,
  ENTRY_PATHS,
  LEAD_QUICK_FACTS,
  CONVERSION_READINESS,
  AI_LEAD_INSIGHT,
  AI_LEAD_SCORE,
  AI_CONVERSION_PREDICTION,
  PROSPECT_TOUCHPOINT,
  LeadStatus,
} from "./data";
import { Compass, MessageCircle, Rocket, Sparkles, TrendingUp, TrendingDown, Minus, Circle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Lead Identity Card — sticky left column of the Lead Profile.
   Avatar/status → entry path → 8-stage journey progress →
   profile completeness + next action → quick facts →
   conversion readiness → AI lead insight / score / prediction.
   ============================================================ */

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const statusColor: Record<LeadStatus, "gray" | "gray-blue" | "brand" | "success"> = {
  New: "gray",
  Engaged: "gray-blue",
  Qualified: "brand",
  Ready: "success",
};

const pathIcon = { explore: Compass, talk: MessageCircle, act: Rocket };
const pathTone: Record<string, { text: string; icon: string }> = {
  explore: { text: "var(--text-status-info-strong)", icon: "var(--icon-status-info)" },
  talk: { text: "var(--text-status-warning)", icon: "var(--color-warning-500)" },
  act: { text: "var(--text-status-success)", icon: "var(--icon-status-success-strong)" },
};

const bandColor: Record<string, string> = {
  behind: "var(--color-error-500)",
  "at-risk": "var(--color-warning-500)",
  "on-track": "var(--color-success-500)",
};

const trendIcon = { improving: TrendingUp, stable: Minus, declining: TrendingDown };
const trendColor: Record<string, string> = {
  improving: "text-[var(--text-status-success)]",
  stable: "text-[var(--text-tertiary)]",
  declining: "text-[var(--text-status-error)]",
};

interface LeadIdentityCardProps {
  onGoToStage: (stage: LeadStageId) => void;
}

export function LeadIdentityCard({ onGoToStage }: LeadIdentityCardProps) {
  const band = completenessBand(PROFILE_COMPLETENESS);
  const path = ENTRY_PATHS[LEAD_ENTRY_PATH];
  const PathIcon = pathIcon[LEAD_ENTRY_PATH];
  const tone = pathTone[LEAD_ENTRY_PATH];
  const currentIndex = LEAD_STAGES.findIndex((s) => s.id === CURRENT_LEAD_STAGE);
  const TrendIcon = trendIcon[AI_LEAD_SCORE.trend];

  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      {/* Avatar + status + entry path */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="xl" initials={initials(LEAD_IDENTITY.name)} />
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight truncate">{LEAD_IDENTITY.name}</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Prospect since {LEAD_IDENTITY.prospectSince}</p>
          </div>
        </div>
        <Badge color={statusColor[LEAD_IDENTITY.status]} size="sm">{LEAD_IDENTITY.status}</Badge>

        {/* Entry path indicator */}
        {/* A ruled row, not a tinted box inside the card: the status colour
            lives on the icon and title, the subtitle stays in normal text
            so it never depends on an opacity-faded tone for contrast. */}
        <div className="mt-4 pt-4 border-t border-[var(--border-tertiary)] flex items-start gap-2.5">
          <PathIcon size={16} strokeWidth={1.75} style={{ color: tone.icon }} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: tone.text }}>{path.label}</p>
            <p className="text-xs mt-0.5 text-[var(--text-tertiary)]">{path.subtitle}</p>
          </div>
        </div>

        {/* Journey progress */}
        <div className="mt-5 pt-4 border-t border-[var(--border-tertiary)]">
          <div className="flex items-center justify-between mb-2.5">
            {LEAD_STAGES.map((stage, i) => {
              const status = leadStageStatus(stage.id);
              const isLast = i === LEAD_STAGES.length - 1;
              return (
                <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => onGoToStage(stage.id)}
                    aria-label={`${stage.number} ${stage.label}`}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 transition-colors",
                      status === "completed" && "bg-[var(--color-success-500)]",
                      status === "current" && "bg-[var(--bg-brand-primary)] animate-pulse",
                      status === "upcoming" && "bg-[var(--bg-primary)] border border-[var(--border-tertiary)]"
                    )}
                  />
                  {!isLast && (
                    <div
                      className={cn(
                        "h-px flex-1 mx-1",
                        status === "completed" ? "bg-[var(--color-success-500)]" : "bg-[var(--border-tertiary)]"
                      )}
                      style={status !== "completed" ? { backgroundImage: "repeating-linear-gradient(90deg, var(--border-tertiary) 0 3px, transparent 3px 6px)" } : undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs font-medium text-[var(--text-primary)]">
            Stage {currentIndex + 1} of {LEAD_STAGES.length} — {LEAD_STAGES[currentIndex].label}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            In this stage for {DAYS_IN_CURRENT_STAGE} {DAYS_IN_CURRENT_STAGE === 1 ? "day" : "days"}
          </p>
        </div>

        {/* Profile completeness */}
        <div className="mt-4 pt-4 border-t border-[var(--border-tertiary)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Profile Completeness
            </span>
            <span className="text-xs font-bold tabular-nums text-[var(--text-primary)]">{PROFILE_COMPLETENESS}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${PROFILE_COMPLETENESS}%`, backgroundColor: bandColor[band.tone] }}
            />
          </div>
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">{band.label}</p>

          <div className="rounded-[var(--radius-md)] bg-[var(--bg-secondary)] p-3">
            <p className="text-xs text-[var(--text-primary)] leading-snug mb-2">
              {NEXT_ACTION_BY_STAGE[CURRENT_LEAD_STAGE]}
            </p>
            <Button variant="secondary" size="sm" onClick={() => onGoToStage(CURRENT_LEAD_STAGE)}>
              Take Action
            </Button>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
          Quick Facts
        </h2>
        <dl className="space-y-2.5">
          {[
            ["Primary goal", LEAD_QUICK_FACTS.primaryGoal],
            ["Life stage", LEAD_QUICK_FACTS.lifeStage],
            ["Income range", LEAD_QUICK_FACTS.incomeRange],
            ["Risk comfort", LEAD_QUICK_FACTS.riskComfort],
            ["Entry path", LEAD_QUICK_FACTS.entryPath],
            ["Lead source", LEAD_QUICK_FACTS.leadSource],
            ["Days since first contact", String(LEAD_QUICK_FACTS.daysSinceFirstContact)],
            ["Last activity", LEAD_QUICK_FACTS.lastActivityDate],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-[var(--text-tertiary)]">{label}</dt>
              <dd className="text-[var(--text-primary)] font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Conversion readiness */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            Conversion Readiness
          </h2>
          <Badge color={CONVERSION_READINESS.status === "ready" ? "success" : CONVERSION_READINESS.status === "blocked" ? "error" : "warning"} size="sm">
            {CONVERSION_READINESS.status === "ready" ? "Ready" : CONVERSION_READINESS.status === "blocked" ? "Blocked" : "Not Ready"}
          </Badge>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">{CONVERSION_READINESS.summary}</p>
        <ul className="space-y-2">
          {CONVERSION_READINESS.missing.map((m) => (
            <li key={m.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Circle size={9} strokeWidth={2} className="text-[var(--icon-quaternary)] shrink-0" />
                {m.label}
              </span>
              <button type="button" className="text-[12px] font-semibold text-[var(--text-brand-primary)] hover:underline shrink-0">
                {m.actionLabel}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* AI Lead Insight */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <h2 className="text-base font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
            AI Lead Insight
          </h2>
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-snug mb-2">{AI_LEAD_INSIGHT.text}</p>
        <span className="text-[12px] font-medium text-[var(--text-brand-secondary)] capitalize">
          {AI_LEAD_INSIGHT.confidence} confidence
        </span>

        <div className="mt-4 pt-4 border-t border-[var(--border-brand-secondary)] grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{AI_LEAD_SCORE.score}</span>
              <TrendIcon size={12} strokeWidth={2} className={trendColor[AI_LEAD_SCORE.trend]} />
            </div>
            <p className="text-[12px] text-[var(--text-tertiary)]">Lead score · {AI_LEAD_SCORE.trend}</p>
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{AI_CONVERSION_PREDICTION.probability}%</span>
            <p className="text-[12px] text-[var(--text-tertiary)]">Conversion probability</p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--text-brand-secondary)] mt-2">
          Avg. time to convert: {AI_CONVERSION_PREDICTION.avgDaysToConvert}d · In funnel {AI_CONVERSION_PREDICTION.currentDaysInFunnel}d
          {AI_CONVERSION_PREDICTION.onTrack ? " — on track" : ""}
        </p>
      </section>

      {/* Prospect awareness — what she's seeing right now, on her side */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-tertiary)] p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Eye size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <h2 className="text-base font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            What Your Prospect Currently Sees
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-snug">{PROSPECT_TOUCHPOINT[CURRENT_LEAD_STAGE]}</p>
      </section>
    </div>
  );
}
