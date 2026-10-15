"use client";

/* ============================================================
   TodaysMeetingsList — real MEETINGS filtered to today
   (dateLabel starting "Today", same convention MEETING_ATTENTION_
   STATS.today is built from). Opening a meeting's full context
   stays on /meetings — this is a preview, not a second drawer.
   ============================================================ */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { buttonVariants } from "@/components/fincaree/button";
import { Video, Phone, Users } from "lucide-react";
import { TODAYS_MEETINGS } from "./home-data";
import { STATUS_COLORS, STATUS_LABELS, type MeetingRecord } from "@/components/meeting-desk/data";

const MODE_ICON: Record<MeetingRecord["mode"], React.ReactNode> = {
  Video: <Video size={12} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  "In-person": <Users size={12} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  Phone: <Phone size={12} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
};

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function TodaysMeetingsList() {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-base font-semibold text-[var(--text-primary)]">Today&apos;s Meetings</span>
        <Link href="/meetings" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
          <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
            <span className="fc-btn-label">View schedule</span>
          </span>
        </Link>
      </div>

      {TODAYS_MEETINGS.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">No meetings scheduled for today.</p>
      ) : (
        <div className="divide-y divide-[var(--border-tertiary)]">
          {TODAYS_MEETINGS.map((m) => (
            <Link key={m.id} href="/meetings" className="flex items-center gap-2.5 py-2.5 group">
              <Avatar size="sm" initials={initials(m.client.name)} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--text-brand-primary)] transition-colors">
                    {m.client.name}
                  </span>
                  <Badge size="sm" color={STATUS_COLORS[m.status] ?? "gray"}>
                    {STATUS_LABELS[m.status] ?? m.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-tertiary)]">
                  {MODE_ICON[m.mode]}
                  {m.meetingType} · {m.duration}
                </div>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)] shrink-0 tabular-nums">
                {m.dateLabel.replace("Today ", "")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
