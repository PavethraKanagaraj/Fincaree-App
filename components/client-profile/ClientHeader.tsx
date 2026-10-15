"use client";

import { Avatar } from "@/components/fincaree/avatar";
import { Badge, BadgeColor } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ClientProfileData, RELATIONSHIP_STAGE_LABELS, RelationshipStage, TODAY_ISO } from "./client-data";
import { Plus, CalendarClock, MoreHorizontal } from "lucide-react";

const STAGE_BADGE_COLOR: Record<RelationshipStage, BadgeColor> = {
  onboarding: "brand",
  "active-client": "gray-blue",
  "ongoing-advisory": "success",
  closed: "gray",
};

function meetingCountdown(dateLabel: string): string | null {
  const today = new Date(TODAY_ISO);
  const meetingDate = new Date(dateLabel);
  if (isNaN(meetingDate.getTime())) return null;
  const days = Math.round((meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 14) return `in ${days} days`;
  return null;
}

export function ClientHeader({ client }: { client: ClientProfileData }) {
  const countdown = meetingCountdown(client.nextMeeting.date);

  return (
    <div className="flex items-start justify-between gap-6 flex-wrap pb-6 border-b border-[var(--border-tertiary)] mb-6">
      {/* Identity */}
      <div className="flex items-center gap-3.5">
        <Avatar size="xl" initials={client.identity.initials} />
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{client.identity.name}</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{client.identity.clientId}</p>
        </div>
      </div>

      {/* Relationship facts */}
      <div className="flex items-start gap-7 flex-wrap">
        <div>
          <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Plan</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">{client.plan.name}</p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Renews {client.plan.renewalDate}</p>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Stage</p>
          <Badge size="sm" color={STAGE_BADGE_COLOR[client.identity.relationshipStage]}>
            {RELATIONSHIP_STAGE_LABELS[client.identity.relationshipStage]}
          </Badge>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Risk</p>
          <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{client.identity.riskProfile}</p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            {client.identity.riskReviewDue ? (
              <span className="text-[var(--text-status-warning)]">Review due {client.identity.riskReviewDue}</span>
            ) : (
              `Assessed ${client.identity.riskLastAssessed}`
            )}
          </p>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Next Meeting</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">{client.nextMeeting.title}</p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            {client.nextMeeting.date} · {client.nextMeeting.time}
            {countdown && <span className="text-[var(--text-brand-primary)] font-semibold"> · {countdown}</span>}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" leadingIcon={<Plus size={14} strokeWidth={2} />}>
          Action
        </Button>
        <Button variant="primary" size="sm" leadingIcon={<CalendarClock size={14} strokeWidth={2} />}>
          Schedule Meeting
        </Button>
        <Button variant="tertiary" size="sm" iconOnly aria-label="More actions" leadingIcon={<MoreHorizontal size={16} strokeWidth={2} />} />
      </div>
    </div>
  );
}
