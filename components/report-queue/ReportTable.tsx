"use client";

import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ButtonGroup } from "@/components/fincaree/button-group";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/fincaree/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Report,
  ReportStatus,
  StatusBadgeColor,
  STATUS_COLORS,
  STATUS_LABELS,
  reportCategoryLabel,
  reviewByUrgency,
  mostSevereFlag,
  primaryAction,
  isoDate,
  MOCK_TODAY,
} from "./data";
import { FlagIcon } from "./FlagIcon";
import {
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Copy,
  FileDown,
  Archive,
  CalendarX,
  CalendarClock,
  Clock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MeetingWhen } from "./MeetingWhen";

/* ============================================================
   Report Table — the queue's only view.
   Columns: Client | Report Type | Meeting | Review By | AI Signals |
            Readiness | Status | Action
   Sort order is fixed (urgency-first, see sortReportsByUrgency in
   data.ts) — this is a work queue, not a sortable ledger.
   ============================================================ */

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function statusToColor(status: ReportStatus): StatusBadgeColor {
  return STATUS_COLORS[status] ?? "gray";
}

function statusToLabel(status: ReportStatus): string {
  return STATUS_LABELS[status] ?? status;
}

function ReadinessBar({ value }: { value: number }) {
  const color =
    value >= 90 ? "var(--color-success-500)" :
    value >= 70 ? "var(--color-brand-500)" :
    value >= 50 ? "var(--color-warning-500)" :
    "var(--color-error-500)";

  return (
    <div className="flex items-center gap-2 min-w-[96px]">
      <div className="h-1.5 w-14 rounded-full bg-[var(--bg-tertiary)] overflow-hidden shrink-0">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums text-[var(--text-tertiary)] leading-tight">{value}%</span>
    </div>
  );
}

function AISignalsCell({ flags }: { flags: Report["aiFlags"] }) {
  if (flags.length === 0) {
    return <span className="text-xs text-[var(--text-tertiary)]">None</span>;
  }
  // Lead with the most severe signal, not just the first one in the array —
  // a compliance flag shouldn't hide behind an earlier suggestion.
  const lead = mostSevereFlag(flags)!;
  const rest = flags.length - 1;
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      <FlagIcon type={lead.type} size={12} />
      <span className="truncate max-w-[140px]">{lead.label}</span>
      {rest > 0 && (
        <span className="text-[var(--text-tertiary)] shrink-0">+{rest}</span>
      )}
    </div>
  );
}

/** The Plan column — one open control, any date and time, no presets.
    Picking a value schedules the report into My Work Plan (on a date the
    natural queue wouldn't have put it, or at all, for a shared/archived
    report); it's the same scheduledOverrides map the week calendar's
    drag-and-drop writes, so this is never a second source of truth. */
/** "HH:MM" in 15-minute steps across the day, e.g. "09:00", "09:15" — the
    options for the Plan picker's time select. A native <input type="time">
    opens the browser's own OS-level picker, which ignores all page CSS
    (including Fincaree's brand color), so this is a plain Select instead:
    fully themeable, and the whole trigger is clickable, not just an icon. */
/** 24h "HH:MM" → its three separate parts, for the split hour/minute/period
    controls — each one its own small dropdown rather than one long list. */
function from24h(hhmm: string): { hour: string; minute: string; period: "AM" | "PM" } {
  const [h, m] = hhmm.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour: String(hour12).padStart(2, "0"), minute: String(m).padStart(2, "0"), period: h < 12 ? "AM" : "PM" };
}

function to24h(hour: string, minute: string, period: "AM" | "PM"): string {
  let h = Number(hour) % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function formatTimeLabel(hhmm: string): string {
  const { hour, minute, period } = from24h(hhmm);
  return `${Number(hour)}:${minute} ${period}`;
}

function formatScheduled(datetime: string): string {
  const [datePart, timePart] = datetime.split("T");
  const d = new Date(`${datePart}T00:00:00`);
  const dateLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${dateLabel}, ${formatTimeLabel(timePart ?? "09:00")}`;
}

/** A calendar-and-time popover, not a browser-native date input — the look
    and interaction the rest of the app's pickers already use (Popover +
    Calendar, both Fincaree-tokenized), and any date in any week, month or
    year is reachable through the calendar's own month navigation. */
/** This mock's "today" — the whole Work Plan feature (Today tab, Week
    calendar) is anchored to MOCK_TODAY, not the real system clock, so the
    picker has to use the same reference. Otherwise picking a time before a
    date (or just opening the calendar) silently lands on the real date —
    which for this prototype's fictional May 2025 timeline could be over a
    year away from every other date in the app. */
const MOCK_TODAY_DATE = new Date(`${MOCK_TODAY}T00:00:00`);

/** The dropdown half shared by ComboField and PeriodDropdown — a plain
    absolutely-positioned list in this same DOM subtree, not Base UI's
    Select (which renders through a second portal; nested inside the
    scheduling Popover's own portal, a click on an option landed outside
    both components' notion of "inside," closing the whole popover instead
    of picking a value). */
function useFieldDropdown(current: string) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    selectedRef.current?.scrollIntoView({ block: "center" });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, current]);

  return { open, setOpen, rootRef, selectedRef };
}

function FieldOptionList({
  options,
  current,
  ariaLabel,
  selectedRef,
  onPick,
}: {
  options: readonly string[];
  current: string;
  ariaLabel: string;
  selectedRef: React.RefObject<HTMLButtonElement | null>;
  onPick: (v: string) => void;
}) {
  return (
    <div
      role="listbox"
      aria-label={ariaLabel}
      className="absolute left-0 right-0 top-full z-10 mt-1 max-h-44 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] py-1 shadow-[var(--shadow-md)]"
    >
      {options.map((o) => (
        <button
          key={o}
          ref={o === current ? selectedRef : undefined}
          type="button"
          role="option"
          aria-selected={o === current}
          onClick={() => onPick(o)}
          className={cn(
            "flex w-full items-center justify-center px-2 py-1.5 text-sm transition-colors",
            o === current
              ? "bg-[var(--bg-brand-subtle)] font-medium text-[var(--text-brand-primary)]"
              : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** A typeable field AND a dropdown for the full range — type a value
    directly for speed, or open the list to browse every option (12 hours,
    60 minutes) and click one. Both write the same value, so they never
    disagree with each other. */
function ComboField({
  value,
  min,
  max,
  onChange,
  ariaLabel,
}: {
  value: string;
  min: number;
  max: number;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState(value);
  // Adjust local draft when the prop changes from elsewhere (e.g. a day
  // dragged onto a different date keeps this field's own last-typed value
  // otherwise) — derived during render, not an effect, per React's own
  // guidance on syncing state to a changed prop.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  const { open, setOpen, rootRef, selectedRef } = useFieldDropdown(value);
  const options = Array.from({ length: max - min + 1 }, (_, i) => String(min + i).padStart(2, "0"));

  function commit() {
    // Focusing clears the field so typed digits just insert — no selection
    // to replace, which sidesteps any "select-then-type" race between the
    // browser's native selection and React's controlled re-render. Blurring
    // without typing anything restores what was there instead of zeroing it.
    if (draft === "") {
      setDraft(value);
      return;
    }
    const n = parseInt(draft, 10);
    const clamped = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
    const padded = String(clamped).padStart(2, "0");
    setDraft(padded);
    if (padded !== value) onChange(padded);
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex h-8 items-stretch overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] transition-colors hover:border-[var(--border-secondary)] focus-within:shadow-[0_0_0_2px_var(--focus-ring-border-primary)]">
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
          onFocus={() => setDraft("")}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label={ariaLabel}
          className="w-7 bg-transparent px-1 text-center text-sm tabular-nums text-[var(--text-primary)] outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${ariaLabel} — browse all options`}
          className="flex w-5 shrink-0 items-center justify-center border-l border-[var(--border-tertiary)] text-[var(--icon-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-secondary)]"
        >
          <ChevronDown size={12} strokeWidth={1.75} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <FieldOptionList
          options={options}
          current={value}
          ariaLabel={`${ariaLabel} options`}
          selectedRef={selectedRef}
          onPick={(o) => {
            setDraft(o);
            setLastValue(o);
            if (o !== value) onChange(o);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

const PERIOD_OPTIONS = ["AM", "PM"] as const;

/** Just two states, but still a dropdown (not a toggle) for the same
    look-and-interaction as the hour and minute fields next to it. */
function PeriodDropdown({
  value,
  onChange,
  ariaLabel,
}: {
  value: "AM" | "PM";
  onChange: (v: "AM" | "PM") => void;
  ariaLabel: string;
}) {
  const { open, setOpen, rootRef, selectedRef } = useFieldDropdown(value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex h-8 w-14 items-center justify-between gap-1 rounded-[var(--radius-sm)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-secondary)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--focus-ring-border-primary)]"
      >
        {value}
        <ChevronDown size={12} strokeWidth={1.75} className={cn("shrink-0 text-[var(--icon-tertiary)] transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <FieldOptionList
          options={PERIOD_OPTIONS}
          current={value}
          ariaLabel={`${ariaLabel} options`}
          selectedRef={selectedRef}
          onPick={(o) => {
            onChange(o as "AM" | "PM");
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PlanCell({
  value,
  onChange,
  clientName,
}: {
  value: string | undefined;
  onChange: (datetime: string | null) => void;
  clientName: string;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(`${value.slice(0, 10)}T00:00:00`) : undefined;
  const time = value ? value.slice(11, 16) : "09:00";
  const { hour, minute, period } = from24h(time);

  function commit(nextDate: Date | undefined, nextTime: string) {
    onChange(nextDate ? `${isoDate(nextDate)}T${nextTime}` : null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<CalendarClock size={14} strokeWidth={1.75} />}
            className="w-[190px] justify-start"
          >
            {value ? formatScheduled(value) : "Schedule"}
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="w-auto p-0"
        aria-label={`Schedule ${clientName}'s report in My Work Plan`}
      >
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date ?? MOCK_TODAY_DATE}
          today={MOCK_TODAY_DATE}
          onSelect={(d) => commit(d, time)}
        />
        <div className="flex items-center gap-1.5 border-t border-[var(--border-tertiary)] px-3 py-2.5">
          <Clock size={14} strokeWidth={1.75} className="shrink-0 text-[var(--icon-tertiary)]" />
          <ComboField
            value={hour}
            min={1}
            max={12}
            onChange={(h) => commit(date ?? MOCK_TODAY_DATE, to24h(h, minute, period))}
            ariaLabel={`Scheduled hour for ${clientName}'s report`}
          />
          <span className="text-[var(--text-tertiary)]">:</span>
          <ComboField
            value={minute}
            min={0}
            max={59}
            onChange={(m) => commit(date ?? MOCK_TODAY_DATE, to24h(hour, m, period))}
            ariaLabel={`Scheduled minute for ${clientName}'s report`}
          />
          <PeriodDropdown
            value={period}
            onChange={(p) => commit(date ?? MOCK_TODAY_DATE, to24h(hour, minute, p))}
            ariaLabel={`AM or PM for ${clientName}'s report`}
          />
          {value && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ReportTableProps {
  reports: Report[];
  onRowClick: (report: Report) => void;
  /** When each report is scheduled for in My Work Plan — a full date and
      time, keyed by id. Optional: tables used outside the Report Queue page
      can omit the Plan column entirely — it only renders when passed. */
  scheduledOverrides?: Record<string, string>;
  onScheduleChange?: (id: string, datetime: string | null) => void;
}

export function ReportTable({
  reports,
  onRowClick,
  scheduledOverrides,
  onScheduleChange,
}: ReportTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const showPlanColumn = !!onScheduleChange;

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1); // avoid landing on a now out-of-range page
  }

  const totalPages = Math.max(1, Math.ceil(reports.length / pageSize));
  const slice = reports.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Table wrapper — shadcn Table, adapted to Fincaree tokens (no table primitive exists in Fincaree) */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
        <Table className={showPlanColumn ? "min-w-[1080px]" : "min-w-[900px]"}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Client</TableHead>
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Report Type</TableHead>
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Meeting</TableHead>
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Review By</TableHead>
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">AI Signals</TableHead>
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Readiness</TableHead>
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Status</TableHead>
              {showPlanColumn && (
                <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Plan</TableHead>
              )}
              <TableHead scope="col" className="px-4 py-2.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((report) => {
              const action = primaryAction(report.status);
              return (
                <TableRow
                  key={report.id}
                  onClick={() => onRowClick(report)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(report);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Open ${report.reportName} for ${report.client.name}`}
                  className="cursor-pointer group"
                >
                  {/* Client */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm" initials={initials(report.client.name)} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] leading-snug truncate">
                          {report.client.name}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] leading-tight">
                          {report.client.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Report Type */}
                  <TableCell className="px-4 py-3">
                    <div className="text-sm text-[var(--text-secondary)] leading-snug">
                      {reportCategoryLabel(report)}
                    </div>
                  </TableCell>

                  {/* Meeting */}
                  <TableCell className="px-4 py-3">
                    {report.meeting ? (
                      <div className="text-sm text-[var(--text-secondary)] leading-snug max-w-[180px] truncate">
                        {report.meeting.label}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                        <CalendarX size={12} strokeWidth={1.75} className="shrink-0" />
                        No Upcoming Meeting
                      </span>
                    )}
                  </TableCell>

                  {/* Review By */}
                  <TableCell className="px-4 py-3">
                    <MeetingWhen
                      label={report.reviewBy.label}
                      urgency={reviewByUrgency(report.reviewBy.category)}
                      srLabel="Review by"
                    />
                  </TableCell>

                  {/* AI Signals */}
                  <TableCell className="px-4 py-3">
                    <AISignalsCell flags={report.aiFlags} />
                  </TableCell>

                  {/* Readiness */}
                  <TableCell className="px-4 py-3">
                    <ReadinessBar value={report.readiness} />
                  </TableCell>

                  {/* Status — Fincaree Badge with dot leading icon */}
                  <TableCell className="px-4 py-3">
                    <Badge color={statusToColor(report.status)} leadingIcon="dot" size="sm">
                      {statusToLabel(report.status)}
                    </Badge>
                  </TableCell>

                  {/* Plan — schedule into My Work Plan: exact date and time */}
                  {showPlanColumn && (
                    <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <PlanCell
                        value={scheduledOverrides?.[report.id]}
                        onChange={(datetime) => onScheduleChange!(report.id, datetime)}
                        clientName={report.client.name}
                      />
                    </TableCell>
                  )}

                  {/* Action — one primary action, rest in the 3-dot menu */}
                  <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={action.variant}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(report);
                        }}
                      >
                        {action.label}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          showChevron={false}
                          render={
                            <Button
                              variant="tertiary"
                              size="sm"
                              iconOnly
                              leadingIcon={<MoreHorizontal size={15} strokeWidth={1.75} />}
                              aria-label="More options"
                            />
                          }
                        />
                        <DropdownMenuContent alignment="end">
                          <DropdownMenuItem icon={<Copy size={14} strokeWidth={1.75} />}>
                            Duplicate report
                          </DropdownMenuItem>
                          <DropdownMenuItem icon={<FileDown size={14} strokeWidth={1.75} />}>
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem icon={<Archive size={14} strokeWidth={1.75} />}>
                            Archive report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-1">
        <div className="text-xs text-[var(--text-tertiary)]">
          Showing {reports.length === 0 ? 0 : ((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, reports.length)} of {reports.length} reports
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            leadingIcon={<ChevronLeft size={14} strokeWidth={2} />}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          />
          <ButtonGroup
            options={Array.from({ length: totalPages }, (_, i) => ({
              value: String(i + 1),
              label: String(i + 1),
            }))}
            value={String(page)}
            onChange={(v) => setPage(Number(v))}
            aria-label="Select page"
          />
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            leadingIcon={<ChevronRight size={14} strokeWidth={2} />}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          Rows per page:
          <SelectField
            size="sm"
            value={String(pageSize)}
            onValueChange={(v: unknown) => handlePageSizeChange(Number(v))}
            aria-label="Rows per page"
            className="w-16"
          >
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectField>
        </div>
      </div>
    </div>
  );
}
