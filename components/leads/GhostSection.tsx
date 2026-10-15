"use client";

import { Button } from "@/components/fincaree/button";
import { LucideIcon, ArrowRight } from "lucide-react";

/* ============================================================
   Ghost card — a Lead Profile section that hasn't happened yet.
   Shows what triggers it rather than nothing at all, so the
   advisor sees the whole funnel in one scroll, not just what
   exists so far.
   ============================================================ */

interface GhostAction {
  label: string;
  variant?: "primary" | "secondary" | "tertiary";
  onClick?: () => void;
}

interface GhostSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions: GhostAction[];
  note?: string;
}

export function GhostSection({ icon: Icon, title, description, actions, note }: GhostSectionProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-tertiary)] bg-[var(--bg-tertiary)]/40 px-6 py-8">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={1.75} className="text-[var(--text-disabled)]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] mb-1">{title}</h3>
          <p className="text-xs text-[var(--text-tertiary)] max-w-lg mb-3">{description}</p>
          {note && <p className="text-[12px] text-[var(--text-tertiary)] italic mb-3">{note}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            {actions.map((a) => (
              <Button
                key={a.label}
                variant={a.variant ?? "secondary"}
                size="sm"
                trailingIcon={a.variant !== "tertiary" ? <ArrowRight size={12} strokeWidth={2} /> : undefined}
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
