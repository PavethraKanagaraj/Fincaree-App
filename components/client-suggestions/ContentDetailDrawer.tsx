"use client";

/* ============================================================
   ContentDetailDrawer
   Opens on row click instead of navigating away. Four tabs map
   to the four questions the advisor has about a piece of
   content: what is it, can I share it, who has it, what did
   they do with it.

   The AI Compliance tab is deliberately not able to approve
   anything — it surfaces findings and suggestions. The
   "Approve for Use" decision sits in its own block, is the
   advisor's alone, and is recorded with their name and date.
   ============================================================ */

import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { Avatar } from "@/components/fincaree/avatar";
import { cn } from "@/lib/utils";
import type { ContentItem, Client, ClientPlan, Topic, EngagementState4, LifeStage, AdvisoryContext, FinnySuggestion, AuditEntry, ClientGoalPlan } from "./content-data";
import {
  CHECKS_BY_TYPE,
  CONTENT_INTENT_LABEL,
  audienceOf,
  blockingOpenCount,
  contentIntent,
  contentStatus,
  contentTypeKey,
  isAiLabelled,
  issueSeverity,
  reviewByLabel,
  type TypeCheck,
} from "./delivery-data";
import { AiTag, AudienceTag, StatusChip } from "./ContentTags";
import { Input } from "@/components/fincaree/input";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { SimulationStudio } from "./SimulationStudio";
import {
  TOPIC_LABEL,
  ADVISORY_STAGE_LABEL,
  COMPLIANCE_CHECK_LABEL,
  ALL_CHECK_IDS,
  ENGAGEMENT_STATE_LABEL,
  LIFE_STAGE_LABEL,
  ADVISORY_CONTEXT_LABEL,
  openIssueCount,
  AUDIT_ACTION_LABEL,
} from "./content-data";
import { getTypeVisual, typeLabel, itemMeta } from "./content-visual";
import {
  Sparkles,
  Check,
  AlertTriangle,
  Minus,
  CircleDashed,
  ShieldCheck,
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  User2,
  UsersRound,
  ArrowRight,
  X,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

export type DrawerTab = "overview" | "simulation" | "compliance" | "assignments" | "engagement";
type AssignMode = "individual" | "group" | "multiple";

interface ContentDetailDrawerProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  suggestions: FinnySuggestion[];
  auditLog: AuditEntry[];
  onAcceptSuggestion: (itemId: string, issueId: string) => void;
  /** Advisory flags only, and always with a reason. */
  onOverrideFlag: (itemId: string, issueId: string, reason: string) => void;
  onApproveForUse: (itemId: string) => void;
  onRunCheck: (itemId: string) => void;
  /** Editing an approved item sends it back to Draft. */
  onRemoveApproval: (itemId: string) => void;
  onAssign: (itemId: string, clientIds: string[]) => void;
  onSaveSimDefaults: (itemId: string, values: Record<string, number>) => void;
  onPersonalizeSim: (itemId: string, plan: ClientGoalPlan) => void;
  /** Open on this tab (e.g. "simulation" from the Sequence Builder's Edit variables). */
  initialTab?: DrawerTab;
}

/* Simulations get a fifth tab — the environment the client toggles.
   Nothing else has one, so it's built per item rather than declared flat. */
function tabsFor(item: ContentItem): { id: DrawerTab; label: string }[] {
  return [
    { id: "overview", label: "Overview" },
    ...(item.category === "simulation" ? ([{ id: "simulation", label: "Simulation" }] as const) : []),
    { id: "compliance", label: "Check" },
    { id: "assignments", label: "Assignments" },
    { id: "engagement", label: "Engagement" },
  ];
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-[var(--border-tertiary)] last:border-0">
      <span className="text-xs text-[var(--text-tertiary)] shrink-0">{label}</span>
      <span className="text-xs font-medium text-[var(--text-primary)] text-right">{value}</span>
    </div>
  );
}

/* ─────────── Overview ─────────── */
function OverviewTab({ item, history }: { item: ContentItem; history: AuditEntry[] }) {
  const meta = itemMeta(item);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Content Information</p>
        <div>
          <Row label="Type" value={typeLabel(item)} />
          <Row label="Topic" value={TOPIC_LABEL[item.topic]} />
          <Row label="Created by" value={item.createdBy} />
          <Row label="Created on" value={item.createdOn} />
          <Row label="Last updated" value={item.updatedAt} />
          {meta && <Row label={item.category === "workshop" ? "Scheduled" : "Duration"} value={meta} />}
          {item.advisoryStage && <Row label="Advisory stage" value={ADVISORY_STAGE_LABEL[item.advisoryStage]} />}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Intended For</p>
        <div className="flex flex-wrap gap-1.5">
          {item.intendedFor.map((a) => (
            <Badge key={a} size="sm" color="gray-blue">{a}</Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Description</p>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <Badge key={t} size="sm" color="gray">{t}</Badge>
          ))}
        </div>
      </div>

      {/* Audit trail for this item — approvals and assignments are recorded here */}
      {history.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">History</p>
          <div>
            {[...history].reverse().map((e) => (
              <div key={e.id} className="flex items-start gap-2 py-2 border-b border-[var(--border-tertiary)] last:border-0">
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 mt-0.5",
                  e.actor === "ai" ? "bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]"
                    : e.actor === "client" ? "bg-[var(--bg-status-info-subtle)] text-[var(--icon-status-info)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                )}>
                  {e.actor}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)]">{AUDIT_ACTION_LABEL[e.action]}</p>
                  {e.detail && <p className="text-xs text-[var(--text-tertiary)]">{e.detail}</p>}
                </div>
                <span className="text-xs text-[var(--text-tertiary)] shrink-0">{e.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Check panel ───────────
   The check runs automatically on save and again before send. It helps the
   advisor review; it never approves. Blocking flags stop Approve, advisory
   flags don't, and an advisory flag can be overridden with a reason (logged).
   ─────────────────────────────────────────────────────────────────────── */
function CheckStateRow({ label, state }: { label: string; state: "pass" | "flag" | "confirm" | "unchecked" | "na" }) {
  const icon =
    state === "pass" ? (
      <Check size={13} strokeWidth={2.5} style={{ color: "var(--check-pass-icon)" }} />
    ) : state === "flag" ? (
      <AlertTriangle size={13} strokeWidth={2} style={{ color: "var(--check-advisory-icon)" }} />
    ) : state === "na" ? (
      <Minus size={13} strokeWidth={2} className="text-[var(--icon-quaternary)]" />
    ) : (
      <CircleDashed size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
    );
  const text = { pass: "Passed", flag: "Flagged", confirm: "You confirm", unchecked: "Not checked", na: "Not applicable" }[state];
  return (
    <li className="flex items-center gap-2 py-2 border-b border-[var(--border-tertiary)] last:border-0">
      <span className="shrink-0">{icon}</span>
      <span className={cn("flex-1 text-xs", state === "na" ? "text-[var(--text-tertiary)]" : state === "flag" ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
        {label}
      </span>
      <span className="text-xs text-[var(--text-tertiary)]">{text}</span>
    </li>
  );
}

function CheckPanel({
  item,
  history,
  onAccept,
  onOverride,
  onApprove,
  onRunCheck,
  onSaveDraft,
}: {
  item: ContentItem;
  history: AuditEntry[];
  onAccept: (issueId: string) => void;
  onOverride: (issueId: string, reason: string) => void;
  onApprove: () => void;
  onRunCheck: () => void;
  onSaveDraft: () => void;
}) {
  const review = item.compliance;
  const status = contentStatus(item);
  const checked = review.status !== "not-reviewed";
  const blocking = blockingOpenCount(item);
  const openAdvisory = review.issues.filter((i) => i.resolution === "open" && issueSeverity(i) === "advisory").length;
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  /* The checklist: this type's checks first, then the rest as not applicable. */
  const typeChecks = CHECKS_BY_TYPE[contentTypeKey(item)];
  const stateOf = (c: TypeCheck): "pass" | "flag" | "confirm" | "unchecked" => {
    if (!c.source) return "confirm";
    if (review.issues.some((i) => i.checkId === c.source && i.resolution === "open")) return "flag";
    return checked ? "pass" : "unchecked";
  };
  const covered = new Set<string>([...typeChecks.map((c) => c.source ?? ""), ...review.issues.map((i) => i.checkId)]);
  const notApplicable = ALL_CHECK_IDS.filter((id) => !covered.has(id));

  /* Audit trail: created, the log entries for this item, and expiry. */
  const trail: { when: string; what: string; detail?: string }[] = [
    { when: item.createdOn, what: "Created", detail: isAiLabelled(item) ? "AI-assisted" : undefined },
    ...history.map((e) => ({ when: e.timestamp, what: AUDIT_ACTION_LABEL[e.action], detail: e.detail })),
    ...(status === "expired" ? [{ when: reviewByLabel(item), what: "Expired", detail: "Past its review-by date" }] : []),
  ];

  const approveHelp = !checked
    ? "Run the check before approving."
    : blocking > 0
      ? `Fix ${blocking} blocking flag${blocking === 1 ? "" : "s"} to approve.`
      : openAdvisory > 0
        ? `${openAdvisory} advisory flag${openAdvisory === 1 ? "" : "s"} still open — you can approve with ${openAdvisory === 1 ? "it" : "them"} open.`
        : "Nothing is blocking approval.";

  return (
    <div className="space-y-5">
      {/* Status + run again */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusChip status={status} />
            <span className="text-xs text-[var(--text-tertiary)]">
              {checked ? `Checked${review.checkedAt ? ` on ${review.checkedAt}` : ""}` : "Not checked yet"}
            </span>
          </div>
          {review.ref && <p className="text-xs font-mono text-[var(--text-tertiary)] mt-1.5">{review.ref}</p>}
          {status === "approved" && (
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Approved by {review.approvedBy} · {review.approvedAt} · until {reviewByLabel(item)}
            </p>
          )}
          {status === "expired" && (
            <p className="text-xs mt-1.5" style={{ color: "var(--content-status-expired-text)" }}>
              Expired on {reviewByLabel(item)}. Run the check and approve again to renew it.
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" leadingIcon={<RefreshCw size={13} strokeWidth={1.75} />} onClick={onRunCheck}>
          Run check again
        </Button>
      </div>

      {/* Checklist */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Checks for this type</p>
        <ul>
          {typeChecks.map((c) => (
            <CheckStateRow key={c.id} label={c.label} state={stateOf(c)} />
          ))}
          {notApplicable.map((id) => (
            <CheckStateRow key={id} label={COMPLIANCE_CHECK_LABEL[id]} state="na" />
          ))}
        </ul>
        <p className="text-xs text-[var(--text-tertiary)] mt-1.5">Placeholder rules by type — confirm them with a compliance professional before relying on them.</p>
      </div>

      {/* Flags */}
      {review.issues.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Flags</p>
          <ul className="divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)]">
            {review.issues.map((issue) => {
              const open = issue.resolution === "open";
              const sev = issueSeverity(issue);
              return (
                <li key={issue.id} className="py-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{issue.title}</p>
                    {open ? (
                      <Badge size="sm" color={sev === "blocking" ? "error" : "warning"}>
                        {sev === "blocking" ? "Blocking" : "Advisory"}
                      </Badge>
                    ) : (
                      <Badge size="sm" color={issue.resolution === "overridden" ? "gray" : "success"}>
                        {issue.resolution === "overridden" ? "Overridden" : "Fixed"}
                      </Badge>
                    )}
                  </div>
                  {issue.location && <p className="text-xs text-[var(--text-tertiary)] mb-1.5">{issue.location}</p>}
                  <p
                    className="text-xs text-[var(--text-primary)] rounded-[var(--radius-sm)] px-2 py-1.5 mb-2"
                    style={{ background: open ? (sev === "blocking" ? "var(--check-blocking-bg)" : "var(--check-advisory-bg)") : "var(--bg-secondary)" }}
                  >
                    &ldquo;{issue.original}&rdquo;
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Suggested fix: </span>
                    &ldquo;{issue.suggestion}&rdquo;
                  </p>
                  {issue.resolution === "overridden" && issue.overrideReason && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1.5">Reason: {issue.overrideReason}</p>
                  )}

                  {open && overrideId !== issue.id && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="primary" size="sm" onClick={() => onAccept(issue.id)}>
                        Accept fix
                      </Button>
                      {sev === "advisory" ? (
                        <Button variant="secondary" size="sm" onClick={() => { setOverrideId(issue.id); setReason(""); }}>
                          Override flag
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">Blocking flags can&apos;t be overridden — fix it to approve.</span>
                      )}
                    </div>
                  )}
                  {open && overrideId === issue.id && (
                    <div className="mt-3 space-y-2">
                      <Input
                        size="sm"
                        label="Reason for overriding (required)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why this flag doesn't apply"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={reason.trim().length === 0}
                          onClick={() => { onOverride(issue.id, reason.trim()); setOverrideId(null); }}
                        >
                          Override flag
                        </Button>
                        <Button variant="tertiary" size="sm" onClick={() => setOverrideId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Advisor actions */}
      <div className="pt-4 border-t border-[var(--border-tertiary)]">
        <p className="text-xs text-[var(--text-secondary)] mb-3">{approveHelp}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<ShieldCheck size={13} strokeWidth={2} />}
            disabled={!checked || blocking > 0 || status === "approved"}
            onClick={onApprove}
          >
            {status === "expired" ? "Approve again" : status === "approved" ? "Approved" : "Approve"}
          </Button>
          <Button variant="secondary" size="sm" onClick={onSaveDraft}>
            Save as draft
          </Button>
        </div>
      </div>

      {/* Audit trail */}
      <details className="group border-t border-[var(--border-tertiary)] pt-3">
        <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-semibold text-[var(--text-secondary)]">
          Audit trail
          <ChevronDown size={14} strokeWidth={2} className="text-[var(--icon-tertiary)] transition-transform group-open:rotate-180" />
        </summary>
        <ol className="mt-2 space-y-2">
          {trail.map((e, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{e.what}</p>
                {e.detail && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{e.detail}</p>}
              </div>
              <span className="text-xs text-[var(--text-tertiary)] shrink-0 whitespace-nowrap">{e.when}</span>
            </li>
          ))}
        </ol>
      </details>

      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
        Checks help you review. You remain responsible for what you publish.
      </p>
    </div>
  );
}

/* ─────────── Assignments ─────────── */
function AssignmentsTab({
  item,
  clients,
  suggestions,
  onAssign,
}: {
  item: ContentItem;
  clients: Client[];
  suggestions: FinnySuggestion[];
  onAssign: (clientIds: string[]) => void;
}) {
  const [mode, setMode] = useState<AssignMode>("individual");
  const [picked, setPicked] = useState<string[]>([]);
  const [reviewingList, setReviewingList] = useState(false);

  /* Group facets */
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [goals, setGoals] = useState<Topic[]>([]);
  const [engagements, setEngagements] = useState<EngagementState4[]>([]);
  const [lifeStages, setLifeStages] = useState<LifeStage[]>([]);
  const [contexts, setContexts] = useState<AdvisoryContext[]>([]);

  function toggle<T>(list: T[], setList: (v: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const matched = useMemo(() => {
    if (mode === "group") {
      return clients.filter((c) => {
        if (plans.length && !plans.includes(c.plan)) return false;
        if (goals.length && !c.goals.some((g) => goals.includes(g))) return false;
        if (engagements.length && !engagements.includes(c.engagement)) return false;
        if (lifeStages.length && !lifeStages.includes(c.lifeStage)) return false;
        if (contexts.length && !c.advisoryContext.some((x) => contexts.includes(x))) return false;
        return true;
      });
    }
    return clients.filter((c) => picked.includes(c.id));
  }, [mode, clients, plans, goals, engagements, lifeStages, contexts, picked]);

  const canAssign = item.compliance.status === "approved-for-use" && matched.length > 0;
  const itemSuggestions = suggestions.filter((s) => s.contentId === item.id);

  const Facet = <T extends string>({ label, options, labels, selected, onToggle }: { label: string; options: T[]; labels: Record<T, string>; selected: T[]; onToggle: (v: T) => void }) => (
    <div>
      <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cn(
              "px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-medium border transition-colors",
              selected.includes(o)
                ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-primary)] text-[var(--text-brand-primary)]"
                : "bg-[var(--bg-primary)] border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            )}
          >
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Finny suggestion — who might benefit, and why */}
      {itemSuggestions.map((s) => (
        <div key={s.id} className="-mx-4 px-4 py-4 bg-[var(--bg-brand-subtle)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
            <p className="text-xs font-semibold text-[var(--text-brand-primary)]">Finny Suggestion</p>
          </div>
          <p className="text-sm text-[var(--text-primary)] mb-2">
            This {item.category === "simulation" ? "simulation" : "content"} may be relevant for {s.clientName.split(" ")[0]}.
          </p>
          <p className="text-xs font-semibold text-[var(--text-brand-secondary)] mb-1">Why?</p>
          <ul className="space-y-0.5 mb-3">
            {s.reasons.map((r) => (
              <li key={r} className="text-xs text-[var(--text-brand-secondary)]">· {r}</li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => onAssign([s.clientId])} disabled={item.compliance.status !== "approved-for-use"}>
              Assign
            </Button>
            <Button variant="tertiary" size="sm">Dismiss</Button>
          </div>
        </div>
      ))}

      {/* Assign */}
      <div>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2.5">Assign to Clients</p>
        <div className="space-y-2 mb-4">
          {([
            { id: "individual", label: "Individual client", icon: <User2 size={13} strokeWidth={1.75} /> },
            { id: "multiple", label: "Multiple clients", icon: <Users size={13} strokeWidth={1.75} /> },
            { id: "group", label: "Client group", icon: <UsersRound size={13} strokeWidth={1.75} /> },
          ] as { id: AssignMode; label: string; icon: React.ReactNode }[]).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { setMode(o.id); setPicked([]); setReviewingList(false); }}
              className="flex items-center gap-3 w-full text-left"
            >
              <span className={cn(
                "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                mode === o.id ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-primary)]" : "border-[var(--border-secondary)]"
              )}>
                {mode === o.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <span className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                <span className="text-[var(--icon-tertiary)]">{o.icon}</span>
                {o.label}
              </span>
            </button>
          ))}
        </div>

        {mode === "group" ? (
          <div className="space-y-3">
            <Facet label="Plan" options={["Silver", "Gold", "Platinum"] as ClientPlan[]} labels={{ Silver: "Silver", Gold: "Gold", Platinum: "Platinum" }} selected={plans} onToggle={(v) => toggle(plans, setPlans, v)} />
            <Facet
              label="Goal"
              options={["retirement", "emergency-fund", "home-purchase", "child-education", "tax-planning", "insurance"] as Topic[]}
              labels={TOPIC_LABEL}
              selected={goals}
              onToggle={(v) => toggle(goals, setGoals, v)}
            />
            <Facet label="Engagement" options={Object.keys(ENGAGEMENT_STATE_LABEL) as EngagementState4[]} labels={ENGAGEMENT_STATE_LABEL} selected={engagements} onToggle={(v) => toggle(engagements, setEngagements, v)} />
            <Facet label="Life Stage" options={Object.keys(LIFE_STAGE_LABEL) as LifeStage[]} labels={LIFE_STAGE_LABEL} selected={lifeStages} onToggle={(v) => toggle(lifeStages, setLifeStages, v)} />
            <Facet label="Advisory Context" options={Object.keys(ADVISORY_CONTEXT_LABEL) as AdvisoryContext[]} labels={ADVISORY_CONTEXT_LABEL} selected={contexts} onToggle={(v) => toggle(contexts, setContexts, v)} />
          </div>
        ) : (
          <div className="-mx-4 divide-y divide-[var(--border-tertiary)] max-h-64 overflow-y-auto">
            {clients.map((c) => {
              const isPicked = picked.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPicked(mode === "individual" ? (isPicked ? [] : [c.id]) : isPicked ? picked.filter((p) => p !== c.id) : [...picked, c.id])}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5 text-left transition-colors",
                    isPicked ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  <Avatar size="xs" initials={c.initials} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs font-medium truncate", isPicked ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{c.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{LIFE_STAGE_LABEL[c.lifeStage]} · {ENGAGEMENT_STATE_LABEL[c.engagement]}</p>
                  </div>
                  <Badge size="sm" color={c.plan === "Platinum" ? "brand" : c.plan === "Gold" ? "warning" : "gray"}>{c.plan}</Badge>
                </button>
              );
            })}
          </div>
        )}

        {/* Match count + actions */}
        <div className="mt-4 pt-3 border-t border-[var(--border-tertiary)]">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2.5">
            {matched.length} client{matched.length === 1 ? "" : "s"} match
          </p>

          {reviewingList && matched.length > 0 && (
            <div className="mb-3 space-y-1 max-h-40 overflow-y-auto border-y border-[var(--border-tertiary)] py-2">
              {matched.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Avatar size="xs" initials={c.initials} />
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">{ENGAGEMENT_STATE_LABEL[c.engagement]}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="flex-1" disabled={matched.length === 0} onClick={() => setReviewingList((v) => !v)}>
              {reviewingList ? "Hide Clients" : "Review Clients"}
            </Button>
            <Button variant="primary" size="sm" className="flex-1" disabled={!canAssign} onClick={() => onAssign(matched.map((c) => c.id))}>
              Assign
            </Button>
          </div>

          {item.compliance.status !== "approved-for-use" && (
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              This content must be approved for use before it can be assigned.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Engagement ─────────── */
function EngagementTab({ item }: { item: ContentItem }) {
  const { engagement } = item;

  if (engagement.assignedCount === 0) {
    return (
      <div className="py-10 text-center">
        <Users size={22} strokeWidth={1.5} className="text-[var(--icon-tertiary)] mx-auto mb-2" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">Not assigned yet</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Engagement appears once this content reaches a client.</p>
      </div>
    );
  }

  const total = engagement.states.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Assigned</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{engagement.assignedCount} clients</p>
        </div>
        {engagement.completionRate !== null && (
          <div className="text-right">
            <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Completion</p>
            <p className="text-lg font-bold text-[var(--text-status-success)]">{engagement.completionRate}%</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Breakdown</p>
        <div className="space-y-2.5">
          {engagement.states.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
                <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{s.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--bg-brand-primary)]" style={{ width: `${(s.count / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {engagement.clients.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Clients</p>
          <div>
            {engagement.clients.map((c) => (
              <div key={c.clientId} className="flex items-center gap-2.5 py-2 border-b border-[var(--border-tertiary)] last:border-0">
                <Avatar size="xs" initials={c.initials} />
                <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{c.clientName}</span>
                <Badge size="sm" color={c.state === "Completed" || c.state === "Attended" ? "success" : c.state === "Missed" ? "error" : c.state === "Not Started" ? "gray" : "gray-blue"}>
                  {c.state}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Drawer shell ─────────── */
export function ContentDetailDrawer({
  item,
  open,
  onOpenChange,
  clients,
  suggestions,
  auditLog,
  onAcceptSuggestion,
  onOverrideFlag,
  onApproveForUse,
  onRunCheck,
  onRemoveApproval,
  onAssign,
  onSaveSimDefaults,
  onPersonalizeSim,
  initialTab,
}: ContentDetailDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>("overview");
  const [confirmEdit, setConfirmEdit] = useState(false);
  /* Each time the drawer opens (or switches item) with an initialTab, start
     there. Adjusted during render rather than in an effect. */
  const openKey = open && initialTab ? `${item?.id}|${initialTab}` : null;
  const [seenOpenKey, setSeenOpenKey] = useState<string | null>(null);
  if (openKey !== seenOpenKey) {
    setSeenOpenKey(openKey);
    if (openKey && initialTab) setTab(initialTab);
  }
  if (!item) return null;

  const cfg = getTypeVisual(item);
  const openIssues = openIssueCount(item.compliance);
  const tabs = tabsFor(item);
  /* Selecting a non-simulation row while the Simulation tab is open
     would otherwise leave the body empty. */
  const activeTab: DrawerTab = tabs.some((t) => t.id === tab) ? tab : "overview";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:w-[520px]">
        {/* Header */}
        <SheetHeader className="border-b border-[var(--border-tertiary)] pb-4">
          <div className="flex items-start gap-3 pr-8">
            <div className={cn("w-11 h-11 rounded-[var(--radius-lg)] shrink-0 flex items-center justify-center", cfg.bgColor, cfg.iconColor)}>
              {cfg.icon}
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate text-base">{item.title}</SheetTitle>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {typeLabel(item)} · {TOPIC_LABEL[item.topic]}
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <StatusChip status={contentStatus(item)} />
                <AudienceTag audience={audienceOf(item)} />
                <span className="text-xs text-[var(--text-tertiary)]">{CONTENT_INTENT_LABEL[contentIntent(item)]}</span>
                {isAiLabelled(item) && <AiTag />}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button variant="secondary" size="sm" leadingIcon={<Eye size={13} strokeWidth={1.75} />}>Preview</Button>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Pencil size={13} strokeWidth={1.75} />}
              onClick={() => {
                /* Editing approved content removes the approval, so ask first. */
                const s = contentStatus(item);
                if (s === "approved" || s === "expired") setConfirmEdit(true);
              }}
            >
              Edit
            </Button>
            <Button variant="tertiary" size="sm" iconOnly leadingIcon={<MoreHorizontal size={15} strokeWidth={2} />} aria-label="More actions" />
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-[var(--border-tertiary)] px-4">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
                  active ? "border-[var(--border-brand-primary)] text-[var(--text-brand-primary)]" : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                {t.label}
                {t.id === "compliance" && openIssues > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--bg-status-warning-subtle)] text-xs font-bold text-[var(--icon-status-warning)]">
                    {openIssues}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && <OverviewTab item={item} history={auditLog.filter((e) => e.itemName === item.title)} />}
          {activeTab === "simulation" && item.category === "simulation" && (
            <SimulationStudio key={item.id} item={item} onSaveDefaults={onSaveSimDefaults} onPersonalize={onPersonalizeSim} />
          )}
          {activeTab === "compliance" && (
            <CheckPanel
              item={item}
              history={auditLog.filter((e) => e.itemName === item.title)}
              onAccept={(issueId) => onAcceptSuggestion(item.id, issueId)}
              onOverride={(issueId, reason) => onOverrideFlag(item.id, issueId, reason)}
              onApprove={() => onApproveForUse(item.id)}
              onRunCheck={() => onRunCheck(item.id)}
              onSaveDraft={() => onOpenChange(false)}
            />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTab item={item} clients={clients} suggestions={suggestions} onAssign={(ids) => onAssign(item.id, ids)} />
          )}
          {activeTab === "engagement" && <EngagementTab item={item} />}
        </div>
      </SheetContent>

      <Modal open={confirmEdit} onOpenChange={setConfirmEdit}>
        <ModalContent className="max-w-[400px]">
          <div className="px-5 pt-5 pb-4 pr-14">
            <ModalTitle>Edit this content?</ModalTitle>
            <ModalDescription className="mt-0.5">Editing will remove approval. Continue?</ModalDescription>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button variant="tertiary" size="sm" onClick={() => setConfirmEdit(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onRemoveApproval(item.id);
                setConfirmEdit(false);
              }}
            >
              Continue
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </Sheet>
  );
}
