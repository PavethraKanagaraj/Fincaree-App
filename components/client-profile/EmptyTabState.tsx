"use client";

import { Button } from "@/components/fincaree/button";
import { LucideIcon, ArrowRight } from "lucide-react";

/* ============================================================
   Ghosted empty state for a Client Story tab that hasn't been
   unlocked yet at the previewed journey stage — shows what's
   coming, not just what exists, reinforcing the progressive
   profile concept.
   ============================================================ */

interface EmptyTabStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick?: () => void;
}

export function EmptyTabState({ icon: Icon, title, description, ctaLabel, onCtaClick }: EmptyTabStateProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-tertiary)] bg-[var(--bg-tertiary)]/50 px-6 py-12 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
        <Icon size={18} strokeWidth={1.75} className="text-[var(--text-disabled)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-disabled)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-disabled)] max-w-sm mb-4">{description}</p>
      <Button variant="secondary" size="sm" trailingIcon={<ArrowRight size={13} strokeWidth={2} />} onClick={onCtaClick}>
        {ctaLabel}
      </Button>
    </div>
  );
}
