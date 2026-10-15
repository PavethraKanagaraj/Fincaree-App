"use client";

import { Badge } from "@/components/fincaree/badge";
import { QUICK_PROFILE_DATA } from "./data";
import { Circle, ClipboardList } from "lucide-react";

/* ============================================================
   Section 2 — Quick Profile Data (populated, Stage 2+)
   ============================================================ */

export function QuickProfileSection() {
  const stale = QUICK_PROFILE_DATA.daysAgo > 14;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Quick Profile</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4">
        <div>
          <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Goals &amp; Priorities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROFILE_DATA.goals.map((g) => (
              <Badge key={g} color="brand" size="sm">{g}</Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Life Stage</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{QUICK_PROFILE_DATA.lifeStage}</p>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Income Range</div>
          <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
            {QUICK_PROFILE_DATA.incomeRange}
            <span className="inline-flex items-center gap-1 text-[12px] font-normal text-[var(--text-tertiary)]">
              <Circle size={7} strokeWidth={2} className="fill-current" /> Self-reported
            </span>
          </p>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Risk Comfort</div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="w-3.5 h-1.5 rounded-full"
                  style={{ backgroundColor: n <= QUICK_PROFILE_DATA.riskComfort.level ? "var(--bg-brand-primary)" : "var(--bg-secondary)" }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)]">{QUICK_PROFILE_DATA.riskComfort.label}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-normal text-[var(--text-tertiary)] mt-1">
            <Circle size={7} strokeWidth={2} className="fill-current" /> Self-reported
          </span>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Key Financial Concerns</div>
          <ul className="space-y-0.5">
            {QUICK_PROFILE_DATA.concerns.map((c) => (
              <li key={c} className="text-xs text-[var(--text-secondary)]">· {c}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            What They Expect From Advisory
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-snug">{QUICK_PROFILE_DATA.expectations}</p>
        </div>
      </div>

      <p className={`text-[12px] pt-3 border-t border-[var(--border-tertiary)] ${stale ? "text-[var(--text-status-error)] font-medium" : "text-[var(--text-tertiary)]"}`}>
        Submitted {QUICK_PROFILE_DATA.submittedDate} — {QUICK_PROFILE_DATA.daysAgo} {QUICK_PROFILE_DATA.daysAgo === 1 ? "day" : "days"} ago
        {stale && " · Consider asking for updates"}
      </p>
    </section>
  );
}
