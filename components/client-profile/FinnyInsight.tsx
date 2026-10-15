"use client";

import { Sparkles } from "lucide-react";

interface FinnyInsightProps {
  title: string;
  description: string;
  evidence: string[];
  timeAgo: string;
  onViewEvidence?: () => void;
  onPrepare?: () => void;
}

export function FinnyInsight({ title, description, evidence, timeAgo, onViewEvidence, onPrepare }: FinnyInsightProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[var(--bg-brand-primary)] flex items-center justify-center">
            <Sparkles size={12} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Finny noticed</span>
        </div>
        <span className="text-xs text-[var(--text-brand-secondary)]">{timeAgo}</span>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-snug mb-3">{description}</p>
      <div className="mb-3 text-[12px] text-[var(--text-brand-secondary)]">
        <p className="font-semibold mb-1">Based on:</p>
        <ul className="space-y-0.5">
          {evidence.map((e, i) => (
            <li key={i}>· {e}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <button className="text-[12px] font-semibold text-[var(--text-brand-primary)] hover:underline">
          View evidence
        </button>
        <button className="text-[12px] font-semibold text-white bg-[var(--bg-brand-primary)] px-3 py-1.5 rounded-[var(--radius-md)] hover:opacity-90">
          Prepare for next meeting
        </button>
      </div>
    </div>
  );
}
