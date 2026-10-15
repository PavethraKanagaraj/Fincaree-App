"use client";

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import {
  JOURNEY_TIMELINE,
  JOURNEY_STAGES,
  JourneyStageId,
  TimelineFilter,
  journeyStageIndex,
  AI_CLIENT_SUMMARY,
  WHO_THEY_ARE,
  ADVISOR_NOTES,
  AI_SUGGESTED_OBSERVATIONS,
  EMOTION_BY_STAGE,
  STAGE_METRICS,
  PAIN_OPPORTUNITY,
} from "./journey.data";
import {
  Sparkles,
  UserPlus,
  ClipboardList,
  BarChart3,
  Users,
  MessageCircle,
  Link2,
  FileText,
  CreditCard,
  CalendarCheck,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_ICON: Record<JourneyStageId, typeof UserPlus> = {
  discover: UserPlus,
  "quick-profile": ClipboardList,
  snapshot: BarChart3,
  matching: Users,
  discovery: MessageCircle,
  "share-data": Link2,
  plan: FileText,
  subscribe: CreditCard,
  ongoing: CalendarCheck,
};

const FILTERS: { id: TimelineFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "meetings", label: "Meetings" },
  { id: "goals", label: "Goals" },
  { id: "actions", label: "Actions" },
  { id: "documents", label: "Documents" },
  { id: "ai", label: "AI Activity" },
];

function matchesFilter(title: string, isAI: boolean, filter: TimelineFilter): boolean {
  if (filter === "all") return true;
  if (filter === "ai") return isAI;
  const t = title.toLowerCase();
  if (filter === "meetings") return t.includes("meeting") || t.includes("call") || t.includes("review");
  if (filter === "goals") return t.includes("goal");
  if (filter === "actions") return t.includes("action");
  if (filter === "documents") return t.includes("agreement") || t.includes("verification") || t.includes("plan generated");
  return true;
}

interface StoryTabProps {
  previewStage: JourneyStageId;
}

export function StoryTab({ previewStage }: StoryTabProps) {
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const previewIndex = journeyStageIndex(previewStage);
  const entries = JOURNEY_TIMELINE.filter(
    (e) => journeyStageIndex(e.stageId) <= previewIndex && matchesFilter(e.title, e.isAI, filter)
  );
  const visible = entries.slice(0, visibleCount);

  const emotion = EMOTION_BY_STAGE[previewStage];
  const metrics = STAGE_METRICS[previewStage];
  const painOpportunity = PAIN_OPPORTUNITY[previewStage];

  return (
    <div className="space-y-5">
      {/* AI Client Summary */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
            <h2 className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
              AI Client Summary
            </h2>
          </div>
          <Button variant="tertiary" size="sm" leadingIcon={<RefreshCw size={12} strokeWidth={2} />}>
            Regenerate
          </Button>
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{AI_CLIENT_SUMMARY.text}</p>
        <p className="text-[11px] text-[var(--text-brand-secondary)] mt-2">Last updated: {AI_CLIENT_SUMMARY.updatedAt}</p>
      </section>

      {/* Stage context — emotion, metrics, pain/opportunity for the previewed stage */}
      {(emotion || metrics || painOpportunity) && (
        <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {JOURNEY_STAGES[previewIndex]?.label} — client perspective
            </h2>
            {emotion && (
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <span>{emotion.emoji}</span>
                {emotion.label}
              </span>
            )}
          </div>

          {metrics && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{m.label}</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {painOpportunity && (
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                <span className="font-semibold text-[var(--text-primary)]">Pain point: </span>
                {painOpportunity.pain}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                <span className="font-semibold text-[var(--text-primary)]">Opportunity: </span>
                {painOpportunity.opportunity}
              </p>
              <Button variant="secondary" size="sm">{painOpportunity.action}</Button>
            </div>
          )}
        </section>
      )}

      {/* Journey timeline */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Journey Timeline</h2>

        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setFilter(f.id); setVisibleCount(8); }}
              className={cn(
                "px-2.5 py-1 rounded-[var(--radius-md)] text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-[var(--bg-brand-primary)] text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ol className="space-y-0">
          {visible.map((entry, i) => {
            const Icon = entry.isAI ? Sparkles : STAGE_ICON[entry.stageId];
            const stage = JOURNEY_STAGES.find((s) => s.id === entry.stageId);
            const isLast = i === visible.length - 1;
            return (
              <li key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0 w-6">
                  <span className="text-[10px] text-[var(--text-quaternary)] tabular-nums mb-1 whitespace-nowrap -ml-4 w-14 text-right">
                    {entry.date}
                  </span>
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border shrink-0",
                      entry.isAI
                        ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-secondary)] text-[var(--icon-brand-primary)]"
                        : "bg-[var(--bg-secondary)] border-[var(--border-tertiary)] text-[var(--icon-tertiary)]"
                    )}
                  >
                    <Icon size={12} strokeWidth={2} />
                  </span>
                  {!isLast && <span className="w-px flex-1 bg-[var(--border-tertiary)] my-1" />}
                </div>
                <div className={cn("flex-1 min-w-0 pb-4", entry.isAI && "rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] px-3 py-2 -mt-1")}>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{entry.title}</span>
                    {entry.isAI && <Badge color="brand" size="sm">AI</Badge>}
                    {stage && <Badge color="gray" size="sm">{stage.label}</Badge>}
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-0.5">{entry.description}</p>
                  <p className="text-[11px] text-[var(--text-quaternary)]">{entry.time} · {entry.actor}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {entries.length > visibleCount && (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 8)}
            className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mt-1"
          >
            Load more
          </button>
        )}
      </section>

      {/* Who they are */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Who They Are</h2>
        <div className="divide-y divide-[var(--border-tertiary)]">
          {WHO_THEY_ARE.map((w) => (
            <div key={w.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-[var(--text-primary)]">{w.label}</span>
                <span className="text-[11px] text-[var(--text-quaternary)] shrink-0">Added after {w.addedAfter}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-snug">{w.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advisor notes — private */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Lock size={12} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Advisor Notes</h2>
          <span className="text-[11px] text-[var(--text-quaternary)]">Only visible to you</span>
        </div>

        <div className="space-y-3 mb-4">
          {ADVISOR_NOTES.map((n) => (
            <div key={n.id} className="text-xs">
              <p className="text-[var(--text-secondary)] leading-snug">{n.note}</p>
              <p className="text-[11px] text-[var(--text-quaternary)] mt-0.5">
                {n.date}{n.relatedMeeting && ` · ${n.relatedMeeting}`}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
            <span className="text-[11px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
              AI Suggested Observations
            </span>
          </div>
          <ul className="space-y-1.5">
            {AI_SUGGESTED_OBSERVATIONS.map((o) => (
              <li key={o} className="text-xs text-[var(--text-secondary)] leading-snug">· {o}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
