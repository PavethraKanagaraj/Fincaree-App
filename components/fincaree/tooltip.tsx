"use client";

/**
 * Fincaree Tooltip Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z — page "Tooltip"
 * Documented in design-system/docs/Components/Tooltip.md but not yet coded
 * until now. Built on @base-ui/react/tooltip (same primitive family as
 * Select/DropdownMenu/Tabs), styled with the Tooltip/* component tokens.
 *
 * Shows on hover AND keyboard focus by default (Base UI's built-in a11y
 * behavior) — covers both "hover to preview" and "focus via click/tab"
 * without separate logic for each.
 */

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = "right",
  sideOffset = 8,
  children,
  ...props
}: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-[var(--z-tooltip)] rounded-[var(--radius-md)] px-2.5 py-1.5",
            "bg-[var(--tooltip-bg)] text-[var(--tooltip-text)]",
            "text-xs font-medium leading-tight whitespace-nowrap",
            "shadow-[var(--shadow-md)]",
            "transition-opacity duration-100",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
