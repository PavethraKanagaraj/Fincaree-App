"use client";

import { ArrowRight, BookOpen, FileText, Users, Zap } from "lucide-react";

const ACTIONS = [
  { icon: FileText, label: "Prepare meeting brief", subtext: "with Finny" },
  { icon: FileText, label: "Create client note", subtext: "" },
  { icon: Users, label: "Assign learning path", subtext: "" },
  { icon: Zap, label: "Add follow-up task", subtext: "" },
  { icon: BookOpen, label: "View opportunities", subtext: "2" },
];

export function QuickActions() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <Zap size={16} className="text-[var(--icon-brand-primary)]" />
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Quick Actions</h3>
      </div>
      <div className="space-y-2">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-colors text-left group"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-[var(--icon-tertiary)] group-hover:text-[var(--icon-brand-primary)] transition-colors" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{action.label}</p>
                  {action.subtext && <p className="text-[13px] text-[var(--text-tertiary)]">{action.subtext}</p>}
                </div>
              </div>
              <ArrowRight size={13} className="text-[var(--icon-tertiary)] group-hover:text-[var(--icon-brand-primary)] transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
