"use client";

import { useMemo, useRef, useState } from "react";
import { ClientProfileData } from "../client-data";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { EngagementEventDrawer } from "../EngagementEventDrawer";
import {
  Calendar,
  MessageCircle,
  HelpCircle,
  Target,
  Wallet,
  BookOpen,
  BarChart3,
  Users,
  FileText,
  CheckSquare,
  Send,
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
} from "lucide-react";
import {
  TIMELINE_EVENTS,
  TIMELINE_FILTERS,
  ENGAGEMENT_SUMMARY,
  OPEN_LOOPS,
  FINNY_ENGAGEMENT_NOTE,
  ENGAGEMENT_SIGNALS,
  NEXT_MEETING_CONTEXT,
  WORKSHOPS,
  TimelineEvent,
  TimelineEventType,
} from "../engagement-data";

const WORKSHOP_STATUS_LABEL: Record<string, string> = {
  registered: "Registered",
  attended: "Attended",
  missed: "Missed",
  recommended: "Recommended",
};

/* today is fixed just after the most recent event, just before the 28 Aug next meeting */
const TODAY = new Date("2025-08-24");
const RANGE_DAYS: Record<"7d" | "30d" | "90d", number> = { "7d": 7, "30d": 30, "90d": 90 };
const RANGE_LABELS = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" };
const MAX_VISIBLE_STATUS_ITEMS = 3;

const TYPE_ICON: Record<TimelineEventType, any> = {
  meeting: Calendar,
  message: MessageCircle,
  query: HelpCircle,
  goal: Target,
  financial: Wallet,
  learning: BookOpen,
  simulation: BarChart3,
  workshop: Users,
  report: FileText,
  task: CheckSquare,
  followup: Send,
};

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)] rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function daysAgo(sortDate: string): number {
  const diff = TODAY.getTime() - new Date(sortDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface EventRowProps {
  event: TimelineEvent;
  query: string;
  onOpen: (e: TimelineEvent) => void;
}

function EventRow({ event, query, onOpen }: EventRowProps) {
  const Icon = TYPE_ICON[event.type];
  const actorStyle =
    event.actor === "client"
      ? "bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]"
      : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]";

  return (
    <button
      onClick={() => onOpen(event)}
      className="w-full text-left flex gap-3 py-2.5 pl-0.5 pr-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-colors group relative z-10"
    >
      <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-tertiary)] flex items-center justify-center transition-colors">
          <Icon size={12} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 ${actorStyle}`}>
            {event.actor}
          </span>
          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{highlight(event.title, query)}</p>
        </div>

        {event.groupedItems ? (
          <ul className="mt-1 space-y-0.5">
            {event.groupedItems.map((item) => (
              <li key={item} className="text-[13px] text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--icon-quaternary)] mt-1.5 flex-shrink-0" />
                {highlight(item, query)}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="text-xs text-[var(--text-secondary)] truncate">{highlight(event.summary, query)}</p>
            {event.outcome && <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5 truncate">{highlight(event.outcome, query)}</p>}
          </>
        )}

        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
          {event.status && <span className="text-[12px] text-[var(--text-tertiary)]">{event.status}</span>}
          {event.relatedLabel && <span className="text-[12px] text-[var(--text-tertiary)]">Related: {event.relatedLabel}</span>}
          {event.linkLabel && <span className="text-[12px] font-semibold text-[var(--text-brand-primary)]">{event.linkLabel} →</span>}
        </div>
      </div>
    </button>
  );
}

export function EngagementTab({ client }: { client: ClientProfileData }) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addedContext, setAddedContext] = useState<Record<string, boolean>>({});
  const [finnyDismissed, setFinnyDismissed] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const firstName = client.identity.name.split(" ")[0];

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /** "View more" from a capped status card jumps to the timeline, pre-filtered
      to that type — the timeline is the one place a full list actually lives. */
  const viewAllInTimeline = (filterKey: string) => {
    setActiveFilters(new Set([filterKey]));
    timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdd = (id: string) => setAddedContext((prev) => ({ ...prev, [id]: true }));

  const openDrawer = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const actorKeys = new Set(TIMELINE_FILTERS.filter((f) => f.group === "actor").map((f) => f.key));
  const typeKeys = new Set(TIMELINE_FILTERS.filter((f) => f.group === "type").map((f) => f.key));

  const filteredEvents = useMemo(() => {
    const maxDays = RANGE_DAYS[range];
    const selectedActors = [...activeFilters].filter((f) => actorKeys.has(f));
    const selectedTypes = [...activeFilters].filter((f) => typeKeys.has(f));
    const q = query.trim().toLowerCase();

    return TIMELINE_EVENTS.filter((e) => {
      if (daysAgo(e.sortDate) > maxDays) return false;
      if (selectedActors.length > 0 && !selectedActors.includes(e.actor)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(e.type)) return false;
      if (q) {
        const haystack = [e.title, e.summary, e.outcome ?? "", ...(e.groupedItems ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [range, activeFilters, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of filteredEvents) {
      if (!map.has(e.dateGroup)) map.set(e.dateGroup, []);
      map.get(e.dateGroup)!.push(e);
    }
    return Array.from(map.entries());
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Engagement</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Follow {firstName}'s relationship between meetings.</p>
        </div>
        <SelectField
          size="sm"
          value={range}
          onValueChange={(v: unknown) => setRange(v as "7d" | "30d" | "90d")}
          className="w-[150px]"
          aria-label="Time range"
          items={RANGE_LABELS}
        >
          {(Object.keys(RANGE_LABELS) as (keyof typeof RANGE_LABELS)[]).map((k) => (
            <SelectItem key={k} value={k}>{RANGE_LABELS[k]}</SelectItem>
          ))}
        </SelectField>
      </div>

      {/* 1. Compact engagement summary */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4">
        <div className="flex flex-wrap gap-y-3">
          {[
            { label: "Last Client Interaction", value: ENGAGEMENT_SUMMARY.lastClientInteraction },
            { label: "Last Advisor Interaction", value: ENGAGEMENT_SUMMARY.lastAdvisorInteraction },
            { label: "Open Client Actions", value: String(ENGAGEMENT_SUMMARY.openClientActions) },
            { label: "Pending Advisor Actions", value: String(ENGAGEMENT_SUMMARY.pendingAdvisorActions) },
            { label: "Learning", value: `${ENGAGEMENT_SUMMARY.learningCompleted} completed` },
            { label: "Simulations", value: `${ENGAGEMENT_SUMMARY.simulationsCompleted} completed` },
            { label: "Content Viewed", value: String(ENGAGEMENT_SUMMARY.contentViewed) },
            { label: "Next Meeting", value: ENGAGEMENT_SUMMARY.nextMeeting },
          ].map((item, i) => (
            <div key={item.label} className={`flex-1 min-w-[130px] px-4 ${i > 0 ? "border-l border-[var(--border-tertiary)]" : "pl-0"}`}>
              <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning | Simulations | Workshops — current status, not history (the timeline covers history).
          Each list is capped so the row stays a fixed shape regardless of how much data the client
          has accumulated; "+N more" hands off to the timeline below, filtered to that type. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
            <BookOpen size={13} className="text-[var(--icon-tertiary)]" /> Learning
          </h3>
          <div className="space-y-2">
            {client.learning.slice(0, MAX_VISIBLE_STATUS_ITEMS).map((path) => (
              <div key={path.id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs text-[var(--text-secondary)] truncate">{path.name}</span>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] flex-shrink-0">{path.completed}/{path.total}</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${path.completed === path.total ? "bg-[var(--color-success-500)]" : "bg-[var(--bg-brand-primary)]"}`}
                    style={{ width: `${(path.completed / path.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {client.learning.length > MAX_VISIBLE_STATUS_ITEMS && (
            <button
              onClick={() => viewAllInTimeline("learning")}
              className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mt-2.5"
            >
              +{client.learning.length - MAX_VISIBLE_STATUS_ITEMS} more
            </button>
          )}
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
            <BarChart3 size={13} className="text-[var(--icon-tertiary)]" /> Simulations
          </h3>
          <div className="space-y-2">
            {client.simulations.slice(0, MAX_VISIBLE_STATUS_ITEMS).map((sim) => (
              <div key={sim.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-secondary)] truncate">{sim.name}</span>
                <span
                  className={`text-[12px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    sim.status === "completed"
                      ? "bg-[var(--bg-status-success-subtle)] text-[var(--text-status-success)]"
                      : sim.status === "in-progress"
                      ? "bg-[var(--bg-status-warning-subtle)] text-[var(--text-status-warning)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {sim.status === "completed" ? "Completed" : sim.status === "in-progress" ? "In progress" : "Abandoned"}
                </span>
              </div>
            ))}
          </div>
          {client.simulations.length > MAX_VISIBLE_STATUS_ITEMS && (
            <button
              onClick={() => viewAllInTimeline("simulation")}
              className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mt-2.5"
            >
              +{client.simulations.length - MAX_VISIBLE_STATUS_ITEMS} more
            </button>
          )}
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
            <Users size={13} className="text-[var(--icon-tertiary)]" /> Workshops
          </h3>
          <div className="space-y-2">
            {WORKSHOPS.slice(0, MAX_VISIBLE_STATUS_ITEMS).map((ws) => (
              <div key={ws.name} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-secondary)] truncate">{ws.name}</span>
                <span
                  className={`text-[12px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    ws.status === "attended"
                      ? "bg-[var(--bg-status-success-subtle)] text-[var(--text-status-success)]"
                      : ws.status === "registered"
                      ? "bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]"
                      : ws.status === "missed"
                      ? "bg-[var(--bg-status-error-subtle)] text-[var(--text-status-error)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {WORKSHOP_STATUS_LABEL[ws.status]}
                </span>
              </div>
            ))}
          </div>
          {WORKSHOPS.length > MAX_VISIBLE_STATUS_ITEMS && (
            <button
              onClick={() => viewAllInTimeline("workshop")}
              className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mt-2.5"
            >
              +{WORKSHOPS.length - MAX_VISIBLE_STATUS_ITEMS} more
            </button>
          )}
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFilters(new Set())}
            className={`text-[13px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
              activeFilters.size === 0
                ? "bg-[var(--bg-brand-primary)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            All
          </button>
          {TIMELINE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={`text-[13px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                activeFilters.has(f.key)
                  ? "bg-[var(--bg-brand-primary)] text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--icon-tertiary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity..."
            className="w-full text-xs bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] rounded-[var(--radius-md)] pl-8 pr-7 py-1.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--border-brand-secondary)]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--icon-tertiary)] hover:text-[var(--icon-primary)]">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Timeline + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Primary: Engagement Timeline */}
        <div ref={timelineRef} className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5 scroll-mt-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Engagement Timeline</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Recent interactions, activity and commitments.</p>
          </div>

          {grouped.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">No activity matches these filters.</p>
          ) : (
            <div className="space-y-5">
              {grouped.map(([dateGroup, events]) => (
                <div key={dateGroup}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">
                      {dateGroup}
                    </span>
                    <div className="h-px flex-1 bg-[var(--border-tertiary)]" />
                  </div>
                  <div className="relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border-tertiary)]" />
                    <div>
                      {events.map((event) => (
                        <EventRow key={event.id} event={event} query={query} onOpen={openDrawer} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Finny · Open Loops · Next Meeting */}
        <div className="space-y-4 xl:sticky xl:top-4">
          {/* Finny noticed */}
          {!finnyDismissed && (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={13} className="text-[var(--icon-brand-primary)]" />
                <span className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Finny noticed</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-snug mb-2.5">{FINNY_ENGAGEMENT_NOTE.observation}</p>
              <ul className="space-y-1 mb-3">
                {FINNY_ENGAGEMENT_NOTE.evidence.map((e) => (
                  <li key={e} className="text-[13px] text-[var(--text-brand-secondary)]">· {e}</li>
                ))}
              </ul>
              <div className="rounded-[var(--radius-md)] bg-[var(--bg-primary)] p-2.5 mb-3">
                <p className="text-[13px] text-[var(--text-secondary)]">{FINNY_ENGAGEMENT_NOTE.suggestedAction}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleAdd("finny-note")}
                  disabled={addedContext["finny-note"]}
                  className={`text-[13px] font-semibold ${addedContext["finny-note"] ? "text-[var(--text-status-success)]" : "text-[var(--text-brand-primary)] hover:underline"}`}
                >
                  {addedContext["finny-note"] ? "Added ✓" : "Add to Meeting Context"}
                </button>
                <button className="text-[13px] font-semibold text-[var(--text-brand-primary)] hover:underline">View engagement pattern</button>
                <button onClick={() => setFinnyDismissed(true)} className="text-[13px] font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Engagement signals */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Engagement Signals</h3>
            <div className="space-y-2">
              {ENGAGEMENT_SIGNALS.map((s) => {
                const Icon = s.direction === "up" ? TrendingUp : s.direction === "down" ? TrendingDown : s.direction === "stable" ? Minus : null;
                const color = s.direction === "up" ? "text-[var(--text-status-success)]" : s.direction === "down" ? "text-[var(--text-status-warning)]" : "text-[var(--text-tertiary)]";
                return (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${color}`}>
                      {Icon && <Icon size={12} strokeWidth={2} />}
                      {s.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open loops */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Open Loops</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Client</p>
                {OPEN_LOOPS.client.map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--text-primary)]">{item.title}</p>
                    {item.due && <span className="text-[13px] text-[var(--text-tertiary)] flex-shrink-0">Due {item.due}</span>}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Advisor</p>
                {OPEN_LOOPS.advisor.map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--text-primary)]">{item.title}</p>
                    {item.due && <span className="text-[13px] text-[var(--text-tertiary)] flex-shrink-0">Due {item.due}</span>}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Pending</p>
                {OPEN_LOOPS.pending.map((item) => (
                  <p key={item.title} className="text-xs text-[var(--text-primary)]">{item.title}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Next meeting */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">Next Meeting</h3>
            <div className="flex items-center gap-1.5 mb-3">
              <Calendar size={13} className="text-[var(--icon-brand-primary)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">{NEXT_MEETING_CONTEXT.title}</p>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mb-3">{NEXT_MEETING_CONTEXT.date} · {NEXT_MEETING_CONTEXT.time}</p>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
              Relevant since last meeting
            </p>
            <ul className="space-y-1 mb-3">
              {NEXT_MEETING_CONTEXT.relevantSince.map((item) => (
                <li key={item} className="text-[13px] text-[var(--text-secondary)] flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[var(--icon-quaternary)] mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full text-xs font-semibold text-white bg-[var(--bg-brand-primary)] py-2 rounded-[var(--radius-md)] hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
              Prepare Meeting Context <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <EngagementEventDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        added={selectedEvent ? !!addedContext[selectedEvent.id] : false}
        onAddToMeeting={handleAdd}
      />
    </div>
  );
}
