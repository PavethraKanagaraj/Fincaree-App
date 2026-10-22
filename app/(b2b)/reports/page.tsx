"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { QueueKpiCards } from "@/components/report-queue/QueueKpiCards";
import { WorkPlan } from "@/components/report-queue/WorkPlan";
import { FilterToolbar, PrimaryFilters } from "@/components/report-queue/FilterToolbar";
import { ReportTable } from "@/components/report-queue/ReportTable";
import { ReportBoard } from "@/components/report-queue/ReportBoard";
import { ReportDrawer } from "@/components/report-queue/ReportDrawer";
import {
  Report,
  REPORTS,
  SavedView,
  matchesSavedView,
  sortReportsByUrgency,
  EMPTY_STATE_COPY,
} from "@/components/report-queue/data";
import { Button } from "@/components/fincaree/button";
import { ButtonGroup } from "@/components/fincaree/button-group";
import { Plus, Download, Sparkles, List, LayoutGrid } from "lucide-react";

/* ============================================================
   Report Queue Page — /reports
   Three distinct jobs, not one pile:
     KPI cards  → how much work is there?
     Work Plan  → what should I do next? (Finny-sequenced)
     All Reports→ what exactly is each report's state? (the table)
   ============================================================ */

type TopView = "work-plan" | "all-reports";

const EMPTY_PRIMARY_FILTERS: PrimaryFilters = {
  reportType: "",
  status: "",
  reviewBy: "",
  meeting: "",
  plan: "",
};

export default function ReportsPage() {
  /* ---- Drawer state ---- */
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  /* ---- Top-level layer: Work Plan vs the report table ---- */
  const [topView, setTopView] = useState<TopView>("work-plan");

  /* ---- Saved view — only meaningful once inside All Reports ---- */
  const [view, setView] = useState<SavedView>("all-reports");

  /* ---- All Reports: table vs Kanban board, split by status ---- */
  const [queueView, setQueueView] = useState<"table" | "board">("table");

  /* ---- Work Plan scheduling: exact date and time, per report.
     Shared by the table's open date/time picker and the Work Plan's week
     calendar (drag-and-drop writes the same map), so picking a date in one
     place is visible in the other. A report counts as manually "added to
     plan" exactly when it's scheduled — that's the one action that pulls a
     report in regardless of its natural queue status. ---- */
  const [scheduledOverrides, setScheduledOverrides] = useState<Record<string, string>>({});
  const addedToPlan = useMemo(() => new Set(Object.keys(scheduledOverrides)), [scheduledOverrides]);

  function setReportSchedule(id: string, datetime: string | null) {
    setScheduledOverrides((prev) => {
      if (datetime === null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: datetime };
    });
  }

  /* ---- Filter state ---- */
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PrimaryFilters>(EMPTY_PRIMARY_FILTERS);

  function handleFilterChange(key: keyof PrimaryFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setSearch("");
    setFilters(EMPTY_PRIMARY_FILTERS);
  }

  /* ---- Reports within the active saved view (drives counts + empty state) ---- */
  const viewReports = useMemo(() => REPORTS.filter((r) => matchesSavedView(r, view)), [view]);

  /* ---- Fully filtered + sorted reports ---- */
  const filteredReports = useMemo(() => {
    const filtered = viewReports.filter((r) => {
      if (
        search &&
        !r.client.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.reportName.toLowerCase().includes(search.toLowerCase()) &&
        !(r.meeting?.label.toLowerCase().includes(search.toLowerCase()) ?? false)
      ) {
        return false;
      }
      if (filters.reportType && r.reportType !== filters.reportType) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.reviewBy && r.reviewBy.category !== filters.reviewBy) return false;
      if (filters.plan && r.client.plan !== filters.plan) return false;
      if (filters.meeting) {
        const [kind, val] = filters.meeting.split(":");
        if (kind === "type" && r.meeting?.type !== val) return false;
        if (kind === "timing" && r.meetingTiming !== val) return false;
      }
      return true;
    });
    return sortReportsByUrgency(filtered);
  }, [viewReports, search, filters]);

  function handleKpiSelect(selected: SavedView) {
    handleReset();
    setView(selected);
    setTopView("all-reports");
  }

  function handleTopViewChange(next: string) {
    setTopView(next as TopView);
    if (next === "all-reports") {
      handleReset();
      setView("all-reports");
    }
  }

  const hasActiveFilters =
    search !== "" ||
    filters.reportType !== "" ||
    filters.status !== "" ||
    filters.reviewBy !== "" ||
    filters.meeting !== "" ||
    filters.plan !== "";

  const emptyCopy = EMPTY_STATE_COPY[view];

  return (
    <AppShell>
      <PageFrame width="default" title="Report Queue" description="AI-assisted reports that require review, validation or approval." actions={
        <>
          <Button variant="secondary" size="sm" leadingIcon={<Download size={14} strokeWidth={1.75} />}>
            Export
          </Button>
          <Button variant="primary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />}>
            Create Report
          </Button>
        </>
      }>
        {/* ── KPI cards: how much work is there? ── */}
        <QueueKpiCards reports={REPORTS} onSelect={handleKpiSelect} />

        {/* ── Work Plan vs All Reports ── */}
        <ButtonGroup
          options={[
            { value: "work-plan", label: "My Work Plan" },
            { value: "all-reports", label: "All Reports" },
          ]}
          value={topView}
          onChange={handleTopViewChange}
          aria-label="Switch between work plan and all reports"
        />

        {topView === "work-plan" ? (
          <WorkPlan
            reports={REPORTS}
            addedToPlan={addedToPlan}
            scheduledOverrides={scheduledOverrides}
            onScheduleChange={setReportSchedule}
            onOpenReport={setSelectedReport}
            onBrowseAllReports={() => handleTopViewChange("all-reports")}
          />
        ) : (
          <div className="space-y-3">
            <FilterToolbar
              searchValue={search}
              onSearchChange={setSearch}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Result count + Table/Board switch */}
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs text-[var(--text-tertiary)]">
                {filteredReports.length === viewReports.length
                  ? `${viewReports.length} reports`
                  : `${filteredReports.length} of ${viewReports.length} reports`}
              </span>
              <ButtonGroup
                options={[
                  { value: "table", label: "Table", icon: <List size={14} strokeWidth={1.75} />, iconType: "leading" },
                  { value: "board", label: "Board", icon: <LayoutGrid size={14} strokeWidth={1.75} />, iconType: "leading" },
                ]}
                value={queueView}
                onChange={(v) => setQueueView(v as "table" | "board")}
                aria-label="Switch between table and board view"
              />
            </div>

            {/* Empty state */}
            {filteredReports.length === 0 ? (
              <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-8 py-16 text-center">
                <div className="w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  {hasActiveFilters ? "No reports found" : emptyCopy.title}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">
                  {hasActiveFilters ? "Try adjusting your search or filter criteria." : emptyCopy.body}
                </p>
                {hasActiveFilters && (
                  <Button variant="secondary" size="sm" onClick={handleReset}>Reset filters</Button>
                )}
              </div>
            ) : queueView === "table" ? (
              <ReportTable
                reports={filteredReports}
                onRowClick={setSelectedReport}
                scheduledOverrides={scheduledOverrides}
                onScheduleChange={setReportSchedule}
              />
            ) : (
              <ReportBoard reports={filteredReports} onOpenReport={setSelectedReport} />
            )}
          </div>
        )}
      </PageFrame>

      {/* ── Row detail drawer ── */}
      <ReportDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </AppShell>
  );
}
