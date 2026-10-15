"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/fincaree/button";
import { ButtonGroup } from "@/components/fincaree/button-group";
import {
  Report,
  AIFlagType,
  MOCK_TODAY,
  workPlanReports,
  weekDates,
  estimateMinutes,
  formatMinutes,
  planReason,
  primaryAction,
  reportCategoryLabel,
  computeFinnySummary,
} from "./data";
import { FlagIcon } from "./FlagIcon";
import { mostSevereFlag } from "./data";
import { Sparkles, ChevronRight, X, GripVertical, ArrowUp, ArrowDown, Plus, CalendarClock, FileCheck2, AlertCircle } from "lucide-react";

/* ============================================================
   My Work Plan — the planning layer over the same records.
   Not a second table: Today is the my-queue set, urgency-sorted,
   capped to what fits a day. This Week is the same set grouped by
   the day its review deadline actually falls on.
   ============================================================ */

type SubView = "today" | "week";

const TODAY_CAP = 4;
/** Chips shown per day before "+N more" — matches the meeting calendar's cap. */
const VISIBLE_PER_DAY = 3;

/** Left-border accent per task chip — the same severity read as FlagIcon,
    as a raw color for inline style (border-left can't take a Tailwind
    text-color class the way the rest of the app colors icons). */
function flagAccent(type: AIFlagType | undefined): string {
  switch (type) {
    case "suggestion":
      return "var(--color-brand-500)";
    case "compliance-review":
    case "exception":
    case "conflicting-data":
    case "data-gap":
      return "var(--color-error-500)";
    case "stale-data":
    case "assumption":
      return "var(--color-warning-500)";
    default:
      return "var(--color-success-500)";
  }
}

/** Apply a manual order on top of the urgency-sorted queue: listed ids come
    first in that order, anything not yet reordered keeps its natural place
    after. Ids that no longer exist (dismissed) are silently dropped. */
function reorderBy(items: Report[], order: string[]): Report[] {
  if (order.length === 0) return items;
  const byId = new Map(items.map((r) => [r.id, r]));
  const ordered = order.map((id) => byId.get(id)).filter((r): r is Report => !!r);
  const remaining = items.filter((r) => !order.includes(r.id));
  return [...ordered, ...remaining];
}

function scheduleStartTimes(reports: Report[]): string[] {
  let minutes = 9 * 60; // 09:00
  return reports.map((r) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    minutes += estimateMinutes(r) + 15; // buffer between tasks
    if (minutes >= 13 * 60 && minutes < 13 * 60 + 30) minutes = 13 * 60 + 30; // skip lunch
    return label;
  });
}

interface WorkPlanProps {
  reports: Report[];
  /** Reports pulled in manually from All Reports, on top of the my-queue set
      — derived from scheduledOverrides having an entry for that report's id. */
  addedToPlan?: Set<string>;
  /** When each report is scheduled for (a full date and time), keyed by
      report id — set from the table's open date/time picker or by dragging
      a chip in the week calendar. Lifted to the page so both stay in sync. */
  scheduledOverrides: Record<string, string>;
  onScheduleChange: (id: string, datetime: string | null) => void;
  onOpenReport: (r: Report) => void;
  /** Jump to All Reports so the advisor can find and add a report that
      isn't already in the plan — the only place that action lives. */
  onBrowseAllReports: () => void;
}

export function WorkPlan({
  reports,
  addedToPlan,
  scheduledOverrides,
  onScheduleChange,
  onOpenReport,
  onBrowseAllReports,
}: WorkPlanProps) {
  const [subView, setSubView] = useState<SubView>("today");
  const [planRevealed, setPlanRevealed] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const taskListRef = useRef<HTMLDivElement>(null);

  const queue = useMemo(
    () => workPlanReports(reports, addedToPlan).filter((r) => !dismissedIds.has(r.id)),
    [reports, addedToPlan, dismissedIds]
  );

  /* The advisor's manual reorder, applied on top of the urgency sort —
     Finny proposes the order, the advisor can override it. */
  const [manualOrder, setManualOrder] = useState<string[]>([]);
  const orderedQueue = useMemo(() => reorderBy(queue, manualOrder), [queue, manualOrder]);

  /* The cap trims the natural queue, but a report the advisor manually
     pulled in must stay visible regardless of where it ranks — otherwise
     "add to plan" silently does nothing for anything outside the top 4
     (which is exactly the kind of report most likely to need promoting:
     no deadline, nothing urgent about it on its own). */
  const todayItems = useMemo(() => {
    const capped = orderedQueue.slice(0, TODAY_CAP);
    const cappedIds = new Set(capped.map((r) => r.id));
    const mustInclude = orderedQueue.filter((r) => addedToPlan?.has(r.id) && !cappedIds.has(r.id));
    return [...capped, ...mustInclude];
  }, [orderedQueue, addedToPlan]);
  const restItems = useMemo(() => {
    const todayIds = new Set(todayItems.map((r) => r.id));
    return orderedQueue.filter((r) => !todayIds.has(r.id));
  }, [orderedQueue, todayItems]);
  const remaining = restItems.length;
  const startTimes = scheduleStartTimes(todayItems);
  const totalMinutes = todayItems.reduce((sum, r) => sum + estimateMinutes(r), 0);

  function moveTask(id: string, to: number) {
    const from = todayItems.findIndex((r) => r.id === id);
    if (from < 0) return;
    const next = [...todayItems];
    const [item] = next.splice(from, 1);
    const target = Math.max(0, Math.min(to > from ? to - 1 : to, next.length));
    next.splice(target, 0, item);
    setManualOrder([...next, ...restItems].map((r) => r.id));
  }

  /* Drag and drop — a ref, because dragover can't read dataTransfer. */
  const dragId = useRef<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function startDrag(e: React.DragEvent, id: string) {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }
  function endDrag() {
    dragId.current = null;
    setDropIndex(null);
  }
  /** Over a task: drop before it in its top half, after it in its bottom half. */
  function overTask(e: React.DragEvent, index: number) {
    if (!dragId.current) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setDropIndex(e.clientY < r.top + r.height / 2 ? index : index + 1);
  }
  function dropTask(e: React.DragEvent) {
    e.preventDefault();
    const id = dragId.current;
    const at = dropIndex ?? todayItems.length;
    if (id) moveTask(id, at);
    endDrag();
  }

  const summary = useMemo(() => computeFinnySummary(reports), [reports]);
  const aiDraftsReady = todayItems.filter((r) => r.status === "ai-draft-ready" || r.status === "advisor-review").length;
  const needsData = todayItems.filter((r) => r.status === "needs-attention").length;

  const days = useMemo(() => weekDates(), []);

  /* scheduledOverrides now lives in the page, shared with the table's
     date/time picker — dragging a chip here and picking a date there write
     the same state. Only the date part buckets a report into a day column;
     the time part (if any) is preserved across a drag. */
  const byDay = useMemo(() => {
    const map = new Map<string, Report[]>(days.map((d) => [d.iso, []]));
    for (const r of queue) {
      const iso = scheduledOverrides[r.id]?.slice(0, 10) ?? r.reviewBy.date?.slice(0, 10);
      if (iso && map.has(iso)) map.get(iso)!.push(r);
    }
    return map;
  }, [queue, days, scheduledOverrides]);

  /* Drag and drop between days — a separate ref from the Today reorder's,
     since a chip can only be dragged while the week grid is mounted. */
  const dragDayReportId = useRef<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  function startDayDrag(e: React.DragEvent, id: string) {
    dragDayReportId.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }
  function endDayDrag() {
    dragDayReportId.current = null;
    setDragOverDay(null);
  }
  function overDay(e: React.DragEvent, iso: string) {
    if (!dragDayReportId.current) return;
    e.preventDefault();
    setDragOverDay(iso);
  }
  function dropOnDay(e: React.DragEvent, iso: string) {
    e.preventDefault();
    const id = dragDayReportId.current;
    if (id) {
      // Keep whatever time was already set (default to 09:00 for a report
      // that's never been scheduled) — dragging only moves the day.
      const time = scheduledOverrides[id]?.slice(11) || "09:00";
      onScheduleChange(id, `${iso}T${time}`);
    }
    endDayDrag();
  }

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">My Work Plan</h2>
        <div className="flex items-center gap-2">
          <ButtonGroup
            options={[
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
            ]}
            value={subView}
            onChange={(v) => setSubView(v as SubView)}
            aria-label="Switch between today and this week"
          />
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} strokeWidth={2} />}
            onClick={onBrowseAllReports}
          >
            Add report
          </Button>
        </div>
      </div>

      {subView === "today" ? (
        <div>
          {/* Finny banner */}
          {!planRevealed ? (
            <div className="flex items-center gap-4 flex-wrap rounded-[var(--radius-lg)] border border-[var(--border-brand-tint)] bg-[var(--bg-brand-subtle)] px-3.5 py-2.5 mb-3">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles size={14} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-brand-primary)]">
                  {todayItems.length} today
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
                {summary.meetingBlockers > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    <CalendarClock size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
                    <span className="font-semibold text-[var(--text-primary)] tabular-nums">{summary.meetingBlockers}</span>
                    blocking a meeting
                  </span>
                )}
                {aiDraftsReady > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    <FileCheck2 size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
                    <span className="font-semibold text-[var(--text-primary)] tabular-nums">{aiDraftsReady}</span>
                    AI draft ready
                  </span>
                )}
                {needsData > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    <AlertCircle size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
                    <span className="font-semibold text-[var(--text-primary)] tabular-nums">{needsData}</span>
                    need client data
                  </span>
                )}
              </div>

              <Button variant="secondary" size="sm" onClick={() => setPlanRevealed(true)} className="shrink-0">
                Plan My Day
              </Button>
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-brand-tint)] bg-[var(--bg-brand-subtle)] px-3.5 py-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-brand-primary)]">Today&apos;s recommended sequence</span>
              </div>
              <ol className="space-y-1 mb-2.5">
                {todayItems.map((r, i) => (
                  <li key={r.id} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-[var(--text-brand-primary)] font-semibold shrink-0">{i + 1}.</span>
                    <span>
                      {primaryAction(r.status).label} {r.client.name}&apos;s {reportCategoryLabel(r).toLowerCase()} — {planReason(r)}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={() => setPlanRevealed(true)}>Accept Plan</Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => taskListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  Reorder
                </Button>
              </div>
            </div>
          )}

          {/* Task list header */}
          <div ref={taskListRef} className="flex items-center justify-between px-0.5 mb-2">
            <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
              {todayItems.length} task{todayItems.length === 1 ? "" : "s"} · {formatMinutes(totalMinutes)}
            </span>
            {todayItems.length > 1 && (
              <span className="text-[11px] text-[var(--text-tertiary)]">Drag to reorder</span>
            )}
          </div>

          {todayItems.length === 0 ? (
            <EmptyPlan />
          ) : (
            <div className="space-y-0" onDrop={dropTask} onDragOver={(e) => e.preventDefault()}>
              {todayItems.map((r, i) => (
                <TaskRow
                  key={r.id}
                  report={r}
                  index={i + 1}
                  total={todayItems.length}
                  addedByYou={addedToPlan?.has(r.id) ?? false}
                  startTime={startTimes[i]}
                  dropBefore={dropIndex === i}
                  dropAfter={dropIndex === todayItems.length && i === todayItems.length - 1}
                  onOpen={() => onOpenReport(r)}
                  onDismiss={() => dismiss(r.id)}
                  onDragStart={(e) => startDrag(e, r.id)}
                  onDragEnd={endDrag}
                  onDragOver={(e) => overTask(e, i)}
                  onMoveUp={() => moveTask(r.id, i - 1)}
                  onMoveDown={() => moveTask(r.id, i + 2)}
                />
              ))}
            </div>
          )}

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setSubView("week")}
              className="mt-3 text-xs text-[var(--text-brand-primary)] hover:underline"
            >
              +{remaining} more this week →
            </button>
          )}
        </div>
      ) : (
        /* `relative` keeps the visually hidden sr-only date text inside the
           page's scroll area, same reasoning as the meeting calendar. */
        <section
          aria-label="This week's work plan"
          className="relative rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden"
        >
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">Reports planned this week</caption>
            <thead>
              <tr>
                {days.map((d) => (
                  <th
                    key={d.iso}
                    scope="col"
                    className={cn(
                      "px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider border-b border-[var(--border-tertiary)]",
                      d.iso === MOCK_TODAY ? "text-[var(--text-brand-primary)]" : "text-[var(--text-tertiary)]"
                    )}
                  >
                    {d.weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map((d) => {
                  const items = byDay.get(d.iso) ?? [];
                  const isToday = d.iso === MOCK_TODAY;
                  const open = expandedDays.has(d.iso);
                  const shown = open ? items : items.slice(0, VISIBLE_PER_DAY);
                  const hidden = items.length - shown.length;
                  return (
                    <td
                      key={d.iso}
                      aria-current={isToday ? "date" : undefined}
                      onDragOver={(e) => overDay(e, d.iso)}
                      onDrop={(e) => dropOnDay(e, d.iso)}
                      className={cn(
                        "align-top h-[300px] p-1.5 border-r last:border-r-0 border-[var(--border-tertiary)] transition-colors",
                        isToday && "bg-[var(--bg-brand-subtle)] shadow-[inset_0_3px_0_0_var(--border-brand-primary)]",
                        dragOverDay === d.iso && "bg-[var(--bg-brand-subtle)] shadow-[inset_0_0_0_2px_var(--border-brand-primary)]"
                      )}
                    >
                      <div className="flex items-center gap-1.5 px-0.5 mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold tabular-nums",
                            isToday
                              ? "bg-[var(--bg-brand-primary)] text-[var(--text-on-brand-primary)]"
                              : "text-[var(--text-secondary)]"
                          )}
                        >
                          <span aria-hidden="true">{d.date}</span>
                          <span className="sr-only">
                            {d.weekday} {d.date}
                            {isToday ? ", today" : ""}
                            {items.length ? `, ${items.length} report${items.length === 1 ? "" : "s"}` : ""}
                          </span>
                        </span>
                        {isToday && (
                          <span aria-hidden="true" className="text-xs font-semibold text-[var(--text-brand-primary)]">
                            Today
                          </span>
                        )}
                      </div>

                      <ul className="flex flex-col gap-1.5">
                        {shown.map((r) => {
                          const lead = mostSevereFlag(r.aiFlags);
                          const extraFlags = r.aiFlags.length - (lead ? 1 : 0);
                          return (
                            <li key={r.id}>
                              <button
                                type="button"
                                draggable
                                onDragStart={(e) => startDayDrag(e, r.id)}
                                onDragEnd={endDayDrag}
                                onClick={() => onOpenReport(r)}
                                aria-label={`${r.client.name}, ${reportCategoryLabel(r)}, ${r.readiness}% ready, ${lead ? lead.label : noFlagStatusLabel(r.status)}. Draggable to move to another day.`}
                                title={`${r.client.name} · ${reportCategoryLabel(r)} — drag to move to another day`}
                                className="group w-full flex items-start gap-1 rounded-[var(--radius-sm)] border border-[var(--border-tertiary)] border-l-[3px] bg-[var(--bg-primary)] pl-1.5 pr-0.5 py-1.5 text-left cursor-grab active:cursor-grabbing hover:bg-[var(--bg-secondary)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--focus-ring-border-primary)] transition-colors"
                                style={{ borderLeftColor: flagAccent(lead?.type) }}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="block w-full truncate text-xs font-semibold text-[var(--text-primary)]">
                                    {r.client.name}
                                  </span>
                                  <span className="block w-full truncate text-[11px] text-[var(--text-tertiary)]">
                                    {reportCategoryLabel(r)}
                                  </span>

                                  {/* Readiness — a quick "how close to done" glance */}
                                  <span className="flex items-center gap-1 mt-1">
                                    <span className="h-1 flex-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                      <span
                                        className="block h-full rounded-full"
                                        style={{
                                          width: `${r.readiness}%`,
                                          backgroundColor:
                                            r.readiness >= 90
                                              ? "var(--color-success-500)"
                                              : r.readiness >= 70
                                                ? "var(--color-brand-500)"
                                                : r.readiness >= 50
                                                  ? "var(--color-warning-500)"
                                                  : "var(--color-error-500)",
                                        }}
                                      />
                                    </span>
                                    <span className="text-[10px] tabular-nums text-[var(--text-tertiary)] shrink-0">
                                      {r.readiness}%
                                    </span>
                                  </span>

                                  <span className="flex items-center gap-1 mt-1 min-w-0">
                                    {lead ? (
                                      <>
                                        <FlagIcon type={lead.type} size={10} />
                                        <span className="truncate text-[11px] text-[var(--text-secondary)]">{lead.label}</span>
                                        {extraFlags > 0 && (
                                          <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">+{extraFlags}</span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="truncate text-[11px] text-[var(--text-status-success)]">
                                        {noFlagStatusLabel(r.status)}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                <GripVertical
                                  size={12}
                                  strokeWidth={1.75}
                                  aria-hidden="true"
                                  className="mt-0.5 shrink-0 text-[var(--icon-quaternary)] group-hover:text-[var(--icon-tertiary)]"
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {hidden > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedDays((prev) => new Set(prev).add(d.iso))}
                          className="mt-1 px-1 text-[11px] font-semibold text-[var(--text-brand-primary)] hover:underline"
                        >
                          +{hidden} more
                        </button>
                      )}
                      {items.length === 0 && (
                        <p className="px-0.5 mt-1 text-[11px] text-[var(--text-tertiary)]">No reports</p>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function EmptyPlan() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] px-6 py-8 text-center">
      <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">You&apos;re all caught up.</div>
      <p className="text-xs text-[var(--text-tertiary)]">Nothing scheduled for this period.</p>
    </div>
  );
}

interface TaskRowProps {
  report: Report;
  index: number;
  total?: number;
  addedByYou?: boolean;
  startTime?: string;
  dropBefore?: boolean;
  dropAfter?: boolean;
  onOpen: () => void;
  onDismiss: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

/** What to say about a report with no AI flags — "AI draft ready" only
    actually holds for a report still moving through review; a report
    that's already out the door needs its own line, not a stale one. */
function noFlagStatusLabel(status: Report["status"]): string {
  if (status === "shared") return "Already shared with client";
  if (status === "approved") return "Approved";
  if (status === "archived") return "Archived";
  if (status === "generating") return "Generating…";
  return "AI draft ready";
}

function TaskRow({
  report,
  index,
  total,
  addedByYou,
  startTime,
  dropBefore,
  dropAfter,
  onOpen,
  onDismiss,
  onDragStart,
  onDragEnd,
  onDragOver,
  onMoveUp,
  onMoveDown,
}: TaskRowProps) {
  const action = primaryAction(report.status);
  const lead = mostSevereFlag(report.aiFlags);
  const reorderable = !!onMoveUp;
  return (
    <div
      draggable={reorderable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={cn(
        "relative border-t border-[var(--border-tertiary)] first:border-t-0 py-3 flex items-start gap-3",
        reorderable && "cursor-grab active:cursor-grabbing"
      )}
    >
      {dropBefore && <DropLine className="-top-[1px]" />}
      {reorderable && (
        <GripVertical size={14} strokeWidth={1.75} className="mt-1.5 shrink-0 text-[var(--icon-quaternary)]" aria-hidden="true" />
      )}
      {startTime && (
        <div className="w-12 shrink-0 text-xs text-[var(--text-tertiary)] tabular-nums pt-0.5">{startTime}</div>
      )}
      <div className="w-5 shrink-0 text-xs font-semibold text-[var(--text-tertiary)] pt-0.5">{index}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-medium text-[var(--text-primary)] leading-snug">{report.client.name}</div>
          {addedByYou && (
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--text-brand-primary)] bg-[var(--bg-brand-subtle)] rounded-full px-1.5 py-0.5">
              Added by you
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--text-tertiary)] mb-1">{reportCategoryLabel(report)}</div>
        {lead ? (
          <div className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] mb-1">
            <FlagIcon type={lead.type} size={11} />
            {lead.label}
          </div>
        ) : (
          <div className="text-xs text-[var(--text-status-success)] mb-1">{noFlagStatusLabel(report.status)}</div>
        )}
        <div className="text-xs text-[var(--text-tertiary)]">{planReason(report)}</div>
      </div>
      <div className="shrink-0">
        <Button variant={action.variant} size="sm" trailingIcon={<ChevronRight size={12} strokeWidth={2} />} onClick={onOpen}>
          {action.label}
        </Button>
      </div>
      {reorderable && (
        <div className="flex flex-col items-center shrink-0 -my-1">
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            disabled={index === 1}
            aria-label={`Move ${report.client.name}'s report up`}
            leadingIcon={<ArrowUp size={12} strokeWidth={1.75} />}
            onClick={onMoveUp}
          />
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            disabled={index === total}
            aria-label={`Move ${report.client.name}'s report down`}
            leadingIcon={<ArrowDown size={12} strokeWidth={1.75} />}
            onClick={onMoveDown}
          />
        </div>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Dismiss ${report.client.name}'s report from today's plan`}
        title="Dismiss from plan"
        className="shrink-0 text-[var(--icon-tertiary)] hover:text-[var(--icon-primary)] p-1 -m-1"
      >
        <X size={13} strokeWidth={1.75} />
      </button>
      {dropAfter && <DropLine className="-bottom-[1px]" />}
    </div>
  );
}

function DropLine({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute left-0 right-0 h-[2px] rounded-full bg-[var(--border-brand-primary)]", className)}
    />
  );
}
