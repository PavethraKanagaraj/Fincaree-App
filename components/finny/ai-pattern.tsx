"use client";

/* ============================================================
   Finny — the AI interaction layer

   Finny is an advisor-controlled agent, not a chatbot. The same
   chain runs on every surface:

     Observe → Understand → Recommend → Prepare → Advisor
     reviews → Act

   Finny may observe, synthesise, explain, recommend and prepare
   (drafts, summaries, scenarios). It may not send, assign,
   approve, change a plan, or certify anything. These primitives
   enforce that in the API rather than trusting each surface to
   remember it:

     · a recommendation requires the list of what Finny
       considered — advice the advisor cannot interrogate is an
       instruction, which Finny must never issue
     · every action block carries the review notice
     · prepared work starts as an AI Draft and only the advisor
       can move it to Advisor Reviewed → Ready to Send. There is
       no state in which Finny moves it forward for them.

   Two vocabularies, deliberately separate:
     AI_STAGE_LABEL   — Finny's voice, for section headings
     AI_STATUS_LABEL  — product-wide status badges, identical on
                        Leads, Clients, Meetings, Reports,
                        Content, Simulations, Opportunities
   ============================================================ */

import { forwardRef, useState } from "react";
import { Sparkles, ShieldCheck, HelpCircle, Check, CheckCheck, Pencil } from "lucide-react";
import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { Avatar } from "@/components/fincaree/avatar";
import { Textarea } from "@/components/fincaree/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ---- Voice: section headings ---- */
export type AIStage =
  | "insight"
  | "recommendation"
  | "explanation"
  | "action"
  | "draft"
  | "review"
  | "approval";

export const AI_STAGE_LABEL: Record<AIStage, string> = {
  insight: "Finny is seeing",
  recommendation: "Finny recommends",
  explanation: "Why this?",
  action: "Your move",
  draft: "Finny prepared",
  review: "Needs your review",
  approval: "Approved by you",
};

/* ---- Status: badges ---- */
export type AIWorkStatus = "insight" | "recommendation" | "draft" | "review-required" | "reviewed" | "ready";

export const AI_STATUS_LABEL: Record<AIWorkStatus, string> = {
  insight: "AI Insight",
  recommendation: "AI Recommendation",
  draft: "AI Draft",
  "review-required": "Advisor Review Required",
  reviewed: "Advisor Reviewed",
  ready: "Ready to Send",
};

const STATUS_COLOR: Record<AIWorkStatus, "gray-blue" | "brand" | "warning" | "success"> = {
  insight: "gray-blue",
  recommendation: "brand",
  draft: "brand",
  "review-required": "warning",
  reviewed: "success",
  ready: "success",
};

/** Signal strength, not alarm level — drives the dot only. */
export type AISeverity = "high" | "medium" | "low";

const SEVERITY_DOT: Record<AISeverity, string> = {
  high: "bg-[var(--color-error-500)]",
  medium: "bg-[var(--color-warning-500)]",
  low: "bg-[var(--color-success-600)]",
};

export interface AIInsight {
  id: string;
  severity: AISeverity;
  /** The finding. Carries the weight. */
  primary: string;
  /** The evidence behind it. Quieter, always present. */
  supporting: string;
}

/* ─────────── AIHeader ─────────── */

export function AIHeader({
  context,
  trailing,
  className,
}: {
  /** Which surface Finny is speaking about, e.g. "Conversation Insights". */
  context: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-[var(--bg-brand-primary)] flex items-center justify-center shrink-0">
          <Sparkles size={13} strokeWidth={2} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-[var(--text-brand-primary)] leading-none">Finny AI</p>
          <p className="text-xs text-[var(--text-tertiary)] leading-none mt-0.5 truncate">{context}</p>
        </div>
      </div>
      {trailing}
    </div>
  );
}

/* ─────────── AdvisorReviewStatus ───────────
   The one badge for where a piece of AI-prepared work stands. */

export function AdvisorReviewStatus({ status, className }: { status: AIWorkStatus; className?: string }) {
  const icon =
    status === "reviewed" ? (
      <Check size={10} strokeWidth={2.5} />
    ) : status === "ready" ? (
      <CheckCheck size={10} strokeWidth={2.5} />
    ) : status === "draft" || status === "recommendation" || status === "insight" ? (
      <Sparkles size={10} strokeWidth={2} />
    ) : undefined;
  return (
    <Badge size="sm" color={STATUS_COLOR[status]} leadingIcon={icon} className={className}>
      {AI_STATUS_LABEL[status]}
    </Badge>
  );
}

/** "5 drafts · 2 reviewed" — the running count that keeps review honest. */
export function ReviewProgress({ total, reviewed, noun = "draft" }: { total: number; reviewed: number; noun?: string }) {
  const done = reviewed === total && total > 0;
  return (
    <p className="text-xs tabular-nums text-[var(--text-tertiary)]" aria-live="polite">
      {total} {noun}
      {total === 1 ? "" : "s"} ·{" "}
      <span className={cn("font-semibold", done ? "text-[var(--text-status-success)]" : "text-[var(--text-primary)]")}>
        {reviewed} reviewed
      </span>
    </p>
  );
}

/* ─────────── FinnyInsight + InsightList ─────────── */

export function InsightSummary({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[var(--text-tertiary)] font-medium">{children}</p>;
}

export function FinnyInsight({
  insight,
  onSelect,
  className,
}: {
  insight: AIInsight;
  /** Makes the row a drill-in to the full evidence. */
  onSelect?: (insight: AIInsight) => void;
  /** Row geometry is the caller's: inset in a card, edge-to-edge in a ledger. */
  className?: string;
}) {
  const body = (
    <>
      <span className={cn("w-1.5 h-1.5 rounded-full mt-[5px] shrink-0", SEVERITY_DOT[insight.severity])} />
      <span className="min-w-0">
        <span
          className={cn(
            "block text-xs font-medium text-[var(--text-primary)] leading-snug",
            onSelect && "group-hover:text-[var(--text-brand-primary)] transition-colors"
          )}
        >
          {insight.primary}
        </span>
        <span className="block text-xs text-[var(--text-tertiary)] leading-snug mt-0.5">{insight.supporting}</span>
      </span>
    </>
  );
  return onSelect ? (
    <button
      type="button"
      onClick={() => onSelect(insight)}
      className={cn("group flex items-start gap-2.5 w-full text-left py-2", className)}
    >
      {body}
    </button>
  ) : (
    <div className={cn("flex items-start gap-2.5 py-2", className)}>{body}</div>
  );
}

/** Rows are separated by hairlines the caller colours — the list itself
    draws no box, so it can sit on any surface without nesting. */
export function InsightList({
  insights,
  onSelect,
  className,
  rowClassName,
}: {
  insights: AIInsight[];
  onSelect?: (insight: AIInsight) => void;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <ul className={cn("flex flex-col divide-y divide-[var(--border-tertiary)]", className)}>
      {insights.map((item) => (
        <li key={item.id}>
          <FinnyInsight insight={item} onSelect={onSelect} className={rowClassName} />
        </li>
      ))}
    </ul>
  );
}

/* ─────────── FinnyReasoning — "Why this?" ───────────
   A popover, never a permanent expansion: the working is on demand
   so the surface stays light. "Considered", not "knows" — this is a
   list of inputs, not a claim of certainty. */

export function FinnyReasoning({
  considered,
  side = "top",
}: {
  considered: string[];
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={120}
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline shrink-0"
          >
            <HelpCircle size={10} strokeWidth={2} />
            {AI_STAGE_LABEL.explanation}
          </button>
        }
      />
      <PopoverContent side={side} align="end">
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">Finny considered:</p>
        <ul className="space-y-1">
          {considered.map((c) => (
            <li key={c} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-snug">
              <span className="w-1 h-1 rounded-full bg-[var(--icon-quaternary)] mt-[6px] shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ─────────── AIReviewNotice ───────────
   Required wherever Finny proposes an action. */

export function AIReviewNotice({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-1 text-xs text-[var(--text-tertiary)]", className)}>
      <ShieldCheck size={10} strokeWidth={1.75} className="shrink-0" />
      AI suggestions require advisor review
    </p>
  );
}

/* ─────────── FinnyAction — the advisor-controlled action row ───────────
   Actions are rendered in the order given. What they say is the caller's
   job, but the notice is not optional: this is where "the advisor
   decides" is stated. Labels should prepare or open, never send. */

export interface FinnyActionItem {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
}

export function FinnyAction({
  actions,
  fill = false,
  className,
}: {
  actions: FinnyActionItem[];
  /** Equal-width buttons, centred notice — for modal and drawer footers. */
  fill?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={cn("flex items-center gap-1.5", fill && "gap-2")}>
        {actions.map((a) => (
          <Button
            key={a.label}
            variant={a.variant ?? "secondary"}
            size="sm"
            disabled={a.disabled}
            onClick={a.onClick}
            className={cn(fill && "flex-1")}
          >
            {a.label}
          </Button>
        ))}
      </div>
      <AIReviewNotice className={cn("mt-2", fill && "justify-center mt-2.5")} />
    </div>
  );
}

/* ─────────── FinnyRecommendation ───────────
   `considered` is required. See header. */

export function FinnyRecommendation({
  recommendation,
  considered,
  actions,
  className,
}: {
  recommendation: string;
  considered: string[];
  actions: FinnyActionItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles size={11} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />
          <p className="text-[11px] font-bold text-[var(--text-brand-primary)] uppercase tracking-wider truncate">
            {AI_STAGE_LABEL.recommendation}
          </p>
        </div>
        <FinnyReasoning considered={considered} />
      </div>

      <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{recommendation}</p>

      <FinnyAction actions={actions} className="mt-3" />
    </div>
  );
}

/* ─────────── AIProvenance ───────────
   What the prepared work was built from. Quiet by design: the advisor
   should be able to find it, not be made to read it. Says nothing
   about approval — "review before sending" is an instruction to the
   advisor, not a claim about the content. */

export function AIProvenance({
  intro,
  sources,
  note,
  className,
}: {
  intro: string;
  sources: string[];
  note: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-[var(--bg-secondary)] px-4 py-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <Sparkles size={11} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />
          {intro}
        </p>
        <span className="shrink-0 text-xs font-semibold text-[var(--text-status-warning)] whitespace-nowrap">{note}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-relaxed">{sources.join(" · ")}</p>
    </div>
  );
}

/* ─────────── AIPreparedDraft ───────────
   A piece of work Finny prepared for the advisor to check. Generic on
   purpose: a follow-up message today, a report section, a meeting
   brief or a simulation's assumptions tomorrow.

   An entry in a ledger, not a card: the avatar is the left rail, the
   message is plain text under a hairline rule, and the caller
   separates entries with dividers. Nothing here draws a box, so a
   list of these never nests.

   The advisor can edit it and mark it reviewed. Editing a reviewed
   draft sends it back to unreviewed — what they signed off on is no
   longer what is on screen. */

export interface AIPreparedDraftProps {
  recipient: string;
  initials: string;
  /** e.g. the lead's stage. */
  context: string;
  message: string;
  onMessageChange: (next: string) => void;
  reviewed: boolean;
  onToggleReviewed: () => void;
  /** Whether the advisor has changed Finny's original wording. */
  edited: boolean;
  secondaryAction?: { label: string; onClick: () => void };
  /** Briefly true when "Review all drafts" has walked the advisor here. */
  highlighted?: boolean;
}

export const AIPreparedDraft = forwardRef<HTMLDivElement, AIPreparedDraftProps>(function AIPreparedDraft(
  { recipient, initials, context, message, onMessageChange, reviewed, onToggleReviewed, edited, secondaryAction, highlighted },
  ref
) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message);

  function startEdit() {
    setText(message);
    setEditing(true);
  }
  function save() {
    const next = text.trim();
    if (next && next !== message) onMessageChange(next);
    setEditing(false);
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={cn("px-4 py-4 outline-none transition-colors", highlighted && "bg-[var(--bg-brand-subtle)]")}
    >
      <div className="flex gap-2.5">
        <Avatar size="xs" initials={initials} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{recipient}</p>
              <p className="text-xs text-[var(--text-tertiary)] truncate">{context}</p>
            </div>
            <AdvisorReviewStatus status={reviewed ? "reviewed" : "draft"} className="shrink-0" />
          </div>

          <p className="mt-3 text-xs text-[var(--text-tertiary)]">
            Suggested message{edited && " · edited by you"}
          </p>
          {editing ? (
            <Textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label={`Message to ${recipient}`}
              className="mt-1.5"
            />
          ) : (
            <p className="mt-1.5 border-l border-[var(--border-secondary)] pl-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              {message}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {editing ? (
                <>
                  <Button variant="primary" size="sm" onClick={save} disabled={!text.trim()}>
                    Save
                  </Button>
                  <Button variant="tertiary" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="sm" leadingIcon={<Pencil size={12} strokeWidth={1.75} />} onClick={startEdit}>
                    Edit
                  </Button>
                  {secondaryAction && (
                    <Button variant="tertiary" size="sm" onClick={secondaryAction.onClick}>
                      {secondaryAction.label}
                    </Button>
                  )}
                </>
              )}
            </div>
            {!editing && (
              <Button
                variant={reviewed ? "tertiary" : "secondary"}
                size="sm"
                leadingIcon={reviewed ? <Check size={12} strokeWidth={2.5} /> : undefined}
                onClick={onToggleReviewed}
                aria-pressed={reviewed}
              >
                {reviewed ? "Reviewed" : "Mark reviewed"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
