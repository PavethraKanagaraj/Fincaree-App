"use client";

/* ============================================================
   SequenceBuilder — the "Sequence Builder" tab of Content Management

   Left     Add content, one tab per kind of step: Learning path ·
            PDF · Video · Image/Post · Message · Simulation · Workshop ·
            Presentation. It sits next to the canvas so a
            drag is a short move left → right. Only approved, published
            content is offered — sending anything else to a client
            would skip compliance review.
   Centre   The canvas: the ordered steps a client will receive.
            Steps are dragged in, reordered by drag, or moved with the
            up/down buttons (the keyboard path — drag and drop alone
            isn't operable without a pointer).
   Right    Who it goes to (one client or a group), how, and an
            optional message that goes with it.

   Simulations are built in the Simulations menu. Here they show a
   short description and an "Edit variables" action that opens the
   existing simulation editor, so the numbers can be tuned before
   the sequence goes out.
   ============================================================ */

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/fincaree/button";
import { Input } from "@/components/fincaree/input";
import { Textarea } from "@/components/fincaree/textarea";
import { Checkbox } from "@/components/fincaree/checkbox";
import { Badge } from "@/components/fincaree/badge";
import { Avatar, AvatarGroup } from "@/components/fincaree/avatar";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
} from "@/components/fincaree/tabs";
import { cn } from "@/lib/utils";
import {
  type Client,
  type ContentItem,
  type DeliveryChannel,
  DELIVERY_CHANNEL_LABEL,
  DELIVERY_CHANNEL_HINT,
  TOPIC_LABEL,
} from "./content-data";
import {
  adviceLanguage,
  holdReason,
  isSendableToClients,
  MEETING_TEMPLATES,
  RECENT_MEETINGS,
  type MeetingRef,
} from "./delivery-data";
import {
  LEARNING_PATHS,
  insightFor,
  type SavedLearningPath,
} from "./learning-path-data";
import { getTypeVisual, itemMeta, typeLabel } from "./content-visual";
import {
  AlertTriangle,
  ArrowDown,
  BookmarkPlus,
  ArrowUp,
  CheckCircle2,
  FileText,
  FlaskConical,
  GripVertical,
  Image as ImageIcon,
  MessageSquare,
  MonitorPlay,
  Play,
  Plus,
  Presentation,
  Route,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

/* ─── Model ─── */

type Step =
  | { uid: string; kind: "content"; contentId: string }
  | { uid: string; kind: "path"; pathId: string }
  | { uid: string; kind: "message"; text: string };

type Insertable =
  | { kind: "content"; contentId: string }
  | { kind: "path"; pathId: string }
  | { kind: "message"; text: string };

type DragPayload = Insertable | { kind: "step"; uid: string };

type RecipientMode = "client" | "group";

/* The left panel's tabs, in the order the advisor asked for. */
type PickerTab =
  | "path"
  | "pdf"
  | "video"
  | "image-post"
  | "message"
  | "simulation"
  | "workshop"
  | "presentation";

/* Icons match the ones used for these types across the app. */
const PICKER_TABS: { id: PickerTab; label: string; icon: React.ReactNode }[] = [
  { id: "path", label: "Learning path", icon: <Route strokeWidth={1.75} /> },
  { id: "pdf", label: "PDF", icon: <FileText strokeWidth={1.75} /> },
  { id: "video", label: "Video", icon: <Play strokeWidth={1.75} /> },
  {
    id: "image-post",
    label: "Image/Post",
    icon: <ImageIcon strokeWidth={1.75} />,
  },
  {
    id: "message",
    label: "Message",
    icon: <MessageSquare strokeWidth={1.75} />,
  },
  {
    id: "simulation",
    label: "Simulation",
    icon: <FlaskConical strokeWidth={1.75} />,
  },
  {
    id: "workshop",
    label: "Workshop",
    icon: <Presentation strokeWidth={1.75} />,
  },
  {
    id: "presentation",
    label: "Presentation",
    icon: <MonitorPlay strokeWidth={1.75} />,
  },
];

/** Which content items belong on a tab. Learning path, Message and Presentation have none. */
function inTab(item: ContentItem, tab: PickerTab): boolean {
  if (tab === "simulation") return item.category === "simulation";
  if (tab === "workshop") return item.category === "workshop";
  if (tab === "pdf" || tab === "video" || tab === "image-post")
    return item.category === "learning" && item.format === tab;
  return false;
}

export interface SequenceSendPayload {
  title: string;
  description: string;
  clientIds: string[];
  /** Flattened, in delivery order (learning paths expanded). */
  contentIds: string[];
  /** Advisor-written messages, with the step they go out at (1-based). */
  messages: { step: number; text: string }[];
  channel: DeliveryChannel;
  /** Advisor's note sent to every recipient with the learning path. */
  note: string;
  /** Also saved as a reusable learning path template. */
  savedAsTemplate: boolean;
  /** The meeting this package follows up, when it was started from one. */
  meeting?: MeetingRef;
}

interface SequenceBuilderProps {
  items: ContentItem[];
  clients: Client[];
  /** Content ids to start the canvas with; a new `nonce` re-applies them. */
  seed?: {
    ids: string[];
    nonce: number;
    /** Starting values when a package begins from a meeting or a queued suggestion. */
    title?: string;
    note?: string;
    clientId?: string;
    meeting?: MeetingRef;
  };
  onEditSimulation: (item: ContentItem) => void;
  onSend: (payload: SequenceSendPayload) => void;
}

let uidCounter = 0;
const nextUid = () => `step-${++uidCounter}`;

/** Only Approved content written for subscribed clients can be sent. Everything else
    stays visible in the picker, greyed out, with the reason. */
const isSendable = isSendableToClients;

/* ════════════════════════════════════════════════ */
export function SequenceBuilder({
  items,
  clients,
  seed,
  onEditSimulation,
  onSend,
}: SequenceBuilderProps) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  /* Learning path templates: the library's paths plus any the advisor saves
     here. Kept in state so a newly saved path is reusable straight away. */
  const [savedPaths, setSavedPaths] = useState<SavedLearningPath[]>(LEARNING_PATHS);
  /* What was last saved as a template (name + items), so the button can show
     "Saved" until the path changes. Saving and sending are independent. */
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const nameRef = useRef<HTMLInputElement>(null);
  const pathById = useMemo(
    () => new Map(savedPaths.map((p) => [p.id, p])),
    [savedPaths],
  );

  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [meeting, setMeeting] = useState<MeetingRef | null>(null);
  /* What the linked meeting was for; Finny uses it to pick matching content. */
  const [purposeId, setPurposeId] = useState<string | null>(null);
  const [mode, setMode] = useState<RecipientMode>("client");
  const [clientId, setClientId] = useState<string | null>(null);
  const [groupIds, setGroupIds] = useState<Set<string>>(new Set());
  const [clientQuery, setClientQuery] = useState("");
  const [channel, setChannel] = useState<DeliveryChannel>("portal");
  const [pickerTab, setPickerTab] = useState<PickerTab>("path");
  const [contentQuery, setContentQuery] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  /** Why some selected rows didn't make it onto the canvas. */
  const [notice, setNotice] = useState<string | null>(null);

  /* Drag state — a ref, because dragover can't read dataTransfer. */
  const drag = useRef<DragPayload | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  /* Seed from the table selection ("Create Learning Path"). Adjusted during
     render, not in an effect, so the canvas never paints unseeded first. */
  const [seenNonce, setSeenNonce] = useState(seed?.nonce ?? 0);
  if (seed && seed.nonce !== seenNonce) {
    setSeenNonce(seed.nonce);
    const have = new Set(
      steps.flatMap((s) => (s.kind === "content" ? [s.contentId] : [])),
    );
    const fresh = seed.ids.filter((id) => !have.has(id) && byId.has(id));
    const held = fresh.filter((id) => !isSendable(byId.get(id)!));
    const add = fresh
      .filter((id) => isSendable(byId.get(id)!))
      .map((id): Step => ({ uid: nextUid(), kind: "content", contentId: id }));
    if (add.length) setSteps([...steps, ...add]);
    if (seed.title !== undefined) setTitle(seed.title);
    if (seed.note !== undefined) setNote(seed.note);
    if (seed.clientId) {
      setMode("client");
      setClientId(seed.clientId);
    }
    setMeeting(seed.meeting ?? null);
    setPurposeId(null);
    setSent(null);
    setNotice(
      held.length
        ? `${held.length === 1 ? `“${byId.get(held[0])!.title}” wasn't` : `${held.length} selected items weren't`} added — only Approved content written for clients can be sent. Finish its check first.`
        : null,
    );
  }

  /* ── Step helpers ── */

  const stepLabel = (s: Step | Insertable) =>
    s.kind === "content"
      ? (byId.get(s.contentId)?.title ?? "Content")
      : s.kind === "path"
        ? (pathById.get(s.pathId)?.title ?? "Learning path")
        : "Message";

  /** Content and paths can appear once; messages can repeat. */
  const onCanvas = (p: Insertable) =>
    p.kind !== "message" &&
    steps.some((s) =>
      p.kind === "content"
        ? s.kind === "content" && s.contentId === p.contentId
        : s.kind === "path" && s.pathId === p.pathId,
    );

  function insert(p: Insertable, at = steps.length) {
    if (onCanvas(p)) return;
    if (p.kind === "message" && !p.text.trim()) return;
    const step: Step =
      p.kind === "content"
        ? { uid: nextUid(), kind: "content", contentId: p.contentId }
        : p.kind === "path"
          ? { uid: nextUid(), kind: "path", pathId: p.pathId }
          : { uid: nextUid(), kind: "message", text: p.text.trim() };
    const next = [...steps];
    next.splice(at, 0, step);
    setSteps(next);
    setSent(null);
    if (p.kind === "message") setDraftMessage("");
    setAnnouncement(
      `Added ${stepLabel(p)} as step ${at + 1} of ${next.length}.`,
    );
  }

  function move(uid: string, to: number) {
    const from = steps.findIndex((s) => s.uid === uid);
    if (from < 0) return;
    const next = [...steps];
    const [s] = next.splice(from, 1);
    const target = Math.max(0, Math.min(to > from ? to - 1 : to, next.length));
    next.splice(target, 0, s);
    setSteps(next);
    if (target !== from)
      setAnnouncement(
        `Moved ${stepLabel(s)} to step ${target + 1} of ${next.length}.`,
      );
  }

  function remove(uid: string) {
    const s = steps.find((x) => x.uid === uid);
    setSteps((prev) => prev.filter((x) => x.uid !== uid));
    if (s) setAnnouncement(`Removed ${stepLabel(s)}.`);
  }

  /* ── Drag and drop ── */

  function startDrag(e: React.DragEvent, payload: DragPayload) {
    drag.current = payload;
    e.dataTransfer.effectAllowed = payload.kind === "step" ? "move" : "copy";
    e.dataTransfer.setData("text/plain", payload.kind);
  }

  function endDrag() {
    drag.current = null;
    setDropIndex(null);
  }

  /** Over a step: drop before it in its top half, after it in its bottom half. */
  function overStep(e: React.DragEvent, index: number) {
    if (!drag.current) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setDropIndex(e.clientY < r.top + r.height / 2 ? index : index + 1);
  }

  function drop(e: React.DragEvent) {
    e.preventDefault();
    const p = drag.current;
    const at = dropIndex ?? steps.length;
    if (p?.kind === "step") move(p.uid, at);
    else if (p) insert(p, at);
    endDrag();
  }

  /* ── Recipients ── */

  const recipients: string[] =
    mode === "client" ? (clientId ? [clientId] : []) : [...groupIds];

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    return q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            TOPIC_LABEL[c.primaryGoal].toLowerCase().includes(q),
        )
      : clients;
  }, [clients, clientQuery]);

  const shownSelected = filteredClients.filter((c) =>
    groupIds.has(c.id),
  ).length;
  const allShownSelected =
    filteredClients.length > 0 && shownSelected === filteredClients.length;

  function toggleAllShown() {
    setGroupIds((prev) => {
      const next = new Set(prev);
      for (const c of filteredClients) {
        if (allShownSelected) next.delete(c.id);
        else next.add(c.id);
      }
      return next;
    });
  }

  /* ── Picker lists ── */

  const q = contentQuery.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);
  const pickPaths = savedPaths.filter((p) => matches(p.title));
  const tabItems = (tab: PickerTab) => items.filter((i) => inTab(i, tab));
  /** The number on each type tile: what can be added (following the search),
      or for Message — which has nothing to pick — the messages already in the
      sequence. */
  const tabCount = (tab: PickerTab): number =>
    tab === "message"
      ? steps.filter((s) => s.kind === "message").length
      : tab === "path"
        ? pickPaths.length
        : tabItems(tab).filter((i) => isSendable(i) && matches(i.title)).length;

  /* ── Finny suggestions for the selected client ──
     Finny's insight when it has one (its reasoning per item is shown, so the
     advisor can audit it); otherwise approved content matching the client's
     primary goal, labelled as such. Only sendable content is suggested. */
  const purpose = MEETING_TEMPLATES.find((t) => t.id === purposeId) ?? null;
  const suggestion = useMemo(() => {
    if (mode !== "client" || !clientId) return null;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return null;
    const first = client.name.split(" ")[0];
    const insight = insightFor(clientId);
    const goal = TOPIC_LABEL[client.primaryGoal];

    /* Meeting-purpose picks lead, so a post-meeting package starts with what
       the meeting was about; Finny's own picks follow. */
    const fromMeeting = (purpose?.contentIds ?? [])
      .map((id) => byId.get(id))
      .filter((i): i is ContentItem => Boolean(i))
      .map((item) => ({ item, because: `Fits your ${purpose!.purpose.toLowerCase()}` }));
    const meetingSignals = meeting && purpose ? [`${meeting.title} · ${meeting.date} — ${purpose.purpose}`] : [];

    let own: { item: ContentItem; because: string }[];
    let heldOwn = 0;
    let signals: string[];
    let headline: string;
    if (insight) {
      const all = insight.sequence
        .map((st) => ({ item: byId.get(st.contentId), because: st.because }))
        .filter((x): x is { item: ContentItem; because: string } => Boolean(x.item));
      own = all.filter((x) => isSendable(x.item));
      heldOwn = all.length - own.length;
      signals = insight.signals;
      headline = insight.headline;
    } else {
      own = items
        .filter((i) => i.topic === client.primaryGoal && isSendable(i))
        .slice(0, 3)
        .map((item) => ({ item, because: `Matches ${first}'s primary goal — ${goal}` }));
      signals = [`Primary goal: ${goal}`, `${client.plan} plan`, `Next review in ${client.nextReviewInDays} days`];
      headline = own.length
        ? `Nothing specific is flagged for ${first} yet, so these match their primary goal: ${goal}.`
        : `No approved content matches ${first}'s primary goal (${goal}) yet.`;
    }

    const sendableMeeting = fromMeeting.filter((x) => isSendable(x.item));
    const seen = new Set(sendableMeeting.map((x) => x.item.id));
    const picks = [...sendableMeeting, ...own.filter((x) => !seen.has(x.item.id))];
    if (purpose && meeting && sendableMeeting.length) {
      headline = `Following up ${meeting.title} (${meeting.date}): ${purpose.purpose.toLowerCase()} content first, then more for ${first}.`;
    }
    return {
      client,
      first,
      headline,
      signals: [...meetingSignals, ...signals],
      picks,
      held: heldOwn + (fromMeeting.length - sendableMeeting.length),
    };
  }, [mode, clientId, clients, byId, items, meeting, purpose]);

  /** Adds several content items at the end, skipping any already on the canvas. */
  function insertMany(ids: string[]) {
    const have = new Set(steps.flatMap((st) => (st.kind === "content" ? [st.contentId] : [])));
    const add = ids
      .filter((id) => !have.has(id))
      .map((id): Step => ({ uid: nextUid(), kind: "content", contentId: id }));
    if (!add.length) return;
    setSteps([...steps, ...add]);
    setSent(null);
    setAnnouncement(`Added ${add.length} suggested item${add.length === 1 ? "" : "s"} to the learning path.`);
  }

  function applySuggestion() {
    if (!suggestion) return;
    insertMany(suggestion.picks.map((x) => x.item.id));
    if (!title.trim() && suggestion.picks.length > 1)
      setTitle(purpose ? purpose.title : `${TOPIC_LABEL[suggestion.picks[0].item.topic]} for ${suggestion.first}`);
    if (purpose && !note.trim()) setNote(purpose.note);
  }

  /* ── Send ── */

  const flatContentIds = steps.flatMap((s) =>
    s.kind === "content"
      ? [s.contentId]
      : s.kind === "path"
        ? (pathById.get(s.pathId)?.contentIds ?? [])
        : [],
  );
  const uniqueContentIds = [...new Set(flatContentIds)];
  const messages = steps.flatMap((s, i) =>
    s.kind === "message" ? [{ step: i + 1, text: s.text }] : [],
  );
  const recipientName =
    recipients.length === 1
      ? (clients.find((c) => c.id === recipients[0])?.name ?? "1 client")
      : `${recipients.length} clients`;
  /* A template only makes sense for two or more pieces of content; a single
     item or a note is sent as-is. */
  const canSaveTemplate = uniqueContentIds.length >= 2;
  const signature = `${title.trim()}|${uniqueContentIds.join(",")}`;
  const isSaved = savedSignature === signature;
  /* Education versus advice: a recommendation belongs in the Advice flow. */
  const adviceHit = adviceLanguage([note, ...messages.map((m) => m.text)].join(" "));

  const blocker =
    steps.length === 0
      ? "Add at least one step to the canvas."
      : recipients.length === 0
        ? "Choose who receives this learning path."
        : adviceHit
          ? `Your message reads like a recommendation (“${adviceHit}”). Issue it through the Advice flow, or reword it as education.`
          : null;

  function saveTemplate() {
    if (!canSaveTemplate || isSaved) return;
    const name = title.trim();
    if (!name) {
      setNameError("Name the learning path to save it as a template.");
      nameRef.current?.focus();
      return;
    }
    setSavedPaths((prev) => [
      ...prev,
      {
        id: `lp-${Date.now()}`,
        title: name,
        description: description.trim() || `${uniqueContentIds.length} items.`,
        // Messages are written for one client, so they aren't part of the template.
        contentIds: uniqueContentIds,
      },
    ]);
    setSavedSignature(signature);
    setAnnouncement(`Saved “${name}” as a learning path template. Find it under Learning path to reuse it.`);
  }

  const summary = [
    uniqueContentIds.length &&
      `${uniqueContentIds.length} item${uniqueContentIds.length === 1 ? "" : "s"}`,
    messages.length &&
      `${messages.length} message${messages.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" + ");

  function send() {
    if (blocker) return;
    const name = title.trim() || "Untitled learning path";
    onSend({
      title: name,
      description: description.trim(),
      clientIds: recipients,
      contentIds: uniqueContentIds,
      messages,
      channel,
      note: note.trim(),
      savedAsTemplate: isSaved,
      meeting: meeting ?? undefined,
    });
    setSent(
      `“${name}” is on its way to ${recipientName} — ${summary}, in order, via ${DELIVERY_CHANNEL_LABEL[channel]}${note.trim() ? ", with your message" : ""}.`,
    );
    setSavedSignature(null);
    setSteps([]);
    setTitle("");
    setDescription("");
    setNote("");
    setMeeting(null);
    setClientId(null);
    setGroupIds(new Set());
  }

  /* ════════ Render ════════
     One bordered workspace, three columns split by dividers. On desktop it
     fills the height the page gives it and each column scrolls on its own,
     with its header and footer fixed; below xl the columns stack. */
  return (
    <section
      aria-label="Learning path builder"
      className="flex flex-col xl:grid xl:h-full xl:grid-cols-[380px_minmax(0,1fr)_340px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)]"
    >
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* ══ Left — Add content ══ */}
      <aside
        aria-label="Add content"
        className="flex flex-col min-h-0 border-b xl:border-b-0 xl:border-r border-[var(--border-tertiary)]"
      >
        <div className="shrink-0 flex flex-col gap-3 px-4 pt-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Add content
          </h2>
          <Input
            size="sm"
            aria-label="Search content"
            placeholder="Search by title…"
            value={contentQuery}
            onChange={(e) => setContentQuery(e.target.value)}
            leadingIcon={<Search size={14} strokeWidth={1.75} />}
          />
        </div>

        {/* Type grid stays put; only the list below it scrolls. */}
        <Tabs
          value={pickerTab}
          onValueChange={(v) => setPickerTab(v as PickerTab)}
          variant="pill"
          className="flex-1 min-h-0 !gap-3 pt-3"
        >
          {/* Eight types don't fit one row of the panel. An even 2-column grid
              keeps every type visible without the ragged wrap of pills. */}
          <div className="shrink-0 px-4">
            <TabsList
              aria-label="Content type"
              className="grid w-full grid-cols-2"
            >
              {PICKER_TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  icon={t.icon}
                  className="w-full justify-start !px-2.5"
                >
                  {t.label}
                  <span className="ml-auto pl-2 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">
                    {tabCount(t.id)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {PICKER_TABS.map((t) => (
            <TabsPanel
              key={t.id}
              value={t.id}
              className="relative flex-1 min-h-0 max-h-[420px] xl:max-h-none overflow-y-auto px-4 pb-4"
            >
              {t.id === "path" ? (
                <ul className="flex flex-col gap-1.5">
                  {pickPaths.map((p) => (
                    <PickerRow
                      key={p.id}
                      icon={<Route size={14} strokeWidth={1.75} />}
                      tile="bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]"
                      title={p.title}
                      meta={`Learning path · ${p.contentIds.length} items`}
                      added={onCanvas({ kind: "path", pathId: p.id })}
                      onAdd={() => insert({ kind: "path", pathId: p.id })}
                      onDragStart={(e) =>
                        startDrag(e, { kind: "path", pathId: p.id })
                      }
                      onDragEnd={endDrag}
                    />
                  ))}
                  {pickPaths.length === 0 && (
                    <li className="py-3 text-xs text-[var(--text-tertiary)]">
                      Nothing matches.
                    </li>
                  )}
                </ul>
              ) : t.id === "message" ? (
                <MessageComposer
                  value={draftMessage}
                  onChange={setDraftMessage}
                  onAdd={() => insert({ kind: "message", text: draftMessage })}
                  onDragStart={(e) =>
                    startDrag(e, { kind: "message", text: draftMessage })
                  }
                  onDragEnd={endDrag}
                />
              ) : t.id === "presentation" ? (
                <EmptyTab
                  icon={<Presentation size={20} strokeWidth={1.5} />}
                  title="No presentations yet"
                  body="Approved presentations will appear here once they're added to the library."
                />
              ) : (
                <ContentTabList
                  all={tabItems(t.id)}
                  matches={matches}
                  onCanvas={(id) =>
                    onCanvas({ kind: "content", contentId: id })
                  }
                  onAdd={(id) => insert({ kind: "content", contentId: id })}
                  onDragStart={(e, id) =>
                    startDrag(e, { kind: "content", contentId: id })
                  }
                  onDragEnd={endDrag}
                />
              )}
            </TabsPanel>
          ))}
        </Tabs>

        <p className="shrink-0 border-t border-[var(--border-tertiary)] px-4 py-3 text-xs text-[var(--text-tertiary)]">
          Drag into the learning path, or click + to add
        </p>
      </aside>

      {/* ══ Centre — Canvas ══ */}
      <div className="flex flex-col min-h-0 border-b xl:border-b-0 xl:border-r border-[var(--border-tertiary)]">
        <div className="shrink-0 flex flex-col gap-3 px-5 py-4 border-b border-[var(--border-tertiary)]">
          <div className="flex items-center gap-2">
            <Route
              size={16}
              strokeWidth={1.75}
              className="text-[var(--icon-brand-primary)]"
              aria-hidden="true"
            />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Build learning path
            </h2>
            {/* Saving is about the path itself, so it sits with its name and
                description — separate from sending, which is per client. */}
            <div className="ml-auto flex items-center gap-2">
              {canSaveTemplate && !isSaved && (
                <span id="save-template-hint" className="hidden text-xs text-[var(--text-tertiary)] 2xl:inline">
                  Reuse it for other clients
                </span>
              )}
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={
                  isSaved ? (
                    <CheckCircle2 size={14} strokeWidth={2} />
                  ) : (
                    <BookmarkPlus size={14} strokeWidth={1.75} />
                  )
                }
                disabled={!canSaveTemplate || isSaved}
                aria-describedby={canSaveTemplate ? undefined : "save-template-why"}
                title={
                  canSaveTemplate
                    ? "Save this path to reuse it for other clients"
                    : "Add two or more pieces of content to save a template"
                }
                onClick={saveTemplate}
              >
                {isSaved ? "Saved as template" : "Save as template"}
              </Button>
              <span id="save-template-why" className="sr-only">
                Add two or more pieces of content to save a template.
              </span>
            </div>
          </div>
          {/* Name and description side by side; they stack on narrow widths. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              ref={nameRef}
              size="sm"
              label="Learning path name"
              placeholder="e.g. Retirement readiness for Anika"
              value={title}
              error={nameError}
              onChange={(e) => {
                setTitle(e.target.value);
                setNameError(undefined);
              }}
            />
            <Input
              size="sm"
              label="Description"
              placeholder="What this helps the client do…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {meeting && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-2">
              <span className="font-semibold text-[var(--text-primary)]">Linked to meeting:</span>
              {meeting.title} · {meeting.date}
              <button
                type="button"
                onClick={() => setMeeting(null)}
                className="ml-1 text-[var(--text-brand-primary)] font-semibold hover:underline"
              >
                Unlink
              </button>
            </p>
          )}

          {sent && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-status-success)] bg-[var(--bg-status-success-subtle)] px-3.5 py-3"
            >
              <CheckCircle2
                size={16}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-[var(--icon-status-success)]"
                aria-hidden="true"
              />
              <p className="flex-1 text-sm text-[var(--text-primary)]">
                {sent}
              </p>
              <Button
                variant="tertiary"
                size="sm"
                iconOnly
                aria-label="Dismiss"
                leadingIcon={<X size={14} strokeWidth={2} />}
                onClick={() => setSent(null)}
              />
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-status-warning)] bg-[var(--bg-status-warning-subtle)] px-3.5 py-3"
            >
              <AlertTriangle
                size={16}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-[var(--icon-status-warning)]"
                aria-hidden="true"
              />
              <p className="flex-1 text-sm text-[var(--text-primary)]">
                {notice}
              </p>
              <Button
                variant="tertiary"
                size="sm"
                iconOnly
                aria-label="Dismiss"
                leadingIcon={<X size={14} strokeWidth={2} />}
                onClick={() => setNotice(null)}
              />
            </div>
          )}
        </div>

        {/* The flow: Start → steps → End, on a tinted surface so the cards read
            as objects the advisor moves around. */}
        <div className="relative flex-1 min-h-[360px] xl:min-h-0 overflow-y-auto bg-[var(--bg-secondary)] px-5 py-6">
          <div className="mx-auto flex max-w-[600px] flex-col items-center">
            <FlowPill kind="start" />
            <Connector />

            <ol
              aria-label="Learning path steps"
              onDragOver={(e) => {
                if (!drag.current) return;
                e.preventDefault();
                if (steps.length === 0) setDropIndex(0);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setDropIndex(null);
              }}
              onDrop={drop}
              className={cn(
                "flex w-full flex-col",
                steps.length === 0 &&
                  "min-h-[200px] items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-10 text-center transition-colors",
                steps.length === 0 &&
                  (dropIndex !== null
                    ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
                    : "border-[var(--border-secondary)] bg-[var(--bg-primary)]"),
              )}
            >
              {steps.length === 0 && (
                <li className="list-none flex flex-col items-center gap-2">
                  <Route
                    size={24}
                    strokeWidth={1.5}
                    className="text-[var(--icon-quaternary)]"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Drag content here to build the learning path
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] max-w-sm">
                    Pick a learning path, PDF, video, post, message, simulation
                    or workshop from the left — drag it in, or use its + button.
                    Steps go out in this order.
                  </p>
                </li>
              )}

              {steps.map((s, index) => (
                <StepRow
                  key={s.uid}
                  index={index}
                  total={steps.length}
                  item={
                    s.kind === "content" ? byId.get(s.contentId) : undefined
                  }
                  path={s.kind === "path" ? pathById.get(s.pathId) : undefined}
                  message={s.kind === "message" ? s.text : undefined}
                  byId={byId}
                  dropBefore={dropIndex === index}
                  dropAfter={
                    dropIndex === steps.length && index === steps.length - 1
                  }
                  onDragStart={(e) =>
                    startDrag(e, { kind: "step", uid: s.uid })
                  }
                  onDragEnd={endDrag}
                  onDragOver={(e) => overStep(e, index)}
                  onMoveUp={() => move(s.uid, index - 1)}
                  onMoveDown={() => move(s.uid, index + 2)}
                  onRemove={() => remove(s.uid)}
                  onEditSimulation={onEditSimulation}
                />
              ))}
            </ol>

            <Connector />
            <FlowPill kind="end" />
          </div>
        </div>

        <p className="shrink-0 border-t border-[var(--border-tertiary)] px-5 py-3 text-xs text-[var(--text-tertiary)]">
          {steps.length === 0
            ? "No steps yet"
            : `${steps.length} step${steps.length === 1 ? "" : "s"} · ${summary} · sent in this order`}
        </p>
      </div>

      {/* ══ Right — Send to ══ */}
      <aside aria-label="Recipients" className="flex flex-col min-h-0">
        {/* Options scroll; the Send action is pinned to the bottom.
            `relative` on the scroll areas matters: the checkbox inputs are
            visually hidden with position:absolute, and without a positioned
            ancestor inside the scroller they escape it and stretch the page. */}
        <div className="relative flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Send to
          </h2>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as RecipientMode)}
            variant="pill"
          >
            <TabsList aria-label="Recipient type" className="w-full">
              <TabsTrigger value="client" className="flex-1">
                One client
              </TabsTrigger>
              <TabsTrigger value="group" className="flex-1">
                Group
              </TabsTrigger>
            </TabsList>

            <TabsPanel value="client" className="pt-3">
              <SelectField
                size="sm"
                label="Client"
                placeholder="Choose a client"
                value={clientId}
                onValueChange={(v: unknown) => {
                  setClientId(v as string);
                  setMeeting(null);
                  setPurposeId(null);
                }}
                items={Object.fromEntries(clients.map((c) => [c.id, c.name]))}
              >
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectField>
              {clientId && (
                <MeetingContext
                  meetings={RECENT_MEETINGS[clientId] ?? []}
                  meeting={meeting}
                  purposeId={purposeId}
                  onMeeting={setMeeting}
                  onPurpose={setPurposeId}
                />
              )}
              {suggestion && (
                <FinnySuggestionCard
                  suggestion={suggestion}
                  onCanvas={(id) => onCanvas({ kind: "content", contentId: id })}
                  onAdd={(id) => insert({ kind: "content", contentId: id })}
                  onAddAll={applySuggestion}
                />
              )}
            </TabsPanel>

            <TabsPanel value="group" className="pt-3 flex flex-col gap-2">
              <Input
                size="sm"
                aria-label="Search clients"
                placeholder="Search by name or goal…"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                leadingIcon={<Search size={14} strokeWidth={1.75} />}
              />
              <div className="flex items-center gap-3">
                {groupIds.size > 0 && (
                  <AvatarGroup
                    size="xs"
                    overflow={Math.max(0, groupIds.size - 4)}
                    aria-label={`${groupIds.size} clients selected`}
                  >
                    {[...groupIds].slice(0, 4).map((id) => {
                      const c = clients.find((x) => x.id === id)!;
                      return (
                        <Avatar
                          key={id}
                          size="xs"
                          initials={c.initials}
                          alt={c.name}
                        />
                      );
                    })}
                  </AvatarGroup>
                )}
                <Checkbox
                  size="sm"
                  className="ml-auto gap-2 flex-row-reverse"
                  checked={allShownSelected}
                  indeterminate={shownSelected > 0 && !allShownSelected}
                  onChange={toggleAllShown}
                  disabled={filteredClients.length === 0}
                >
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Select all shown ({filteredClients.length})
                  </span>
                </Checkbox>
              </div>
              <ul
                className="relative max-h-56 overflow-y-auto -mx-1 px-1 flex flex-col"
                aria-label="Clients"
              >
                {filteredClients.map((c) => (
                  <li
                    key={c.id}
                    className="py-2 border-b border-[var(--border-tertiary)] last:border-b-0"
                  >
                    <Checkbox
                      size="sm"
                      className="w-full gap-3"
                      checked={groupIds.has(c.id)}
                      onChange={() =>
                        setGroupIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(c.id)) next.delete(c.id);
                          else next.add(c.id);
                          return next;
                        })
                      }
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Avatar size="xs" initials={c.initials} />
                        <span className="min-w-0">
                          <span className="block text-sm text-[var(--text-primary)] truncate">
                            {c.name}
                          </span>
                          <span className="block text-xs text-[var(--text-tertiary)] truncate">
                            {c.plan} · {TOPIC_LABEL[c.primaryGoal]}
                          </span>
                        </span>
                      </span>
                    </Checkbox>
                  </li>
                ))}
                {filteredClients.length === 0 && (
                  <li className="py-3 text-xs text-[var(--text-tertiary)]">
                    No clients match “{clientQuery}”.
                  </li>
                )}
              </ul>
            </TabsPanel>
          </Tabs>

          <SelectField
            size="sm"
            label="Deliver via"
            hint={DELIVERY_CHANNEL_HINT[channel]}
            value={channel}
            onValueChange={(v: unknown) => setChannel(v as DeliveryChannel)}
            items={DELIVERY_CHANNEL_LABEL}
          >
            {(Object.keys(DELIVERY_CHANNEL_LABEL) as DeliveryChannel[]).map(
              (k) => (
                <SelectItem key={k} value={k}>
                  {DELIVERY_CHANNEL_LABEL[k]}
                </SelectItem>
              ),
            )}
          </SelectField>

          <Textarea
            label="Message"
            hint="Sent with the learning path to every recipient."
            placeholder="Hi, I've put together a few pieces to go through before our next review…"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="shrink-0 border-t border-[var(--border-tertiary)] p-4 flex flex-col gap-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            leadingIcon={<Send size={16} strokeWidth={1.75} />}
            disabled={Boolean(blocker)}
            aria-describedby="sequence-send-hint"
            onClick={send}
          >
            {recipients.length > 0 && steps.length > 0
              ? `Send to ${recipientName}`
              : "Send learning path"}
          </Button>
          <p
            id="sequence-send-hint"
            className="text-xs text-[var(--text-tertiary)]"
          >
            {blocker ?? `${summary}, sent in the order shown`}
          </p>
        </div>
      </aside>
    </section>
  );
}

/* ─── Canvas step ─── */

interface StepRowProps {
  index: number;
  total: number;
  item?: ContentItem;
  path?: SavedLearningPath;
  message?: string;
  byId: Map<string, ContentItem>;
  dropBefore: boolean;
  dropAfter: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEditSimulation: (item: ContentItem) => void;
}

function StepRow({
  index,
  total,
  item,
  path,
  message,
  byId,
  dropBefore,
  dropAfter,
  onDragStart,
  onDragEnd,
  onDragOver,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEditSimulation,
}: StepRowProps) {
  const title =
    item?.title ??
    path?.title ??
    (message !== undefined ? "Message" : "Unavailable");
  const v = item ? getTypeVisual(item) : null;
  const kindLine = item
    ? [typeLabel(item), itemMeta(item)].filter(Boolean).join(" · ")
    : path
      ? `Learning path · ${path.contentIds.length} items`
      : "Your note to the client";

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className="relative list-none"
    >
      {/* Steps after the first are joined to the one above by a connector;
          the drop indicator sits in that gap. */}
      {index > 0 && <Connector />}
      {dropBefore && (
        <DropLine className={index > 0 ? "top-[7px]" : "-top-[9px]"} />
      )}
      <div className="group flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] p-3 hover:border-[var(--border-primary)] transition-colors">
        <GripVertical
          size={16}
          strokeWidth={1.75}
          className="mt-2 shrink-0 cursor-grab text-[var(--icon-quaternary)]"
          aria-hidden="true"
        />
        <span
          className="mt-1 shrink-0 w-6 h-6 rounded-full bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-center"
          aria-hidden="true"
        >
          {index + 1}
        </span>
        <span
          className={cn(
            "shrink-0 w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center",
            v
              ? cn(v.bgColor, v.iconColor)
              : message !== undefined
                ? "bg-[var(--bg-secondary)] text-[var(--icon-secondary)]"
                : "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]",
          )}
          aria-hidden="true"
        >
          {v ? (
            v.icon
          ) : message !== undefined ? (
            <MessageSquare size={14} strokeWidth={1.75} />
          ) : (
            <Route size={14} strokeWidth={1.75} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            <span className="sr-only">Step {index + 1}: </span>
            {title}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {kindLine}
          </p>

          {message !== undefined && (
            <p className="mt-2 text-sm text-[var(--text-secondary)] whitespace-pre-line line-clamp-4 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] px-3 py-2">
              {message}
            </p>
          )}

          {item?.category === "simulation" && (
            <div className="mt-2 flex flex-col items-start gap-2">
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  size="sm"
                  color={item.model.kind === "personalized" ? "brand" : "gray"}
                >
                  {item.model.kind === "personalized"
                    ? `Personalised · ${item.model.clientName}`
                    : "Template"}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={
                    <SlidersHorizontal size={14} strokeWidth={1.75} />
                  }
                  aria-label={`Edit variables for ${item.title}`}
                  onClick={() => onEditSimulation(item)}
                >
                  Edit variables
                </Button>
              </div>
            </div>
          )}

          {path && (
            <ol className="mt-2 flex flex-col gap-1 border-l-2 border-[var(--border-tertiary)] pl-3">
              {path.contentIds.map((id, i) => {
                const c = byId.get(id);
                return (
                  <li key={id} className="text-xs text-[var(--text-secondary)]">
                    {i + 1}. {c?.title ?? "Unavailable"}
                    {c && (
                      <span className="text-[var(--text-tertiary)]">
                        {" "}
                        · {typeLabel(c)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            aria-label={`Move ${title} up`}
            disabled={index === 0}
            leadingIcon={<ArrowUp size={14} strokeWidth={1.75} />}
            onClick={onMoveUp}
          />
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            aria-label={`Move ${title} down`}
            disabled={index === total - 1}
            leadingIcon={<ArrowDown size={14} strokeWidth={1.75} />}
            onClick={onMoveDown}
          />
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            aria-label={`Remove ${title}`}
            leadingIcon={<X size={14} strokeWidth={1.75} />}
            onClick={onRemove}
          />
        </div>
      </div>
      {dropAfter && <DropLine className="-bottom-[9px]" />}
    </li>
  );
}

/* ─── Flow chrome ─── */

/** The Start / End markers that bracket the sequence. Decorative — the
    ordered list already conveys order to assistive tech. */
function FlowPill({ kind }: { kind: "start" | "end" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-8 items-center rounded-full px-6 text-sm font-semibold",
        kind === "start"
          ? "bg-[var(--bg-brand-primary)] text-[var(--text-on-brand-primary)]"
          : "border-2 border-[var(--border-brand-primary)] bg-[var(--bg-primary)] text-[var(--text-brand-primary)]",
      )}
    >
      {kind === "start" ? "Start" : "End"}
    </span>
  );
}

function Connector() {
  return (
    <span
      aria-hidden="true"
      className="mx-auto block h-4 w-px bg-[var(--border-secondary)]"
    />
  );
}

function DropLine({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-0 right-0 h-[2px] rounded-full bg-[var(--border-brand-primary)]",
        className,
      )}
    />
  );
}

/* ─── Left panel pieces ─── */

function ContentTabList({
  all,
  matches,
  onCanvas,
  onAdd,
  onDragStart,
  onDragEnd,
}: {
  all: ContentItem[];
  matches: (text: string) => boolean;
  onCanvas: (id: string) => boolean;
  onAdd: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  const sendable = all.filter(isSendable);
  const shown = sendable.filter((i) => matches(i.title));
  const held = all.filter((i) => !isSendable(i) && matches(i.title));

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1.5">
        {shown.map((i) => {
          const v = getTypeVisual(i);
          const meta =
            i.category === "simulation"
              ? `${i.model.kind === "personalized" ? `Personalised · ${i.model.clientName}` : "Template"} · ${itemMeta(i) ?? "Simulation"}`
              : [typeLabel(i), itemMeta(i)].filter(Boolean).join(" · ");
          return (
            <PickerRow
              key={i.id}
              icon={v.icon}
              tile={cn(v.bgColor, v.iconColor)}
              title={i.title}
              meta={meta}
              added={onCanvas(i.id)}
              onAdd={() => onAdd(i.id)}
              onDragStart={(e) => onDragStart(e, i.id)}
              onDragEnd={onDragEnd}
            />
          );
        })}
        {shown.length === 0 && held.length === 0 && (
          <li className="py-3 text-xs text-[var(--text-tertiary)]">
            {sendable.length === 0
              ? "Nothing approved to send yet."
              : "Nothing matches."}
          </li>
        )}
        {/* Not sendable — still visible, greyed out, with the reason. */}
        {held.map((i) => {
          const v = getTypeVisual(i);
          return (
            <li
              key={i.id}
              className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-2.5 py-2"
            >
              <span className="shrink-0 w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--bg-primary)] text-[var(--icon-quaternary)]" aria-hidden="true">
                {v.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[var(--text-disabled)] truncate">{i.title}</span>
                <span className="block text-xs text-[var(--text-tertiary)] truncate">{holdReason(i, "clients")}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {held.length > 0 && (
        <p className="text-xs text-[var(--text-tertiary)]">
          Greyed-out items can&apos;t be sent yet — only Approved content written for clients can.
        </p>
      )}
    </div>
  );
}

function MessageComposer({
  value,
  onChange,
  onAdd,
  onDragStart,
  onDragEnd,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const ready = value.trim().length > 0;
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        label="Message to the client"
        hint="Goes out at its place in the learning path — e.g. why the next piece matters."
        placeholder="Hi Anika, before our review next week…"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        draggable={ready}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          "flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] px-2.5 py-2",
          ready
            ? "cursor-grab bg-[var(--bg-primary)] hover:border-[var(--border-secondary)]"
            : "bg-[var(--bg-secondary)]",
        )}
      >
        <span
          className="shrink-0 w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--icon-secondary)]"
          aria-hidden="true"
        >
          <MessageSquare size={14} strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-xs text-[var(--text-tertiary)]">
          {ready
            ? "Drag this message into the learning path"
            : "Write a message to add it"}
        </span>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          aria-label="Add message to the learning path"
          disabled={!ready}
          leadingIcon={<Plus size={14} strokeWidth={2} />}
          onClick={onAdd}
        />
      </div>
    </div>
  );
}

function EmptyTab({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] px-4 py-6 text-center">
      <span className="text-[var(--icon-quaternary)]" aria-hidden="true">
        {icon}
      </span>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </p>
      <p className="text-xs text-[var(--text-tertiary)]">{body}</p>
    </div>
  );
}

interface PickerRowProps {
  icon: React.ReactNode;
  tile: string;
  title: string;
  meta: string;
  added: boolean;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function PickerRow({
  icon,
  tile,
  title,
  meta,
  added,
  onAdd,
  onDragStart,
  onDragEnd,
}: PickerRowProps) {
  return (
    <li
      draggable={!added}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] px-2.5 py-2",
        added
          ? "bg-[var(--bg-secondary)]"
          : "bg-[var(--bg-primary)] cursor-grab hover:border-[var(--border-secondary)]",
      )}
    >
      <GripVertical
        size={14}
        strokeWidth={1.75}
        className={cn(
          "shrink-0",
          added ? "invisible" : "text-[var(--icon-quaternary)]",
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "shrink-0 w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center",
          tile,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-[var(--text-primary)] truncate">
          {title}
        </span>
        <span className="block text-xs text-[var(--text-tertiary)] truncate">
          {meta}
        </span>
      </span>
      {added ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] shrink-0">
          <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" /> Added
        </span>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          aria-label={`Add ${title} to the learning path`}
          leadingIcon={<Plus size={14} strokeWidth={2} />}
          onClick={onAdd}
        />
      )}
    </li>
  );
}

/* ─── Meeting context ───
   Optional. Linking a meeting records the package against it; the purpose
   tells Finny what the meeting was about, so its suggestions lead with it. */

const NO_MEETING = "none";

function MeetingContext({
  meetings,
  meeting,
  purposeId,
  onMeeting,
  onPurpose,
}: {
  meetings: MeetingRef[];
  meeting: MeetingRef | null;
  purposeId: string | null;
  onMeeting: (m: MeetingRef | null) => void;
  onPurpose: (id: string | null) => void;
}) {
  /* A meeting linked from the review queue may not be in the recent list. */
  const options = meeting && !meetings.some((m) => m.id === meeting.id) ? [meeting, ...meetings] : meetings;
  if (options.length === 0) return null;
  const label = (m: MeetingRef) => `${m.title} · ${m.date}`;

  return (
    <div className="mt-3 flex flex-col gap-3">
      <SelectField
        size="sm"
        label="Meeting (optional)"
        value={meeting?.id ?? NO_MEETING}
        onValueChange={(v: unknown) => {
          const m = options.find((x) => x.id === v) ?? null;
          onMeeting(m);
          /* "Quarterly Review" → the "Quarterly review" template; otherwise the advisor picks. */
          const guess = m && MEETING_TEMPLATES.find((t) => t.purpose.toLowerCase() === m.title.toLowerCase());
          onPurpose(guess ? guess.id : null);
        }}
        items={{ [NO_MEETING]: "Not linked to a meeting", ...Object.fromEntries(options.map((m) => [m.id, label(m)])) }}
      >
        <SelectItem value={NO_MEETING}>Not linked to a meeting</SelectItem>
        {options.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {label(m)}
          </SelectItem>
        ))}
      </SelectField>
      {meeting && (
        <SelectField
          size="sm"
          label="Meeting purpose"
          placeholder="What was it for?"
          value={purposeId}
          onValueChange={(v: unknown) => onPurpose(v as string)}
          items={Object.fromEntries(MEETING_TEMPLATES.map((t) => [t.id, t.purpose]))}
        >
          {MEETING_TEMPLATES.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.purpose}
            </SelectItem>
          ))}
        </SelectField>
      )}
    </div>
  );
}

/* ─── Finny suggestions ─── */

interface FinnySuggestion {
  client: Client;
  first: string;
  headline: string;
  signals: string[];
  picks: { item: ContentItem; because: string }[];
  held: number;
}

function FinnySuggestionCard({
  suggestion,
  onCanvas,
  onAdd,
  onAddAll,
}: {
  suggestion: FinnySuggestion;
  onCanvas: (id: string) => boolean;
  onAdd: (id: string) => void;
  onAddAll: () => void;
}) {
  const { first, headline, signals, picks, held } = suggestion;
  const remaining = picks.filter((x) => !onCanvas(x.item.id)).length;

  return (
    <section
      aria-label={`Finny's suggestions for ${first}`}
      className="relative mt-3 flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)] p-3"
    >
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-brand-primary)]">
          Finny suggests
        </h3>
      </div>
      <p className="text-sm text-[var(--text-primary)]">{headline}</p>

      <details className="group text-xs text-[var(--text-secondary)]">
        <summary className="cursor-pointer font-semibold text-[var(--text-brand-primary)] hover:underline">
          Based on {signals.length} signal{signals.length === 1 ? "" : "s"}
        </summary>
        <ul className="mt-1.5 flex list-disc flex-col gap-0.5 pl-4">
          {signals.map((sg) => (
            <li key={sg}>{sg}</li>
          ))}
        </ul>
      </details>

      {picks.length > 0 && (
        <ol className="flex flex-col gap-1.5">
          {picks.map(({ item, because }, i) => {
            const v = getTypeVisual(item);
            const added = onCanvas(item.id);
            return (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-2"
              >
                <span className="mt-0.5 w-4 shrink-0 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]" aria-hidden="true">
                  {i + 1}
                </span>
                <span className={cn("shrink-0 w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center", v.bgColor, v.iconColor)} aria-hidden="true">
                  {v.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--text-primary)]">{item.title}</span>
                  <span className="block text-xs text-[var(--text-tertiary)]">
                    {typeLabel(item)} · {because}
                  </span>
                </span>
                {added ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)]">
                    <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" /> Added
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    iconOnly
                    aria-label={`Add ${item.title} to the learning path`}
                    leadingIcon={<Plus size={14} strokeWidth={2} />}
                    onClick={() => onAdd(item.id)}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}

      {picks.length > 1 && (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          leadingIcon={<Route size={14} strokeWidth={1.75} />}
          disabled={remaining === 0}
          onClick={onAddAll}
        >
          {remaining === 0
            ? "All suggestions added"
            : remaining === picks.length
              ? `Add all ${picks.length} suggestions`
              : `Add remaining ${remaining}`}
        </Button>
      )}

      {held > 0 && (
        <p className="text-xs text-[var(--text-tertiary)]">
          {held} more suggestion{held === 1 ? " is" : "s are"} awaiting compliance review, so {held === 1 ? "it isn't" : "they aren't"} shown.
        </p>
      )}
      <p className="text-xs text-[var(--text-tertiary)]">
        Suggestions only — review before sending.
      </p>
    </section>
  );
}
