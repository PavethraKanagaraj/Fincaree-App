import Image from "next/image";
import { cn } from "@/lib/utils";

/* ============================================================
   FinCaree customer page hero — the banner shared by every step of
   the discovery and profile journey: an eyebrow label, a bold
   headline, a short description and a decorative illustration.
   ============================================================ */

export function PageHero({
  eyebrow,
  title,
  badge,
  description,
  trailing,
  illustration = true,
  className,
}: {
  eyebrow: string;
  title: string;
  /** Inline status chip next to the title — e.g. "Fiduciary alignment". */
  badge?: React.ReactNode;
  description?: string;
  /** Extra content pinned to the right, replacing the illustration — e.g. a search widget. */
  trailing?: React.ReactNode;
  illustration?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-brand-subtle)] p-6",
        className
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-tertiary)]">{eyebrow}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold leading-tight text-[var(--text-primary)]">{title}</h1>
            {badge}
          </div>
          {description && <p className="mt-2 text-sm leading-relaxed text-[var(--text-tertiary)]">{description}</p>}
        </div>
        {trailing}
      </div>
      {illustration && !trailing && (
        <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 sm:block" aria-hidden>
          <Image src="/brand/page-hero-illustration.png" alt="" width={220} height={116} className="h-[116px] w-[220px] object-contain" unoptimized />
        </div>
      )}
    </div>
  );
}
