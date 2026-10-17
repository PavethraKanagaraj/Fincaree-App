"use client";

/* ============================================================
   Content Management — /content-management

   Organised around what the advisor needs on open, not around
   what the system can filter:
     1. What do I have?            → type tabs
     2. What needs my attention?   → Needs Review quick view
     3. What have I shared?        → Assigned quick view
     4. Is it actually helping?    → engagement columns

   Type and status are deliberately separate: tabs are type
   only, status is a filter. Work states (needs review, drafts,
   assigned) are quick views on the KPI row rather than tabs,
   so the advisor never has to remember which is which.

   Reports are absent by design — they live in AI Report Queue.
   ============================================================ */

import { useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/fincaree/button";
import { ListItem } from "@/components/fincaree/list-item";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem, SelectGroup, SelectGroupLabel } from "@/components/fincaree/select";
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from "@/components/fincaree/tabs";
import { ContentTable, followUpCount, type LibraryTab } from "@/components/client-suggestions/ContentTable";
import { ContentDetailDrawer, type DrawerTab } from "@/components/client-suggestions/ContentDetailDrawer";
import { SequenceBuilder, type SequenceSendPayload } from "@/components/client-suggestions/SequenceBuilder";
import { AssignContentDrawer } from "@/components/client-suggestions/AssignContentDrawer";
import { ReviewQueue, type ResolvedSend } from "@/components/client-suggestions/ReviewQueue";
import { SendLog } from "@/components/client-suggestions/DeliveryPanels";
import { MarketingZone } from "@/components/client-suggestions/MarketingZone";
import {
  REVIEW_QUEUE,
  SEND_TRIGGER_LABEL,
  CONTENT_AUDIENCE_HINT,
  CONTENT_AUDIENCE_LABEL,
  CONTENT_INTENT_LABEL,
  CONTENT_TYPE_GROUPS,
  CONTENT_TYPE_LABEL,
  assuredReturnLanguage,
  blockingOpenCount,
  contentStatus,
  contentTypeKey,
  isSendableToClients,
  issueSeverity,
  needsCheckCount,
  seedContentItems,
  typeDisabledReason,
  type ContentAudience,
  type ContentIntent,
  type ContentTypeKey,
  type MeetingRef,
  type ReviewQueueItem,
} from "@/components/client-suggestions/delivery-data";
import { getFormatVisual } from "@/components/client-suggestions/content-visual";
import {
  CONTENT_ITEMS,
  CLIENTS,
  FINNY_SUGGESTIONS,
  AUDIT_LOG,
  TOPIC_LABEL,
  CREATED_VIA_LABEL,
  AUDIENCE_LABEL,
  DELIVERY_CHANNEL_LABEL,
  ENGAGEMENT_BAND_LABEL,
  ADVISORY_STAGE_LABEL,
  engagementBand,
  defaultVariables,
  draftPersonalizedModel,
  type ContentItem,
  type Topic,
  type ComplianceStatus,
  type CreatedVia,
  type Audience,
  type EngagementBand,
  type AdvisoryStage,
  type AuditEntry,
  type ClientGoalPlan,
  type DeliveryChannel,
} from "@/components/client-suggestions/content-data";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Switch } from "@/components/fincaree/switch";
import { cn } from "@/lib/utils";
import { Plus, Search, FlaskConical, Presentation, SlidersHorizontal, Route, Maximize2, Send, Library, Inbox, Megaphone, ScrollText } from "lucide-react";

const TODAY = "18 Sep 2026";

/* ─── Views — sending comes first ───
   Most visits are to send something to a client, so the page opens on the
   Sequence Builder. Managing the library (review, drafts, engagement) is
   periodic work and lives in its own view, with a count of what needs
   review so that time-sensitive compliance work is never out of sight. */
type PageView = "queue" | "send" | "library" | "marketing" | "log";

/* ─── Type tabs (Library view) — "what kind of content am I looking for?" ─── */
type TypeTab = "all" | "learning" | "simulations" | "workshops";

const TYPE_TABS: { id: TypeTab; label: string }[] = [
  { id: "all", label: "All Content" },
  { id: "learning", label: "Learning" },
  { id: "simulations", label: "Simulations" },
  { id: "workshops", label: "Workshops" },
];

/* ─── Status tabs — "can I send this?" ───
   Four statuses only: Draft, Needs fixes, Approved, Expired. The tabs group
   them by what the advisor does next, and combine with the type filter. */
const STATUS_TABS: { id: LibraryTab; label: string }[] = [
  { id: "ready", label: "Ready to send" },
  { id: "needs-check", label: "Needs check" },
  { id: "expired", label: "Expired" },
  { id: "all", label: "All" },
];

/* ─── Type filter — reads the same canonical list as the Create modal ─── */
type TypeFilter = "all" | ContentTypeKey;

const TYPE_FILTER_LABEL: Record<TypeFilter, string> = { all: "All types", ...CONTENT_TYPE_LABEL };

/* ─── Assignment filter (§8) ─── */
type AssignmentFilter = "all" | "not-assigned" | "assigned" | "partially-assigned";

const ASSIGNMENT_LABEL: Record<AssignmentFilter, string> = {
  all: "All assignment",
  "not-assigned": "Not Assigned",
  assigned: "Assigned",
  "partially-assigned": "Partially Assigned",
};

const CREATED_WINDOW_LABEL = { all: "Any time", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 3 months" };
type CreatedWindow = keyof typeof CREATED_WINDOW_LABEL;

const SORT_LABELS = { latest: "Latest", "most-assigned": "Most Assigned", "most-engaged": "Most Engaged" };
type SortKey = keyof typeof SORT_LABELS;


function matchesTypeFilter(item: ContentItem, f: TypeFilter): boolean {
  return f === "all" || contentTypeKey(item) === f;
}

function inStatusTab(item: ContentItem, tab: LibraryTab): boolean {
  const status = contentStatus(item);
  if (tab === "ready") return status === "approved";
  if (tab === "needs-check") return status === "draft" || status === "needs-fixes";
  if (tab === "expired") return status === "expired";
  return true;
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((new Date("2026-09-18").getTime() - d.getTime()) / 86_400_000);
}

/* ════════════════════════════════════════════════ */
export default function ContentStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(() => seedContentItems(CONTENT_ITEMS));
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(AUDIT_LOG);

  const [tab, setTab] = useState<TypeTab>("all");
  const [statusTab, setStatusTab] = useState<LibraryTab>("ready");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [topicFilter, setTopicFilter] = useState<Topic | "all">("all");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [sort, setSort] = useState<SortKey>("latest");

  /* Advanced — hidden by default (§9) */
  const [moreOpen, setMoreOpen] = useState(false);
  const [createdWindow, setCreatedWindow] = useState<CreatedWindow>("all");
  const [createdVia, setCreatedVia] = useState<CreatedVia | "all">("all");
  const [engBand, setEngBand] = useState<EngagementBand | "all">("all");
  const [stageFilter, setStageFilter] = useState<AdvisoryStage | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<Audience | "all">("all");

  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  /* Create flow: audience first, because it decides the rules; then type; then settings. */
  const [createAudience, setCreateAudience] = useState<ContentAudience>("clients");
  const [createType, setCreateType] = useState<ContentTypeKey | null>(null);
  const [createIntent, setCreateIntent] = useState<ContentIntent>("learn");
  const [createAi, setCreateAi] = useState(false);

  /* Multi-select exists for one reason: order matters across several items,
     which is the Learning Path case. */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  /* Assign — one item, individual or group. */
  const [assignItem, setAssignItem] = useState<ContentItem | null>(null);

  /* The expanded workspace. Opens over the studio rather than navigating
     away, so the advisor keeps their filters and selection. */
  const [view, setView] = useState<PageView>("queue");
  /* Sequence Builder seed — a new nonce re-applies the selection. */
  const [builderSeed, setBuilderSeed] = useState<{
    ids: string[];
    nonce: number;
    title?: string;
    note?: string;
    clientId?: string;
    meeting?: MeetingRef;
  }>({ ids: [], nonce: 0 });

  /* Review queue — AI-suggested sends waiting for the advisor's decision. */
  const [pendingQueue, setPendingQueue] = useState<ReviewQueueItem[]>(REVIEW_QUEUE);
  const [resolvedQueue, setResolvedQueue] = useState<ResolvedSend[]>([]);
  const [drawerTab, setDrawerTab] = useState<DrawerTab | undefined>(undefined);


  /* The Needs check count is the same number the nav badge shows. */
  const needsCheck = useMemo(() => needsCheckCount(items), [items]);

  /* When each item last went out, read from the send log. */
  const lastSent = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of auditLog) {
      if (e.action !== "assigned" && e.action !== "send-approved") continue;
      const when = e.timestamp.split(" · ")[0];
      const titles = e.itemName.split(" + ");
      for (const it of items) if (titles.includes(it.title)) m.set(it.id, when === "Just now" ? "Today" : when);
    }
    return m;
  }, [auditLog, items]);

  const tabCounts = useMemo(
    () => ({
      all: items.length,
      learning: items.filter((i) => i.category === "learning").length,
      simulations: items.filter((i) => i.category === "simulation").length,
      workshops: items.filter((i) => i.category === "workshop").length,
    }),
    [items]
  );

  /* Templates are reusable; personalised ones are bound to one client. */
  const simCounts = useMemo(() => {
    const sims = items.filter((i) => i.category === "simulation");
    return {
      templates: sims.filter((i) => i.model.kind === "template").length,
      personalized: sims.filter((i) => i.model.kind === "personalized").length,
    };
  }, [items]);

  const checkedCount = checkedIds.size;

  const activeFilterCount =
    (createdWindow !== "all" ? 1 : 0) + (createdVia !== "all" ? 1 : 0) + (engBand !== "all" ? 1 : 0) + (stageFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0);

  /* Tab counts follow the type selection, so they match what the table would show. */
  const statusCounts = useMemo(() => {
    const scoped = items.filter(
      (i) =>
        (tab === "all" || (tab === "learning" && i.category === "learning") || (tab === "simulations" && i.category === "simulation") || (tab === "workshops" && i.category === "workshop")) &&
        matchesTypeFilter(i, typeFilter)
    );
    return Object.fromEntries(STATUS_TABS.map((t) => [t.id, scoped.filter((i) => inStatusTab(i, t.id)).length])) as Record<LibraryTab, number>;
  }, [items, tab, typeFilter]);

  const visible = useMemo(() => {
    let list = items;

    /* Type tab */
    if (tab === "learning") list = list.filter((i) => i.category === "learning");
    else if (tab === "simulations") list = list.filter((i) => i.category === "simulation");
    else if (tab === "workshops") list = list.filter((i) => i.category === "workshop");

    /* Type filter, then status tab — both apply, so "Videos that are Ready to send" works. */
    list = list.filter((i) => matchesTypeFilter(i, typeFilter));
    list = list.filter((i) => inStatusTab(i, statusTab));
    if (topicFilter !== "all") list = list.filter((i) => i.topic === topicFilter);
    if (assignmentFilter === "not-assigned") list = list.filter((i) => i.engagement.assignedCount === 0);
    else if (assignmentFilter === "assigned") list = list.filter((i) => i.engagement.assignedCount > 0);
    else if (assignmentFilter === "partially-assigned") list = list.filter((i) => i.engagement.assignedCount > 0 && followUpCount(i) > 0);

    /* Advanced filters */
    if (createdWindow !== "all") {
      const max = createdWindow === "7d" ? 7 : createdWindow === "30d" ? 30 : 90;
      list = list.filter((i) => daysSince(i.createdOn) <= max);
    }
    if (createdVia !== "all") list = list.filter((i) => i.createdVia === createdVia);
    if (engBand !== "all") list = list.filter((i) => engagementBand(i.engagement.completionRate, i.engagement.assignedCount) === engBand);
    if (stageFilter !== "all") list = list.filter((i) => i.advisoryStage === stageFilter);
    if (audienceFilter !== "all") list = list.filter((i) => i.audience.includes(audienceFilter));

    /* Search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.title.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)) || TOPIC_LABEL[i.topic].toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    if (sort === "most-assigned") sorted.sort((a, b) => b.engagement.assignedCount - a.engagement.assignedCount);
    else if (sort === "most-engaged") sorted.sort((a, b) => (b.engagement.completionRate ?? -1) - (a.engagement.completionRate ?? -1));
    else sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted;
  }, [items, tab, statusTab, typeFilter, topicFilter, assignmentFilter, createdWindow, createdVia, engBand, stageFilter, audienceFilter, search, sort]);

  /* ── Mutations ── */
  const logAudit = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    setAuditLog((prev) => [...prev, { ...entry, id: `au-${Date.now()}-${prev.length}`, timestamp: "Just now" }]);
  }, []);

  function updateItem(itemId: string, fn: (i: ContentItem) => ContentItem) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? fn(i) : i)));
    setSelected((prev) => (prev && prev.id === itemId ? fn(prev) : prev));
  }

  /** Accepting a fix resolves the flag. Resolving the last one leaves the content checked and
      waiting for the advisor's decision — never straight to approved. */
  function acceptFix(itemId: string, issueId: string) {
    const item = items.find((i) => i.id === itemId);
    updateItem(itemId, (it) => {
      const resolvedCheck = it.compliance.issues.find((x) => x.id === issueId)?.checkId;
      const issues = it.compliance.issues.map((x) => (x.id === issueId ? { ...x, resolution: "accepted" as const } : x));
      const stillOpen = issues.filter((x) => x.resolution === "open").length;
      return {
        ...it,
        compliance: {
          ...it.compliance,
          issues,
          failedChecks: resolvedCheck ? it.compliance.failedChecks.filter((c) => c !== resolvedCheck) : it.compliance.failedChecks,
          status: stillOpen === 0 && it.compliance.status !== "approved-for-use" ? "ai-review-complete" : it.compliance.status,
        },
      };
    });
    logAudit({ action: "issue-accepted", itemName: item?.title ?? "Content", actor: "advisor", detail: "Fix accepted" });
  }

  /** Advisory flags only — a blocking flag has to be fixed. The reason is required and logged. */
  function overrideFlag(itemId: string, issueId: string, reason: string) {
    const item = items.find((i) => i.id === itemId);
    const issue = item?.compliance.issues.find((x) => x.id === issueId);
    if (!item || !issue || issueSeverity(issue) === "blocking" || !reason.trim()) return;
    updateItem(itemId, (it) => {
      const issues = it.compliance.issues.map((x) => (x.id === issueId ? { ...x, resolution: "overridden" as const, overrideReason: reason } : x));
      const stillOpen = issues.filter((x) => x.resolution === "open").length;
      return {
        ...it,
        compliance: {
          ...it.compliance,
          issues,
          status: stillOpen === 0 && it.compliance.status !== "approved-for-use" ? "ai-review-complete" : it.compliance.status,
        },
      };
    });
    logAudit({ action: "flag-overridden", itemName: item.title, actor: "advisor", detail: `Overrode “${issue.title}” — ${reason}` });
  }

  /** Blocking flags stop approval; advisory flags don't. Approving restarts the review-by clock. */
  function approveForUse(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item || blockingOpenCount(item) > 0) return;
    updateItem(itemId, (it) => ({
      ...it,
      reviewBy: undefined,
      compliance: { ...it.compliance, status: "approved-for-use", approvedBy: "Anita Sharma", approvedAt: TODAY },
    }));
    logAudit({ action: "advisor-approved", itemName: item.title, actor: "advisor", detail: "Approved by Anita Sharma", ref: item.compliance.ref });
  }

  /** Editing approved content sends it back to Draft and clears the approval. */
  function removeApproval(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    updateItem(itemId, (it) => ({
      ...it,
      reviewBy: undefined,
      updatedAt: TODAY,
      compliance: { ...it.compliance, status: "not-reviewed", approvedBy: undefined, approvedAt: undefined },
    }));
    logAudit({ action: "approval-removed", itemName: item?.title ?? "Content", actor: "advisor", detail: "Edited — approval removed, back to Draft" });
  }

  /** The automatic check. It reads the title and description for outcome promises; the other
      checks keep their findings. It never approves — it only flags. */
  function checkedReview(it: ContentItem): ContentItem["compliance"] {
    const assured = assuredReturnLanguage(`${it.title} ${it.description}`);
    const known = it.compliance.issues.some((x) => x.checkId === "guaranteed-return-language");
    const issues = assured && !known
      ? [...it.compliance.issues, { id: `iss-${Date.now()}`, checkId: "guaranteed-return-language" as const, title: "Promises an outcome", original: assured, suggestion: "Describe what it does without promising a return.", location: "Title or description", resolution: "open" as const }]
      : it.compliance.issues;
    const open = issues.filter((x) => x.resolution === "open").length;
    const wasApproved = it.compliance.status === "approved-for-use";
    const status: ComplianceStatus =
      wasApproved && issues === it.compliance.issues ? "approved-for-use" : open > 0 ? "changes-required" : wasApproved ? "approved-for-use" : "ai-review-complete";
    return {
      ...it.compliance,
      issues,
      failedChecks: assured && !known ? [...it.compliance.failedChecks, "guaranteed-return-language"] : it.compliance.failedChecks,
      status,
      ref: it.compliance.ref ?? `COMP-${1100 + Math.floor(Math.random() * 90)}`,
      checkedAt: TODAY,
      ...(status === "approved-for-use" ? {} : { approvedBy: undefined, approvedAt: undefined }),
    };
  }

  function runCheck(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const next = checkedReview(item);
    const open = next.issues.filter((x) => x.resolution === "open").length;
    updateItem(itemId, (it) => ({ ...it, compliance: checkedReview(it) }));
    logAudit({ action: "ai-review-run", itemName: item.title, actor: "ai", detail: open > 0 ? `Checked — ${open} open flag${open === 1 ? "" : "s"}` : "Checked — no open flags", ref: next.ref });
  }

  function assign(itemId: string, clientIds: string[], channel?: DeliveryChannel, message?: string) {
    if (clientIds.length === 0) return;
    const item = items.find((i) => i.id === itemId);
    updateItem(itemId, (it) => {
      const existing = new Set(it.engagement.clients.map((c) => c.clientId));
      const added = clientIds
        .filter((id) => !existing.has(id))
        .map((id) => {
          const c = CLIENTS.find((x) => x.id === id)!;
          return { clientId: c.id, clientName: c.name, initials: c.initials, state: "Assigned" };
        });
      const states = it.engagement.states.map((s) => ({ ...s }));
      const assignedState = states.find((s) => s.label === "Assigned");
      if (assignedState) assignedState.count += added.length;
      else if (added.length) states.push({ label: "Assigned", count: added.length });
      return {
        ...it,
        engagement: {
          ...it.engagement,
          assignedCount: it.engagement.assignedCount + added.length,
          states,
          clients: [...it.engagement.clients, ...added],
        },
      };
    });
    /* The audit records how it went out and whether a note went with it —
       both matter when reconstructing what a client was actually told. */
    const via = channel ? ` via ${DELIVERY_CHANNEL_LABEL[channel]}` : "";
    const note = message ? " · with a message" : "";
    logAudit({
      action: "assigned",
      itemName: item?.title ?? "Content",
      actor: "advisor",
      detail: `${clientIds.length} client${clientIds.length === 1 ? "" : "s"}${via}${note}`,
    });
  }

  /* ── Simulations ── */

  /** Template defaults are the advisor's starting point for everyone. */
  function saveSimDefaults(itemId: string, values: Record<string, number>) {
    const item = items.find((i) => i.id === itemId);
    updateItem(itemId, (it) =>
      it.category === "simulation"
        ? { ...it, updatedAt: TODAY, model: { ...it.model, variables: it.model.variables.map((v) => ({ ...v, value: values[v.id] ?? v.value })) } }
        : it
    );
    logAudit({ action: "created", itemName: item?.title ?? "Simulation", actor: "advisor", detail: "Template defaults updated" });
  }

  /** Personalising derives a NEW client-bound simulation and leaves the
      template intact — one template, many personalised environments.
      Finny drafts the environment; it starts unreviewed, so the advisor
      still has to approve it before the client ever sees it. */
  function personalizeSim(itemId: string, plan: ClientGoalPlan) {
    const template = items.find((i) => i.id === itemId);
    if (!template || template.category !== "simulation") return;

    const derived: ContentItem = {
      ...template,
      id: `ct-sim-${plan.clientId}-${Date.now()}`,
      title: `${template.title} — ${plan.clientName}`,
      topic: plan.goalTopic,
      createdVia: "finny",
      audience: [],
      createdOn: TODAY,
      updatedAt: TODAY,
      publication: "draft",
      compliance: { status: "not-reviewed", failedChecks: [], issues: [] },
      engagement: { assignedCount: 0, completionRate: null, states: [], clients: [] },
      model: draftPersonalizedModel(plan),
    };

    setItems((prev) => [derived, ...prev]);
    logAudit({
      action: "simulation-personalised",
      itemName: derived.title,
      actor: "ai",
      detail: `Synced from ${plan.clientName}'s ${plan.goalName} goal and plan recommendation`,
    });
    setSelected(derived);
    setDrawerOpen(true);
  }

  /** Opens the Create flow, optionally with a type already picked (audience stays the advisor's call). */
  function openCreate(type?: ContentTypeKey) {
    setCreateType(type ?? null);
    setCreateAudience("clients");
    setCreateIntent(type === "simulation" ? "explore" : "learn");
    setCreateAi(false);
    setCreateOpen(true);
  }

  /** Starts a Draft. The automatic check runs on save, so the new item arrives already checked
      — and still needs the advisor's approval before it can be sent. */
  function createDraft(kind: ContentTypeKey, opts: { audience: ContentAudience; intent: ContentIntent; ai: boolean }) {
    const id = `ct-new-${Date.now()}`;
    const base = {
      id,
      description: "",
      topic: "financial-planning" as Topic,
      tags: [],
      intendedFor: [],
      createdBy: "Anita Sharma",
      createdVia: "advisor" as const,
      audience: [],
      forAudience: opts.audience,
      intent: opts.intent,
      aiAssisted: opts.ai,
      createdOn: TODAY,
      updatedAt: TODAY,
      publication: "draft" as const,
      compliance: { status: "not-reviewed" as ComplianceStatus, failedChecks: [], issues: [] },
      engagement: { assignedCount: 0, completionRate: null, states: [], clients: [] },
    };
    let draft: ContentItem;
    if (kind === "simulation")
      draft = {
        ...base,
        title: "Untitled Simulation",
        category: "simulation",
        estimatedTime: "—",
        model: { kind: "template", goalTopic: base.topic, variables: defaultVariables(base.topic) },
      };
    else if (kind === "workshop") draft = { ...base, title: "Untitled Workshop", category: "workshop", mode: "online", duration: "—" };
    else draft = { ...base, title: `Untitled ${CONTENT_TYPE_LABEL[kind]}`, category: "learning", format: kind };

    draft = { ...draft, compliance: checkedReview(draft) };
    setItems((prev) => [draft, ...prev]);
    logAudit({
      action: "created",
      itemName: draft.title,
      actor: "advisor",
      detail: `${CONTENT_AUDIENCE_LABEL[opts.audience]} · ${CONTENT_INTENT_LABEL[opts.intent]}${opts.ai ? " · AI-assisted" : ""}`,
    });
    setCreateOpen(false);
    setStatusTab("needs-check");
    setSelected(draft);
    setDrawerTab("compliance");
    setDrawerOpen(true);
  }

  /* ── Selection ── */
  function toggleChecked(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /** Header checkbox acts on what's shown, not the whole library. */
  function toggleAll(ids: string[]) {
    setCheckedIds((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      for (const id of ids) (allOn ? next.delete(id) : next.add(id));
      return next;
    });
  }

  /** Opens the Sequence Builder, seeded with whatever is selected, in table order. */
  function openPathBuilder(seed?: string[]) {
    setBuilderSeed((prev) => ({
      ids: seed ?? visible.filter((i) => checkedIds.has(i.id)).map((i) => i.id),
      nonce: prev.nonce + 1,
    }));
    setView("send");
  }

  /** Edit variables from a canvas step — opens the drawer on its Simulation tab. */
  function editSimulation(item: ContentItem) {
    setSelected(item);
    setDrawerTab("simulation");
    setDrawerOpen(true);
  }

  /** Sends every item in the sequence, in order, and records the sequence itself. */
  function sendSequence(p: SequenceSendPayload) {
    for (const id of p.contentIds) assign(id, p.clientIds, p.channel, p.note || undefined);
    logAudit({
      action: "assigned",
      itemName: p.title,
      actor: "advisor",
      detail: `Learning path of ${p.contentIds.length} item${p.contentIds.length === 1 ? "" : "s"}${p.messages.length ? ` + ${p.messages.length} message${p.messages.length === 1 ? "" : "s"}` : ""} to ${p.clientIds.length} client${p.clientIds.length === 1 ? "" : "s"}${p.note ? ", with a message" : ""}${p.savedAsTemplate ? "; saved as a template" : ""}${p.meeting ? `; follows ${p.meeting.title}, ${p.meeting.date}` : ""}`,
    });
  }

  /* ── Review queue decisions ── every one is logged ── */
  const clientNameOf = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? "Client";
  const resolveQueueItem = (q: ReviewQueueItem, r: Omit<ResolvedSend, "id" | "clientName" | "trigger">) => {
    setPendingQueue((prev) => prev.filter((x) => x.id !== q.id));
    setResolvedQueue((prev) => [{ id: q.id, clientName: clientNameOf(q.clientId), trigger: q.trigger, ...r }, ...prev]);
  };

  /** Approving sends only content that is approved for clients and live; the rest is held and logged. */
  function approveQueueItem(q: ReviewQueueItem, message: string) {
    const content = q.contentIds.map((id) => items.find((i) => i.id === id)).filter((i): i is ContentItem => Boolean(i));
    const sendable = content.filter(isSendableToClients);
    const held = content.filter((i) => !isSendableToClients(i));
    if (sendable.length === 0) return;
    for (const item of sendable) assign(item.id, [q.clientId], "portal", message || undefined);
    const name = clientNameOf(q.clientId);
    logAudit({
      action: "send-approved",
      itemName: sendable.map((i) => i.title).join(" + "),
      actor: "advisor",
      detail: `To ${name} · ${SEND_TRIGGER_LABEL[q.trigger]}: ${q.evidence[0]} · approved by Anita Sharma${q.meeting ? ` · follows ${q.meeting.title}, ${q.meeting.date}` : ""}${held.length ? ` · held back: ${held.map((i) => i.title).join(", ")}` : ""}`,
    });
    resolveQueueItem(q, {
      outcome: "sent",
      detail: `${sendable.length} item${sendable.length === 1 ? "" : "s"} sent via Client Portal${held.length ? `; ${held.length} held back` : ""}`,
    });
  }

  function dismissQueueItem(q: ReviewQueueItem, reason: string) {
    logAudit({
      action: "send-dismissed",
      itemName: `${clientNameOf(q.clientId)} — ${SEND_TRIGGER_LABEL[q.trigger]}`,
      actor: "advisor",
      detail: reason ? `Dismissed: ${reason}` : "Dismissed, no reason given",
    });
    resolveQueueItem(q, { outcome: "dismissed", detail: reason || "No reason given" });
  }

  /** Opens the suggestion in the composer, so the advisor can change the content before it goes. */
  function editQueueItem(q: ReviewQueueItem, message: string) {
    setBuilderSeed((prev) => ({
      ids: q.contentIds,
      nonce: prev.nonce + 1,
      title: q.meeting ? `${q.meeting.title} follow-up` : `${SEND_TRIGGER_LABEL[q.trigger]} for ${clientNameOf(q.clientId)}`,
      note: message,
      clientId: q.clientId,
      meeting: q.meeting,
    }));
    setView("send");
  }

  return (
    <AppShell>
      {/* In the Send view (desktop), the page stops scrolling and the builder
          fills the remaining height; its three columns scroll on their own. */}
      <div className={cn("flex flex-col h-full overflow-y-auto bg-[var(--bg-canvas)]", view === "send" && "xl:overflow-hidden")}>
        {/* ══ Header ══ */}
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-5 bg-[var(--bg-primary)] border-b border-[var(--border-tertiary)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">Content Management</h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Approve what goes to clients, assemble post-meeting packages and manage the content library.</p>
            <Tabs value={view} onValueChange={(v) => setView(v as PageView)} variant="pill" className="mt-4">
              <TabsList aria-label="Content Management view">
                <TabsTrigger value="queue" icon={<Inbox size={16} strokeWidth={1.75} />}>
                  Review queue
                  {pendingQueue.length > 0 && (
                    <span className="ml-1 text-xs font-semibold text-[var(--text-status-warning)] bg-[var(--bg-status-warning-subtle)] px-2 py-0.5 rounded-full tabular-nums">
                      {pendingQueue.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="send" icon={<Send size={16} strokeWidth={1.75} />}>Compose &amp; send</TabsTrigger>
                <TabsTrigger value="library" icon={<Library size={16} strokeWidth={1.75} />}>
                  Library
                  {needsCheck > 0 && (
                    <span className="ml-1 text-xs font-semibold text-[var(--text-status-warning)] bg-[var(--bg-status-warning-subtle)] px-2 py-0.5 rounded-full tabular-nums">
                      {needsCheck} need check
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="marketing" icon={<Megaphone size={16} strokeWidth={1.75} />}>Marketing</TabsTrigger>
                <TabsTrigger value="log" icon={<ScrollText size={16} strokeWidth={1.75} />}>Send log</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => openCreate()}>
              Create Content
            </Button>
          </div>
        </div>

        <div className={cn("px-6 py-6 space-y-6", view === "send" && "xl:flex xl:flex-col xl:flex-1 xl:min-h-0")}>
          {/* ══ Send to clients — the Sequence Builder ══
              Kept mounted (hidden) so a half-built sequence survives a trip
              to the Library. */}
          {view === "queue" && (
            <ReviewQueue
              pending={pendingQueue}
              resolved={resolvedQueue}
              items={items}
              clients={CLIENTS}
              onApprove={approveQueueItem}
              onEdit={editQueueItem}
              onDismiss={dismissQueueItem}
            />
          )}
          {view === "marketing" && <MarketingZone items={items} />}
          {view === "log" && <SendLog entries={auditLog} />}

          <div hidden={view !== "send"} className="xl:flex-1 xl:min-h-0">
            <SequenceBuilder
              items={items}
              clients={CLIENTS}
              seed={builderSeed}
              onEditSimulation={editSimulation}
              onSend={sendSequence}
            />
          </div>

          {view === "library" && (<>
          {/* ══ Type tabs ══ */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as TypeTab)} variant="line" className="!gap-0">
            <div className="border-b border-[var(--border-tertiary)]">
              <TabsList>
                {TYPE_TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                    <span className="ml-2 text-xs font-semibold text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                      {tabCounts[t.id]}
                    </span>
                  </TabsTrigger>
                ))}
                <TabsIndicator />
              </TabsList>
            </div>
          </Tabs>

          {/* ══ Per-tab create action ══
              Each type has its own way in. Simulations get the fullest
              treatment because the template → personalise step is the
              part that isn't self-evident. */}
          {tab === "simulations" && (
            <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-3.5">
              <div className="w-9 h-9 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
                <FlaskConical size={17} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Simulation templates</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-relaxed max-w-[62ch]">
                  Build the environment once. Finny then personalises it per client — synced from their goal and your plan recommendation — so
                  they can move the variables and see whether the plan gets them there.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5 tabular-nums">
                  {simCounts.templates} template{simCounts.templates === 1 ? "" : "s"} · {simCounts.personalized} personalised
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                leadingIcon={<Plus size={14} strokeWidth={2} />}
                onClick={() => openCreate("simulation")}
              >
                Create Template
              </Button>
            </div>
          )}

          {tab === "learning" && (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-xs text-[var(--text-tertiary)]">Videos, courses, PDFs and image posts you can assign to clients or groups.</p>
              <Button variant="secondary" size="sm" className="shrink-0" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => openCreate()}>
                New Learning Content
              </Button>
            </div>
          )}

          {tab === "workshops" && (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-xs text-[var(--text-tertiary)]">Online and offline sessions clients can be invited to.</p>
              <Button variant="secondary" size="sm" className="shrink-0" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => openCreate("workshop")}>
                Create Workshop
              </Button>
            </div>
          )}

          {/* ══ Status tabs ══
              "Can I send this?" — Approved content is the default view. Counts are live
              and follow the type selection above. */}
          <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as LibraryTab)} variant="pill" className="!gap-0">
            <TabsList aria-label="Content status">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label}
                  <span className="ml-1.5 text-xs font-semibold text-[var(--text-tertiary)] tabular-nums">{statusCounts[t.id]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* ══ Filters ══ */}
          <div className="space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="w-52">
                <Input
                  size="sm"
                  placeholder="Search content…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leadingIcon={<Search size={14} strokeWidth={1.75} />}
                />
              </div>

              <SelectField size="sm" className="w-[148px]" aria-label="Type" value={typeFilter} onValueChange={(v: unknown) => setTypeFilter(v as TypeFilter)} items={TYPE_FILTER_LABEL}>
                <SelectItem value="all">All types</SelectItem>
                {CONTENT_TYPE_GROUPS.map((g) => (
                  <SelectGroup key={g.group}>
                    <SelectGroupLabel>{g.group}</SelectGroupLabel>
                    {g.types.map((t) => (
                      <SelectItem key={t} value={t}>{CONTENT_TYPE_LABEL[t]}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectField>

              <SelectField size="sm" className="w-[140px]" aria-label="Topic" value={topicFilter} onValueChange={(v: unknown) => setTopicFilter(v as Topic | "all")} items={{ all: "All topics", ...TOPIC_LABEL }}>
                <SelectItem value="all">All topics</SelectItem>
                {(Object.keys(TOPIC_LABEL) as Topic[]).map((t) => (
                  <SelectItem key={t} value={t}>{TOPIC_LABEL[t]}</SelectItem>
                ))}
              </SelectField>

              <SelectField size="sm" className="w-[176px]" aria-label="Assignment" value={assignmentFilter} onValueChange={(v: unknown) => setAssignmentFilter(v as AssignmentFilter)} items={ASSIGNMENT_LABEL}>
                {(Object.keys(ASSIGNMENT_LABEL) as AssignmentFilter[]).map((a) => (
                  <SelectItem key={a} value={a}>{ASSIGNMENT_LABEL[a]}</SelectItem>
                ))}
              </SelectField>

              <Button
                variant={moreOpen || activeFilterCount > 0 ? "secondary" : "tertiary"}
                size="sm"
                leadingIcon={<SlidersHorizontal size={13} strokeWidth={1.75} />}
                onClick={() => setMoreOpen((v) => !v)}
              >
                More Filters
                {activeFilterCount > 0 && <span className="ml-1.5 text-xs font-semibold text-[var(--text-brand-primary)]">{activeFilterCount}</span>}
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">Sort</span>
                <SelectField size="sm" className="w-[132px]" aria-label="Sort" value={sort} onValueChange={(v: unknown) => setSort(v as SortKey)} items={SORT_LABELS}>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
                    <SelectItem key={s} value={s}>{SORT_LABELS[s]}</SelectItem>
                  ))}
                </SelectField>
              </div>
            </div>

            {/* Advanced filters — kept out of the way until asked for */}
            {moreOpen && (
              <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">Created</p>
                    <SelectField size="sm" aria-label="Created" value={createdWindow} onValueChange={(v: unknown) => setCreatedWindow(v as CreatedWindow)} items={CREATED_WINDOW_LABEL}>
                      {(Object.keys(CREATED_WINDOW_LABEL) as CreatedWindow[]).map((k) => (
                        <SelectItem key={k} value={k}>{CREATED_WINDOW_LABEL[k]}</SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">Created by</p>
                    <SelectField size="sm" aria-label="Created by" value={createdVia} onValueChange={(v: unknown) => setCreatedVia(v as CreatedVia | "all")} items={{ all: "Anyone", ...CREATED_VIA_LABEL }}>
                      <SelectItem value="all">Anyone</SelectItem>
                      {(Object.keys(CREATED_VIA_LABEL) as CreatedVia[]).map((k) => (
                        <SelectItem key={k} value={k}>{CREATED_VIA_LABEL[k]}</SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">Engagement</p>
                    <SelectField size="sm" aria-label="Engagement" value={engBand} onValueChange={(v: unknown) => setEngBand(v as EngagementBand | "all")} items={{ all: "Any", ...ENGAGEMENT_BAND_LABEL }}>
                      <SelectItem value="all">Any</SelectItem>
                      {(Object.keys(ENGAGEMENT_BAND_LABEL) as EngagementBand[]).map((k) => (
                        <SelectItem key={k} value={k}>{ENGAGEMENT_BAND_LABEL[k]}</SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">Advisory context</p>
                    <SelectField size="sm" aria-label="Advisory context" value={stageFilter} onValueChange={(v: unknown) => setStageFilter(v as AdvisoryStage | "all")} items={{ all: "Any", ...ADVISORY_STAGE_LABEL }}>
                      <SelectItem value="all">Any</SelectItem>
                      {(Object.keys(ADVISORY_STAGE_LABEL) as AdvisoryStage[]).map((k) => (
                        <SelectItem key={k} value={k}>{ADVISORY_STAGE_LABEL[k]}</SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">Audience</p>
                    <SelectField size="sm" aria-label="Audience" value={audienceFilter} onValueChange={(v: unknown) => setAudienceFilter(v as Audience | "all")} items={{ all: "Any", ...AUDIENCE_LABEL }}>
                      <SelectItem value="all">Any</SelectItem>
                      {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((k) => (
                        <SelectItem key={k} value={k}>{AUDIENCE_LABEL[k]}</SelectItem>
                      ))}
                    </SelectField>
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { setCreatedWindow("all"); setCreatedVia("all"); setEngBand("all"); setStageFilter("all"); setAudienceFilter("all"); }}
                    className="mt-3 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
                  >
                    Clear advanced filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ══ Table ══ */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs text-[var(--text-tertiary)]">
                {visible.length} item{visible.length === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-3">
                {/* Expand — opens the full workspace over the studio */}
                <button
                  type="button"
                  onClick={() => openPathBuilder()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
                >
                  <Maximize2 size={12} strokeWidth={2} />
                  Expand
                </button>
              </div>
            </div>

            {/* Selection bar — appears only once order could matter */}
            {checkedCount > 0 && (
              <div className="flex items-center justify-between gap-3 mb-3 rounded-[var(--radius-lg)] border border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)] px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-semibold text-[var(--text-brand-primary)] tabular-nums">{checkedCount} items selected</p>
                  <button
                    type="button"
                    onClick={() => setCheckedIds(new Set())}
                    className="text-xs font-semibold text-[var(--text-brand-secondary)] hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[var(--text-brand-secondary)] hidden lg:block">Put them in order and send them as a learning path</p>
                  <Button variant="primary" size="sm" leadingIcon={<Route size={13} strokeWidth={1.75} />} onClick={() => openPathBuilder()}>
                    Add to learning path
                  </Button>
                </div>
              </div>
            )}

            <ContentTable
              items={visible}
              selectedId={selected?.id ?? null}
              onSelect={(item) => { setSelected(item); setDrawerTab(undefined); setDrawerOpen(true); }}
              mode={statusTab}
              checkedIds={checkedIds}
              onToggleChecked={toggleChecked}
              onToggleAll={toggleAll}
              lastSent={lastSent}
              onSend={(item) => openPathBuilder([item.id])}
              onReview={(item) => { setSelected(item); setDrawerTab("compliance"); setDrawerOpen(true); }}
              empty={<LibraryEmpty tab={statusTab} filtered={Boolean(search.trim()) || typeFilter !== "all" || topicFilter !== "all" || assignmentFilter !== "all" || activeFilterCount > 0} onGo={setStatusTab} onCreate={() => openCreate()} />}
            />
          </div>
          </>)}
        </div>
      </div>

      {/* ══ Detail drawer ══ */}
      <ContentDetailDrawer
        item={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        clients={CLIENTS}
        suggestions={FINNY_SUGGESTIONS}
        auditLog={auditLog}
        onAcceptSuggestion={acceptFix}
        onOverrideFlag={overrideFlag}
        onApproveForUse={approveForUse}
        onRunCheck={runCheck}
        onRemoveApproval={removeApproval}
        onAssign={assign}
        onSaveSimDefaults={saveSimDefaults}
        onPersonalizeSim={personalizeSim}
        initialTab={drawerTab}
      />

      {/* ══ Assign — one item, individual or group ══ */}
      <AssignContentDrawer item={assignItem} clients={CLIENTS} onClose={() => setAssignItem(null)} onAssign={assign} />

      {/* ══ Create Content ══
          On the shared Modal primitive (focus trap, Escape, scroll lock) and
          laid out as one ruled list — the six types are rows, not tiles. */}
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-[520px]">
          <div className="shrink-0 border-b border-[var(--border-tertiary)] px-5 pt-5 pb-4 pr-14">
            <ModalTitle>Create Content</ModalTitle>
            <ModalDescription className="mt-0.5">
              Pick who it&apos;s for, then a type. Drafts are checked automatically before they can be sent.
            </ModalDescription>
          </div>

          <div className="overflow-y-auto pb-2">
            {/* Step 1 — audience decides the rules, so it comes first */}
            <fieldset className="px-5 pt-4">
              <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Who is it for?</legend>
              <div role="radiogroup" aria-label="Audience" className="grid grid-cols-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] overflow-hidden divide-x divide-[var(--border-tertiary)]">
                {(Object.keys(CONTENT_AUDIENCE_LABEL) as ContentAudience[]).map((a) => {
                  const on = createAudience === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setCreateAudience(a);
                        if (createType && typeDisabledReason(createType, a)) setCreateType(null);
                      }}
                      className={cn("px-3 py-2.5 text-left transition-colors", on ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]")}
                    >
                      <p className={cn("text-sm font-semibold", on ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{CONTENT_AUDIENCE_LABEL[a]}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug">{CONTENT_AUDIENCE_HINT[a]}</p>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Step 2 — the one type list; types that don't fit the audience say why */}
            <div role="radiogroup" aria-label="Content type">
              {CONTENT_TYPE_GROUPS.map((g) => (
                <section key={g.group}>
                  <p className="px-5 pt-4 pb-1.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{g.group}</p>
                  <ul className="divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)]">
                    {g.types.map((t) => {
                      const reason = typeDisabledReason(t, createAudience);
                      const on = createType === t;
                      const tile = typeTile(t);
                      return (
                        <li key={t}>
                          <ListItem
                            icon={tile.icon}
                            tileClassName={tile.className}
                            selected={on}
                            disabledReason={reason ?? undefined}
                            onClick={() => {
                              setCreateType(t);
                              setCreateIntent(t === "simulation" ? "explore" : "learn");
                            }}
                          >
                            {CONTENT_TYPE_LABEL[t]}
                          </ListItem>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            {/* Step 3 — settings, once a type is picked */}
            {createType && (
              <div className="px-5 pt-4 space-y-4">
                <fieldset>
                  <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Content label <span className="text-[var(--text-status-error)]">*</span></legend>
                  <div role="radiogroup" aria-label="Content label" className="grid grid-cols-2 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] overflow-hidden divide-x divide-[var(--border-tertiary)]">
                    {(["learn", "explore"] as ContentIntent[]).map((i) => {
                      const on = createIntent === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setCreateIntent(i)}
                          className={cn("px-3 py-2.5 text-left transition-colors", on ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]")}
                        >
                          <p className={cn("text-sm font-semibold", on ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{CONTENT_INTENT_LABEL[i]}</p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{i === "learn" ? "Teaches an idea" : "Lets the client try their own numbers"}</p>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <Switch checked={createAi} onCheckedChange={setCreateAi}>
                    AI-generated or AI-assisted
                  </Switch>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">An AI label is added to the item automatically.</p>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex justify-end gap-2 border-t border-[var(--border-tertiary)] px-5 py-3">
            <Button variant="tertiary" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!createType}
              onClick={() => createType && createDraft(createType, { audience: createAudience, intent: createIntent, ai: createAi })}
            >
              Start draft
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </AppShell>
  );
}

/* ─── Create modal: the tile for each type ─── */
function typeTile(t: ContentTypeKey): { icon: React.ReactNode; className: string } {
  if (t === "simulation") return { icon: <FlaskConical size={14} strokeWidth={1.75} />, className: "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]" };
  if (t === "workshop") return { icon: <Presentation size={14} strokeWidth={1.75} />, className: "bg-[var(--bg-status-success-subtle)] text-[var(--icon-status-success)]" };
  const cfg = getFormatVisual(t);
  return { icon: cfg.icon, className: cn(cfg.bgColor, cfg.iconColor) };
}

/* ─── One empty state per status tab ─── */
function LibraryEmpty({ tab, filtered, onGo, onCreate }: { tab: LibraryTab; filtered: boolean; onGo: (t: LibraryTab) => void; onCreate: () => void }) {
  if (filtered) {
    return (
      <>
        <p className="text-sm font-medium text-[var(--text-secondary)]">No content matches these filters</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Try a different type, topic or search term.</p>
      </>
    );
  }
  const copy: Record<LibraryTab, { title: string; action?: { label: string; run: () => void } }> = {
    ready: { title: "Nothing approved yet. Review your drafts.", action: { label: "Go to Needs check", run: () => onGo("needs-check") } },
    "needs-check": { title: "Everything is checked." },
    expired: { title: "No expired content." },
    all: { title: "No content yet.", action: { label: "Create Content", run: onCreate } },
  };
  const c = copy[tab];
  return (
    <>
      <p className="text-sm font-medium text-[var(--text-secondary)]">{c.title}</p>
      {c.action && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={c.action.run}>
          {c.action.label}
        </Button>
      )}
    </>
  );
}
