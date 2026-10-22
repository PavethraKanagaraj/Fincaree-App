"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { MeetingAttentionRow } from "@/components/meeting-desk/MeetingAttentionRow";
import { MeetingFilterToolbar } from "@/components/meeting-desk/MeetingFilterToolbar";
import { MeetingTable } from "@/components/meeting-desk/MeetingTable";
import { MeetingBoard } from "@/components/meeting-desk/MeetingBoard";
import { MeetingCalendar } from "@/components/meeting-desk/MeetingCalendar";
import { MeetingDeskDrawer } from "@/components/meeting-desk/MeetingDeskDrawer";
import { MeetingRecord, MEETINGS } from "@/components/meeting-desk/data";
import { Button } from "@/components/fincaree/button";
import { ButtonGroup } from "@/components/fincaree/button-group";
import { Plus, Download, RefreshCw, CalendarClock, CalendarDays, List, Columns3 } from "lucide-react";

/* ============================================================
   Meetings — /meetings
   Advisor's complete workspace for every client meeting — before,
   during and after. Same structure as the Report Queue page:
   attention row → filter toolbar + view toggle → board/list/calendar →
   detail drawer.
   ============================================================ */

type ViewMode = "board" | "list" | "calendar";

export default function MeetingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    meetingType: "",
    status: "",
    mode: "",
  });

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setSearch("");
    setFilters({ meetingType: "", status: "", mode: "" });
  }

  const filteredMeetings = useMemo(() => {
    return MEETINGS.filter((m) => {
      if (
        search &&
        !m.client.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.meetingType.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (filters.status && m.status !== filters.status) return false;
      if (filters.mode && m.mode !== filters.mode) return false;
      if (filters.meetingType && m.meetingType !== filters.meetingType) return false;
      return true;
    });
  }, [search, filters]);

  function handleAttentionCardClick(id: string) {
    handleReset();
    if (id === "needs-prep") setFilters((p) => ({ ...p, status: "needs-prep" }));
    if (id === "follow-up-pending") setFilters((p) => ({ ...p, status: "follow-up-pending" }));
    if (id === "today") setSearch("Today");
  }

  const hasActiveFilters = search !== "" || filters.status !== "" || filters.mode !== "" || filters.meetingType !== "";

  return (
    <AppShell>
      <PageFrame width="full" title="Meetings" description="Prepare, run and follow up on every client meeting in one place" actions={
        <>
          <Button variant="secondary" size="sm" iconOnly leadingIcon={<RefreshCw size={15} strokeWidth={1.75} />} aria-label="Refresh" />
          <Button variant="secondary" size="sm" iconOnly leadingIcon={<Download size={15} strokeWidth={1.75} />} aria-label="Export" />
          <Button variant="primary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />}>
            Schedule Meeting
          </Button>
        </>
      }>
        {/* ── Attention row ── */}
        <MeetingAttentionRow onCardClick={handleAttentionCardClick} />

        {/* ── Filter toolbar + view toggle ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <MeetingFilterToolbar
                searchValue={search}
                onSearchChange={setSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>

            <ButtonGroup
              options={[
                { value: "board", label: "Board", icon: <Columns3 size={14} strokeWidth={1.75} />, iconType: "leading" },
                { value: "list", label: "List", icon: <List size={14} strokeWidth={1.75} />, iconType: "leading" },
                { value: "calendar", label: "Calendar", icon: <CalendarDays size={14} strokeWidth={1.75} />, iconType: "leading" },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              aria-label="Switch between board, list and calendar view"
              className="shrink-0"
            />
          </div>

          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs text-[var(--text-tertiary)]">
              {filteredMeetings.length === MEETINGS.length
                ? `${MEETINGS.length} meetings`
                : `${filteredMeetings.length} of ${MEETINGS.length} meetings`}
            </span>
            {hasActiveFilters && (
              <Button variant="link-brand" size="sm" onClick={handleReset} className="text-xs">
                Clear all filters
              </Button>
            )}
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-8 py-16 text-center">
              <div className="w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-3">
                <CalendarClock size={20} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">No meetings found</div>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">Try adjusting your search or filter criteria.</p>
              <Button variant="secondary" size="sm" onClick={handleReset}>Reset filters</Button>
            </div>
          ) : viewMode === "board" ? (
            <MeetingBoard meetings={filteredMeetings} onCardClick={setSelectedMeeting} />
          ) : viewMode === "calendar" ? (
            <MeetingCalendar meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} />
          ) : (
            <MeetingTable meetings={filteredMeetings} onRowClick={setSelectedMeeting} />
          )}
        </div>
      </PageFrame>

      <MeetingDeskDrawer meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />
    </AppShell>
  );
}
