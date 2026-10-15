"use client";

import { Badge } from "@/components/fincaree/badge";
import { FinancialHealthSnapshot as FinancialHealthSnapshotData, HealthStatus } from "./data";
import { Activity } from "lucide-react";

/* ============================================================
   Financial Health Snapshot — the "under 10 seconds" answer to
   "how healthy is this client's financial position right now?"
   Sits right under the identity header, ahead of everything
   else — distinct from Financial Picture, which stays the
   supporting detail tab.
   ============================================================ */

const STATUS_CONFIG: Record<HealthStatus, { label: string; color: "success" | "warning" | "error"; barColor: string }> = {
  "on-track": { label: "On track", color: "success", barColor: "var(--color-success-500)" },
  "needs-attention": { label: "Needs attention", color: "warning", barColor: "var(--color-warning-500)" },
  "at-risk": { label: "At risk", color: "error", barColor: "var(--color-error-500)" },
};

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

export function FinancialHealthSnapshot({ data }: { data: FinancialHealthSnapshotData }) {
  const status = STATUS_CONFIG[data.healthStatus];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Financial Health Snapshot</h2>
        </div>
        <Badge color={status.color} size="sm">{status.label}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <Stat label="Total AUM">
          <p className="text-lg font-bold text-[var(--text-primary)]">{data.aum}</p>
        </Stat>

        <Stat label="Health Score">
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold text-[var(--text-primary)]">{data.healthScore}</p>
            <span className="text-xs text-[var(--text-tertiary)]">/ 100</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mt-1.5 max-w-[110px]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${data.healthScore}%`, backgroundColor: status.barColor }}
            />
          </div>
        </Stat>

        <Stat label="Risk Level">
          <p className="text-lg font-bold text-[var(--text-primary)]">{data.riskLevel}</p>
        </Stat>

        <Stat label="Portfolio Return">
          <p className="text-lg font-bold text-[var(--color-success-700)]">{data.portfolioReturn}</p>
        </Stat>
      </div>
    </section>
  );
}
