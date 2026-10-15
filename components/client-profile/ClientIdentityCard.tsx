"use client";

import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ClientIdentity } from "./data";
import type { SubscriptionTier } from "./meeting-context.data";
import {
  JOURNEY_STAGES,
  JourneyStageId,
  journeyStageStatus,
  PROFILE_COMPLETENESS,
  PLAN_COMPLETENESS_CAP,
  QUICK_FACTS,
  RELATIONSHIP_HEALTH,
  AI_NEXT_BEST_ACTION,
} from "./journey.data";
import { Check, TrendingUp, TrendingDown, Minus, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Client Identity Card — sticky left column.
   Avatar + plan → Profile Maturity (9-stage journey) → Quick
   Facts → Relationship Health → AI Next Best Action. Stays
   visible as the advisor scrolls the Story tab on the right.
   ============================================================ */

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const planColor: Record<string, "brand" | "warning" | "gray"> = {
  Platinum: "brand",
  Gold: "warning",
  Silver: "gray",
};

function completenessBand(pct: number): { color: string; label: string } {
  if (pct <= 30) return { color: "var(--color-error-500)", label: "Behind" };
  if (pct <= 60) return { color: "var(--color-warning-500)", label: "At risk" };
  if (pct <= 85) return { color: "var(--color-success-500)", label: "On track" };
  return { color: "var(--color-brand-500)", label: "Completed" };
}

const trendIcon = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const trendColor: Record<string, string> = {
  improving: "text-[var(--color-success-600)]",
  stable: "text-[var(--text-tertiary)]",
  declining: "text-[var(--color-error-600)]",
};

interface ClientIdentityCardProps {
  identity: ClientIdentity;
  plan: SubscriptionTier;
  previewStage: JourneyStageId;
  onSelectStage: (stage: JourneyStageId) => void;
}

export function ClientIdentityCard({ identity, plan, previewStage, onSelectStage }: ClientIdentityCardProps) {
  const cap = PLAN_COMPLETENESS_CAP[plan];
  const displayPct = Math.min(PROFILE_COMPLETENESS, cap);
  const band = completenessBand(displayPct);
  const isPremiumDepth = plan === "platinum" && PROFILE_COMPLETENESS > 100;
  const nextIncomplete = JOURNEY_STAGES.find((s) => journeyStageStatus(s.id) === "upcoming");
  const TrendIcon = trendIcon[RELATIONSHIP_HEALTH.trend];

  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      {/* Avatar + plan */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="xl" initials={initials(identity.name)} />
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight truncate">{identity.name}</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Client since {identity.clientSince}</p>
          </div>
        </div>
        <Badge color={planColor[identity.plan] ?? "gray"} size="sm">{identity.plan}</Badge>

        {/* Profile Maturity Indicator */}
        <div className="mt-5 pt-4 border-t border-[var(--border-tertiary)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Profile Maturity
            </span>
            <span
              className={cn(
                "text-xs font-bold tabular-nums",
                isPremiumDepth ? "text-[var(--color-brand-600)]" : "text-[var(--text-primary)]"
              )}
            >
              {PROFILE_COMPLETENESS}%{isPremiumDepth && "+"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(displayPct, 100)}%`, backgroundColor: band.color }}
            />
          </div>
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">
            {band.label} · Actively Managed Client
          </p>

          <ul className="space-y-1.5">
            {JOURNEY_STAGES.map((stage) => {
              const status = journeyStageStatus(stage.id);
              const isPreview = stage.id === previewStage;
              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    onClick={() => onSelectStage(stage.id)}
                    className={cn(
                      "w-full flex items-center gap-2 text-left rounded-[var(--radius-sm)] px-1.5 py-0.5 -mx-1.5 transition-colors",
                      "hover:bg-[var(--bg-secondary)]",
                      isPreview && "bg-[var(--bg-brand-subtle)]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border",
                        status === "completed" && "bg-[var(--color-success-50)] border-[var(--color-success-500)] text-[var(--color-success-600)]",
                        status === "current" && "bg-[var(--bg-brand-primary)] border-[var(--bg-brand-primary)] text-white",
                        status === "upcoming" && "bg-[var(--bg-primary)] border-[var(--border-tertiary)]"
                      )}
                    >
                      {status !== "upcoming" && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        status === "upcoming" ? "text-[var(--text-quaternary)]" : "text-[var(--text-secondary)]",
                        status === "current" && "font-semibold text-[var(--text-primary)]",
                        isPreview && "text-[var(--text-brand-primary)] font-medium"
                      )}
                    >
                      {stage.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {nextIncomplete && (
            <button
              type="button"
              onClick={() => onSelectStage(nextIncomplete.id)}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
            >
              Guide client to {nextIncomplete.label.toLowerCase()}
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          )}
        </div>
      </section>

      {/* Quick facts */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
          Quick Facts
        </h2>
        <dl className="space-y-2.5">
          {[
            ["Life stage", QUICK_FACTS.lifeStage],
            ["Location", QUICK_FACTS.location],
            ["Income range", QUICK_FACTS.incomeRange],
            ["Risk profile", QUICK_FACTS.riskProfile],
            ["Active goals", String(QUICK_FACTS.activeGoals)],
            ["Plan", QUICK_FACTS.planType],
            ["Next meeting", QUICK_FACTS.nextMeetingDate],
            ["Last interaction", `${QUICK_FACTS.daysSinceLastInteraction} days ago`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <dt className="text-[var(--text-tertiary)]">{label}</dt>
              <dd className="text-[var(--text-primary)] font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Relationship health */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
          Relationship Health
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{RELATIONSHIP_HEALTH.score}</span>
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor[RELATIONSHIP_HEALTH.trend])}>
            <TrendIcon size={13} strokeWidth={2} />
            <span className="capitalize">{RELATIONSHIP_HEALTH.trend}</span>
          </div>
        </div>
      </section>

      {/* AI Next Best Action */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <h2 className="text-[11px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
            AI Next Best Action
          </h2>
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-snug mb-3">{AI_NEXT_BEST_ACTION.text}</p>
        <div className="flex items-center justify-between">
          <Button variant="primary" size="sm">Take Action</Button>
          <span className="text-[11px] font-medium text-[var(--text-brand-secondary)] capitalize">
            {AI_NEXT_BEST_ACTION.confidence} confidence
          </span>
        </div>
      </section>
    </div>
  );
}
