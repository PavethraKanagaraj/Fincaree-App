"use client";

import { Badge } from "@/components/fincaree/badge";
import {
  CURRENT_ADVICE,
  ADVICE_HISTORY,
  DECISIONS_LOG,
  ADVICE_LIFECYCLE,
  ADVICE_STATUS_LABEL,
  ADVICE_SOURCE_LABEL,
  AdviceStatus,
  AdviceSource,
} from "../advice-data";
import { AlertCircle, ArrowRight } from "lucide-react";

const STATUS_BADGE_COLOR: Record<AdviceStatus, "gray" | "brand" | "error" | "warning" | "success" | "gray-blue"> = {
  draft: "gray",
  "advisor-reviewed": "gray-blue",
  shared: "brand",
  "client-considering": "warning",
  accepted: "success",
  declined: "error",
  implemented: "success",
};

const SOURCE_BADGE_COLOR: Record<AdviceSource, "gray" | "brand" | "error" | "warning" | "success" | "gray-blue"> = {
  "ai-drafted": "brand",
  "advisor-authored": "gray",
  "client-provided": "gray-blue",
};

const RESOLVED_STATUSES: AdviceStatus[] = ["accepted", "declined", "implemented"];

/** Whose move it is, derived from where the item sits in the lifecycle.
    This is the one thing the advisor can't read off the status badge alone. */
function waitingOn(status: AdviceStatus): "client" | "you" | null {
  switch (status) {
    case "draft":
    case "advisor-reviewed":
    case "accepted":
      return "you";
    case "shared":
    case "client-considering":
      return "client";
    default:
      return null;
  }
}

export function AdviceAndDecisionsTab() {
  const pending = CURRENT_ADVICE.filter((a) => !RESOLVED_STATUSES.includes(a.status));
  const onClient = pending.filter((a) => waitingOn(a.status) === "client").length;
  const onAdvisor = pending.filter((a) => waitingOn(a.status) === "you").length;

  return (
    <div className="space-y-6">
      {/* Waiting strip — what's blocked and whose move it is. Replaces the old
          "Pending Decisions" card, which re-listed the same records as Active Advice. */}
      {pending.length > 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-status-warning-subtle)] bg-[var(--bg-status-warning-subtle)] px-5 py-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-[var(--text-status-warning)] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {pending.length} {pending.length === 1 ? "decision" : "decisions"} waiting
                <span className="font-normal text-[var(--text-secondary)]">
                  {" — "}
                  {onClient > 0 && `${onClient} on client`}
                  {onClient > 0 && onAdvisor > 0 && ", "}
                  {onAdvisor > 0 && `${onAdvisor} on you`}
                </span>
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
                {pending.map((advice) => (
                  <p key={advice.id} className="text-xs text-[var(--text-secondary)]">
                    {advice.title}
                    <span className="text-[var(--text-tertiary)]">
                      {" · "}
                      {waitingOn(advice.status) === "client" ? "client to confirm" : "needs your action"}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4">
          <p className="text-sm text-[var(--text-secondary)]">Nothing is waiting on a decision right now.</p>
        </div>
      )}

      {/* Advice and Decisions sit side by side — the tab's whole point is the
          distinction between what was proposed and what was decided. Rows are
          divided, not boxed: nesting a grey card inside a white one adds nothing,
          and half-width keeps the sentences at a readable measure. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Active Advice — the single place in-motion advice detail lives */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Active Advice</h2>

          {/* Lifecycle legend — shown once, not repeated per item */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap pb-3 border-b border-[var(--border-tertiary)]">
            {ADVICE_LIFECYCLE.map((status, idx) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">{ADVICE_STATUS_LABEL[status]}</span>
                {idx < ADVICE_LIFECYCLE.length - 1 && <ArrowRight size={10} className="text-[var(--icon-quaternary)]" />}
              </div>
            ))}
          </div>

          <div>
            {CURRENT_ADVICE.map((advice) => {
              const turn = waitingOn(advice.status);
              return (
                <div key={advice.id} className="py-3.5 border-b border-[var(--border-tertiary)] last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{advice.title}</p>
                    <Badge size="sm" color={STATUS_BADGE_COLOR[advice.status]} className="flex-shrink-0">
                      {ADVICE_STATUS_LABEL[advice.status]}
                    </Badge>
                  </div>
                  {turn && (
                    <p className="text-xs font-semibold text-[var(--text-status-warning)] mb-1.5">
                      Waiting on {turn === "client" ? "client" : "you"}
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] mb-2 max-w-[60ch]">{advice.context}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge size="sm" color={SOURCE_BADGE_COLOR[advice.source]}>{ADVICE_SOURCE_LABEL[advice.source]}</Badge>
                    <span className="text-[12px] text-[var(--text-tertiary)]">
                      {advice.advisor} · {advice.created}{advice.relatedGoal && ` · ${advice.relatedGoal}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decisions Log — decision first, meta consolidated beneath it */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Decisions Log</h2>
          <p className="text-[13px] text-[var(--text-tertiary)] mb-4 pb-3 border-b border-[var(--border-tertiary)]">
            What was decided — not the same as what was proposed.
          </p>
          <div>
            {DECISIONS_LOG.map((entry) => (
              <div key={entry.id} className="py-3.5 border-b border-[var(--border-tertiary)] last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{entry.decision}</p>
                <p className="text-[12px] text-[var(--text-tertiary)] mb-2">
                  {entry.meetingLabel} · {entry.date} · Decided by {entry.decisionMaker}
                  {entry.relatedGoal && ` · ${entry.relatedGoal}`}
                </p>
                <p className="text-xs text-[var(--text-secondary)] max-w-[60ch]">{entry.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Advice History — full chronology; in-flight items are marked so this
          reads as a timeline rather than a re-list of Active Advice above */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Advice History</h2>
        <div>
          {ADVICE_HISTORY.map((advice) => (
            <div key={advice.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-tertiary)] last:border-0">
              <span className="text-[13px] text-[var(--text-tertiary)] w-20 flex-shrink-0">{advice.created}</span>
              <span className="text-xs font-semibold text-[var(--text-primary)] flex-1 min-w-0">
                {advice.title}
                {!RESOLVED_STATUSES.includes(advice.status) && (
                  <span className="text-[12px] font-normal text-[var(--text-tertiary)]"> · still active</span>
                )}
              </span>
              <Badge size="sm" color={STATUS_BADGE_COLOR[advice.status]} className="flex-shrink-0">{ADVICE_STATUS_LABEL[advice.status]}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
