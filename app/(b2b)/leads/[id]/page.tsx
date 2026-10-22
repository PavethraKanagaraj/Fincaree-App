"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer, PageGrid } from "@/components/layout/PageFrame";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Button } from "@/components/fincaree/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/fincaree/dropdown-menu";
import { ChevronRight, MoreHorizontal, Archive, FileDown, StickyNote, UserX, ArrowRight } from "lucide-react";

import { LeadIdentityCard } from "@/components/leads/LeadIdentityCard";
import { IntelligenceSummaryGrid } from "@/components/leads/IntelligenceSummaryGrid";
import { LeadSummarySection } from "@/components/leads/LeadSummarySection";
import { QuickProfileSection } from "@/components/leads/QuickProfileSection";
import { FinancialSnapshotSection } from "@/components/leads/FinancialSnapshotSection";
import { GhostSection } from "@/components/leads/GhostSection";
import { LeadActivityTimeline } from "@/components/leads/LeadActivityTimeline";

import {
  LEAD_IDENTITY,
  LeadStageId,
  LeadStatus,
  CURRENT_LEAD_STAGE,
  leadStageIndex,
} from "@/components/leads/data";
import { Users, MessageCircle, Link2, FileText, CreditCard } from "lucide-react";

/* ============================================================
   Lead Intelligence Detail — /leads/[id]
   The advisor's workspace for one prospect, pre-subscription.
   A single scrollable funnel page — sections appear as stages
   complete, ghosted otherwise — rather than the Client Profile's
   tabs, because this is a conversion funnel, not a reference doc.

   The mock data layer (components/leads/data.ts) models a single
   lead (Priya Menon) regardless of [id], same as the rest of this
   app's other single-record demo pages — a real build would fetch
   by id.
   ============================================================ */

const STATUS_OPTIONS: LeadStatus[] = ["New", "Engaged", "Qualified", "Ready"];
const STATUS_ITEMS: Record<string, string> = Object.fromEntries(STATUS_OPTIONS.map((s) => [s, s]));

const currentIndex = leadStageIndex(CURRENT_LEAD_STAGE);
const reached = (stage: LeadStageId) => currentIndex >= leadStageIndex(stage);

export default function LeadProfilePage() {
  const [status, setStatus] = useState<LeadStatus>(LEAD_IDENTITY.status);

  function goToStage(stage: LeadStageId) {
    document.getElementById(`stage-${stage}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <AppShell>
      <PageContainer width="default" className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
            <Link href="/leads" className="hover:text-[var(--text-secondary)] transition-colors">Lead Management</Link>
            <ChevronRight size={13} strokeWidth={2} />
            <span className="text-[var(--text-primary)] font-medium">{LEAD_IDENTITY.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <SelectField
              size="sm"
              value={status}
              onValueChange={(v: unknown) => setStatus(v as LeadStatus)}
              className="w-[140px]"
              aria-label="Lead status"
              items={STATUS_ITEMS}
            >
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectField>

            {reached("discovery") && (
              <Button variant="primary" size="sm" trailingIcon={<ArrowRight size={13} strokeWidth={2} />}>
                Recommend Plan
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                showChevron={false}
                render={
                  <Button variant="tertiary" size="sm" iconOnly leadingIcon={<MoreHorizontal size={15} strokeWidth={1.75} />} aria-label="More actions" />
                }
              />
              <DropdownMenuContent alignment="end">
                <DropdownMenuItem icon={<Archive size={14} strokeWidth={1.75} />}>Archive</DropdownMenuItem>
                <DropdownMenuItem icon={<UserX size={14} strokeWidth={1.75} />}>Mark as Lost</DropdownMenuItem>
                <DropdownMenuItem icon={<FileDown size={14} strokeWidth={1.75} />}>Export</DropdownMenuItem>
                <DropdownMenuItem icon={<StickyNote size={14} strokeWidth={1.75} />}>Notes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <PageGrid className="items-start">
          {/* Sticky left — Lead Identity Card */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3"><LeadIdentityCard onGoToStage={goToStage} /></div>

          {/* Right — staged content, single scroll */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 min-w-0 space-y-4">
            <IntelligenceSummaryGrid />

            <div id="stage-discover">
              <LeadSummarySection />
            </div>

            <div id="stage-quick-profile">
              <QuickProfileSection />
            </div>

            <div id="stage-snapshot">
              <FinancialSnapshotSection />
            </div>

            <div id="stage-matching">
              {reached("matching") ? null : (
                <GhostSection
                  icon={Users}
                  title="Advisor Matching"
                  description="Prospect has not yet been matched with you."
                  actions={[]}
                />
              )}
            </div>

            <div id="stage-discovery">
              {reached("discovery") ? null : (
                <GhostSection
                  icon={MessageCircle}
                  title="Discovery Call"
                  description="No discovery call scheduled yet. Prospect may choose to book one, or proceed directly to data sharing."
                  note="Discovery calls are optional for Path A and Path C prospects."
                  actions={[{ label: "Suggest a Call" }]}
                />
              )}
            </div>

            <div id="stage-detailed-data">
              {reached("detailed-data") ? null : (
                <GhostSection
                  icon={Link2}
                  title="Detailed Financial Data"
                  description="Prospect has not shared detailed financial data yet. Guide your prospect to share data using the method they're most comfortable with."
                  actions={[
                    { label: "Connect Accounts", variant: "tertiary" },
                    { label: "Upload Documents", variant: "tertiary" },
                    { label: "Enter Manually", variant: "tertiary" },
                    { label: "Send Data Request to Prospect", variant: "primary" },
                  ]}
                />
              )}
            </div>

            <div id="stage-plan-generated">
              {reached("plan-generated") ? null : (
                <GhostSection
                  icon={FileText}
                  title="Personalised Plan"
                  description="Personalised plan will be generated once financial data is complete and verified."
                  note="Cannot generate plan — missing data: discovery call notes, verified financial data."
                  actions={[{ label: "Complete Financial Data", variant: "tertiary" }]}
                />
              )}
            </div>

            <div id="stage-subscribe">
              {reached("subscribe") ? null : (
                <GhostSection
                  icon={CreditCard}
                  title="Subscription"
                  description="Prospect has not yet selected a plan."
                  actions={[]}
                />
              )}
            </div>

            <LeadActivityTimeline />
          </div>
        </PageGrid>
      </PageContainer>
    </AppShell>
  );
}
