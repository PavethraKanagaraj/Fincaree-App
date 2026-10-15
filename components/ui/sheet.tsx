"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/fincaree/button"

/**
 * shadcn/ui Sheet, adapted to Fincaree design tokens.
 *
 * Replaces the original hand-built ReportDrawer shell (a manually positioned
 * `fixed right-0` div with no backdrop, no focus trap, no ESC-to-close).
 * Fincaree has no drawer/panel primitive of its own.
 *
 * Sizing matches the drawer's existing responsive fix: full-width below
 * `sm:`, 440px fixed above it. The close button uses Fincaree's own Button
 * (iconOnly, tertiary) rather than the generic shadcn Button this was
 * scaffolded with — Fincaree's Button already covers icon-only buttons.
 */

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-150",
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col",
          "bg-[var(--bg-primary)] text-[var(--text-primary)]",
          "shadow-[var(--shadow-2xl,_0_25px_50px_-12px_rgb(0,0,0,0.25))]",
          "transition duration-200 ease-in-out",
          "data-ending-style:opacity-0 data-starting-style:opacity-0",
          side === "right" &&
            "inset-y-0 right-0 h-full w-full sm:w-[440px] border-l border-[var(--border-tertiary)] data-ending-style:translate-x-[2.5rem] data-starting-style:translate-x-[2.5rem]",
          side === "left" &&
            "inset-y-0 left-0 h-full w-full sm:w-[440px] border-r border-[var(--border-tertiary)] data-ending-style:translate-x-[-2.5rem] data-starting-style:translate-x-[-2.5rem]",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t border-[var(--border-tertiary)] data-ending-style:translate-y-[2.5rem] data-starting-style:translate-y-[2.5rem]",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b border-[var(--border-tertiary)] data-ending-style:translate-y-[-2.5rem] data-starting-style:translate-y-[-2.5rem]",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="tertiary"
                size="sm"
                iconOnly
                leadingIcon={<X size={15} strokeWidth={2} />}
                className="absolute top-3 right-3"
                aria-label="Close"
              />
            }
          />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium text-[var(--text-primary)]", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-[var(--text-tertiary)]", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
