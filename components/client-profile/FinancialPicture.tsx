"use client";

import { FinancialPicture as FinancialPictureData } from "./data";
import { Wallet } from "lucide-react";

/* ============================================================
   Financial Picture
   Supporting detail — intentionally placed last in the reading
   order. High-level indicators only, not a full calculation.
   ============================================================ */

export function FinancialPicture({ data }: { data: FinancialPictureData }) {
  const items: { label: string; value: string }[] = [
    { label: "Net Worth", value: data.netWorth },
    { label: "Monthly Income", value: data.monthlyIncome },
    { label: "Monthly Expenses", value: data.monthlyExpenses },
    { label: "Monthly Surplus", value: data.monthlySurplus },
    { label: "Investments", value: data.investments },
    { label: "Insurance Cover", value: data.insuranceCover },
    { label: "Existing Debt", value: data.debt },
    { label: "Suggested Reserve", value: data.suggestedReserve },
  ];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Wallet size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Financial Picture</h2>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mb-4 max-w-prose">
        High-level indicators based on information provided. Planning horizon: {data.planningHorizon}.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)]"
          >
            <div className="text-[11px] text-[var(--text-tertiary)] mb-1">{item.label}</div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
