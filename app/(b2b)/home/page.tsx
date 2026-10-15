import { AppShell } from "@/components/layout/AppShell";
import { PipelineSummaryCards } from "@/components/home/PipelineSummaryCards";
import { TodaysMeetingsList } from "@/components/home/TodaysMeetingsList";
import { TodaysWorkPlanPreview } from "@/components/home/TodaysWorkPlanPreview";
import { ClientEngagementChart } from "@/components/home/ClientEngagementChart";
import { OpportunityFunnel } from "@/components/home/OpportunityFunnel";
import { ClientQueriesPanel } from "@/components/home/ClientQueriesPanel";
import { UpcomingWorkshops } from "@/components/home/UpcomingWorkshops";
import { OpportunityInsights } from "@/components/home/OpportunityInsights";
import { PracticePerformance } from "@/components/home/PracticePerformance";
import { HOME_TODAY_LABEL } from "@/components/home/home-data";

/* ============================================================
   Home — /home
   The advisor's "where do I start today" cockpit, not a 4th
   pipeline: a summary card per pipeline to jump in — plus a 4th
   Finny card carrying the top cross-pipeline signal — today's
   schedule and work plan, engagement/funnel analytics, client
   queries, upcoming workshops, and quick links to the rest of the
   workspace. Each pipeline keeps its own full board/queue — Home
   only ever launches into them.

   Lives at its own route (like every other page) rather than at
   the bare "/" — the root just redirects here, same pattern it
   used to redirect to /reports before this page existed.
   ============================================================ */

export default function HomePage() {
  return (
    <AppShell>
      <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-5">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
            Good morning, Aditya
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{HOME_TODAY_LABEL}</p>
        </div>

        {/* ── Pipeline summary cards + Finny ── */}
        <PipelineSummaryCards />

        {/* ── Practice performance ── */}
        <PracticePerformance />

        {/* ── Today: schedule + work plan ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TodaysMeetingsList />
          <TodaysWorkPlanPreview />
        </div>

        {/* ── Client engagement + client queries ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ClientEngagementChart />
          <ClientQueriesPanel />
        </div>

        {/* ── Opportunity funnel + upcoming workshops ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <OpportunityFunnel />
          <UpcomingWorkshops />
        </div>

        {/* ── Opportunity insights: life events + client signals ── */}
        <OpportunityInsights />
      </div>
    </AppShell>
  );
}
