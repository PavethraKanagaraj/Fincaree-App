"use client";

import { FeeStructure } from "./data";
import { Receipt } from "lucide-react";

/* ============================================================
   Billing — sidebar card. Kept simple per the Foundation scope:
   current fee structure and standing, not a full invoicing
   ledger.
   ============================================================ */

function Row({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "error" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      <span
        className={
          tone === "error"
            ? "text-sm font-medium text-[var(--color-error-700)] text-right"
            : "text-sm font-medium text-[var(--text-primary)] text-right"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function BillingCard({ fee }: { fee: FeeStructure }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Receipt size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Billing</h2>
      </div>
      <div className="space-y-2.5">
        <Row label="Fee structure" value={fee.rate} />
        <Row label="Annual fee" value={fee.annualFee} />
        <Row label="Last paid" value={fee.lastPaid} />
        <Row label="Next billing" value={fee.overdue ? "Overdue" : fee.nextBilling} tone={fee.overdue ? "error" : "default"} />
      </div>
    </section>
  );
}
