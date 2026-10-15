"use client";

import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ComplianceCard } from "./ComplianceCard";
import { ComplianceItem } from "./data";
import { COMPLIANCE_AUDIT_TRAIL, SUITABILITY_LOG } from "./journey.data";
import { Download, Sparkles } from "lucide-react";

export function ComplianceTab({ items }: { items: ComplianceItem[] }) {
  return (
    <div className="space-y-4">
      <ComplianceCard items={items} />

      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Audit Trail</h2>
          <Button variant="tertiary" size="sm" leadingIcon={<Download size={12} strokeWidth={2} />}>
            Download Compliance Log
          </Button>
        </div>
        <ul className="space-y-2.5">
          {COMPLIANCE_AUDIT_TRAIL.map((e) => (
            <li
              key={e.id}
              className={
                e.actor === "AI"
                  ? "flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] px-2.5 py-1.5"
                  : "flex items-center gap-2 px-0.5"
              }
            >
              {e.actor === "AI" && <Sparkles size={11} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />}
              <span className="text-[11px] text-[var(--text-quaternary)] tabular-nums w-20 shrink-0">{e.date}</span>
              <span className="text-xs text-[var(--text-secondary)] flex-1">{e.action}</span>
              <Badge color="gray" size="sm">{e.actor}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Suitability Log</h2>
        <div className="divide-y divide-[var(--border-tertiary)]">
          {SUITABILITY_LOG.map((s) => (
            <div key={s.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{s.recommendation}</p>
                <Badge color={s.clientResponse === "accepted" ? "success" : s.clientResponse === "declined" ? "error" : "warning"} size="sm">
                  {s.clientResponse}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-snug mb-1">{s.rationale}</p>
              <p className="text-[11px] text-[var(--text-quaternary)]">
                Risk profile at time: {s.riskProfileAtTime} · {s.advisor} · {s.date}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
