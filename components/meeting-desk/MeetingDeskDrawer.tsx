"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button, buttonVariants } from "@/components/fincaree/button";
import { Checkbox } from "@/components/fincaree/checkbox";
import { Textarea } from "@/components/fincaree/textarea";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Tabs, TabsList, TabsTrigger, TabsPanel, TabsIndicator } from "@/components/fincaree/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/fincaree/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  MeetingRecord,
  ActionItem,
  LastMeetingDetail,
  CommunicationEntry,
  STATUS_COLORS,
  STATUS_LABELS,
} from "./data";
import { MeetingNote } from "./MeetingNote";
import { TranscriptViewer } from "./TranscriptViewer";
import { hasTranscript, useMeetingNotes } from "./meeting-notes";
import {
  X,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  Clock,
  ChevronRight,
  ExternalLink,
  CalendarPlus,
  Ban,
  FileDown,
  Video,
  FileText,
  BookOpen,
  Presentation,
  FlaskConical,
  History,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  StickyNote,
} from "lucide-react";

/* ============================================================
   Meeting Desk Drawer — full right-side drawer.
   Segments: Brief · Actions · Send · History
   Same Sheet + Tabs + sticky-footer structure as the Report
   Queue's ReportDrawer.

   Answers the 5 questions an advisor should never have to leave
   this screen to answer:
     1. What do I need to know before I walk in?   → Brief
     2. What did we discuss and decide last time?  → Brief
     3. What actions are still pending from before? → Actions
     4. What should I send/recommend after?         → Send
     5. What's the one most important next thing?   → header banner + Send
   ============================================================ */

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function planColor(plan: string): "brand" | "warning" | "gray" {
  if (plan === "Platinum") return "brand";
  if (plan === "Gold") return "warning";
  return "gray";
}

const MATERIAL_ICON: Record<string, React.ReactNode> = {
  Report: <FileText size={14} strokeWidth={1.75} />,
  Video: <Video size={14} strokeWidth={1.75} />,
  Article: <FileText size={14} strokeWidth={1.75} />,
  Workshop: <Presentation size={14} strokeWidth={1.75} />,
  Simulation: <FlaskConical size={14} strokeWidth={1.75} />,
  "PDF Guide": <BookOpen size={14} strokeWidth={1.75} />,
  "Learning Path": <BookOpen size={14} strokeWidth={1.75} />,
};

const ACTION_STATUS_COLOR: Record<ActionItem["status"], "gray" | "brand" | "success"> = {
  pending: "gray",
  "in-progress": "brand",
  completed: "success",
};

const ACTION_STATUS_LABEL: Record<ActionItem["status"], string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

/* ---- Brief tab — Q1 + Q2 ---- */

function BriefTab({ meeting, onViewNote, onOpenTranscript }: { meeting: MeetingRecord; onViewNote: () => void; onOpenTranscript: (ids: string[]) => void }) {
  const [notes, setNotes] = useState("");
  const noteState = useMeetingNotes()[meeting.id];
  const recorded = hasTranscript(meeting.id);
  const noteLabel = !recorded ? null : noteState?.status === "reviewed" ? "Note reviewed" : noteState?.status === "draft" ? "Note drafted by Finny — not reviewed yet" : "Note not generated yet";

  return (
    <div className="space-y-5">
      {meeting.alerts.length > 0 && (
        <div className="divide-y divide-[var(--border-status-error-subtle)]">
          {meeting.alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2 -mx-5 px-5 py-2.5 bg-[var(--bg-status-error-subtle)]">
              <AlertTriangle size={13} strokeWidth={2} className="text-[var(--text-status-error)] shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-[var(--text-status-error-strong)]">{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Finny Meeting Brief */}
      <div className="pb-5 border-b border-[var(--border-tertiary)]">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Finny Meeting Brief</span>
        </div>
        <ol className="space-y-2 mb-3">
          {meeting.briefPoints.map((point, i) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-[var(--text-primary)]">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] tabular-nums shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug">{point}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-tertiary)]">
          Prepared by Finny · Review before use
        </p>
      </div>

      {/* Last meeting */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Last Meeting
        </div>
        {meeting.lastMeetingSummary ? (
          <div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-1.5">{meeting.lastMeetingSummary}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{meeting.lastMeetingDate}</p>
            {recorded && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-[var(--text-tertiary)]">{noteLabel}</span>
                <button type="button" onClick={onViewNote} className="font-semibold text-[var(--text-brand-primary)] hover:underline">View note</button>
                <button type="button" onClick={() => onOpenTranscript([])} className="font-semibold text-[var(--text-brand-primary)] hover:underline">View transcript</button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)]">First meeting with this client — no previous meeting on file.</p>
        )}
      </div>

      {/* Advisor notes — added before the meeting */}
      <div>
        <Textarea
          label="Your notes for this meeting"
          placeholder="Add anything Finny wouldn't know — a personal detail, a concern from a call, a talking point..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

/* ---- Actions tab — Q3 + Feature 4 (follow-up reminders) ---- */

function ActionsTab({ meeting }: { meeting: MeetingRecord }) {
  const [reminderType, setReminderType] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[var(--text-primary)]">Action Items</span>
          <Button variant="link-brand" size="sm">+ Add action item</Button>
        </div>
        {meeting.actionItems.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">No action items carried over from previous meetings.</p>
        ) : (
          <div className="divide-y divide-[var(--border-tertiary)]">
            {meeting.actionItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 -mx-5 px-5 py-3">
                <Checkbox size="sm" checked={item.status === "completed"} className="mt-0.5" readOnly />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm leading-snug", item.status === "completed" ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]")}>
                    {item.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge size="sm" color={item.owner === "Advisor" ? "brand" : "gray"}>{item.owner}</Badge>
                    <span className="text-xs text-[var(--text-tertiary)]">Due {item.dueDate}</span>
                  </div>
                </div>
                <Badge size="sm" color={ACTION_STATUS_COLOR[item.status]}>{ACTION_STATUS_LABEL[item.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up reminder — a natural step at the end of the flow */}
      <div className="pt-5 border-t border-[var(--border-tertiary)]">
        <div className="flex items-center gap-1.5 mb-3">
          <Clock size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Set a Follow-up Reminder</span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          Suggested: a {meeting.status === "follow-up-pending" ? "call" : "reminder"} once the open action items above are resolved.
        </p>
        <div className="flex items-center gap-2">
          <SelectField
            size="sm"
            placeholder="Reminder type"
            value={reminderType}
            onValueChange={(v: unknown) => setReminderType((v as string) ?? null)}
            className="flex-1"
            aria-label="Reminder type"
          >
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
          </SelectField>
          <Button variant="secondary" size="sm" leadingIcon={<CalendarPlus size={13} strokeWidth={1.75} />}>
            Set Reminder
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---- Send tab — Q4 + Q5: materials, reports, next best action ---- */

function SendTab({ meeting }: { meeting: MeetingRecord }) {
  const [dismissed, setDismissed] = useState(false);
  const firstName = meeting.client.name.split(" ")[0];
  const suggestion = meeting.finnySuggestion;

  return (
    <div className="space-y-5">
      {/* Finny suggestion */}
      {suggestion && !dismissed && (
        <div className="-mx-5 px-5 py-4 bg-[var(--bg-brand-subtle)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
            <span className="text-[11px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
              Finny Suggestion
            </span>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">{suggestion.title}</p>
          <p className="text-xs text-[var(--text-secondary)] leading-snug mb-3">
            <span className="font-medium text-[var(--text-primary)]">Why this may help: </span>
            {suggestion.reason}
          </p>
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Based on
            </div>
            <ul className="space-y-0.5">
              {suggestion.basedOn.map((point, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)] leading-snug">
                  <span className="text-[var(--text-tertiary)] shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm">Review &amp; Add</Button>
            <Button variant="tertiary" size="sm" onClick={() => setDismissed(true)}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Send a resource */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Send a Resource
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)]">Send a resource to {firstName}</p>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Reports, learning, simulations, videos, PDFs or links</p>
        <Link
          href="/content-management"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full justify-center")}
        >
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">Open Content Management</span>
            <span className="fc-btn-icon shrink-0" aria-hidden="true">
              <ArrowRight size={13} strokeWidth={2} />
            </span>
          </span>
        </Link>
      </div>

      {/* Recently sent */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Recently Sent
        </div>
        {meeting.recentlySent.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">Nothing sent to this client yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border-tertiary)]">
            {meeting.recentlySent.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 -mx-5 px-5 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] text-[var(--icon-tertiary)] flex items-center justify-center shrink-0">
                    {MATERIAL_ICON[item.type] ?? <FileText size={14} strokeWidth={1.75} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{item.type} · {item.date}</p>
                  </div>
                </div>
                {item.status === "viewed" ? (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-status-success)] shrink-0">
                    <CheckCircle2 size={12} strokeWidth={2} /> Viewed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] shrink-0">
                    <Clock size={12} strokeWidth={1.75} /> In progress
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <Button
          variant="link-brand"
          size="sm"
          trailingIcon={<ArrowRight size={12} strokeWidth={2} />}
          className="text-xs mt-2"
        >
          View All History
        </Button>
      </div>
    </div>
  );
}

/* ---- Last meeting card — the expanded record behind a past meeting.
   Only title / Finny insights / decisions are its own data (LastMeetingDetail);
   date, duration and the summary are read off the meeting record itself,
   so nothing is duplicated between the two. Action items and the report
   already have their own tabs (Actions, Send) — this card stays to what's
   specific to looking backward: what happened, what got decided, what
   Finny noticed. ---- */

function LastMeetingCard({ meeting, detail, onOpenTranscript }: { meeting: MeetingRecord; detail: LastMeetingDetail; onOpenTranscript: (ids: string[]) => void }) {
  const noteStatus = useMeetingNotes()[meeting.id]?.status;
  /* Once Finny's note exists it replaces the hand-written summary and decisions. */
  const generated = noteStatus === "draft" || noteStatus === "reviewed";
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-4">
      <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
        Last Meeting
      </div>
      <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{detail.title}</div>
      <div className="text-xs text-[var(--text-tertiary)] mt-0.5 mb-3">
        {meeting.lastMeetingDate} · {meeting.duration} · Completed
      </div>

      <div className="space-y-4">
        {!generated && meeting.lastMeetingSummary && (
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Summary
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-snug">{meeting.lastMeetingSummary}</p>
          </div>
        )}

        {!generated && (
        <div>
          <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
            Decisions
          </div>
          <ul className="space-y-1">
            {detail.decisions.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)] leading-snug">
                <span className="text-[var(--text-tertiary)] shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        )}

        <MeetingNote meetingId={meeting.id} label={`${detail.title} · ${meeting.client.name}`} onOpenTranscript={onOpenTranscript} />

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
            <span className="text-[11px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">
              Finny Insights
            </span>
          </div>
          <ul className="space-y-1">
            {detail.finnyInsights.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)] leading-snug">
                <span className="text-[var(--text-tertiary)] shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

/* ---- Client Communication — a running log of direct exchanges and
   logged events, same timeline idiom as the old Interaction History so
   the visual language stays consistent across the tab. ---- */

function ClientCommunicationSection({ entries }: { entries: CommunicationEntry[] }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <MessageSquare size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">Client Communication</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">No communication logged yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border-tertiary)]" />
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 pl-1">
                <span className="w-[22px] h-[22px] rounded-full border-2 border-[var(--border-secondary)] bg-[var(--bg-primary)] flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-grey-400)]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-[var(--text-primary)]">{entry.direction}</span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">{entry.date}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] leading-snug mt-0.5">{entry.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Advisor Notes — private context, local to this drawer session
   (no persistence layer exists to save it to). ---- */

function AdvisorNotesSection() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <StickyNote size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">Advisor Notes</span>
      </div>
      <Textarea
        placeholder="Add notes about client context..."
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={3}
      />
      <Button
        variant="secondary"
        size="sm"
        className="mt-2"
        disabled={!note.trim() || saved}
        onClick={() => setSaved(true)}
      >
        {saved ? "Saved" : "Save Note"}
      </Button>
    </div>
  );
}

/* ---- Quick Access — jumps elsewhere in the client's record. Reports &
   Documents is a real link (the Report Queue exists); the other two
   don't have a dedicated view yet, so they're visually in place but
   not wired to anything. ---- */

function QuickAccessSection() {
  const rowClass =
    "w-full flex items-center justify-between py-2.5 text-left group";
  const labelClass = "text-sm text-[var(--text-primary)]";
  const chevronClass = "text-[var(--icon-tertiary)] group-hover:text-[var(--icon-secondary)] transition-colors";

  return (
    <div>
      <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
        Quick Access
      </div>
      <div className="divide-y divide-[var(--border-tertiary)]">
        <button type="button" className={rowClass}>
          <span className={labelClass}>Previous Meetings</span>
          <ChevronRight size={14} strokeWidth={1.75} className={chevronClass} />
        </button>
        <Link href="/reports" className={rowClass}>
          <span className={labelClass}>Reports &amp; Documents</span>
          <ChevronRight size={14} strokeWidth={1.75} className={chevronClass} />
        </Link>
        <button type="button" className={rowClass}>
          <span className={labelClass}>Advice &amp; Decisions</span>
          <ChevronRight size={14} strokeWidth={1.75} className={chevronClass} />
        </button>
      </div>
    </div>
  );
}

/* ---- History tab — Feature 5 + Feature 9 (audit) ---- */

function HistoryTab({ meeting, onOpenTranscript }: { meeting: MeetingRecord; onOpenTranscript: (ids: string[]) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <History size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Interaction History</span>
        </div>
        {meeting.lastMeetingDetail ? (
          <LastMeetingCard meeting={meeting} detail={meeting.lastMeetingDetail} onOpenTranscript={onOpenTranscript} />
        ) : meeting.lastMeetingSummary ? (
          <div className="relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border-tertiary)]" />
            <div className="flex items-start gap-3 pl-1">
              <span className="w-[22px] h-[22px] rounded-full border-2 border-[var(--border-secondary)] bg-[var(--bg-primary)] flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-grey-400)]" />
              </span>
              <div>
                <div className="text-xs text-[var(--text-secondary)] leading-snug">{meeting.lastMeetingSummary}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{meeting.lastMeetingDate}</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)]">No prior interactions on file.</p>
        )}
      </div>

      <div className="pt-5 border-t border-[var(--border-tertiary)]">
        <ClientCommunicationSection entries={meeting.communicationLog} />
      </div>

      <div className="pt-5 border-t border-[var(--border-tertiary)]">
        <AdvisorNotesSection />
      </div>

      <div className="pt-5 border-t border-[var(--border-tertiary)]">
        <QuickAccessSection />
      </div>
    </div>
  );
}

/* ---- Main Drawer ---- */

interface MeetingDeskDrawerProps {
  meeting: MeetingRecord | null;
  onClose: () => void;
}

export function MeetingDeskDrawer({ meeting, onClose }: MeetingDeskDrawerProps) {
  const [displayMeeting, setDisplayMeeting] = useState<MeetingRecord | null>(null);
  const [tab, setTab] = useState("brief");
  /* The transcript opens over the drawer; `highlight` is the passage a note point came from. */
  const [transcript, setTranscript] = useState<{ open: boolean; highlight: string[] }>({ open: false, highlight: [] });
  if (meeting && meeting !== displayMeeting) {
    setDisplayMeeting(meeting);
    setTab("brief");
  }
  const openTranscript = (highlight: string[]) => setTranscript({ open: true, highlight });

  const shown = displayMeeting;
  if (!shown) return null;

  const openActions = shown.actionItems.filter((a) => a.status !== "completed").length;

  function footerAction(): { label: string; variant: "primary" } {
    if (shown!.status === "needs-prep") return { label: "Mark as Prepped", variant: "primary" };
    if (shown!.status === "follow-up-pending") return { label: "Log Follow-up", variant: "primary" };
    if (shown!.status === "completed") return { label: "View Summary", variant: "primary" };
    return { label: "Start Meeting", variant: "primary" };
  }
  const footer = footerAction();

  return (
    <Sheet open={!!meeting} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent showCloseButton={false} aria-label={`${shown.meetingType} — ${shown.client.name}`}>
        <SheetTitle className="sr-only">{shown.meetingType} — {shown.client.name}</SheetTitle>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border-tertiary)] shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Avatar size="md" initials={initials(shown.client.name)} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{shown.client.name}</span>
                  <Button
                    variant="link-brand"
                    size="sm"
                    trailingIcon={<ExternalLink size={11} strokeWidth={2} />}
                    className="text-xs"
                  >
                    View Client Profile
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge color={planColor(shown.client.plan)} size="sm">{shown.client.plan}</Badge>
                  <span className="text-xs text-[var(--text-tertiary)]">{shown.client.id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  showChevron={false}
                  render={<Button variant="tertiary" size="sm" iconOnly leadingIcon={<MoreHorizontal size={15} strokeWidth={1.75} />} aria-label="More options" />}
                />
                <DropdownMenuContent alignment="end">
                  <DropdownMenuItem icon={<CalendarPlus size={14} strokeWidth={1.75} />}>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem icon={<FileDown size={14} strokeWidth={1.75} />}>Export summary</DropdownMenuItem>
                  <DropdownMenuItem icon={<Ban size={14} strokeWidth={1.75} />}>Cancel meeting</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="tertiary" size="sm" iconOnly leadingIcon={<X size={15} strokeWidth={2} />} onClick={onClose} aria-label="Close drawer" />
            </div>
          </div>

          <div className="mb-3">
            <div className="text-base font-semibold text-[var(--text-primary)] leading-snug mb-1">{shown.meetingType}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color={STATUS_COLORS[shown.status] ?? "gray"} leadingIcon="dot" size="sm">
                {STATUS_LABELS[shown.status] ?? shown.status}
              </Badge>
              <span className="text-xs text-[var(--text-tertiary)]">{shown.dateLabel} · {shown.duration} · {shown.mode}</span>
            </div>
          </div>

          {shown.urgency === "urgent" && (
            <div className="mt-3 -mx-5 px-5 py-2.5 flex items-start gap-2 bg-[var(--bg-status-error-subtle)]">
              <Clock size={13} strokeWidth={2} className="text-[var(--text-status-error)] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[var(--text-status-error-strong)]">Meeting is today or tomorrow</div>
                <div className="text-xs text-[var(--text-status-error)]">{shown.nextBestAction}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)} variant="line" className="flex flex-col flex-1 min-h-0">
          <div className="px-5 pt-5 shrink-0 border-b border-[var(--border-tertiary)]">
            <TabsList>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="actions">Actions{openActions > 0 ? ` (${openActions})` : ""}</TabsTrigger>
              <TabsTrigger value="send">Send</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsIndicator />
            </TabsList>
          </div>

          <TabsPanel value="brief" className="flex-1 overflow-y-auto px-5 py-5">
            <BriefTab meeting={shown} onViewNote={() => setTab("history")} onOpenTranscript={openTranscript} />
          </TabsPanel>
          <TabsPanel value="actions" className="flex-1 overflow-y-auto px-5 py-5">
            <ActionsTab meeting={shown} />
          </TabsPanel>
          <TabsPanel value="send" className="flex-1 overflow-y-auto px-5 py-5">
            <SendTab meeting={shown} />
          </TabsPanel>
          <TabsPanel value="history" className="flex-1 overflow-y-auto px-5 py-5">
            <HistoryTab meeting={shown} onOpenTranscript={openTranscript} />
          </TabsPanel>
        </Tabs>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-[var(--border-tertiary)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Button variant={footer.variant} size="md" className="flex-1" trailingIcon={<ChevronRight size={13} strokeWidth={2} />}>
              {footer.label}
            </Button>
            <Button variant="secondary" size="md">Reschedule</Button>
          </div>
        </div>
      </SheetContent>

      {hasTranscript(shown.id) && (
        <TranscriptViewer
          meetingId={shown.id}
          title={`${shown.client.name} · ${shown.lastMeetingDetail?.title ?? "Last meeting"}`}
          open={transcript.open}
          onOpenChange={(open) => setTranscript((t) => ({ ...t, open }))}
          highlight={transcript.highlight}
        />
      )}
    </Sheet>
  );
}
