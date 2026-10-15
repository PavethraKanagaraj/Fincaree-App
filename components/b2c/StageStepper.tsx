import Link from "next/link";
import { cn } from "@/lib/utils";

/* ============================================================
   FinCaree customer stage stepper — the horizontal progress bar
   shared by every step of the discovery and profile journey.
   Each stage shows a numbered badge, its label, and a progress
   bar: 100% once reached (via completedIndices or as the active
   stage), 0% while still ahead.
   ============================================================ */

export const STAGE_STEPS = [
  "Financial starting point",
  "Assets & savings",
  "Spending & expenses",
  "Goals & priorities",
  "Risk & preferences",
];

/* Steps that have a page in the journey. Other steps are shown but not yet linkable. */
const STAGE_ROUTES: Partial<Record<number, string>> = {
  0: "/financial-summary",
  1: "/assets",
  2: "/spending",
  3: "/goals",
  4: "/risk",
};

export function StageStepper({ activeIndex, completedIndices = [] }: { activeIndex: number; completedIndices?: number[] }) {
  return (
    <nav aria-label="Stages" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-3">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-1">
        {STAGE_STEPS.map((step, i) => {
          const active = i === activeIndex;
          const reached = active || completedIndices.includes(i);
          const pct = reached ? 100 : 0;
          const route = STAGE_ROUTES[i];
          const num = String(i + 1).padStart(2, "0");

          const content = (
            <>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold tabular-nums",
                    active
                      ? "border-transparent bg-[var(--color-brand-700)] text-white"
                      : "border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  )}
                  aria-hidden
                >
                  {num}
                </span>
                <span className={cn("truncate text-sm", active ? "font-bold text-[var(--text-brand-primary)]" : "font-semibold text-[var(--text-primary)]")}>
                  {step}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 pl-12">
                <div
                  role="progressbar"
                  aria-label={`${step} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]"
                >
                  <div className="h-full rounded-full bg-[var(--color-brand-600)] transition-[width] duration-300" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right text-xs tabular-nums text-[var(--text-tertiary)]">{pct}%</span>
              </div>
            </>
          );

          const className = cn("block rounded-[var(--radius-lg)] p-3 transition-colors", active && "bg-[var(--bg-brand-subtle)]");

          return (
            <li key={step}>
              {route ? (
                <Link href={route} aria-current={active ? "step" : undefined} className={cn(className, !active && "hover:bg-[var(--bg-secondary)]")}>
                  {content}
                </Link>
              ) : (
                <span aria-current={active ? "step" : undefined} className={className}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
