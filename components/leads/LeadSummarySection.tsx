"use client";

import { Button } from "@/components/fincaree/button";
import { AI_LEAD_SUMMARY, ENTRY_PATHS, LEAD_ENTRY_PATH, PATH_STEPS_COMPLETED } from "./data";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Section 1 — Lead Summary (always visible)
   AI-generated summary of what's known so far, plus a compact
   horizontal timeline showing how this prospect entered.
   ============================================================ */

export function LeadSummarySection() {
  const path = ENTRY_PATHS[LEAD_ENTRY_PATH];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <h2 className="text-base font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
            AI-Generated Lead Summary
          </h2>
        </div>
        <Button variant="tertiary" size="sm" leadingIcon={<RefreshCw size={12} strokeWidth={2} />}>
          Regenerate
        </Button>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{AI_LEAD_SUMMARY.text}</p>
      <p className="text-[12px] text-[var(--text-brand-secondary)] mt-2">Last updated: {AI_LEAD_SUMMARY.updatedAt}</p>

      {/* Entry path context */}
      <div className="mt-4 pt-4 border-t border-[var(--border-brand-secondary)]">
        <p className="text-xs text-[var(--text-secondary)] leading-snug mb-4">{path.description}</p>
        <div className="flex items-center">
          {path.timeline.map((step, i) => {
            const isCompleted = i < PATH_STEPS_COMPLETED;
            const isCurrent = i === PATH_STEPS_COMPLETED - 1;
            const isLast = i === path.timeline.length - 1;
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0 w-20">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border shrink-0",
                      isCompleted && "bg-[var(--bg-status-success-subtle)] border-[var(--color-success-500)] text-[var(--text-status-success)]",
                      isCurrent && "bg-[var(--bg-brand-primary)] border-[var(--bg-brand-primary)] text-white animate-pulse",
                      !isCompleted && !isCurrent && "bg-[var(--bg-primary)] border-[var(--border-tertiary)]"
                    )}
                  >
                    {isCompleted && <Check size={12} strokeWidth={2.5} />}
                  </span>
                  <span className="text-[12px] text-center text-[var(--text-secondary)] leading-tight">{step}</span>
                </div>
                {!isLast && (
                  <div className={cn("h-px flex-1 -mt-4", isCompleted ? "bg-[var(--color-success-500)]" : "bg-[var(--border-tertiary)]")} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
