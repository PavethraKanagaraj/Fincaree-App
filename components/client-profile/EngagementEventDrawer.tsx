"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/fincaree/button";
import { QUERY_KIND_META, TIER_REPLY_TARGET, TimelineEvent } from "./engagement-data";

interface EngagementEventDrawerProps {
  event: TimelineEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  added: boolean;
  onAddToMeeting: (id: string) => void;
  /** The client's plan, which sets the reply target for some kinds of query. */
  planName?: string;
}

export function EngagementEventDrawer({ event, open, onOpenChange, added, onAddToMeeting, planName }: EngagementEventDrawerProps) {
  if (!event) return null;
  const kind = event.queryKind ? QUERY_KIND_META[event.queryKind] : null;
  const urgency =
    kind === null ? null : kind.urgency === "tier" ? { level: `${planName ?? "Plan"} plan`, target: TIER_REPLY_TARGET[planName ?? ""] ?? "By plan" } : kind.urgency;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader className="border-b border-[var(--border-tertiary)] pb-4">
          <span className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{event.dateGroup}</span>
          <SheetTitle className="pr-8">{event.detail.heading}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {event.groupedItems && (
            <div>
              <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Outcomes</p>
              <ul className="space-y-1">
                {event.groupedItems.map((item) => (
                  <li key={item} className="text-sm text-[var(--text-secondary)]">· {item}</li>
                ))}
              </ul>
            </div>
          )}

          {event.detail.body && (
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{event.detail.body}</p>
          )}

          {kind && urgency && (
            <div className="rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] p-3.5 space-y-3">
              <p className="text-[12px] font-bold text-[var(--text-brand-primary)] uppercase tracking-wider">How to handle · {kind.label}</p>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Comes from</p>
                <p className="text-sm text-[var(--text-primary)]">{kind.source}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">What to do</p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{kind.handle}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Reply target</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {urgency.level} · {urgency.target}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {event.detail.fields.map((field) => (
              <div key={field.label}>
                <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">{field.label}</p>
                <p className="text-sm text-[var(--text-primary)]">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="border-t border-[var(--border-tertiary)] flex-row gap-2">
          {event.detail.primaryActionLabel && (
            <Button variant="secondary" size="md" className="flex-1">
              {event.detail.primaryActionLabel}
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={added}
            onClick={() => onAddToMeeting(event.id)}
          >
            {added ? "Added to meeting ✓" : "Add to Meeting Context"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
