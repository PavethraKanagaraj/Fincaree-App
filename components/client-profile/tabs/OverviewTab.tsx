"use client";

import { useState } from "react";
import { ClientProfileData, NeedsAttentionItem, TODAY_ISO } from "../client-data";
import { CURRENT_ADVICE, ADVICE_STATUS_LABEL } from "../advice-data";
import { Badge } from "@/components/fincaree/badge";
import { ArrowRight, CheckCircle2, Calendar, ChevronDown, Sparkles } from "lucide-react";

interface OverviewTabProps {
  client: ClientProfileData;
  onTabChange: (tab: string) => void;
}

const SEVERITY_DOT: Record<NeedsAttentionItem["severity"], string> = {
  critical: "bg-[var(--color-error-500)]",
  warning: "bg-[var(--color-warning-500)]",
  info: "bg-[var(--color-info-500)]",
};

const GOAL_STATUS_LABEL: Record<string, string> = {
  "on-track": "On track",
  "needs-review": "Needs review",
  "needs-attention": "Needs attention",
};
const GOAL_STATUS_COLOR: Record<string, "gray" | "brand" | "error" | "warning" | "success" | "gray-blue"> = {
  "on-track": "success",
  "needs-review": "warning",
  "needs-attention": "error",
};

function daysUntil(dateLabel: string): number | null {
  const d = new Date(dateLabel);
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - new Date(TODAY_ISO).getTime()) / (1000 * 60 * 60 * 24));
}

export function OverviewTab({ client, onTabChange }: OverviewTabProps) {
  const daysToMeeting = daysUntil(client.nextMeeting.date);
  const meetingSoon = (daysToMeeting ?? 99) <= 14;
  const [meetingExpanded, setMeetingExpanded] = useState(meetingSoon);
  const meetingsCount = client.activity.filter((a) => a.category === "meeting").length;

  return (
    <div className="space-y-6">
      {/* Relationship strip — orientation first, and only the facts the persistent
          header doesn't already carry (no Plan / Next Review repeat). */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4">
        <div className="flex flex-wrap gap-y-3">
          {[
            { label: "Client Since", value: client.identity.relationshipSince },
            { label: "Meetings", value: String(meetingsCount) },
            { label: "Last Interaction", value: "2 days ago" },
            { label: "Open Actions", value: String(client.openActions) },
            { label: "Relationship Health", value: "Active" },
          ].map((item, i) => (
            <div key={item.label} className={`flex-1 min-w-[130px] px-4 ${i > 0 ? "border-l border-[var(--border-tertiary)]" : "pl-0"}`}>
              <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Left: what needs a decision ────────────────────────── */}
        <div className="space-y-6">
          {/* Needs Attention */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
              Needs Attention{" "}
              {client.needsAttention.length > 0 && (
                <span className="text-[var(--text-tertiary)] font-normal">· {client.needsAttention.length}</span>
              )}
            </h2>
            {client.needsAttention.length === 0 ? (
              <div className="flex items-center gap-2.5 py-2">
                <CheckCircle2 size={16} className="text-[var(--text-status-success)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">You&apos;re all caught up</p>
                  <p className="text-xs text-[var(--text-tertiary)]">No urgent client actions right now.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {client.needsAttention.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)]">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEVERITY_DOT[item.severity]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{item.issue}</p>
                        {item.detail && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.detail}</p>}
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex-shrink-0">
                      {item.type === "pending" ? "Request details" : item.type === "review" ? "Review report" : "Review"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What Changed Since Last Review */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">What Changed Since Last Review</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Financial</p>
                <p className="text-xs text-[var(--text-secondary)]">Portfolio value</p>
                <p className="text-sm font-semibold text-[var(--text-status-success)]">+6.2%</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Goals</p>
                <p className="text-xs text-[var(--text-secondary)]">Retirement target</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">Age 60 → 58</p>
                <p className="text-xs text-[var(--text-secondary)]">Education goal</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">₹25L → ₹35L</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">New Information</p>
                <p className="text-xs text-[var(--text-secondary)]">Healthcare expense</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">New consideration</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-tertiary)]">
              <div className="flex items-start gap-2 min-w-0">
                <Sparkles size={13} className="text-[var(--icon-brand-primary)] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[var(--text-secondary)]">
                  The revised retirement timeline may affect the funding trajectory — review contribution levels.
                </p>
              </div>
              <button onClick={() => onTabChange("goals-plan")} className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex-shrink-0">
                Review impact
              </button>
            </div>
          </div>

          {/* Current Goals */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Current Goals</h2>
              <button onClick={() => onTabChange("goals-plan")} className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex items-center gap-1">
                View all goals <ArrowRight size={11} />
              </button>
            </div>
            <div>
              <div className="grid grid-cols-[1fr_64px_72px_108px] gap-2 px-1 pb-2 border-b border-[var(--border-tertiary)]">
                <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Goal</span>
                <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Progress</span>
                <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Gap</span>
                <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Status</span>
              </div>
              {client.goals.map((goal) => (
                <div key={goal.id} className="grid grid-cols-[1fr_64px_72px_108px] gap-2 px-1 py-2.5 items-center border-b border-[var(--border-tertiary)] last:border-0">
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{goal.name}</span>
                  <span className="text-sm text-[var(--text-primary)] text-right">{goal.progress}%</span>
                  <span className="text-sm text-[var(--text-tertiary)] text-right">{goal.gap ?? "—"}</span>
                  <div className="flex justify-end">
                    <Badge size="sm" color={GOAL_STATUS_COLOR[goal.status]}>{GOAL_STATUS_LABEL[goal.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Advice */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Current Advice</h2>
              <button onClick={() => onTabChange("advice-decisions")} className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </button>
            </div>
            <div className="space-y-3">
              {CURRENT_ADVICE.map((advice) => (
                <div key={advice.id} className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)]">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{advice.title}</p>
                    <Badge size="sm" color="warning" className="flex-shrink-0">{ADVICE_STATUS_LABEL[advice.status]}</Badge>
                  </div>
                  <p className="text-[13px] text-[var(--text-tertiary)] mb-2">
                    {advice.advisor} · {advice.created}{advice.relatedGoal && ` · ${advice.relatedGoal}`}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">{advice.context}</p>
                  <button onClick={() => onTabChange("advice-decisions")} className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline">
                    View Advice
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: the context you hold while deciding (sticky) ── */}
        <div className="space-y-4 xl:sticky xl:top-4">
          {/* Next Meeting */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-primary)] p-4">
            <button onClick={() => setMeetingExpanded((v) => !v)} className="w-full flex items-start justify-between gap-3 text-left">
              <div className="flex items-start gap-2 min-w-0">
                <Calendar size={15} className="text-[var(--icon-brand-primary)] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Next Meeting</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{client.nextMeeting.title}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {client.nextMeeting.date} · {client.nextMeeting.time}
                    {daysToMeeting !== null && daysToMeeting >= 0 && (
                      <span className="text-[var(--text-brand-primary)] font-semibold">
                        {daysToMeeting === 0 ? " · Today" : daysToMeeting === 1 ? " · Tomorrow" : ` · in ${daysToMeeting} days`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-[var(--icon-tertiary)] transition-transform flex-shrink-0 mt-0.5 ${meetingExpanded ? "rotate-180" : ""}`} />
            </button>

            {meetingExpanded && (
              <div className="mt-3.5 pt-3.5 border-t border-[var(--border-tertiary)] space-y-3">
                <div>
                  <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Why we&apos;re meeting</p>
                  <p className="text-xs text-[var(--text-secondary)]">{client.nextMeeting.description}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Key topics</p>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                    <li>• Retirement goal</li>
                    <li>• Education funding</li>
                    <li>• Portfolio review</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Open questions</p>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                    <li>• Updated retirement income requirement</li>
                    <li>• Confirm existing insurance coverage</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={11} className="text-[var(--icon-brand-primary)]" />
                    <span className="text-[12px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Finny Meeting Brief</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    Retirement goal has moved 8% behind the previous projection. Consider validating monthly contribution and income assumptions.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => onTabChange("meeting-context")}
              className="mt-3.5 w-full bg-[var(--bg-brand-primary)] text-white text-xs font-semibold py-2 rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
            >
              Open Meeting Prep
            </button>
          </div>

          {/* Finny Insight */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-[var(--icon-brand-primary)]" />
              <span className="text-[12px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Finny Insight</span>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed mb-2.5">
              <span className="font-semibold">Engagement has increased</span> over the last 60 days — 3 learning modules completed and 2 retirement simulations run since the last review.
            </p>
            <button onClick={() => onTabChange("engagement")} className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline">
              See engagement
            </button>
          </div>

          {/* Last Review Outcome */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Last Review Outcome</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Plan Discussion · 20 May 2025</p>
            <div className="space-y-2.5">
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] mb-0.5">Discussed</p>
                <p className="text-xs text-[var(--text-secondary)]">Goal prioritisation · Retirement simulation</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] mb-0.5">Decisions</p>
                <p className="text-xs text-[var(--text-secondary)]">Increase SIP contribution after bonus review</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] mb-0.5">Still open</p>
                <p className="text-xs text-[var(--text-status-warning)]">Client to provide updated insurance policy</p>
              </div>
            </div>
            <button onClick={() => onTabChange("activity")} className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mt-3 flex items-center gap-1">
              View full review <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
