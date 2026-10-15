"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/fincaree/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Report,
  AIFlag,
  AIFlagType,
  AI_FLAG_TYPE_LABELS,
  FlagDecision,
  FLAG_DECISION_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  MEETING_DEPENDENCY_LABELS,
  reportCategoryLabel,
  reviewByUrgency,
  primaryAction,
} from "./data";
import { FlagIcon } from "./FlagIcon";
import { MeetingWhen } from "./MeetingWhen";
import {
  X,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  FileDown,
  Archive,
  Calendar,
  Database,
} from "lucide-react";
import { useState } from "react";

/* ============================================================
   Report Drawer — row detail, right-side.
   Flat scroll: Client Header → Report Status → Finny Intelligence
   → AI Flags → Report Preview (with inline Finny cards) →
   Finny Pre-Approval Check.

   Flag resolution is one shared `flagDecisions` map, keyed by flag
   index, read by both the flat AI Flags list and the inline cards
   inside Report Preview — resolving a flag in either place updates
   both, so there's no duplicate state to drift.
   ============================================================ */

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function planColor(plan: string): "brand" | "warning" | "gray" {
  if (plan === "Platinum") return "brand";
  if (plan === "Gold") return "warning";
  return "gray";
}

/* The verb an advisor acts with depends on what kind of flag it is —
   "Resolve" is a blunt catch-all; these name the actual decision. */
interface FlagAction {
  label: string;
  decision: FlagDecision;
  variant: "primary" | "secondary" | "tertiary";
}

function flagActions(type: AIFlagType): FlagAction[] {
  switch (type) {
    case "suggestion":
      return [
        { label: "Accept", decision: "accepted", variant: "primary" },
        { label: "Dismiss", decision: "dismissed", variant: "tertiary" },
      ];
    case "assumption":
      return [
        { label: "Confirm", decision: "confirmed", variant: "primary" },
        { label: "Change", decision: "changed", variant: "secondary" },
      ];
    case "data-gap":
    case "conflicting-data":
    case "stale-data":
      return [
        { label: "Request Update", decision: "requested", variant: "primary" },
        { label: "Continue with Assumption", decision: "continued", variant: "secondary" },
      ];
    case "compliance-review":
    case "exception":
      return [{ label: "Resolve", decision: "resolved", variant: "primary" }];
  }
}

const DATA_QUALITY_TYPES: AIFlagType[] = ["data-gap", "conflicting-data", "stale-data"];

interface ReportDrawerProps {
  report: Report | null;
  onClose: () => void;
}

export function ReportDrawer({ report, onClose }: ReportDrawerProps) {
  // The parent nulls `report` the instant it closes, but Sheet's exit
  // animation needs content to animate against — keep the last real report
  // around through the close transition instead of unmounting to nothing.
  // Adjusted during render (not an effect) per React's recommended pattern
  // for deriving state from a changing prop.
  const [displayReport, setDisplayReport] = useState<Report | null>(null);
  if (report && report !== displayReport) {
    setDisplayReport(report);
  }

  const [flagDecisions, setFlagDecisions] = useState<Record<number, FlagDecision>>({});
  // Refs aren't safe to read/write during render — track the previous id in
  // state instead (React's documented pattern for this exact case).
  const [lastReportId, setLastReportId] = useState<string | null>(null);
  if (report && report.id !== lastReportId) {
    setLastReportId(report.id);
    setFlagDecisions({});
  }

  const shown = displayReport;
  if (!shown) return null;

  function decide(index: number, decision: FlagDecision) {
    setFlagDecisions((prev) => {
      const next = { ...prev };
      if (next[index] === decision) delete next[index];
      else next[index] = decision;
      return next;
    });
  }

  const unresolvedAssumptions = shown.aiFlags.filter((f, i) => f.type === "assumption" && !flagDecisions[i]).length;
  const unresolvedSuggestions = shown.aiFlags.filter((f, i) => f.type === "suggestion" && !flagDecisions[i]).length;
  const unresolvedCompliance = shown.aiFlags.filter((f, i) => f.type === "compliance-review" && !flagDecisions[i]).length;
  const unresolvedDataIssues = shown.aiFlags.filter(
    (f, i) => DATA_QUALITY_TYPES.includes(f.type) && !flagDecisions[i]
  ).length;
  const ctaLabel = primaryAction(shown.status).label;

  const suggestionFlags = shown.aiFlags
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.type === "suggestion");
  const assumptionFlags = shown.aiFlags
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.type === "assumption");
  const dataQualityFlags = shown.aiFlags
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => DATA_QUALITY_TYPES.includes(f.type));

  return (
    <Sheet
      open={!!report}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent showCloseButton={false} aria-label={`${shown.reportName} — ${shown.client.name}`}>
        <SheetTitle className="sr-only">
          {shown.reportName} — {shown.client.name}
        </SheetTitle>

        {/* ── Client Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border-tertiary)] shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Avatar size="md" initials={initials(shown.client.name)} />
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{shown.client.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge color={planColor(shown.client.plan)} size="sm">{shown.client.plan}</Badge>
                  <span className="text-xs text-[var(--text-tertiary)]">{shown.client.id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="tertiary"
                size="sm"
                iconOnly
                leadingIcon={<RefreshCw size={14} strokeWidth={1.75} />}
                aria-label="Regenerate report"
                title="Regenerate report"
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  showChevron={false}
                  render={
                    <Button
                      variant="tertiary"
                      size="sm"
                      iconOnly
                      leadingIcon={<MoreHorizontal size={15} strokeWidth={1.75} />}
                      aria-label="More options"
                    />
                  }
                />
                <DropdownMenuContent alignment="end">
                  <DropdownMenuItem icon={<Copy size={14} strokeWidth={1.75} />}>
                    Duplicate report
                  </DropdownMenuItem>
                  <DropdownMenuItem icon={<FileDown size={14} strokeWidth={1.75} />}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem icon={<Archive size={14} strokeWidth={1.75} />}>
                    Archive report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="tertiary"
                size="sm"
                iconOnly
                leadingIcon={<X size={15} strokeWidth={2} />}
                onClick={onClose}
                aria-label="Close drawer"
              />
            </div>
          </div>

          <div className="text-base font-semibold text-[var(--text-primary)] leading-snug mb-1">
            {shown.reportName}
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <span>{reportCategoryLabel(shown)}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} strokeWidth={1.75} />
              {shown.meeting ? shown.meeting.label : "No Upcoming Meeting"}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* ── Report Status ── */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Report Status</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Status</div>
                <Badge color={STATUS_COLORS[shown.status]} leadingIcon="dot" size="sm">
                  {STATUS_LABELS[shown.status]}
                </Badge>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Readiness</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{shown.readiness}%</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Review Deadline</div>
                <MeetingWhen label={shown.reviewBy.label} urgency={reviewByUrgency(shown.reviewBy.category)} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Meeting Dependency</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {MEETING_DEPENDENCY_LABELS[shown.meetingDependency]}
                </div>
              </div>
            </div>
          </section>

          {/* ── Finny Intelligence ── */}
          <section id="finny-intelligence" className="-mx-5 px-5 py-4 bg-[var(--bg-brand-subtle)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
              <span className="text-sm font-semibold text-[var(--text-brand-primary)]">Finny Intelligence</span>
            </div>

            <IntelBlock
              title="What changed"
              items={
                suggestionFlags.length > 0
                  ? suggestionFlags.map(({ f }) => f.explanation)
                  : ["Portfolio holdings and goal progress were refreshed since the last report."]
              }
            />

            <IntelBlock
              title="Why this matters"
              items={
                shown.aiFlags.length > 0
                  ? shown.aiFlags.slice(0, 2).map((f) => `${f.label}: ${f.explanation}`)
                  : ["Nothing material changed — the plan still tracks to goal."]
              }
            />

            <IntelBlock
              title="Suggested discussion"
              items={
                suggestionFlags.length > 0
                  ? suggestionFlags.map(({ f }) => f.suggestedResolution)
                  : ["No specific discussion points — a general check-in is enough."]
              }
            />

            <div className="mb-3">
              <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Data quality</div>
              <ul className="space-y-1">
                <li className="flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 size={13} strokeWidth={2} className="text-[var(--text-status-success)] mt-0.5 shrink-0" />
                  Portfolio &amp; goal data synced
                </li>
                {dataQualityFlags.map(({ f }, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                    <AlertTriangle size={13} strokeWidth={2} className="text-[var(--text-status-warning)] mt-0.5 shrink-0" />
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Assumptions</div>
              {assumptionFlags.length === 0 ? (
                <div className="flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 size={13} strokeWidth={2} className="text-[var(--text-status-success)] mt-0.5 shrink-0" />
                  No unconfirmed assumptions
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {assumptionFlags.map(({ f }, idx) => (
                    <li key={idx} className="text-sm text-[var(--text-secondary)]">
                      <span className="flex items-start gap-1.5">
                        <AlertTriangle size={13} strokeWidth={2} className="text-[var(--text-status-warning)] mt-0.5 shrink-0" />
                        {f.label}
                      </span>
                      <span className="block text-xs text-[var(--text-tertiary)] ml-5">Based on: {f.source}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => document.getElementById("report-preview")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Review Changes
            </Button>
          </section>

          {/* ── AI Flags ── */}
          <section id="ai-flags">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Flags</h3>
              <span className="text-xs font-semibold text-[var(--text-brand-primary)] bg-[var(--bg-brand-subtle)] px-1.5 py-0.5 rounded-full">
                {shown.aiFlags.length}
              </span>
            </div>
            {shown.aiFlags.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">No AI flags on this report.</p>
            ) : (
              <div className="divide-y divide-[var(--border-tertiary)]">
                {shown.aiFlags.map((f, i) => (
                  <FlagCard key={i} flag={f} decision={flagDecisions[i]} onDecide={(d) => decide(i, d)} />
                ))}
              </div>
            )}
          </section>

          {/* ── Report Preview ── */}
          <section id="report-preview">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Report Preview</h3>

            <div className="mb-4">
              <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Executive Summary</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {shown.client.name}&apos;s overall financial position is stable, with goal funding broadly on track.
                {shown.aiFlags.length > 0 ? " A few items below are worth confirming before this goes out." : " No open items before this can be shared."}
              </p>
            </div>

            <div className="mb-4">
              <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Key Findings</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: "Net Worth", value: "₹1.42 Cr" },
                  { label: "Monthly Income", value: "₹1,85,000" },
                  { label: "Investments", value: "₹89 L" },
                  { label: "Insurance Cover", value: "₹1.2 Cr" },
                ].map((item) => (
                  <div key={item.label} className="border-t border-[var(--border-tertiary)] pt-2.5">
                    <div className="text-xs text-[var(--text-tertiary)] mb-0.5">{item.label}</div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Inline Finny suggestion — the moment a reader hits the number it's about */}
              {suggestionFlags.map(({ f, i }) => (
                <InlineFinnyCard key={i} flag={f} decision={flagDecisions[i]} onDecide={(d) => decide(i, d)} />
              ))}
            </div>

            <div className="mb-4">
              <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Assumptions</div>

              {assumptionFlags.map(({ f, i }) => (
                <InlineFinnyCard key={i} flag={f} decision={flagDecisions[i]} onDecide={(d) => decide(i, d)} />
              ))}

              <ul className={cn("space-y-1 text-sm text-[var(--text-secondary)]", assumptionFlags.length > 0 && "mt-3")}>
                <li>Retirement age: 60</li>
                <li>Expected portfolio return: 10% p.a.</li>
                <li>Inflation: 6% p.a.</li>
              </ul>
            </div>

            {dataQualityFlags.map(({ f, i }) => (
              <div key={i} className="mb-4">
                <InlineFinnyCard flag={f} decision={flagDecisions[i]} onDecide={(d) => decide(i, d)} />
              </div>
            ))}

            <div>
              <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Data Sources</div>
              <div className="space-y-1.5">
                {["Portfolio holdings · synced today", "Client profile", "Goal tracker"].map((s) => (
                  <div key={s} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <Database size={11} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Finny Pre-Approval Check — sticky footer ── */}
        <div className="shrink-0 border-t border-[var(--border-tertiary)] px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
            <span className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
              Finny Pre-Approval Check
            </span>
          </div>
          <ul className="space-y-1 mb-3">
            <ChecklistItem ok={unresolvedDataIssues === 0}>
              {unresolvedDataIssues === 0
                ? "Required data available"
                : `${unresolvedDataIssues} data issue${unresolvedDataIssues === 1 ? "" : "s"} unresolved`}
            </ChecklistItem>
            <ChecklistItem ok>Calculations completed</ChecklistItem>
            <ChecklistItem ok>Previous report comparison complete</ChecklistItem>
            <ChecklistItem ok={unresolvedAssumptions === 0}>
              {unresolvedAssumptions === 0
                ? "No unresolved assumptions"
                : `${unresolvedAssumptions} assumption${unresolvedAssumptions === 1 ? "" : "s"} unresolved`}
            </ChecklistItem>
            <ChecklistItem ok={unresolvedSuggestions === 0}>
              {unresolvedSuggestions === 0
                ? "No unresolved AI suggestions"
                : `${unresolvedSuggestions} AI suggestion${unresolvedSuggestions === 1 ? "" : "s"} unresolved`}
            </ChecklistItem>
            <ChecklistItem ok={unresolvedCompliance === 0}>
              {unresolvedCompliance === 0 ? "Compliance review completed" : "Compliance review pending"}
            </ChecklistItem>
          </ul>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => document.getElementById("report-preview")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              {ctaLabel}
            </Button>
            <Button variant="secondary" size="md" onClick={onClose}>Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---- Finny Intelligence sub-block ---- */
function IntelBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">{title}</div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-1.5 leading-relaxed">
            <span className="text-[var(--icon-brand-primary)] mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- AI Flags list card — full detail, type-specific actions ---- */
function FlagCard({
  flag,
  decision,
  onDecide,
}: {
  flag: AIFlag;
  decision: FlagDecision | undefined;
  onDecide: (d: FlagDecision) => void;
}) {
  const actions = flagActions(flag.type);
  return (
    <div className={cn("py-3.5", decision && "opacity-50")}>
      <div className="flex items-start gap-2 mb-1.5">
        <span className="mt-0.5 shrink-0"><FlagIcon type={flag.type} /></span>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            {AI_FLAG_TYPE_LABELS[flag.type]}
          </span>
          <div className="text-sm font-medium text-[var(--text-primary)] leading-snug mt-0.5">{flag.label}</div>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed ml-5 mb-1">{flag.explanation}</p>
      <div className="ml-5 text-xs text-[var(--text-tertiary)] mb-2">
        <span className="font-medium">Source:</span> {flag.source}
      </div>
      <div className="ml-5 flex items-start gap-1.5 mb-2.5">
        <CheckCircle2 size={12} strokeWidth={2} className="text-[var(--text-status-success)] mt-0.5 shrink-0" />
        <span className="text-xs text-[var(--text-secondary)]">{flag.suggestedResolution}</span>
      </div>
      <div className="ml-5 flex items-center gap-2">
        {decision ? (
          <span className="text-xs font-medium text-[var(--text-secondary)]">{FLAG_DECISION_LABELS[decision]}</span>
        ) : (
          actions.map((a) => (
            <Button key={a.label} variant={a.variant} size="sm" onClick={() => onDecide(a.decision)}>
              {a.label}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}

/* ---- Inline Finny card — compact, contextual, shown inside Report
   Preview right next to the content it's about. Same underlying flag +
   decision as FlagCard above, different presentation. ---- */
function InlineFinnyCard({
  flag,
  decision,
  onDecide,
}: {
  flag: AIFlag;
  decision: FlagDecision | undefined;
  onDecide: (d: FlagDecision) => void;
}) {
  const actions = flagActions(flag.type);
  const isSuggestion = flag.type === "suggestion";
  return (
    <div
      className={cn(
        "mt-3 rounded-[var(--radius-lg)] border px-3.5 py-3",
        isSuggestion
          ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-tint)]"
          : "bg-[var(--bg-status-warning-subtle)] border-[var(--border-status-warning-subtle)]",
        decision && "opacity-60"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <FlagIcon type={flag.type} size={12} />
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isSuggestion ? "text-[var(--text-brand-primary)]" : "text-[var(--text-status-warning)]"
          )}
        >
          {AI_FLAG_TYPE_LABELS[flag.type]}
        </span>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-snug mb-1">{flag.label}</p>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-1">{flag.explanation}</p>
      {!isSuggestion && (
        <div className="text-xs text-[var(--text-tertiary)] mb-2">
          <span className="font-medium">Source:</span> {flag.source}
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        {decision ? (
          <span className="text-xs font-medium text-[var(--text-secondary)]">{FLAG_DECISION_LABELS[decision]}</span>
        ) : (
          actions.map((a) => (
            <Button key={a.label} variant={a.variant} size="sm" onClick={() => onDecide(a.decision)}>
              {a.label}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5 text-xs">
      {ok ? (
        <CheckCircle2 size={13} strokeWidth={2} className="text-[var(--text-status-success)] mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={13} strokeWidth={2} className="text-[var(--text-status-warning)] mt-0.5 shrink-0" />
      )}
      <span className={ok ? "text-[var(--text-secondary)]" : "text-[var(--text-status-warning)]"}>{children}</span>
    </li>
  );
}
