import { cn } from "@/lib/utils";

/* ============================================================
   Page Frame — the one page grid every B2B page sits on.

   Grid: 12 columns, 16px gutter, measured inside the content area
   (after the side nav). Side margin is --page-margin in globals.css:
   16px below 768, 24px from 768, 32px from 1440.

   Width is a choice per page, not an accident:
   - full     boards and tables; fluid, no cap
   - default  overview dashboards; centred, capped at 1440px
   - narrow   forms, settings, detail; centred, capped at 960px

   Header band (title, description, optional tabs, page actions) and
   content share the same width, so their edges line up at any size.
   Sections are spaced 24px apart (space-y-6).
   `lockHeight` stops the page scrolling at xl so a child can fill the
   remaining height and scroll on its own (Compose & send).
   ============================================================ */

export type PageWidth = "full" | "default" | "narrow";

const WIDTH: Record<PageWidth, string> = {
  full: "",
  default: "max-w-[1440px] mx-auto",
  narrow: "max-w-[960px] mx-auto",
};

const MARGIN = "px-[var(--page-margin)]";

/** The 12-column page grid: 12 columns, 16px gutter. Children span columns with
    col-span-* — e.g. "col-span-12 lg:col-span-6" for a half-width card, "lg:col-span-4"
    for a third. `*:h-full` on a child wrapper makes cards in a row equal height. */
export function PageGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-12 gap-4", className)}>{children}</div>;
}

interface PageContainerProps {
  width?: PageWidth;
  className?: string;
  children: React.ReactNode;
}

/** Margins, width and rhythm only — for pages that draw their own header. */
export function PageContainer({ width = "default", className, children }: PageContainerProps) {
  return <div className={cn(MARGIN, "py-6", WIDTH[width], className)}>{children}</div>;
}

interface PageFrameProps {
  title: string;
  description?: React.ReactNode;
  /** Page-level actions, right-aligned in the header band. */
  actions?: React.ReactNode;
  /** A <Tabs> row rendered under the description. */
  tabs?: React.ReactNode;
  width?: PageWidth;
  /** Let the content area fill the remaining height instead of scrolling the page (xl+). */
  lockHeight?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
}

export function PageFrame({ title, description, actions, tabs, width = "default", lockHeight, contentClassName, children }: PageFrameProps) {
  return (
    <div className={cn("flex flex-col h-full overflow-y-auto bg-[var(--bg-canvas)]", lockHeight && "xl:overflow-hidden")}>
      <header className="shrink-0 bg-[var(--bg-primary)] border-b border-[var(--border-tertiary)]">
        <div className={cn("flex items-start justify-between gap-4 py-5", MARGIN, WIDTH[width])}>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{title}</h1>
            {description && <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{description}</p>}
            {tabs && <div className="mt-4">{tabs}</div>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>

      <div
        className={cn(
          "w-full space-y-6",
          MARGIN,
          "py-6",
          WIDTH[width],
          lockHeight && "xl:flex xl:flex-col xl:flex-1 xl:min-h-0",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
