"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ButtonGroup } from "@/components/fincaree/button-group";
import { Checkbox } from "@/components/fincaree/checkbox";
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
import {
  MeetingRecord,
  MeetingStatus,
  StatusBadgeColor,
  STATUS_COLORS,
  STATUS_LABELS,
} from "./data";
import {
  MoreHorizontal,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CalendarPlus,
  Ban,
  FileDown,
} from "lucide-react";
import { useState } from "react";

/* ============================================================
   Meeting Table — Main list view.
   Columns: Client | Meeting | When | Alerts | Actions Open | Status | Actions
   Same structure as the Report Queue's ReportTable.
   ============================================================ */

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function statusToColor(status: MeetingStatus): StatusBadgeColor {
  return STATUS_COLORS[status] ?? "gray";
}

function primaryAction(status: MeetingStatus): { label: string; variant: "primary" | "secondary" } {
  if (status === "needs-prep") return { label: "Prepare", variant: "primary" };
  if (status === "follow-up-pending") return { label: "Follow up", variant: "primary" };
  return { label: "Open", variant: "secondary" };
}

function WhenCell({ label, urgency }: { label: string; urgency: MeetingRecord["urgency"] }) {
  const color =
    urgency === "urgent" ? "text-[var(--text-status-error)]" : urgency === "soon" ? "text-[var(--text-status-warning)]" : "text-[var(--text-secondary)]";
  const bg =
    urgency === "urgent" ? "bg-[var(--bg-status-error-subtle)] border-[var(--border-status-error-subtle)]" : urgency === "soon" ? "bg-[var(--bg-status-warning-subtle)] border-[var(--border-status-warning-subtle)]" : "bg-transparent border-transparent";

  return (
    <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded border", bg)}>
      {urgency === "urgent" && <AlertCircle size={11} strokeWidth={2} className="text-[var(--text-status-error)] shrink-0" />}
      {urgency === "soon" && <Clock size={11} strokeWidth={2} className="text-[var(--text-status-warning)] shrink-0" />}
      <span className={cn("text-xs font-medium leading-tight", color)}>{label}</span>
    </div>
  );
}

function AlertsCell({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
        <span className="text-[var(--icon-placeholder)]">◇</span>
        None
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      {alerts.map((a, i) => (
        <div key={i} className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
          <Sparkles size={10} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />
          <span className="truncate max-w-[140px]">{a}</span>
        </div>
      ))}
    </div>
  );
}

interface MeetingTableProps {
  meetings: MeetingRecord[];
  onRowClick: (meeting: MeetingRecord) => void;
}

export function MeetingTable({ meetings, onRowClick }: MeetingTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  const totalPages = Math.ceil(meetings.length / pageSize);
  const slice = meetings.slice((page - 1) * pageSize, page * pageSize);
  const allChecked = slice.length > 0 && slice.every((m) => checkedIds.has(m.id));
  const someChecked = slice.some((m) => checkedIds.has(m.id));

  function toggleAll() {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allChecked) slice.forEach((m) => next.delete(m.id));
      else slice.forEach((m) => next.add(m.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="w-10 px-4 py-3">
                <Checkbox checked={allChecked} indeterminate={!allChecked && someChecked} onChange={toggleAll} size="sm" aria-label="Select all" />
              </TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Client</TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Meeting</TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">When</TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Alerts</TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Open Actions</TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Status</TableHead>
              <TableHead scope="col" className="px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((meeting) => {
              const action = primaryAction(meeting.status);
              const openActions = meeting.actionItems.filter((a) => a.status !== "completed").length;
              return (
                <TableRow
                  key={meeting.id}
                  onClick={() => onRowClick(meeting)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(meeting);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Open ${meeting.meetingType} for ${meeting.client.name}`}
                  className="cursor-pointer group"
                >
                  <TableCell className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={checkedIds.has(meeting.id)} onChange={() => toggleOne(meeting.id)} size="sm" aria-label={`Select ${meeting.client.name}`} />
                  </TableCell>

                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm" initials={initials(meeting.client.name)} />
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)] leading-snug">{meeting.client.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)] leading-tight">{meeting.client.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)] leading-snug">{meeting.meetingType}</div>
                      <div className="text-xs text-[var(--text-tertiary)] leading-tight">{meeting.mode} · {meeting.duration}</div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3.5">
                    <WhenCell label={meeting.dateLabel} urgency={meeting.urgency} />
                  </TableCell>

                  <TableCell className="px-4 py-3.5">
                    <AlertsCell alerts={meeting.alerts} />
                  </TableCell>

                  <TableCell className="px-4 py-3.5">
                    {openActions > 0 ? (
                      <span className="text-sm font-semibold text-[var(--text-brand-primary)]">{openActions}</span>
                    ) : (
                      <span className="text-sm text-[var(--text-tertiary)]">0</span>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3.5">
                    <Badge color={statusToColor(meeting.status)} leadingIcon="dot" size="sm">
                      {STATUS_LABELS[meeting.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={action.variant}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(meeting);
                        }}
                      >
                        {action.label}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          showChevron={false}
                          render={
                            <Button variant="tertiary" size="sm" iconOnly leadingIcon={<MoreHorizontal size={15} strokeWidth={1.75} />} aria-label="More options" />
                          }
                        />
                        <DropdownMenuContent alignment="end">
                          <DropdownMenuItem icon={<CalendarPlus size={14} strokeWidth={1.75} />}>Reschedule</DropdownMenuItem>
                          <DropdownMenuItem icon={<FileDown size={14} strokeWidth={1.75} />}>Export summary</DropdownMenuItem>
                          <DropdownMenuItem icon={<Ban size={14} strokeWidth={1.75} />}>Cancel meeting</DropdownMenuItem>
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

      <div className="flex items-center justify-between mt-4 px-1">
        <div className="text-xs text-[var(--text-tertiary)]">
          Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, meetings.length)} of {meetings.length} meetings
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="sm" iconOnly leadingIcon={<ChevronLeft size={14} strokeWidth={2} />} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" />
          <ButtonGroup
            options={Array.from({ length: totalPages }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
            value={String(page)}
            onChange={(v) => setPage(Number(v))}
            aria-label="Select page"
          />
          <Button variant="secondary" size="sm" iconOnly leadingIcon={<ChevronRight size={14} strokeWidth={2} />} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          Rows per page:
          <SelectField size="sm" value={String(pageSize)} onValueChange={(v: unknown) => handlePageSizeChange(Number(v))} aria-label="Rows per page" className="w-16">
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectField>
        </div>
      </div>
    </div>
  );
}
