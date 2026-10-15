"use client";

import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { CLIENT_MEETINGS, MEETING_STATS, ClientMeeting } from "./journey.data";
import { Calendar } from "lucide-react";

const statusColor: Record<ClientMeeting["status"], "success" | "brand" | "gray"> = {
  completed: "success",
  scheduled: "brand",
  cancelled: "gray",
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">{label}</div>
      <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{value}</div>
    </div>
  );
}

export function MeetingsTab() {
  return (
    <div className="space-y-4">
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Total meetings" value={MEETING_STATS.total} />
          <Stat label="This quarter" value={MEETING_STATS.thisQuarter} />
          <Stat label="Avg. frequency" value={`${MEETING_STATS.avgFrequencyDays}d`} />
          <Stat label="Attended vs cancelled" value={MEETING_STATS.attendedVsCancelled} />
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Meeting History</h2>
        </div>
        <div className="divide-y divide-[var(--border-tertiary)]">
          {CLIENT_MEETINGS.map((m) => (
            <div key={m.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{m.purpose}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{m.date} · {m.time} · {m.planAtTime} tier</p>
                </div>
                <Badge color={statusColor[m.status]} size="sm">
                  {m.status === "completed" ? "Completed" : m.status === "scheduled" ? "Scheduled" : "Cancelled"}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {m.goalsCovered.map((g) => (
                  <Badge key={g} color="gray" size="sm">{g}</Badge>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-brand-secondary)] mb-3">{m.profileLayerAdded}</p>
              <div className="flex items-center gap-2">
                <Button variant="tertiary" size="sm">View Details</Button>
                <Button variant="tertiary" size="sm">View Notes</Button>
                <Button variant="tertiary" size="sm">View Tasks</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
