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
import { SimulationStudio } from "./SimulationStudio";
import {
  COMPLIANCE_STATUS_LABEL,
  PUBLICATION_STATUS_LABEL,
  TOPIC_LABEL,
  ADVISORY_STAGE_LABEL,
  COMPLIANCE_CHECK_LABEL,
  ALL_CHECK_IDS,
  ENGAGEMENT_STATE_LABEL,
  LIFE_STAGE_LABEL,
  ADVISORY_CONTEXT_LABEL,
  passedCheckCount,
  openIssueCount,
  AUDIT_ACTION_LABEL,
} from "./content-data";
import { COMPLIANCE_BADGE_COLOR, PUBLICATION_BADGE_COLOR, getTypeVisual, typeLabel, itemMeta } from "./content-visual";
import {
  Sparkles,
  Check,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  User2,
  UsersRound,
  ArrowRight,
  X,
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
  onDismissSuggestion: (itemId: string, issueId: string) => void;
  onApproveForUse: (itemId: string) => void;
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
    { id: "compliance", label: "AI Compliance" },
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

/* ─────────── AI Compliance ─────────── */
function ComplianceTab({
  item,
  onAccept,
  onDismiss,
  onApprove,
}: {
  item: ContentItem;
  onAccept: (issueId: string) => void;
  onDismiss: (issueId: string) => void;
  onApprove: () => void;
}) {
  const review = item.compliance;
  const passed = passedCheckCount(review);
  const openIssues = openIssueCount(review);
  const isApproved = review.status === "approved-for-use";
  const notReviewed = review.status === "not-reviewed";
  const readyForDecision = !isApproved && !notReviewed && openIssues === 0;

  return (
    <div className="space-y-5">
      {/* Finny review header */}
      <div className="-mx-4 -mt-4 px-4 py-4 bg-[var(--bg-brand-subtle)]">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <p className="text-xs font-semibold text-[var(--text-brand-primary)]">Finny AI Compliance Review</p>
        </div>
        {notReviewed ? (
          <p className="text-xs text-[var(--text-brand-secondary)]">This content hasn&apos;t been checked yet. Run a review to see findings.</p>
        ) : (
          <>
            <Badge size="sm" color={COMPLIANCE_BADGE_COLOR[review.status]}>{COMPLIANCE_STATUS_LABEL[review.status]}</Badge>
            <p className="text-xs text-[var(--text-brand-secondary)] mt-2">
              {passed} of {ALL_CHECK_IDS.length} checks passed
              {openIssues > 0 && ` · ${openIssues} item${openIssues > 1 ? "s" : ""} need${openIssues > 1 ? "" : "s"} advisor review`}
            </p>
            {review.ref && <p className="text-xs font-mono text-[var(--text-brand-secondary)] mt-1">{review.ref} · {review.checkedAt}</p>}
          </>
        )}
      </div>

      {/* The seven checks */}
      {!notReviewed && (
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Checks</p>
          <div className="space-y-0">
            {ALL_CHECK_IDS.map((id) => {
              const failed = review.failedChecks.includes(id);
              return (
                <div key={id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-tertiary)] last:border-0">
                  {failed ? (
                    <AlertTriangle size={12} strokeWidth={2} className="text-[var(--icon-status-warning)] shrink-0" />
                  ) : (
                    <Check size={12} strokeWidth={2.5} className="text-[var(--icon-status-success)] shrink-0" />
                  )}
                  <span className={cn("text-xs", failed ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]")}>
                    {COMPLIANCE_CHECK_LABEL[id]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issues — original text vs Finny's suggested rewrite */}
      {review.issues.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Findings</p>
          <div className="divide-y divide-[var(--border-tertiary)]">
            {review.issues.map((issue) => {
              const resolved = issue.resolution !== "open";
              return (
                <div
                  key={issue.id}
                  className={cn(
                    "-mx-4 px-4 py-3.5",
                    !resolved && "bg-[var(--bg-status-warning-subtle)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertTriangle size={12} strokeWidth={2} className={cn("shrink-0", resolved ? "text-[var(--icon-tertiary)]" : "text-[var(--icon-status-warning)]")} />
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{issue.title}</p>
                    </div>
                    {resolved && (
                      <Badge size="sm" color={issue.resolution === "accepted" ? "success" : "gray"}>
                        {issue.resolution === "accepted" ? "Accepted" : "Dismissed"}
                      </Badge>
                    )}
                  </div>
                  {issue.location && <p className="text-xs text-[var(--text-tertiary)] mb-2">{issue.location}</p>}

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-0.5">Original</p>
                      <p className="text-xs text-[var(--text-secondary)] italic">&ldquo;{issue.original}&rdquo;</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-brand-primary)] mb-0.5">Finny suggestion</p>
                      <p className="text-xs text-[var(--text-primary)]">&ldquo;{issue.suggestion}&rdquo;</p>
                    </div>
                  </div>

                  {!resolved && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="secondary" size="sm" leadingIcon={<Pencil size={11} strokeWidth={2} />}>Edit Content</Button>
                      <Button variant="primary" size="sm" onClick={() => onAccept(issue.id)}>Accept Suggestion</Button>
                      <Button variant="tertiary" size="sm" onClick={() => onDismiss(issue.id)}>Dismiss</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Advisor decision — the only place approval happens */}
      <div className="pt-5 border-t border-[var(--border-tertiary)]">
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Advisor Review</p>
        {isApproved ? (
          <div className="flex items-start gap-2">
            <ShieldCheck size={15} strokeWidth={2} className="text-[var(--icon-status-success)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Approved for Use</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Approved by {review.approvedBy} · {review.approvedAt}
              </p>
            </div>
          </div>
        ) : readyForDecision ? (
          <>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Ready for your decision — all AI findings have been resolved.</p>
            <Button variant="primary" size="sm" className="w-full" leadingIcon={<ShieldCheck size={13} strokeWidth={2} />} onClick={onApprove}>
              Approve for Use
            </Button>
          </>
        ) : (
          <p className="text-xs text-[var(--text-tertiary)]">
            {notReviewed
              ? "Run an AI compliance review before approving."
              : `Resolve ${openIssues} open finding${openIssues > 1 ? "s" : ""} before approving.`}
          </p>
        )}
      </div>

      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
        AI provides a compliance pre-check. Final approval remains with the advisor.
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
  onDismissSuggestion,
  onApproveForUse,
  onAssign,
  onSaveSimDefaults,
  onPersonalizeSim,
  initialTab,
}: ContentDetailDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>("overview");
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
                <Badge size="sm" color={COMPLIANCE_BADGE_COLOR[item.compliance.status]}>{COMPLIANCE_STATUS_LABEL[item.compliance.status]}</Badge>
                <Badge size="sm" color={PUBLICATION_BADGE_COLOR[item.publication]}>{PUBLICATION_STATUS_LABEL[item.publication]}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button variant="secondary" size="sm" leadingIcon={<Eye size={13} strokeWidth={1.75} />}>Preview</Button>
            <Button variant="secondary" size="sm" leadingIcon={<Pencil size={13} strokeWidth={1.75} />}>Edit</Button>
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
            <ComplianceTab
              item={item}
              onAccept={(issueId) => onAcceptSuggestion(item.id, issueId)}
              onDismiss={(issueId) => onDismissSuggestion(item.id, issueId)}
              onApprove={() => onApproveForUse(item.id)}
            />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTab item={item} clients={clients} suggestions={suggestions} onAssign={(ids) => onAssign(item.id, ids)} />
          )}
          {activeTab === "engagement" && <EngagementTab item={item} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
