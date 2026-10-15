"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/* ============================================================
   Calendar — shadcn's date-picker structure (DayPicker + a custom
   day-button component), reskinned with Fincaree tokens instead of
   shadcn's own palette. No dependency on shadcn's Button: a day is
   a plain styled <button>, since Fincaree already has its own Button
   and the project rules forbid running two button systems side by side.
   ============================================================ */

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex flex-col gap-4", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between px-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-primary)] disabled:opacity-40 disabled:pointer-events-none transition-colors",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-primary)] disabled:opacity-40 disabled:pointer-events-none transition-colors",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-7 w-full items-center justify-center text-sm font-semibold text-[var(--text-primary)]",
          defaultClassNames.month_caption
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-9 flex-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square w-9 flex-1 p-0.5 text-center",
          defaultClassNames.day
        ),
        today: cn("", defaultClassNames.today),
        outside: cn("text-[var(--text-quaternary)]", defaultClassNames.outside),
        disabled: cn("text-[var(--text-quaternary)] opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === "left" ? (
            <ChevronLeft size={16} strokeWidth={1.75} className={chevronClassName} />
          ) : (
            <ChevronRight size={16} strokeWidth={1.75} className={chevronClassName} />
          ),
        DayButton: CalendarDayButton,
        ...props.components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({ className, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-selected={modifiers.selected || undefined}
      data-today={modifiers.today || undefined}
      className={cn(
        "flex aspect-square w-full items-center justify-center rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-primary)] transition-colors",
        "hover:bg-[var(--bg-secondary)]",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--focus-ring-border-primary)]",
        "data-[today=true]:bg-[var(--bg-brand-subtle)] data-[today=true]:text-[var(--text-brand-primary)] data-[today=true]:font-semibold",
        "data-[selected=true]:bg-[var(--bg-brand-primary)] data-[selected=true]:text-[var(--text-on-brand-primary)] data-[selected=true]:font-semibold data-[selected=true]:hover:bg-[var(--bg-brand-primary)]",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
