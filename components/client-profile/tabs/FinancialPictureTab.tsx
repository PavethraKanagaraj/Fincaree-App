"use client";

import { ClientProfileData, DATA_SOURCE_LABEL, formatINR } from "../client-data";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

const ALLOCATION_COLOR: Record<string, string> = {
  equity: "bg-[var(--bg-brand-primary)]",
  debt: "bg-[var(--color-info-500)]",
  gold: "bg-[var(--color-warning-500)]",
  cash: "bg-[var(--icon-quaternary)]",
};

export function FinancialPictureTab({ client }: { client: ClientProfileData }) {
  const { financialData: f, advisoryReadiness: r, identity } = client;
  const allocationEntries = Object.entries(f.portfolioAllocation) as [keyof typeof f.portfolioAllocation, number][];

  return (
    <div className="space-y-6">
      {/* 1. Financial Profile (with source provenance) */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Financial Profile</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Income</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{f.monthlyIncome.value}<span className="text-xs font-normal text-[var(--text-tertiary)]">/mo</span></p>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{DATA_SOURCE_LABEL[f.monthlyIncome.source]}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Expenses</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{f.monthlyExpenses.value}<span className="text-xs font-normal text-[var(--text-tertiary)]">/mo</span></p>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{DATA_SOURCE_LABEL[f.monthlyExpenses.source]}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Monthly Surplus</p>
            <p className="text-lg font-bold text-[var(--text-status-success)]">{formatINR(f.monthlySurplus)}</p>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Calculated from verified data</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Net Worth</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{f.netWorth.value}</p>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{DATA_SOURCE_LABEL[f.netWorth.source]}</p>
          </div>
        </div>
      </div>

      {/* 2. KYC & Data Verification */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">KYC & Data Verification</h2>
          <button className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline">View verification history</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Identity</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[var(--text-status-success)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Verified</span>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">PAN</p>
            <div className="flex items-center gap-1.5">
              {r.panVerified ? (
                <>
                  <CheckCircle2 size={13} className="text-[var(--text-status-success)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle size={13} className="text-[var(--text-status-warning)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Pending</span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Financial Information</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Last verified: {r.lastPortfolioSync}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Risk Profile</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] capitalize">{identity.riskProfile}</p>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
              {identity.riskReviewDue ? (
                <span className="text-[var(--text-status-warning)]">Review due {identity.riskReviewDue}</span>
              ) : (
                `Assessed ${identity.riskLastAssessed}`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Accounts & Aggregation */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Accounts & Aggregation</h2>
        <div>
          {f.accounts.map((account) => (
            <div key={account.name} className="flex items-center justify-between gap-3 py-2.5 border-b border-[var(--border-tertiary)] last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{account.institution}</p>
                <p className="text-[13px] text-[var(--text-tertiary)]">{account.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  {account.status === "connected" ? (
                    <CheckCircle2 size={12} className="text-[var(--text-status-success)]" />
                  ) : (
                    <AlertCircle size={12} className="text-[var(--text-status-warning)]" />
                  )}
                  <span className={`text-xs font-semibold ${account.status === "connected" ? "text-[var(--text-primary)]" : "text-[var(--text-status-warning)]"}`}>
                    {account.status === "connected" ? "Connected" : "Sync issue"}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Last synced {account.lastSynced}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Portfolio Overview */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Portfolio Overview</h2>
          <span className="text-xs font-semibold text-[var(--text-status-success)]">{f.portfolioChangeLabel}</span>
        </div>
        <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Total Investments</p>
        <p className="text-xl font-bold text-[var(--text-primary)] mb-4">{f.totalInvestments}</p>

        <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Asset Allocation</p>
        <div className="h-2.5 rounded-full overflow-hidden flex mb-2">
          {allocationEntries.map(([key, pct]) => (
            <div key={key} className={ALLOCATION_COLOR[key]} style={{ width: `${pct}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {allocationEntries.map(([key, pct]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${ALLOCATION_COLOR[key]}`} />
              <span className="text-[13px] text-[var(--text-secondary)] capitalize">{key} · {pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Protection */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Protection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {f.protection.map((policy) => (
            <div key={policy.type} className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-3.5">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">{policy.type}</p>
              {policy.status === "active" ? (
                <div className="space-y-1">
                  <p className="text-xs text-[var(--text-secondary)]">Coverage: {policy.coverageAmount}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Renews {policy.renewalDate}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-[var(--text-status-warning)]" />
                  <p className="text-xs text-[var(--text-status-warning)]">Coverage information incomplete</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Data Quality */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-status-warning-subtle)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Data Quality</h2>
          <span className="text-sm font-bold text-[var(--text-primary)]">{r.financialDataCompletion}% complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-4">
          <div className="h-full rounded-full bg-[var(--color-warning-500)]" style={{ width: `${r.financialDataCompletion}%` }} />
        </div>
        {r.pendingBlockers.length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Needs Attention</p>
            <div className="space-y-1.5 mb-3">
              {r.pendingBlockers.map((gap) => (
                <div key={gap} className="flex items-center gap-2">
                  <AlertCircle size={12} className="text-[var(--text-status-warning)] flex-shrink-0" />
                  <p className="text-xs text-[var(--text-secondary)]">{gap}</p>
                </div>
              ))}
            </div>
            <button className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex items-center gap-1">
              Resolve <ArrowRight size={11} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
