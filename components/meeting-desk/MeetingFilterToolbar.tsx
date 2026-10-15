"use client";

import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Button } from "@/components/fincaree/button";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { MEETING_STAGES, STATUS_LABELS } from "./data";

/* ============================================================
   Filter Toolbar — Fincaree Input (search) + SelectField (filters).
   Same pattern as Report Queue's FilterToolbar.
   ============================================================ */

interface MeetingFilterToolbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters: {
    meetingType: string;
    status: string;
    mode: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

const MEETING_TYPES = [
  { value: "Discovery Call", label: "Discovery Call" },
  { value: "Financial Blueprint Review", label: "Financial Blueprint Review" },
  { value: "Proposal Walkthrough", label: "Proposal Walkthrough" },
  { value: "Annual Plan Review", label: "Annual Plan Review" },
  { value: "Family Wealth Review", label: "Family Wealth Review" },
  { value: "Follow-up Call", label: "Follow-up Call" },
];

const STATUSES = MEETING_STAGES.flatMap((stage) =>
  stage.statuses.map((status) => ({ value: status, label: STATUS_LABELS[status] }))
);

const MODES = [
  { value: "Video", label: "Video" },
  { value: "In-person", label: "In-person" },
  { value: "Phone", label: "Phone" },
];

export function MeetingFilterToolbar({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onReset,
}: MeetingFilterToolbarProps) {
  const hasActiveFilters =
    searchValue !== "" || filters.meetingType !== "" || filters.status !== "" || filters.mode !== "";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex-1 min-w-[220px] max-w-xs">
        <Input
          size="sm"
          placeholder="Search clients, meetings..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search size={14} strokeWidth={1.75} />}
          aria-label="Search meetings"
        />
      </div>

      <div className="h-5 w-px bg-[var(--border-tertiary)]" />

      <SelectField
        size="sm"
        placeholder="Meeting Type"
        value={filters.meetingType || null}
        onValueChange={(v: unknown) => onFilterChange("meetingType", (v as string) ?? "")}
        aria-label="Filter by meeting type"
      >
        {MEETING_TYPES.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectField>

      <SelectField
        size="sm"
        placeholder="Status"
        value={filters.status || null}
        onValueChange={(v: unknown) => onFilterChange("status", (v as string) ?? "")}
        aria-label="Filter by status"
      >
        {STATUSES.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectField>

      <SelectField
        size="sm"
        placeholder="Mode"
        value={filters.mode || null}
        onValueChange={(v: unknown) => onFilterChange("mode", (v as string) ?? "")}
        aria-label="Filter by meeting mode"
      >
        {MODES.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectField>

      <Button variant="secondary" size="sm" leadingIcon={<SlidersHorizontal size={14} strokeWidth={1.75} />}>
        More Filters
      </Button>

      {hasActiveFilters && (
        <Button variant="link-grey" size="sm" leadingIcon={<RotateCcw size={13} strokeWidth={2} />} onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
