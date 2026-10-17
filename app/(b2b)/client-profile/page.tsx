"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from "@/components/fincaree/tabs";
import { ANIKA_RAO } from "@/components/client-profile/client-data";
import { ClientHeader } from "@/components/client-profile/ClientHeader";
import { OverviewTab } from "@/components/client-profile/tabs/OverviewTab";
import { MeetingContextTab } from "@/components/client-profile/tabs/MeetingContextTab";
import { GoalsAndPlanTab } from "@/components/client-profile/tabs/GoalsAndPlanTab";
import { AdviceAndDecisionsTab } from "@/components/client-profile/tabs/AdviceAndDecisionsTab";
import { FinancialPictureTab } from "@/components/client-profile/tabs/FinancialPictureTab";
import { EngagementTab } from "@/components/client-profile/tabs/EngagementTab";
import { ActivityTab } from "@/components/client-profile/tabs/ActivityTab";

type TabId = "overview" | "meeting-context" | "goals-plan" | "advice-decisions" | "financial-picture" | "engagement" | "activity";

/* Meeting Context is reachable from Overview's "Open Meeting Prep" but isn't
   a persistent tab — Overview owns the meeting-prep entry point now. */
const TAB_CONFIG: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "goals-plan", label: "Goals & Plan" },
  { id: "advice-decisions", label: "Advice & Decisions" },
  { id: "financial-picture", label: "Financial Picture" },
  { id: "engagement", label: "Engagement" },
  { id: "activity", label: "Activity" },
];

export default function ClientProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const clientData = ANIKA_RAO;

  return (
    <AppShell>
      <div className="px-6 py-6 max-w-[1440px] mx-auto">
        <ClientHeader client={clientData} />

        {/* Design-system Tabs: trigger padding, the sliding indicator, arrow-key
            navigation and tab/tabpanel roles come from the component. This bar
            was hand-rolled bare buttons (bottom padding only, no hit area). */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} variant="line" className="!gap-0 mt-2 mb-6">
          <div className="border-b border-[var(--border-tertiary)]">
            <TabsList>
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
              <TabsIndicator />
            </TabsList>
          </div>
        </Tabs>

        <div className="min-h-[600px]">
          {activeTab === "overview" && <OverviewTab client={clientData} onTabChange={(tab) => setActiveTab(tab as TabId)} />}
          {activeTab === "meeting-context" && (
            <MeetingContextTab meeting={clientData.nextMeeting} onBack={() => setActiveTab("overview")} />
          )}
          {activeTab === "goals-plan" && <GoalsAndPlanTab client={clientData} />}
          {activeTab === "advice-decisions" && <AdviceAndDecisionsTab />}
          {activeTab === "financial-picture" && <FinancialPictureTab client={clientData} />}
          {activeTab === "engagement" && <EngagementTab client={clientData} />}
          {activeTab === "activity" && <ActivityTab activity={clientData.activity} discoveryContext={clientData.discoveryContext} />}
        </div>
      </div>
    </AppShell>
  );
}
