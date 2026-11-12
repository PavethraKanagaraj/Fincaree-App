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

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { Button } from "@/components/fincaree/button";
import { ListItem } from "@/components/fincaree/list-item";
import { Input } from "@/components/fincaree/input";
import { Textarea } from "@/components/fincaree/textarea";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from "@/components/fincaree/tabs";

import { ContentBoard, activeClientCount, columnOf, type ColumnId, type MoveCheck } from "@/components/client-suggestions/ContentBoard";
import { ContentDetailDrawer, type DrawerTab } from "@/components/client-suggestions/ContentDetailDrawer";
import { type SequenceSendPayload } from "@/components/client-suggestions/SequenceBuilder";
import { AssignContentDrawer } from "@/components/client-suggestions/AssignContentDrawer";
import type { ResolvedSend } from "@/components/client-suggestions/ReviewQueue";
import { SendWorkspace } from "@/components/client-suggestions/SendWorkspace";
import { SendLog } from "@/components/client-suggestions/DeliveryPanels";
import { MarketingZone } from "@/components/client-suggestions/MarketingZone";
import { useMarketing } from "@/components/client-suggestions/marketing-store";
import { useNoteEvents } from "@/components/meeting-desk/meeting-notes";
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
  DELIVERY_CHANNEL_LABEL,
  defaultVariables,
  draftPersonalizedModel,
  type ContentItem,
  type Topic,
  type ComplianceStatus,
  type AuditEntry,
  type ClientGoalPlan,
  type DeliveryChannel,
} from "@/components/client-suggestions/content-data";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Switch } from "@/components/fincaree/switch";
import { cn } from "@/lib/utils";
import { Plus, Search, FlaskConical, Upload, X as XIcon, FileUp, Presentation, Route, Send, Library, Megaphone, ScrollText } from "lucide-react";

const TODAY = "18 Sep 2026";

/* ─── Upload: which files each type takes ───
   Learning paths and simulations are built in Fincaree, so they have no upload. */
const UPLOAD_MAX_MB = 50;
const UPLOAD_ACCEPT: Partial<Record<ContentTypeKey, { accept: string; hint: string }>> = {
  presentation: { accept: ".ppt,.pptx,.key,.odp,.pdf", hint: "PowerPoint, Keynote or PDF" },
  pdf: { accept: ".pdf", hint: "PDF" },
  video: { accept: "video/*,.mp4,.mov,.webm", hint: "MP4, MOV or WebM" },
  "image-post": { accept: "image/*,.png,.jpg,.jpeg,.webp", hint: "PNG, JPG or WebP" },
  course: { accept: ".pdf,.ppt,.pptx,.doc,.docx,.zip", hint: "PDF, PowerPoint, Word or a zip of modules" },
  workshop: { accept: ".pdf,.ppt,.pptx,.doc,.docx", hint: "Deck, agenda or brochure (PDF, PowerPoint or Word)" },
  message: { accept: ".pdf,.doc,.docx,.txt", hint: "PDF, Word or text" },
};
const canUpload = (t: ContentTypeKey | null): t is ContentTypeKey => t !== null && t in UPLOAD_ACCEPT;
const fileSizeLabel = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/* ─── Views — sending comes first ───
   Most visits are to send something to a client, so the page opens on the
   Sequence Builder. Managing the library (review, drafts, engagement) is
   periodic work and lives in its own view, with a count of what needs
   review so that time-sensitive compliance work is never out of sight. */
type PageView = "send" | "library" | "marketing" | "log";

/* ─── Type tabs (Library view) — "what kind of content am I looking for?" ─── */
type TypeTab = ContentTypeKey;

/* Same types, same order as the Add content panel in Assign content. No "All" tab:
   the advisor always picks the kind of content first. */
const TYPE_TAB_ORDER: ContentTypeKey[] = ["learning-path", "pdf", "video", "image-post", "message", "simulation", "workshop", "presentation"];

/* Courses are listed under Workshop. */
const tabOf = (i: ContentItem): TypeTab => {
  const k = contentTypeKey(i);
  return k === "course" ? "workshop" : k;
};
const TYPE_TABS: { id: TypeTab; label: string }[] = TYPE_TAB_ORDER.map((id) => ({ id, label: CONTENT_TYPE_LABEL[id] }));

/* ════════════════════════════════════════════════ */
/* The Suspense boundary is for useSearchParams: other pages link here with ?open=<id> to land on one item. */
export default function ContentStudioPageRoute() {
  return (
    <Suspense fallback={null}>
      <ContentStudioPage />
    </Suspense>
  );
}

function ContentStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(() => seedContentItems(CONTENT_ITEMS));
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(AUDIT_LOG);
  /* Marketing changes (scheduling, per-lead pauses and sends) are logged by the shared store. */
  const { events: marketingEvents } = useMarketing();
  /* Meeting notes drafted, reworded and approved on the Meetings page are logged the same way. */
  const noteEvents = useNoteEvents();

  const [tab, setTab] = useState<TypeTab>("video");
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<Topic | "all">("all");


  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  /* Create flow: audience first, because it decides the rules; then type; then settings. */
  const [createAudience, setCreateAudience] = useState<ContentAudience>("clients");
  const [createType, setCreateType] = useState<ContentTypeKey | null>(null);
  const [createIntent, setCreateIntent] = useState<ContentIntent>("learn");
  const [createAi, setCreateAi] = useState(false);
  const [createMode, setCreateMode] = useState<"create" | "upload">("create");
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  /* Opened from a type tab: the type is already known, so the popup only asks who it is for and takes the file. */
  const [createScoped, setCreateScoped] = useState(false);
  /* A message is written here (or uploaded); every other type is a file or built elsewhere. */
  const [createMessage, setCreateMessage] = useState("");

  /* Multi-select exists for one reason: order matters across several items,
     which is the Learning Path case. */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  /* Assign — one item, individual or group. */
  const [assignItem, setAssignItem] = useState<ContentItem | null>(null);

  /* The expanded workspace. Opens over the studio rather than navigating
     away, so the advisor keeps their filters and selection. */
  const [view, setView] = useState<PageView>("send");
  /* Arriving from another page with ?open=<id> (the dashboard's Upcoming Workshops, say):
     show the Content view on that item's type tab and open its popup. Done during render,
     once per id, so the page never paints the wrong view first. */
  const openId = useSearchParams().get("open");
  const [handledOpenId, setHandledOpenId] = useState<string | null>(null);
  if (openId && handledOpenId !== openId) {
    setHandledOpenId(openId);
    const target = items.find((i) => i.id === openId);
    if (target) {
      setView("library");
      setTab(tabOf(target));
      setSelected(target);
      setDrawerOpen(true);
    }
  }
  /* Sequence Builder seed — a new nonce re-applies the selection. */
  const [builderSeed, setBuilderSeed] = useState<{
    ids: string[];
    nonce: number;
    title?: string;
    note?: string;
    clientId?: string;
    meeting?: MeetingRef;
    reset?: boolean;
  }>({ ids: [], nonce: 0 });
  /* The queue suggestion currently loaded in the composer. */
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);

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

  const tabCounts = useMemo(() => {
    const m = Object.fromEntries(TYPE_TAB_ORDER.map((t) => [t, 0])) as Record<TypeTab, number>;
    for (const i of items) m[tabOf(i)] += 1;
    return m;
  }, [items]);

  /* Templates are reusable; personalised ones are bound to one client. */
  const simCounts = useMemo(() => {
    const sims = items.filter((i) => i.category === "simulation");
    return {
      templates: sims.filter((i) => i.model.kind === "template").length,
      personalized: sims.filter((i) => i.model.kind === "personalized").length,
    };
  }, [items]);

  const checkedCount = checkedIds.size;

  const visible = useMemo(() => {
    let list = items;

    /* Type tab; the board sorts what is left into status columns. */
    list = list.filter((i) => tabOf(i) === tab);
    if (topicFilter !== "all") list = list.filter((i) => i.topic === topicFilter);

    /* Search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.title.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)) || TOPIC_LABEL[i.topic].toLowerCase().includes(q)
      );
    }

    /* Most recently updated first. */
    const sorted = [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted;
  }, [items, tab, topicFilter, search]);

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

  /* ── Moving a card between board columns ──
     Every move changes approval, so it is checked, confirmed and logged.
     Expiry follows the review-by date, so nothing can be dragged into Expired. */
  const [pendingMove, setPendingMove] = useState<{ item: ContentItem; to: ColumnId } | null>(null);

  function canMove(item: ContentItem, to: ColumnId): MoveCheck {
    const from = columnOf(item);
    if (from === to) return { ok: false, reason: "Already here." };
    if (to === "active") return { ok: false, reason: "Content becomes Active when a client starts it. It can't be moved here." };
    if (from === "active" && to === "ready") return { ok: false, reason: "Content moves back on its own once no client is part-way through it." };
    if (to === "expired") return { ok: false, reason: "Content expires on its review-by date. It can't be moved here." };
    if (to === "ready") {
      if (from === "expired") return { ok: false, reason: "Expired content needs a fresh review before it can be approved." };
      const n = blockingOpenCount(item);
      if (n > 0) return { ok: false, reason: `${n} blocking flag${n === 1 ? "" : "s"} must be fixed before this can be approved.` };
    }
    return { ok: true };
  }

  function confirmMove() {
    if (!pendingMove) return;
    const { item, to } = pendingMove;
    if (to === "ready") approveForUse(item.id);
    else removeApproval(item.id);
    setPendingMove(null);
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
  function openCreate(type?: ContentTypeKey, mode: "create" | "upload" = "create", scoped = false) {
    setCreateScoped(scoped && Boolean(type));
    setCreateType(type ?? null);
    setCreateAudience("clients");
    setCreateIntent(type === "simulation" ? "explore" : "learn");
    setCreateAi(false);
    setCreateMode(type && canUpload(type) ? mode : "create");
    setCreateFile(null);
    setCreateMessage("");
    setUploadError(null);
    setCreateOpen(true);
  }

  /** Starts a Draft. The automatic check runs on save, so the new item arrives already checked
      — and still needs the advisor's approval before it can be sent. */
  function createDraft(kind: ContentTypeKey, opts: { audience: ContentAudience; intent: ContentIntent; ai: boolean; file?: File | null; text?: string }) {
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

    /* An uploaded file names the draft and, for images and video, becomes its preview. The check
       reads the title and description; the file's own contents are not read, so it is still the
       advisor's job to review what is inside it. */
    if (opts.file && kind !== "simulation") {
      const f = opts.file;
      const isMedia = f.type.startsWith("image/") || f.type.startsWith("video/");
      draft = {
        ...draft,
        title: f.name.replace(/\.[^.]+$/, "") || draft.title,
        description: `Uploaded file: ${f.name} (${fileSizeLabel(f.size)}).`,
        ...(isMedia ? { mediaUrl: URL.createObjectURL(f) } : {}),
      };
    }

    /* A written message is the content itself, so the check reads all of it. */
    if (opts.text && kind === "message") {
      const oneLine = opts.text.replace(/\s+/g, " ").trim();
      draft = {
        ...draft,
        title: oneLine.length > 60 ? `${oneLine.slice(0, 57)}…` : oneLine,
        description: opts.file ? `${opts.text}\n\nAttached: ${opts.file.name} (${fileSizeLabel(opts.file.size)}).` : opts.text,
      };
    }

    draft = { ...draft, compliance: checkedReview(draft) };
    setItems((prev) => [draft, ...prev]);
    logAudit({
      action: "created",
      itemName: draft.title,
      actor: "advisor",
      detail: `${CONTENT_AUDIENCE_LABEL[opts.audience]} · ${CONTENT_INTENT_LABEL[opts.intent]}${opts.ai ? " · AI-assisted" : ""}${opts.file ? ` · Uploaded ${opts.file.name}` : ""}`,
    });
    setCreateOpen(false);
    setTab(tabOf(draft));
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

  /** Opens the Sequence Builder, seeded with whatever is selected, in table order. */
  function openPathBuilder(seed?: string[]) {
    setBuilderSeed((prev) => ({
      ids: seed ?? visible.filter((i) => checkedIds.has(i.id)).map((i) => i.id),
      nonce: prev.nonce + 1,
    }));
    setActiveQueueId(null);
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
    const fromQueue = pendingQueue.find((x) => x.id === activeQueueId);
    for (const id of p.contentIds) assign(id, p.clientIds, p.channel, p.note || undefined);
    logAudit({
      action: "assigned",
      itemName: p.title,
      actor: "advisor",
      detail: `Learning path of ${p.contentIds.length} item${p.contentIds.length === 1 ? "" : "s"}${p.messages.length ? ` + ${p.messages.length} message${p.messages.length === 1 ? "" : "s"}` : ""} to ${p.clientIds.length} client${p.clientIds.length === 1 ? "" : "s"}${p.note ? ", with a message" : ""}${p.savedAsTemplate ? "; saved as a template" : ""}${p.meeting ? `; follows ${p.meeting.title}, ${p.meeting.date}` : ""}`,
    });
    if (fromQueue) {
      resolveQueueItem(fromQueue, {
        outcome: "sent",
        detail: `Sent from the composer, ${p.contentIds.length} item${p.contentIds.length === 1 ? "" : "s"}${p.messages.length ? ` + ${p.messages.length} message${p.messages.length === 1 ? "" : "s"}` : ""}`,
      });
      setActiveQueueId(null);
    }
  }

  /* ── Review queue decisions ── every one is logged ── */
  const clientNameOf = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? "Client";
  const resolveQueueItem = (q: ReviewQueueItem, r: Omit<ResolvedSend, "id" | "clientName" | "trigger">) => {
    setPendingQueue((prev) => prev.filter((x) => x.id !== q.id));
    if (q.id === activeQueueId) {
      setActiveQueueId(null);
      setBuilderSeed((prev) => ({ ids: [], nonce: prev.nonce + 1, reset: true }));
    }
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

  /** Loads the suggested client into the composer with an empty canvas, replacing whatever was on it. */
  function selectQueueItem(q: ReviewQueueItem) {
    setBuilderSeed((prev) => ({
      /* The canvas starts empty: the client, title and message are filled in, and the content comes
         from Finny's suggestions or from the advisor adding it, not pre-loaded. */
      ids: [],
      nonce: prev.nonce + 1,
      reset: true,
      title: q.meeting ? `${q.meeting.title} follow-up` : `${SEND_TRIGGER_LABEL[q.trigger]} for ${clientNameOf(q.clientId)}`,
      note: q.message,
      clientId: q.clientId,
      meeting: q.meeting,
    }));
    setActiveQueueId(q.id);
  }

  /** A blank package, not tied to a suggestion. */
  function newSend() {
    setBuilderSeed((prev) => ({ ids: [], nonce: prev.nonce + 1, reset: true }));
    setActiveQueueId(null);
  }

  return (
    <AppShell>
      {/* In the Send view (desktop), the page stops scrolling and the builder
          fills the remaining height; its three columns scroll on their own. */}
      <PageFrame width="full" title="Content Management" description="Assign content to clients and leads, and manage the content library." lockHeight={view === "send"} tabs={
        <Tabs value={view} onValueChange={(v) => setView(v as PageView)} variant="pill">
              <TabsList aria-label="Content Management view">
                <TabsTrigger value="send" icon={<Send size={16} strokeWidth={1.75} />}>
                  Assign content
                  {pendingQueue.length > 0 && (
                    <span className="ml-1 text-xs font-semibold text-[var(--text-status-warning)] bg-[var(--bg-status-warning-subtle)] px-2 py-0.5 rounded-full tabular-nums">
                      {pendingQueue.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="library" icon={<Library size={16} strokeWidth={1.75} />}>
                  Content
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
      } actions={
        <Button variant="primary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={() => openCreate()}>
          Create / Upload Content
        </Button>
      }>
          {/* ══ Send to clients — the Sequence Builder ══
              Kept mounted (hidden) so a half-built sequence survives a trip
              to the Library. */}
          {view === "marketing" && <MarketingZone items={items} />}
          {view === "log" && <SendLog entries={[...auditLog, ...marketingEvents, ...noteEvents]} />}

          <div hidden={view !== "send"} className="xl:flex-1 xl:min-h-0">
            <SendWorkspace
              pending={pendingQueue}
              resolved={resolvedQueue}
              items={items}
              clients={CLIENTS}
              activeId={activeQueueId}
              seed={builderSeed}
              onSelect={selectQueueItem}
              onNew={newSend}
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
          <div className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] px-5 py-4">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] shrink-0 flex items-center justify-center bg-[var(--bg-primary)] text-[var(--icon-brand-primary)]">
              {tab === "simulation" ? <FlaskConical size={18} strokeWidth={1.75} /> : canUpload(tab) ? <Upload size={18} strokeWidth={1.75} /> : <Plus size={18} strokeWidth={2} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{tab === "simulation" ? "Simulation templates" : CONTENT_TYPE_LABEL[tab]}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed max-w-[70ch]">
                {tab === "simulation"
                  ? "Build the environment once. Finny then personalises it per client, synced from their goal and your plan recommendation."
                  : tab === "workshop"
                    ? "Online and offline sessions clients can be invited to."
                    : "Add to a package, or assign to clients and groups."}
              </p>
              {tab === "simulation" && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1 tabular-nums">
                  {simCounts.templates} template{simCounts.templates === 1 ? "" : "s"} · {simCounts.personalized} personalised
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="md"
              className="shrink-0"
              leadingIcon={canUpload(tab) ? <Upload size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
              onClick={() => openCreate(tab, canUpload(tab) ? "upload" : "create", true)}
            >
              {tab === "message" ? "Add content" : canUpload(tab) ? "Upload content" : tab === "simulation" ? "Create template" : "Create content"}
            </Button>
          </div>

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

              <SelectField size="sm" className="w-[140px]" aria-label="Topic" value={topicFilter} onValueChange={(v: unknown) => setTopicFilter(v as Topic | "all")} items={{ all: "All topics", ...TOPIC_LABEL }}>
                <SelectItem value="all">All topics</SelectItem>
                {(Object.keys(TOPIC_LABEL) as Topic[]).map((t) => (
                  <SelectItem key={t} value={t}>{TOPIC_LABEL[t]}</SelectItem>
                ))}
              </SelectField>

            </div>

          </div>

          {/* ══ Table ══ */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs text-[var(--text-tertiary)]">
                {visible.length} item{visible.length === 1 ? "" : "s"}
              </p>
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

            <ContentBoard
              items={visible}
              selectedId={selected?.id ?? null}
              onSelect={(item) => { setSelected(item); setDrawerTab(undefined); setDrawerOpen(true); }}
              checkedIds={checkedIds}
              onToggleChecked={toggleChecked}
              lastSent={lastSent}
              canMove={canMove}
              onMove={(item, to) => setPendingMove({ item, to })}
              onSend={(item) => openPathBuilder([item.id])}
              onReview={(item) => { setSelected(item); setDrawerTab("compliance"); setDrawerOpen(true); }}
              empty={<LibraryEmpty filtered={Boolean(search.trim()) || topicFilter !== "all"} onCreate={() => openCreate()} />}
            />
          </div>
          </>)}
      </PageFrame>

      {/* ══ Confirm a board move ══ */}
      <Modal open={pendingMove !== null} onOpenChange={(o) => !o && setPendingMove(null)}>
        <ModalContent className="max-w-[440px]">
          <div className="px-5 pt-5 pb-4 pr-14">
            <ModalTitle>{pendingMove?.to === "ready" ? "Approve for use?" : "Send back for review?"}</ModalTitle>
            <ModalDescription className="mt-1">
              {pendingMove?.to === "ready"
                ? `“${pendingMove?.item.title}” will be approved by Anita Sharma and can then be sent to clients. This is logged.`
                : `“${pendingMove?.item.title}” will lose its approval and go back to Draft. It can't be sent until it is approved again.${pendingMove && activeClientCount(pendingMove.item) > 0 ? ` ${activeClientCount(pendingMove.item)} client${activeClientCount(pendingMove.item) === 1 ? " is" : "s are"} part-way through it.` : ""} This is logged.`}
            </ModalDescription>
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--border-tertiary)] px-5 py-3">
            <Button variant="tertiary" size="sm" onClick={() => setPendingMove(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={confirmMove}>
              {pendingMove?.to === "ready" ? "Approve" : "Send back"}
            </Button>
          </div>
        </ModalContent>
      </Modal>

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
            <ModalTitle>{createScoped ? (createType === "message" ? "Add content" : canUpload(createType) ? "Upload content" : "Create content") : "Create / Upload Content"}</ModalTitle>
            <ModalDescription className="mt-0.5">
              {createScoped
                ? `Choose who it is for${createType === "message" ? ", then write it or add a file" : canUpload(createType) ? ", then add your file" : ""}. It is checked for compliance before it can be sent.`
                : "Pick who it's for and a type, then create it here or upload a file you made elsewhere. Either way it is checked for compliance before it can be sent."}
            </ModalDescription>
          </div>

          <div className="overflow-y-auto pb-2">
            {/* Step 1 — audience decides the rules, so it comes first */}
            <fieldset className="px-5 mt-6">
              <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Who is it for?</legend>
              <div role="radiogroup" aria-label="Audience" className="grid grid-cols-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] overflow-hidden divide-x divide-[var(--border-tertiary)]">
                {(Object.keys(CONTENT_AUDIENCE_LABEL) as ContentAudience[]).map((a) => {
                  const on = createAudience === a;
                  const blocked = createScoped && createType ? typeDisabledReason(createType, a) : null;
                  return (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={Boolean(blocked)}
                      title={blocked ?? undefined}
                      onClick={() => {
                        setCreateAudience(a);
                        if (!createScoped && createType && typeDisabledReason(createType, a)) setCreateType(null);
                      }}
                      className={cn("px-3 py-2.5 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed", on ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]")}
                    >
                      <p className={cn("text-sm font-semibold", on ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{CONTENT_AUDIENCE_LABEL[a]}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug">{CONTENT_AUDIENCE_HINT[a]}</p>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Step 2 — the one type list; types that don't fit the audience say why */}
            {!createScoped && (
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
                              if (!canUpload(t)) {
                                setCreateMode("create");
                                setCreateFile(null);
                                setUploadError(null);
                              }
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
            )}

            {/* Step 3 — settings, once a type is picked */}
            {createType && (
              <div className="px-5 pt-4 space-y-4">
                {canUpload(createType) && (
                  <fieldset>
                    {!createScoped && createType !== "message" && <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">How do you want to add it?</legend>}
                    {!createScoped && createType !== "message" && <div role="radiogroup" aria-label="Create or upload" className="grid grid-cols-2 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] overflow-hidden divide-x divide-[var(--border-tertiary)]">
                      {([
                        { id: "create", title: "Create here", hint: "Start an empty draft" },
                        { id: "upload", title: "Upload a file", hint: "Made in PowerPoint, Canva or similar" },
                      ] as const).map((m) => {
                        const on = createMode === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setCreateMode(m.id)}
                            className={cn("px-3 py-2.5 text-left transition-colors", on ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]")}
                          >
                            <p className={cn("text-sm font-semibold", on ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{m.title}</p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{m.hint}</p>
                          </button>
                        );
                      })}
                    </div>}

                    {createType === "message" && (
                      <Textarea
                        label="Message"
                        rows={6}
                        value={createMessage}
                        onChange={(e) => setCreateMessage(e.target.value)}
                        placeholder="Write the message the client will receive"
                        hint="The compliance check reads this text."
                      />
                    )}

                    {(createMode === "upload" || createType === "message") && (
                      <div className={createScoped && createType !== "message" ? "" : "mt-3"}>
                        {createType === "message" && <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Or upload a file</p>}
                        {createFile ? (
                          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-3 py-2.5">
                            <FileUp size={18} strokeWidth={1.75} className="shrink-0 text-[var(--icon-brand-primary)]" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{createFile.name}</p>
                              <p className="text-xs text-[var(--text-tertiary)]">{fileSizeLabel(createFile.size)}</p>
                            </div>
                            <Button variant="tertiary" size="sm" iconOnly aria-label="Remove file" leadingIcon={<XIcon size={14} strokeWidth={2} />} onClick={() => setCreateFile(null)} />
                          </div>
                        ) : (
                          <label
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOver(false);
                              const f = e.dataTransfer.files?.[0];
                              if (!f) return;
                              if (f.size > UPLOAD_MAX_MB * 1048576) setUploadError(`That file is over ${UPLOAD_MAX_MB} MB.`);
                              else {
                                setUploadError(null);
                                setCreateFile(f);
                              }
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border border-dashed px-4 py-6 text-center cursor-pointer transition-colors",
                              "focus-within:ring-2 focus-within:ring-[var(--border-brand-primary)]",
                              dragOver ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]" : "border-[var(--border-secondary)] hover:bg-[var(--bg-secondary)]"
                            )}
                          >
                            <Upload size={20} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" aria-hidden="true" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">Drop a file here, or click to browse</span>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {UPLOAD_ACCEPT[createType]?.hint} · up to {UPLOAD_MAX_MB} MB
                            </span>
                            <input
                              type="file"
                              accept={UPLOAD_ACCEPT[createType]?.accept}
                              className="sr-only"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                e.target.value = "";
                                if (!f) return;
                                if (f.size > UPLOAD_MAX_MB * 1048576) setUploadError(`That file is over ${UPLOAD_MAX_MB} MB.`);
                                else {
                                  setUploadError(null);
                                  setCreateFile(f);
                                }
                              }}
                            />
                          </label>
                        )}
                        {uploadError && <p role="alert" className="text-xs text-[var(--text-status-error)] mt-1.5">{uploadError}</p>}
                        <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                          The compliance check reads the title and description. It does not read the inside of the file, so review that yourself before approving.
                        </p>
                      </div>
                    )}
                  </fieldset>
                )}
                {!createScoped && (<>
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
                </>)}
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
              disabled={!createType || (createType === "message" ? !createMessage.trim() && !createFile : createMode === "upload" && canUpload(createType) && !createFile)}
              onClick={() =>
                createType &&
                createDraft(createType, {
                  audience: createAudience,
                  intent: createIntent,
                  ai: createAi,
                  file: (createMode === "upload" || createType === "message") && canUpload(createType) ? createFile : null,
                  text: createType === "message" ? createMessage.trim() : undefined,
                })
              }
            >
              {createType === "message" ? (createFile ? "Upload & check" : "Save & check") : createMode === "upload" && canUpload(createType) ? "Upload & check" : createScoped ? "Create draft" : "Start draft"}
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

/* ─── Empty state for a type with no content ─── */
function LibraryEmpty({ filtered, onCreate }: { filtered: boolean; onCreate: () => void }) {
  if (filtered) {
    return (
      <>
        <p className="text-sm font-medium text-[var(--text-secondary)]">No content matches these filters</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Try a different topic or search term.</p>
      </>
    );
  }
  return (
    <>
      <p className="text-sm font-medium text-[var(--text-secondary)]">No content of this type yet.</p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={onCreate}>
        Upload / Create Content
      </Button>
    </>
  );
}
