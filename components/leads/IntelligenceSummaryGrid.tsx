"use client";

import { Button } from "@/components/fincaree/button";
import {
  WHAT_WE_KNOW, WHAT_WE_LEARNED, WHATS_MISSING, MISSING_IMPACT, NEXT_BEST_ACTION,
  DataSource,
} from "./data";
import { User, Eye, Cpu, CheckCircle2, FileText, Link2, Sparkles, ArrowRight, CalendarClock, BookOpenCheck, CircleAlert, Target, LucideIcon } from "lucide-react";

/* ============================================================
   Intelligence Summary — the 2x2 grid that opens the detail
   page's right column. What We Know / What We've Learned /
   What's Missing / Next Best Action — the cyclical intelligence
   model made visible in one glance, every fact source-tagged.
   ============================================================ */

const sourceMeta: Record<DataSource, { label: string; icon: typeof User; color: string }> = {
  "client-provided": { label: "Client provided", icon: User, color: "var(--text-tertiary)" },
  "advisor-observed": { label: "Advisor observation", icon: Eye, color: "var(--color-warning-600)" },
  "system-derived": { label: "System derived", icon: Cpu, color: "var(--icon-brand-primary)" },
  verified: { label: "Verified", icon: CheckCircle2, color: "var(--color-success-600)" },
  uploaded: { label: "Uploaded", icon: FileText, color: "var(--text-tertiary)" },
  connected: { label: "Connected", icon: Link2, color: "var(--color-success-600)" },
};

const confidenceColor = { high: "var(--color-success-600)", medium: "var(--color-warning-600)", low: "var(--text-tertiary)" };

function Quadrant({ icon: Icon, iconColor, title, children }: { icon: LucideIcon; iconColor: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-primary)] border border-[var(--border-tertiary)] p-4">
      <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
        <Icon size={12} strokeWidth={2} style={{ color: iconColor }} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export function IntelligenceSummaryGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* What we know */}
      <Quadrant icon={BookOpenCheck} iconColor="var(--text-secondary)" title="What We Know">
        <ul className="space-y-2.5">
          {WHAT_WE_KNOW.map((k) => {
            const s = sourceMeta[k.source];
            const Icon = s.icon;
            return (
              <li key={k.id} className="flex items-start justify-between gap-2">
                <span className="text-xs text-[var(--text-primary)] leading-snug">{k.fact}</span>
                <span className="flex items-center gap-1 text-[12px] text-[var(--text-tertiary)] shrink-0 whitespace-nowrap">
                  <Icon size={10} strokeWidth={2} style={{ color: s.color }} />
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </Quadrant>

      {/* What we've learned */}
      <Quadrant icon={Sparkles} iconColor="var(--icon-brand-primary)" title="What We've Learned">
        <ul className="space-y-2.5">
          {WHAT_WE_LEARNED.map((l) => (
            <li key={l.id} className="rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] p-2">
              <div className="flex items-start gap-1.5">
                <Sparkles size={11} strokeWidth={2} className="text-[var(--icon-brand-primary)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--text-primary)] leading-snug">{l.text}</p>
              </div>
              <span className="text-[12px] font-medium capitalize ml-4" style={{ color: confidenceColor[l.confidence] }}>{l.confidence} confidence</span>
            </li>
          ))}
        </ul>
      </Quadrant>

      {/* What's missing */}
      <Quadrant icon={CircleAlert} iconColor="var(--color-warning-600)" title="What's Missing">
        <ul className="space-y-2.5 mb-3">
          {WHATS_MISSING.map((m) => (
            <li key={m.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--text-primary)]">{m.item}</span>
                <button type="button" className="text-[12px] font-semibold text-[var(--text-brand-primary)] hover:underline shrink-0">{m.actionLabel}</button>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)]">Needed for: {m.whyItMatters}</p>
            </li>
          ))}
        </ul>
        <p className="text-[12px] font-medium text-[var(--text-status-warning)] pt-2 border-t border-[var(--border-tertiary)]">
          Readiness: {MISSING_IMPACT.current}% → est. {MISSING_IMPACT.projected}% after verification
        </p>
      </Quadrant>

      {/* Next best action */}
      <Quadrant icon={Target} iconColor="var(--icon-brand-primary)" title="Next Best Action">
        <p className="text-sm text-[var(--text-primary)] leading-snug mb-2">{NEXT_BEST_ACTION.text}</p>
        <ul className="mb-3">
          {NEXT_BEST_ACTION.evidence.map((e) => (
            <li key={e} className="text-[12px] text-[var(--text-tertiary)]">· {e}</li>
          ))}
        </ul>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" trailingIcon={<ArrowRight size={12} strokeWidth={2} />}>{NEXT_BEST_ACTION.ctaLabel}</Button>
          <Button variant="tertiary" size="sm" leadingIcon={<CalendarClock size={12} strokeWidth={2} />}>Schedule Reminder Instead</Button>
        </div>
        <span className="inline-block mt-2 text-[12px] font-medium capitalize" style={{ color: confidenceColor[NEXT_BEST_ACTION.confidence] }}>
          {NEXT_BEST_ACTION.confidence} confidence
        </span>
      </Quadrant>
    </section>
  );
}
