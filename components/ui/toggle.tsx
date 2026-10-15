"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Toggle, adapted to Fincaree design tokens.
 *
 * Fincaree has no toggle primitive, and neither Button nor Chip can carry a
 * per-instance semantic color for the "on" state — Chip's selected state is
 * hardcoded to one brand color (see design-system audit). `success` and
 * `destructive` variants exist here specifically for paired accept/reject
 * controls, mirroring the color logic the original hand-built version used,
 * now routed through semantic tokens instead of raw primitives.
 */
const toggleVariants = cva(
  [
    "group/toggle inline-flex items-center justify-center gap-1",
    "rounded-[var(--radius-md)] text-xs font-medium whitespace-nowrap",
    "border transition-colors outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-[var(--border-secondary)] bg-transparent text-[var(--text-secondary)]",
          "hover:bg-[var(--bg-secondary)]",
          "data-[state=on]:bg-[var(--bg-brand-subtle)] data-[state=on]:border-[var(--border-brand-primary)] data-[state=on]:text-[var(--text-brand-primary)]",
        ].join(" "),
        success: [
          "border-[var(--border-secondary)] bg-transparent text-[var(--text-secondary)]",
          "hover:border-[var(--border-status-success)] hover:text-[var(--text-status-success)]",
          "data-[state=on]:bg-[var(--bg-status-success-solid)] data-[state=on]:border-[var(--bg-status-success-solid)] data-[state=on]:text-[var(--text-on-brand-primary)]",
        ].join(" "),
        destructive: [
          "border-[var(--border-secondary)] bg-transparent text-[var(--text-secondary)]",
          "hover:border-[var(--border-status-error)] hover:text-[var(--text-status-error)]",
          "data-[state=on]:bg-[var(--bg-status-error-solid)] data-[state=on]:border-[var(--bg-status-error-solid)] data-[state=on]:text-[var(--text-on-brand-primary)]",
        ].join(" "),
      },
      size: {
        sm: "h-7 px-2.5",
        default: "h-8 px-2.5",
        lg: "h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
