"use client";

import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { PipelineLead, PIPELINE_STAGES } from "./pipeline-data";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";

/* ============================================================
   Lead Drawer — the client-context surface a card click opens,
   rather than navigating away. Enough to decide the next move
   without losing your place on the board; "Open client profile"
   is the deliberate exit into the full Lead Intelligence Detail.
   ============================================================ */

function lastActivityLabel(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

function aiNextAction(lead: PipelineLead): string {
  switch (lead.stage) {
    case "discovery-call":
      return `Review ${lead.name.split(" ")[0]}'s stated goals before the call — tailor your opening questions to ${lead.goal.toLowerCase()}.`;
    case "awaiting-details":
      return lead.remindersSent && lead.remindersSent > 0
        ? `${lead.remindersSent} reminder(s) already sent with no response — consider a call instead of another message.`
        : `Discovery just completed — send the data request now while the conversation is fresh.`;
    case "needs-followup":
      return `${lead.followUpAttempts} attempt(s) so far — try a different channel (call instead of email) before writing this lead off.`;
    case "ready-for-advice":
      return `Data is complete at ${lead.completeness}% — this lead is ready for you to start building the plan.`;
    case "plan-discussion":
      return `Meeting is scheduled — prepare the plan comparison and goal-gap numbers before you walk in.`;
    case "decision-pending":
      return `Plan has been sitting with them since ${lead.planSharedNote?.replace("Plan shared ", "")} — a short check-in now beats a longer one later.`;
    default:
      return "";
  }
}

interface LeadDrawerProps {
  lead: PipelineLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDrawer({ lead, open, onOpenChange }: LeadDrawerProps) {
  const router = useRouter();
  if (!lead) return null;
  const stage = PIPELINE_STAGES.find((s) => s.id === lead.stage)!;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader className="border-b border-[var(--border-tertiary)] pb-4">
          <div className="flex items-center gap-3 pr-8">
            <span className="w-10 h-10 rounded-full bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)] text-sm font-semibold flex items-center justify-center shrink-0">
              {lead.initials.replace(/[0-9]/g, "")}
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate">{lead.name}</SheetTitle>
              <p className="text-xs text-[var(--text-tertiary)]">{lead.goal} · {lead.timeline}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Current Stage</p>
            <Badge color="brand" size="sm">{stage.number} · {stage.title}</Badge>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Last Activity</p>
            <p className="text-sm text-[var(--text-primary)]">{lastActivityLabel(lead.lastActivitySort)}</p>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Financial Snapshot</p>
            {lead.meetingFacts || lead.checklist || lead.readyChecklist ? (
              <ul className="space-y-1">
                {(lead.meetingFacts ?? lead.checklist ?? lead.readyChecklist ?? []).map((f) => (
                  <li key={f} className="text-sm text-[var(--text-secondary)]">· {f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">Collected during discovery — not yet on file.</p>
            )}
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Data Completeness</p>
            {lead.completeness !== undefined ? (
              <div>
                <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-[var(--color-success-500)]" style={{ width: `${lead.completeness}%` }} />
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{lead.completeness}%</span>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">Not yet available</p>
            )}
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Meeting History</p>
            {lead.meetingLabel ? (
              <p className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                <Calendar size={13} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />
                Upcoming: {lead.meetingLabel}
              </p>
            ) : lead.stage === "decision-pending" ? (
              <p className="text-sm text-[var(--text-secondary)]">Plan Discussion completed — plan currently with client.</p>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">No meetings yet.</p>
            )}
          </div>

          <div className="rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
              <span className="text-[12px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">AI Next Action</span>
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-snug">{aiNextAction(lead)}</p>
          </div>
        </div>

        <SheetFooter className="border-t border-[var(--border-tertiary)]">
          <Button
            variant="primary"
            size="md"
            trailingIcon={<ArrowRight size={14} strokeWidth={2} />}
            onClick={() => router.push(`/leads/${lead.slug}`)}
          >
            Open client profile
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
