"use client";

import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { LEARNING_RESOURCES, LEARNING_AI_SUGGESTIONS, LearningResource } from "./journey.data";
import { Sparkles, BookOpen, Video, FileText } from "lucide-react";

const typeIcon: Record<LearningResource["type"], typeof BookOpen> = {
  Article: FileText,
  Video: Video,
  Module: BookOpen,
};

function ResourceCard({ resource, action }: { resource: LearningResource; action: React.ReactNode }) {
  const Icon = typeIcon[resource.type];
  return (
    <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
        <Icon size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">{resource.title}</p>
          <Badge color="gray" size="sm">{resource.type}</Badge>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mb-2">
          {resource.relatedGoal} · Recommended after {resource.recommendedAfter} · {resource.estMinutes} min
        </p>
        {resource.status === "in-progress" && (
          <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-2 max-w-[200px]">
            <div className="h-full rounded-full bg-[var(--bg-brand-primary)]" style={{ width: `${resource.progress}%` }} />
          </div>
        )}
        {resource.status === "completed" && (
          <p className="text-[11px] text-[var(--color-success-600)] font-medium mb-2">Completed · {resource.completedOn}</p>
        )}
        {action}
      </div>
    </div>
  );
}

export function LearningTab() {
  const recommended = LEARNING_RESOURCES.filter((r) => r.status === "recommended");
  const inProgress = LEARNING_RESOURCES.filter((r) => r.status === "in-progress");
  const completed = LEARNING_RESOURCES.filter((r) => r.status === "completed");

  return (
    <div className="space-y-4">
      {inProgress.length > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">In Progress</h2>
          <div className="divide-y divide-[var(--border-tertiary)]">
            {inProgress.map((r) => <ResourceCard key={r.id} resource={r} action={null} />)}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Recommended</h2>
          <div className="divide-y divide-[var(--border-tertiary)]">
            {recommended.map((r) => (
              <ResourceCard key={r.id} resource={r} action={<Button variant="secondary" size="sm">Send to Client</Button>} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Completed</h2>
          <div className="divide-y divide-[var(--border-tertiary)]">
            {completed.map((r) => <ResourceCard key={r.id} resource={r} action={null} />)}
          </div>
        </section>
      )}

      <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <h2 className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">AI Suggestions</h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Based on Anika&apos;s current goals and recent meeting discussions:
        </p>
        {LEARNING_AI_SUGGESTIONS.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{s.title}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{s.relatedGoal}</p>
            </div>
            <Button variant="secondary" size="sm">Recommend</Button>
          </div>
        ))}
      </section>
    </div>
  );
}
