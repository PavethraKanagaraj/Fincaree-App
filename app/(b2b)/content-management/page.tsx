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
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem, SelectGroup, SelectGroupLabel } from "@/components/fincaree/select";
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from "@/components/fincaree/tabs";
import { ContentTable, followUpCount } from "@/components/client-suggestions/ContentTable";
import { ContentDetailDrawer, type DrawerTab } from "@/components/client-suggestions/ContentDetailDrawer";
import { SequenceBuilder, type SequenceSendPayload } from "@/components/client-suggestions/SequenceBuilder";
import { AssignContentDrawer } from "@/components/client-suggestions/AssignContentDrawer";
import { getFormatVisual } from "@/components/client-suggestions/content-visual";
import {
  CONTENT_ITEMS,
  CLIENTS,
  FINNY_SUGGESTIONS,
  AUDIT_LOG,
  TOPIC_LABEL,
  COMPLIANCE_STATUS_LABEL,
  PUBLICATION_STATUS_LABEL,
  LEARNING_FORMAT_LABEL,
  CREATED_VIA_LABEL,
  AUDIENCE_LABEL,
  DELIVERY_CHANNEL_LABEL,
  ENGAGEMENT_BAND_LABEL,
  ADVISORY_STAGE_LABEL,
  engagementBand,
  defaultVariables,
  draftPersonalizedModel,
  openIssueCount,
  type ContentItem,
  type LearningFormat,
  type Topic,
  type ComplianceStatus,
  type PublicationStatus,
  type CreatedVia,
  type Audience,
  type EngagementBand,
  type AdvisoryStage,
  type AuditEntry,
  type ClientGoalPlan,
  type DeliveryChannel,
} from "@/components/client-suggestions/content-data";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Search, FlaskConical, Presentation, X, SlidersHorizontal, AlertTriangle, FileEdit, Users, TrendingUp, Route, Maximize2, ChevronRight, Send, Library } from "lucide-react";

const TODAY = "18 Sep 2026";

/* ─── Views — sending comes first ───
   Most visits are to send something to a client, so the page opens on the
   Sequence Builder. Managing the library (review, drafts, engagement) is
   periodic work and lives in its own view, with a count of what needs
   review so that time-sensitive compliance work is never out of sight. */
type PageView = "send" | "library";

/* ─── Type tabs (Library view) — "what kind of content am I looking for?" ─── */
type TypeTab = "all" | "learning" | "simulations" | "workshops";

const TYPE_TABS: { id: TypeTab; label: string }[] = [
  { id: "all", label: "All Content" },
  { id: "learning", label: "Learning" },
  { id: "simulations", label: "Simulations" },
  { id: "workshops", label: "Workshops" },
];

/* ─── Quick views — work states, not tabs ─── */
type QuickView = "none" | "needs-review" | "drafts" | "assigned";

/* ─── Flat type filter (§5 — doesn't duplicate the tabs) ─── */
type TypeFilter = "all" | LearningFormat | "simulation" | "workshop";

const TYPE_FILTER_LABEL: Record<TypeFilter, string> = {
  all: "All types",
  video: "Video",
  pdf: "PDF",
  course: "Course",
  "image-post": "Image Post",
  simulation: "Simulation",
  workshop: "Workshop",
};

/* ─── Status filter — grouped, since review ≠ publication ─── */
type StatusFilter = "all" | ComplianceStatus | PublicationStatus;

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

const COMPLIANCE_KEYS = Object.keys(COMPLIANCE_STATUS_LABEL) as ComplianceStatus[];
const PUBLICATION_KEYS = Object.keys(PUBLICATION_STATUS_LABEL) as PublicationStatus[];

function needsReview(item: ContentItem): boolean {
  return item.compliance.status !== "approved-for-use";
}

function matchesTypeFilter(item: ContentItem, f: TypeFilter): boolean {
  if (f === "all") return true;
  if (f === "simulation") return item.category === "simulation";
  if (f === "workshop") return item.category === "workshop";
  return item.category === "learning" && item.format === f;
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((new Date("2026-09-18").getTime() - d.getTime()) / 86_400_000);
}

/* ════════════════════════════════════════════════ */
export default function ContentStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(CONTENT_ITEMS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(AUDIT_LOG);

  const [tab, setTab] = useState<TypeTab>("all");
  const [quickView, setQuickView] = useState<QuickView>("none");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [topicFilter, setTopicFilter] = useState<Topic | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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

  /* Multi-select exists for one reason: order matters across several items,
     which is the Learning Path case. */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  /* Assign — one item, individual or group. */
  const [assignItem, setAssignItem] = useState<ContentItem | null>(null);

  /* The expanded workspace. Opens over the studio rather than navigating
     away, so the advisor keeps their filters and selection. */
  const [view, setView] = useState<PageView>("send");
  /* Sequence Builder seed — a new nonce re-applies the selection. */
  const [builderSeed, setBuilderSeed] = useState<{ ids: string[]; nonce: number }>({ ids: [], nonce: 0 });
  const [drawerTab, setDrawerTab] = useState<DrawerTab | undefined>(undefined);

  /* Preview — how the client sees it. */
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  /* ── Quick-view counts ── */
  const counts = useMemo(() => {
    const review = items.filter(needsReview);
    const needsChanges = review.filter((i) => i.compliance.status === "changes-required").length;
    const drafts = items.filter((i) => i.publication === "draft");
    const incompleteDrafts = drafts.filter((i) => i.compliance.status === "not-reviewed").length;
    const assigned = items.filter((i) => i.engagement.assignedCount > 0);
    const rates = items.map((i) => i.engagement.completionRate).filter((r): r is number => r !== null);
    const avgEngagement = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
    const followUps = assigned.reduce((sum, i) => sum + followUpCount(i), 0);
    return {
      review: review.length,
      needsChanges,
      drafts: drafts.length,
      incompleteDrafts,
      assigned: assigned.length,
      avgEngagement,
      followUps,
      total: items.length,
    };
  }, [items]);

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

  const visible = useMemo(() => {
    let list = items;

    /* Type tab */
    if (tab === "learning") list = list.filter((i) => i.category === "learning");
    else if (tab === "simulations") list = list.filter((i) => i.category === "simulation");
    else if (tab === "workshops") list = list.filter((i) => i.category === "workshop");

    /* Quick view */
    if (quickView === "needs-review") list = list.filter(needsReview);
    else if (quickView === "drafts") list = list.filter((i) => i.publication === "draft");
    else if (quickView === "assigned") list = list.filter((i) => i.engagement.assignedCount > 0);

    /* Primary filters */
    list = list.filter((i) => matchesTypeFilter(i, typeFilter));
    if (topicFilter !== "all") list = list.filter((i) => i.topic === topicFilter);
    if (statusFilter !== "all") {
      list = list.filter((i) =>
        COMPLIANCE_KEYS.includes(statusFilter as ComplianceStatus)
          ? i.compliance.status === statusFilter
          : i.publication === statusFilter
      );
    }
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
  }, [items, tab, quickView, typeFilter, topicFilter, statusFilter, assignmentFilter, createdWindow, createdVia, engBand, stageFilter, audienceFilter, search, sort]);

  /* ── Mutations ── */
  const logAudit = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    setAuditLog((prev) => [...prev, { ...entry, id: `au-${Date.now()}-${prev.length}`, timestamp: "Just now" }]);
  }, []);

  function updateItem(itemId: string, fn: (i: ContentItem) => ContentItem) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? fn(i) : i)));
    setSelected((prev) => (prev && prev.id === itemId ? fn(prev) : prev));
  }

  /** Resolving the last finding moves to "AI Review Complete" — ready for the
      advisor's decision, never straight to approved. */
  function resolveIssue(itemId: string, issueId: string, resolution: "accepted" | "dismissed") {
    const item = items.find((i) => i.id === itemId);
    updateItem(itemId, (it) => {
      const issues = it.compliance.issues.map((x) => (x.id === issueId ? { ...x, resolution } : x));
      const stillOpen = issues.filter((x) => x.resolution === "open").length;
      const resolvedCheck = it.compliance.issues.find((x) => x.id === issueId)?.checkId;
      return {
        ...it,
        compliance: {
          ...it.compliance,
          issues,
          failedChecks: resolution === "accepted" && resolvedCheck ? it.compliance.failedChecks.filter((c) => c !== resolvedCheck) : it.compliance.failedChecks,
          status: stillOpen === 0 ? "ai-review-complete" : it.compliance.status,
        },
      };
    });
    logAudit({
      action: resolution === "accepted" ? "issue-accepted" : "issue-dismissed",
      itemName: item?.title ?? "Content",
      actor: "advisor",
      detail: resolution === "accepted" ? "Finny suggestion accepted" : "Finny suggestion dismissed",
    });
  }

  function approveForUse(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    updateItem(itemId, (it) => ({
      ...it,
      compliance: { ...it.compliance, status: "approved-for-use", approvedBy: "Anita Sharma", approvedAt: TODAY },
    }));
    logAudit({ action: "advisor-approved", itemName: item?.title ?? "Content", actor: "advisor", detail: "Approved by Anita Sharma", ref: item?.compliance.ref });
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

  function createDraft(kind: Exclude<TypeFilter, "all">) {
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
    else draft = { ...base, title: `Untitled ${LEARNING_FORMAT_LABEL[kind]}`, category: "learning", format: kind };

    setItems((prev) => [draft, ...prev]);
    logAudit({ action: "created", itemName: draft.title, actor: "advisor" });
    setCreateOpen(false);
    setSelected(draft);
    setDrawerOpen(true);
  }

  function toggleQuickView(v: QuickView) {
    setQuickView((prev) => (prev === v ? "none" : v));
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
      detail: `Learning path of ${p.contentIds.length} item${p.contentIds.length === 1 ? "" : "s"}${p.messages.length ? ` + ${p.messages.length} message${p.messages.length === 1 ? "" : "s"}` : ""} to ${p.clientIds.length} client${p.clientIds.length === 1 ? "" : "s"}${p.note ? ", with a message" : ""}${p.savedAsTemplate ? "; saved as a template" : ""}`,
    });
  }

  /* ── KPI / quick-view cards ── */
  const primaryCards = [
    {
      id: "needs-review" as QuickView,
      label: "Needs Review",
      value: counts.review,
      sub: counts.needsChanges > 0 ? `${counts.needsChanges} need changes` : "All findings resolved",
      icon: <AlertTriangle size={13} strokeWidth={2} />,
      warn: counts.review > 0,
    },
    {
      id: "drafts" as QuickView,
      label: "Drafts",
      value: counts.drafts,
      sub: counts.incompleteDrafts > 0 ? `${counts.incompleteDrafts} not yet reviewed` : "All reviewed",
      icon: <FileEdit size={13} strokeWidth={2} />,
      warn: false,
    },
  ];

  const secondaryCards = [
    {
      id: "assigned" as QuickView,
      label: "Assigned",
      value: String(counts.assigned),
      sub: counts.followUps > 0 ? `${counts.followUps} clients to follow up` : "No follow-ups pending",
      icon: <Users size={13} strokeWidth={2} />,
    },
    {
      id: "none" as QuickView,
      label: "Engagement",
      value: `${counts.avgEngagement}%`,
      sub: "Average completion",
      icon: <TrendingUp size={13} strokeWidth={2} />,
    },
  ];

  return (
    <AppShell>
      {/* In the Send view (desktop), the page stops scrolling and the builder
          fills the remaining height; its three columns scroll on their own. */}
      <div className={cn("flex flex-col h-full overflow-y-auto bg-[var(--bg-canvas)]", view === "send" && "xl:overflow-hidden")}>
        {/* ══ Header ══ */}
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-5 bg-[var(--bg-primary)] border-b border-[var(--border-tertiary)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">Content Management</h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Curate, create and share educational content with your clients.</p>
            <Tabs value={view} onValueChange={(v) => setView(v as PageView)} variant="pill" className="mt-4">
              <TabsList aria-label="Content Management view">
                <TabsTrigger value="send" icon={<Send size={16} strokeWidth={1.75} />}>Send to clients</TabsTrigger>
                <TabsTrigger value="library" icon={<Library size={16} strokeWidth={1.75} />}>
                  Library
                  {counts.review > 0 && (
                    <span className="ml-1 text-xs font-semibold text-[var(--text-status-warning)] bg-[var(--bg-status-warning-subtle)] px-2 py-0.5 rounded-full tabular-nums">
                      {counts.review} need review
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => setCreateOpen(true)}>
              Create Content
            </Button>
          </div>
        </div>

        <div className={cn("px-6 py-6 space-y-6", view === "send" && "xl:flex xl:flex-col xl:flex-1 xl:min-h-0")}>
          {/* ══ Send to clients — the Sequence Builder ══
              Kept mounted (hidden) so a half-built sequence survives a trip
              to the Library. */}
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
          {/* ══ Quick views — the KPI row is an operational shortcut, not decoration ══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryCards.map((c) => {
              const active = quickView === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleQuickView(c.id)}
                  className={cn(
                    "text-left rounded-[var(--radius-xl)] border px-5 py-4 transition-colors",
                    active
                      ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
                      : c.warn
                      ? "border-[var(--border-status-warning-subtle)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]"
                      : "border-[var(--border-tertiary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn(c.warn ? "text-[var(--icon-status-warning)]" : "text-[var(--icon-tertiary)]")}>{c.icon}</span>
                    <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{c.label}</p>
                  </div>
                  <p className={cn("text-3xl font-bold mt-1.5 tabular-nums", c.warn ? "text-[var(--text-status-warning)]" : "text-[var(--text-primary)]")}>
                    {c.value}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{c.sub}</p>
                </button>
              );
            })}

            {secondaryCards.map((c) => {
              const clickable = c.id !== "none";
              const active = clickable && quickView === c.id;
              return (
                <button
                  key={c.label}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && toggleQuickView(c.id)}
                  className={cn(
                    "text-left rounded-[var(--radius-xl)] border px-5 py-4 transition-colors",
                    active ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]" : "border-[var(--border-tertiary)] bg-[var(--bg-primary)]",
                    clickable && !active && "hover:bg-[var(--bg-secondary)]",
                    !clickable && "cursor-default"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--icon-tertiary)]">{c.icon}</span>
                    <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{c.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1.5 tabular-nums">{c.value}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{c.sub}</p>
                </button>
              );
            })}
          </div>

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
                onClick={() => createDraft("simulation")}
              >
                Create Template
              </Button>
            </div>
          )}

          {tab === "learning" && (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-xs text-[var(--text-tertiary)]">Videos, courses, PDFs and image posts you can assign to clients or groups.</p>
              <Button variant="secondary" size="sm" className="shrink-0" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => setCreateOpen(true)}>
                New Learning Content
              </Button>
            </div>
          )}

          {tab === "workshops" && (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-xs text-[var(--text-tertiary)]">Online and offline sessions clients can be invited to.</p>
              <Button variant="secondary" size="sm" className="shrink-0" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => createDraft("workshop")}>
                Create Workshop
              </Button>
            </div>
          )}

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

              <SelectField size="sm" className="w-[120px]" aria-label="Type" value={typeFilter} onValueChange={(v: unknown) => setTypeFilter(v as TypeFilter)} items={TYPE_FILTER_LABEL}>
                {(Object.keys(TYPE_FILTER_LABEL) as TypeFilter[]).map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_FILTER_LABEL[t]}</SelectItem>
                ))}
              </SelectField>

              <SelectField size="sm" className="w-[140px]" aria-label="Topic" value={topicFilter} onValueChange={(v: unknown) => setTopicFilter(v as Topic | "all")} items={{ all: "All topics", ...TOPIC_LABEL }}>
                <SelectItem value="all">All topics</SelectItem>
                {(Object.keys(TOPIC_LABEL) as Topic[]).map((t) => (
                  <SelectItem key={t} value={t}>{TOPIC_LABEL[t]}</SelectItem>
                ))}
              </SelectField>

              {/* Status is grouped — review state and publication state are different axes */}
              <SelectField
                size="sm"
                className="w-[168px]"
                aria-label="Status"
                value={statusFilter}
                onValueChange={(v: unknown) => setStatusFilter(v as StatusFilter)}
                items={{ all: "All statuses", ...COMPLIANCE_STATUS_LABEL, ...PUBLICATION_STATUS_LABEL }}
              >
                <SelectItem value="all">All statuses</SelectItem>
                <SelectGroup>
                  <SelectGroupLabel>Review</SelectGroupLabel>
                  {COMPLIANCE_KEYS.map((s) => (
                    <SelectItem key={s} value={s}>{COMPLIANCE_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectGroupLabel>Publication</SelectGroupLabel>
                  {PUBLICATION_KEYS.map((s) => (
                    <SelectItem key={s} value={s}>{PUBLICATION_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectField>

              <SelectField size="sm" className="w-[152px]" aria-label="Assignment" value={assignmentFilter} onValueChange={(v: unknown) => setAssignmentFilter(v as AssignmentFilter)} items={ASSIGNMENT_LABEL}>
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
                {visible.length} of {counts.total} items
              </p>
              <div className="flex items-center gap-3">
                {quickView !== "none" && (
                  <button
                    type="button"
                    onClick={() => setQuickView("none")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
                  >
                    Viewing {quickView === "needs-review" ? "Needs Review" : quickView === "drafts" ? "Drafts" : "Assigned"}
                    <X size={11} strokeWidth={2.5} />
                  </button>
                )}
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
              variant={quickView === "assigned" ? "assigned" : "default"}
              checkedIds={checkedIds}
              onToggleChecked={toggleChecked}
              onToggleAll={toggleAll}
              onAssign={(item) => setAssignItem(item)}
              onPreview={(item) => setPreviewItem(item)}
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
        onAcceptSuggestion={(id, issueId) => resolveIssue(id, issueId, "accepted")}
        onDismissSuggestion={(id, issueId) => resolveIssue(id, issueId, "dismissed")}
        onApproveForUse={approveForUse}
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
        <ModalContent className="max-w-[440px]">
          <div className="shrink-0 border-b border-[var(--border-tertiary)] px-5 pt-5 pb-4 pr-14">
            <ModalTitle>Create Content</ModalTitle>
            <ModalDescription className="mt-0.5">
              Pick a type to start a draft. It stays un-reviewed until you run a compliance check.
            </ModalDescription>
          </div>

          <div className="overflow-y-auto pb-2">
            {[
              {
                group: "Learning",
                rows: (Object.keys(LEARNING_FORMAT_LABEL) as LearningFormat[]).map((f) => {
                  const cfg = getFormatVisual(f);
                  return { key: f as string, label: LEARNING_FORMAT_LABEL[f], icon: cfg.icon, tile: cn(cfg.bgColor, cfg.iconColor), kind: f as Exclude<TypeFilter, "all"> };
                }),
              },
              {
                group: "Interactive",
                rows: [{ key: "simulation", label: "Simulation", icon: <FlaskConical size={14} strokeWidth={1.75} />, tile: "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]", kind: "simulation" as const }],
              },
              {
                group: "Live",
                rows: [{ key: "workshop", label: "Workshop", icon: <Presentation size={14} strokeWidth={1.75} />, tile: "bg-[var(--bg-status-success-subtle)] text-[var(--icon-status-success)]", kind: "workshop" as const }],
              },
            ].map((g) => (
              <section key={g.group}>
                <p className="px-5 pt-4 pb-1.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{g.group}</p>
                <ul className="divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)]">
                  {g.rows.map((r) => (
                    <li key={r.key}>
                      <button
                        type="button"
                        onClick={() => createDraft(r.kind)}
                        className="group flex items-center gap-3 w-full px-5 py-2.5 text-left hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <span className={cn("w-8 h-8 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center", r.tile)}>{r.icon}</span>
                        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{r.label}</span>
                        <ChevronRight size={14} strokeWidth={2} className="text-[var(--icon-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </ModalContent>
      </Modal>
    </AppShell>
  );
}
