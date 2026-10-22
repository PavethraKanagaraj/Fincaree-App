import { AppShell } from "@/components/layout/AppShell";
import { PageFrame, PageGrid } from "@/components/layout/PageFrame";
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
      <PageFrame width="default" title="Good morning, Aditya" description={HOME_TODAY_LABEL}>
        {/* ── Pipeline summary cards + Finny ── */}
        <PipelineSummaryCards />

        {/* ── Practice performance ── */}
        <PracticePerformance />

        {/* ── Today: schedule + work plan ── */}
        <PageGrid>
          <div className="col-span-12 lg:col-span-6 *:h-full"><TodaysMeetingsList /></div>
          <div className="col-span-12 lg:col-span-6 *:h-full"><TodaysWorkPlanPreview /></div>
        </PageGrid>

        {/* ── Client engagement + client queries ── */}
        <PageGrid>
          <div className="col-span-12 lg:col-span-6 *:h-full"><ClientEngagementChart /></div>
          <div className="col-span-12 lg:col-span-6 *:h-full"><ClientQueriesPanel /></div>
        </PageGrid>

        {/* ── Opportunity funnel + upcoming workshops ── */}
        <PageGrid>
          <div className="col-span-12 lg:col-span-6 *:h-full"><OpportunityFunnel /></div>
          <div className="col-span-12 lg:col-span-6 *:h-full"><UpcomingWorkshops /></div>
        </PageGrid>

        {/* ── Opportunity insights: life events + client signals ── */}
        <OpportunityInsights />
      </PageFrame>
    </AppShell>
  );
}
