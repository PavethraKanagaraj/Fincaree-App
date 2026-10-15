"use client"

import * as React from "react"
import { Dialog as ModalPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/fincaree/button"

/**
 * Centered modal, adapted to Fincaree design tokens.
 *
 * Fincaree has no dialog primitive of its own and `ui/sheet.tsx` only covers
 * edge-anchored panels. Built on the same @base-ui/react/dialog primitive as
 * the Sheet, so focus trap, ESC-to-close, scroll lock and backdrop click come
 * from the primitive rather than being hand-rolled.
 */

function Modal({ ...props }: ModalPrimitive.Root.Props) {
  return <ModalPrimitive.Root data-slot="modal" {...props} />
}

function ModalTrigger({ ...props }: ModalPrimitive.Trigger.Props) {
  return <ModalPrimitive.Trigger data-slot="modal-trigger" {...props} />
}

function ModalClose({ ...props }: ModalPrimitive.Close.Props) {
  return <ModalPrimitive.Close data-slot="modal-close" {...props} />
}

function ModalContent({
  className,
  children,
  showClose = true,
  ...props
}: ModalPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <ModalPrimitive.Portal>
      <ModalPrimitive.Backdrop
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-150",
          "data-ending-style:opacity-0 data-starting-style:opacity-0"
        )}
      />
      <ModalPrimitive.Popup
        data-slot="modal-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100vw-2rem)] max-w-[560px] max-h-[calc(100vh-4rem)]",
          "flex flex-col overflow-hidden",
          "rounded-[var(--radius-xl)] border border-[var(--border-tertiary)]",
          "bg-[var(--bg-primary)] shadow-[var(--shadow-lg)]",
          "transition-[opacity,transform] duration-150",
          "data-starting-style:opacity-0 data-starting-style:scale-[0.98]",
          "data-ending-style:opacity-0 data-ending-style:scale-[0.98]",
          className
        )}
        {...props}
      >
        {showClose && (
          <ModalClose
            render={
              <Button
                variant="tertiary"
                size="sm"
                iconOnly
                leadingIcon={<X size={15} strokeWidth={2} />}
                aria-label="Close"
                className="absolute right-3 top-3 z-10"
              />
            }
          />
        )}
        {children}
      </ModalPrimitive.Popup>
    </ModalPrimitive.Portal>
  )
}

function ModalTitle({ className, ...props }: ModalPrimitive.Title.Props) {
  return (
    <ModalPrimitive.Title
      data-slot="modal-title"
      className={cn("text-base font-semibold text-[var(--text-primary)]", className)}
      {...props}
    />
  )
}

function ModalDescription({ className, ...props }: ModalPrimitive.Description.Props) {
  return (
    <ModalPrimitive.Description
      data-slot="modal-description"
      className={cn("text-xs text-[var(--text-tertiary)]", className)}
      {...props}
    />
  )
}

export { Modal, ModalTrigger, ModalClose, ModalContent, ModalTitle, ModalDescription }
