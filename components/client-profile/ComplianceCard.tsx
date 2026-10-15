"use client";

import { Badge } from "@/components/fincaree/badge";
import { ComplianceItem, ComplianceItemStatus } from "./data";
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

/* ============================================================
   SEBI Compliance — sidebar card so the advisor never has to
   leave the profile to check a client's KYC / risk profile /
   agreement standing. Kept simple per the Foundation scope: a
   status read, not a full compliance workflow.
   ============================================================ */

const STATUS_ICON: Record<ComplianceItemStatus, React.ReactNode> = {
  complete: <CheckCircle2 size={14} strokeWidth={2} className="text-[var(--color-success-500)]" />,
  "due-soon": <AlertTriangle size={14} strokeWidth={2} className="text-[var(--color-warning-500)]" />,
  overdue: <AlertCircle size={14} strokeWidth={2} className="text-[var(--color-error-500)]" />,
};

export function ComplianceCard({ items }: { items: ComplianceItem[] }) {
  const actionNeeded = items.some((i) => i.status !== "complete");

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">SEBI Compliance</h2>
        </div>
        <Badge size="sm" color={actionNeeded ? "warning" : "success"}>
          {actionNeeded ? "Action needed" : "All clear"}
        </Badge>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">{STATUS_ICON[item.status]}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-snug">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
