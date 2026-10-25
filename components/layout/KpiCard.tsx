import { cn } from "@/lib/utils";
import { Button } from "@/components/fincaree/button";
import { ArrowRight } from "lucide-react";

/* ============================================================
   KPI Card — the card language shared by the Meetings attention
   row and the Reports queue cards: an icon badge beside the label,
   a big count, one line of context, and a link-style action.

   Emphasis only changes colour: default for steady numbers,
   warning for something worth a look, critical for something that
   blocks work.
   ============================================================ */

export type KpiEmphasis = "default" | "warning" | "critical";

const EMPHASIS = {
  default: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-tertiary)]",
    icon: "bg-[var(--bg-secondary)] text-[var(--icon-tertiary)]",
    count: "text-[var(--text-primary)]",
    cta: "text-[var(--text-brand-primary)] hover:text-[var(--text-brand-primary)]",
    detail: "text-[var(--text-tertiary)]",
  },
  warning: {
    card: "bg-[var(--bg-primary)] border border-[var(--border-status-warning-subtle)]",
    icon: "bg-[var(--bg-status-warning-subtle)] text-[var(--icon-status-warning)]",
    count: "text-[var(--text-status-warning)]",
    cta: "text-[var(--text-status-warning)] hover:text-[var(--text-status-warning)]",
    detail: "text-[var(--text-tertiary)]",
  },
  critical: {
    card: "bg-[var(--bg-primary)] border-2 border-[var(--border-status-error)]",
    icon: "bg-[var(--bg-status-error-subtle)] text-[var(--icon-status-error)]",
    count: "text-[var(--text-status-error)]",
    cta: "text-[var(--text-status-error)] hover:text-[var(--text-status-error)]",
    detail: "text-[var(--text-status-error)]",
  },
};

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  /** One line under the value: what it's out of, or what's next. */
  detail?: string;
  cta?: string;
  onCta?: () => void;
  emphasis?: KpiEmphasis;
}

export function KpiCard({ icon, label, value, detail, cta, onCta, emphasis = "default" }: KpiCardProps) {
  const cfg = EMPHASIS[emphasis];
  return (
    <div className={cn("flex flex-col rounded-[var(--radius-xl)] p-5 transition-shadow hover:shadow-[var(--shadow-sm)]", cfg.card)}>
      <div className="flex items-center gap-3 mb-3.5">
        <span className={cn("w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0", cfg.icon)} aria-hidden="true">
          {icon}
        </span>
        <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug min-w-0">{label}</div>
      </div>

      <span className={cn("block text-3xl font-bold leading-none tabular-nums", cfg.count)}>{value}</span>

      {detail && <div className={cn("text-xs leading-snug mt-2", cfg.detail)}>{detail}</div>}

      {cta && onCta && (
        <Button
          variant="link-grey"
          size="sm"
          trailingIcon={<ArrowRight size={12} strokeWidth={2.5} />}
          onClick={onCta}
          className={cn("text-[12px] font-semibold mt-auto pt-3 self-start", cfg.cta)}
        >
          {cta}
        </Button>
      )}
    </div>
  );
}
