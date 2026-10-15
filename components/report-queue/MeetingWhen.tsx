import { cn } from "@/lib/utils";
import { AlertCircle, Calendar, Clock } from "lucide-react";

/* ============================================================
   MeetingWhen — a date/deadline label, coloured by urgency.
   Used for the Report Table's Review By column:
     urgent  → red chip + alert icon
     soon    → amber chip + clock icon
     upcoming→ plain text
   Colour isn't the only signal: the urgency is also spoken ("Urgent:").
   ============================================================ */

interface MeetingWhenProps {
  label: string | null;
  urgency: "urgent" | "soon" | "upcoming" | null;
  /** Show a calendar icon on non-urgent dates — for places with no heading of their own, like a card. */
  showCalendarIcon?: boolean;
  /** Screen-reader prefix before the label, e.g. "Review by" or "Meeting". */
  srLabel?: string;
}

export function MeetingWhen({ label, urgency, showCalendarIcon = false, srLabel = "Review by" }: MeetingWhenProps) {
  if (!label) {
    return <span className="text-[var(--text-tertiary)] text-xs">No deadline</span>;
  }

  const color =
    urgency === "urgent" ? "text-[var(--text-status-error)]" :
    urgency === "soon"   ? "text-[var(--text-status-warning)]" :
    "text-[var(--text-secondary)]";

  const bg =
    urgency === "urgent" ? "bg-[var(--bg-status-error-subtle)] border-[var(--border-status-error-subtle)]" :
    urgency === "soon"   ? "bg-[var(--bg-status-warning-subtle)] border-[var(--border-status-warning-subtle)]" :
    "bg-transparent border-transparent";

  return (
    // `relative` keeps the hidden (position:absolute) urgency text inside the chip.
    <span className={cn("relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded border", bg)}>
      {urgency === "urgent" && <AlertCircle size={11} strokeWidth={2} aria-hidden="true" className="text-[var(--text-status-error)] shrink-0" />}
      {urgency === "soon"   && <Clock       size={11} strokeWidth={2} aria-hidden="true" className="text-[var(--text-status-warning)] shrink-0" />}
      {urgency !== "urgent" && urgency !== "soon" && showCalendarIcon && (
        <Calendar size={11} strokeWidth={2} aria-hidden="true" className="text-[var(--icon-tertiary)] shrink-0" />
      )}
      <span className={cn("text-xs font-medium leading-tight", color)}>
        {urgency === "urgent" && <span className="sr-only">Urgent: </span>}
        {urgency === "soon" && <span className="sr-only">Soon: </span>}
        <span className="sr-only">{srLabel} </span>
        {label}
      </span>
    </span>
  );
}
