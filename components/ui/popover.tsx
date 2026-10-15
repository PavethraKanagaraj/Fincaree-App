"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "@/lib/utils"

/**
 * Popover, adapted to Fincaree tokens.
 *
 * The design system's Tooltip is a dark single-line label — right for icon
 * names, wrong for a short list of reasons. This is the light, wrapping
 * counterpart: same Base UI family, opens on hover or click, and stays open
 * long enough to read (Tooltip closes the instant the pointer leaves).
 */

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  children,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} className="z-[var(--z-popover)]">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "w-[264px] rounded-[var(--radius-lg)] border border-[var(--border-tertiary)]",
            "bg-[var(--bg-primary)] px-3.5 py-3 shadow-[var(--shadow-md)] outline-none",
            "transition-opacity duration-100",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
