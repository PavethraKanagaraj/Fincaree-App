"use client";

import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator } from "@/components/fincaree/select";
import { Button } from "@/components/fincaree/button";
import { Search, RotateCcw } from "lucide-react";
import {
  REPORT_TYPE_GROUPS,
  REPORT_TYPE_LABELS,
  STATUS_OPTIONS,
  STATUS_LABELS,
  REVIEW_BY_LABELS,
  ReviewByCategory,
  MEETING_TYPE_OPTIONS,
  MEETING_TIMING_LABELS,
  MeetingTiming,
  PlanTier,
  PLAN_LABELS,
} from "./data";

/* ============================================================
   Filter Toolbar — the queue's only filters. "Meeting" combines
   Meeting Type and Meeting Timing into one select (two groups,
   prefixed values) since they describe the same column but
   answer different questions.
   ============================================================ */

export interface PrimaryFilters {
  reportType: string;
  status: string;
  reviewBy: string;
  meeting: string; // "type:<MeetingType>" | "timing:<MeetingTiming>" | ""
  plan: string;
}

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters: PrimaryFilters;
  onFilterChange: (key: keyof PrimaryFilters, value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const REVIEW_BY_OPTIONS: ReviewByCategory[] = [
  "overdue",
  "due-today",
  "due-tomorrow",
  "due-3-days",
  "due-7-days",
  "no-deadline",
];

const MEETING_TIMING_OPTIONS: MeetingTiming[] = ["today", "tomorrow", "this-week", "next-week", "none"];

const PLAN_OPTIONS: PlanTier[] = ["Silver", "Gold", "Platinum"];

export function FilterToolbar({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}: FilterToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[220px] max-w-xs">
        <Input
          size="sm"
          placeholder="Search client, report or meeting..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search size={14} strokeWidth={1.75} />}
          aria-label="Search reports"
        />
      </div>

      <div className="h-5 w-px bg-[var(--border-tertiary)]" />

      {/* Report Type */}
      <SelectField
        size="sm"
        placeholder="Report Type"
        value={filters.reportType || null}
        onValueChange={(v: unknown) => onFilterChange("reportType", (v as string) ?? "")}
        aria-label="Filter by report type"
      >
        {REPORT_TYPE_GROUPS.flatMap((g) => g.options).map((opt) => (
          <SelectItem key={opt} value={opt}>{REPORT_TYPE_LABELS[opt]}</SelectItem>
        ))}
      </SelectField>

      {/* Status */}
      <SelectField
        size="sm"
        placeholder="Status"
        value={filters.status || null}
        onValueChange={(v: unknown) => onFilterChange("status", (v as string) ?? "")}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
        ))}
      </SelectField>

      {/* Review By */}
      <SelectField
        size="sm"
        placeholder="Review By"
        value={filters.reviewBy || null}
        onValueChange={(v: unknown) => onFilterChange("reviewBy", (v as string) ?? "")}
        aria-label="Filter by review deadline"
      >
        {REVIEW_BY_OPTIONS.map((r) => (
          <SelectItem key={r} value={r}>{REVIEW_BY_LABELS[r]}</SelectItem>
        ))}
      </SelectField>

      {/* Meeting — Meeting Type + Meeting Timing, grouped in one select */}
      <SelectField
        size="sm"
        placeholder="Meeting"
        value={filters.meeting || null}
        onValueChange={(v: unknown) => onFilterChange("meeting", (v as string) ?? "")}
        aria-label="Filter by meeting"
      >
        <SelectGroup>
          <SelectGroupLabel>Meeting Type</SelectGroupLabel>
          {MEETING_TYPE_OPTIONS.map((t) => (
            <SelectItem key={t} value={`type:${t}`}>{t}</SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Meeting Timing</SelectGroupLabel>
          {MEETING_TIMING_OPTIONS.map((t) => (
            <SelectItem key={t} value={`timing:${t}`}>{MEETING_TIMING_LABELS[t]}</SelectItem>
          ))}
        </SelectGroup>
      </SelectField>

      {/* Plan */}
      <SelectField
        size="sm"
        placeholder="Plan"
        value={filters.plan || null}
        onValueChange={(v: unknown) => onFilterChange("plan", (v as string) ?? "")}
        aria-label="Filter by plan"
      >
        {PLAN_OPTIONS.map((p) => (
          <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>
        ))}
      </SelectField>

      {hasActiveFilters && (
        <Button
          variant="link-grey"
          size="sm"
          leadingIcon={<RotateCcw size={12} strokeWidth={1.75} />}
          onClick={onReset}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
