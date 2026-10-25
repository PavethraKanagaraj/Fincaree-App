"use client";

import { useState } from "react";
import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { CalendarClock, Megaphone, Pause, Play, Send } from "lucide-react";
import type { PipelineLead } from "./pipeline-data";
import { isSendableToLeads } from "@/components/client-suggestions/delivery-data";
import { MARKETING_CONTENT, loopsOfLead, marketing, useMarketing } from "@/components/client-suggestions/marketing-store";
import { isMarketable } from "@/components/client-suggestions/marketing-intelligence";

/* ============================================================
   Lead marketing — where this lead is in a follow-up loop, in the
   place the advisor is already thinking about them. Same controls
   and guardrails as the loop's own lead table: pause or resume,
   and send the next message early (asks first, only ever the next
   message in the loop, never for an opted-out lead).
   ============================================================ */

export function LeadMarketingSection({ lead: pipelineLead, onScheduleContent }: { lead: PipelineLead; onScheduleContent: (lead: PipelineLead) => void }) {
  const { loops, paused } = useMarketing();
  const [confirming, setConfirming] = useState<string | null>(null);
  const memberships = loopsOfLead(loops, pipelineLead.name);

  const heading = (
    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">
      <Megaphone size={12} strokeWidth={2} aria-hidden="true" />
      Marketing
    </p>
  );

  /* Not in a loop yet: assign to one, or schedule content for this lead */
  if (memberships.length === 0) {
    if (!isMarketable(pipelineLead)) {
      return (
        <div>
          {heading}
          <p className="text-sm text-[var(--text-tertiary)]">Follow-up messages start after a discovery call.</p>
        </div>
      );
    }
    const loopItems = Object.fromEntries(loops.map((l) => [l.id, l.name]));
    return (
      <div>
        {heading}
        <p className="text-sm text-[var(--text-secondary)]">Not in a follow-up loop yet.</p>
        <div className="mt-2 flex flex-col gap-2">
          <SelectField
            size="sm"
            aria-label="Add to a loop"
            placeholder="Add to a loop…"
            value={null}
            onValueChange={(v: unknown) => marketing.addLeadsToLoop(v as string, [{ id: pipelineLead.id, name: pipelineLead.name }])}
            items={loopItems}
          >
            {loops.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectField>
          <Button size="sm" variant="secondary" className="self-start" leadingIcon={<CalendarClock size={13} strokeWidth={1.75} />} onClick={() => onScheduleContent(pipelineLead)}>
            Schedule content…
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {heading}
      <ul className="space-y-3">
        {memberships.map(({ seq, lead }) => {
          const loopPaused = Boolean(paused[seq.id]);
          const finished = lead.sentCount >= seq.steps.length;
          const next = finished ? undefined : MARKETING_CONTENT.find((i) => i.id === seq.steps[lead.sentCount].contentId);
          const canSend = Boolean(next && isSendableToLeads(next)) && !lead.held && !loopPaused && !lead.optedOut;
          const status = lead.optedOut ? "Opted out" : finished ? "Finished" : lead.held ? "Paused" : loopPaused ? "Loop paused" : "Active";
          const key = `${seq.id}:${lead.id}`;

          return (
            <li key={key}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{seq.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] tabular-nums">
                    {lead.sentCount} of {seq.steps.length} sent
                    {!finished && !lead.optedOut && lead.nextSend && status === "Active" ? ` · next ${lead.nextSend}` : ""}
                  </p>
                </div>
                <Badge size="sm" color={status === "Active" ? "success" : status === "Opted out" ? "error" : status === "Paused" ? "warning" : "gray"}>
                  {status}
                </Badge>
              </div>

              {lead.optedOut ? (
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5">This lead opted out. No messages go out and it can&apos;t be changed here.</p>
              ) : finished ? null : confirming === key && next ? (
                <div role="alertdialog" aria-label="Confirm send" className="mt-2 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] p-3">
                  <p className="text-xs text-[var(--text-primary)]">Send “{next.title}” now? It goes out straight away as their Day {seq.steps[lead.sentCount].day} message.</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="primary" leadingIcon={<Send size={13} strokeWidth={2} />} onClick={() => { marketing.sendNow(seq.id, lead.id, next.title); setConfirming(null); }}>
                      Send now
                    </Button>
                    <Button size="sm" variant="tertiary" onClick={() => setConfirming(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {lead.held ? (
                    <Button size="sm" variant="secondary" leadingIcon={<Play size={13} strokeWidth={1.75} />} onClick={() => marketing.setLeadHeld(seq.id, lead.id, false)}>
                      Resume
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" leadingIcon={<Pause size={13} strokeWidth={1.75} />} onClick={() => marketing.setLeadHeld(seq.id, lead.id, true)}>
                      Pause
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" leadingIcon={<Send size={13} strokeWidth={1.75} />} disabled={!canSend} onClick={() => setConfirming(key)}>
                    Send next now
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
