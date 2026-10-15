'use client'

/**
 * Fincaree Chip Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 10259:8318
 * Page: Chips
 *
 * Variant    : Filter | Input | Assist — semantic; the rendered element follows
 *              from the props rather than a variant name:
 *   Filter  → selectable (selected / defaultSelected / onSelectChange): a
 *             toggle button with aria-pressed
 *   Assist  → onClick only: a plain action button (not announced as a toggle)
 *   Input   → onRemove: a chip with a trailing close button
 *   none    → no handlers: a static, non-interactive label
 * Content    : Label | Dot | Leading Icon | Leading Avatar | Trailing Close
 * Selection  : Default | Selected | Disabled
 * Size       : sm (18px) | md (24px) | lg (32px)
 *
 * A removable chip is a <span> holding two sibling buttons — the toggle (when
 * selectable or clickable) and the close button — so buttons never nest. The
 * close button is named after the chip ("Remove Equity").
 */

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ChipSize = 'sm' | 'md' | 'lg'

export interface ChipProps extends React.HTMLAttributes<HTMLElement> {
  size?: ChipSize
  /** Controlled selection state (Filter chips) */
  selected?: boolean
  /** Uncontrolled initial selection state */
  defaultSelected?: boolean
  /** Called when selection toggles */
  onSelectChange?: (selected: boolean) => void
  /** Shows a dot before the label */
  dot?: boolean
  /** Leading icon node */
  icon?: React.ReactNode
  /** Leading avatar node (circular crop applied) */
  avatar?: React.ReactNode
  /** Renders a trailing close button (Input chips) */
  onRemove?: () => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

// ── Component ──────────────────────────────────────────────────────────────────

export const Chip = React.forwardRef<HTMLElement, ChipProps>(
  (
    {
      size = 'md',
      selected: controlledSelected,
      defaultSelected,
      onSelectChange,
      dot,
      icon,
      avatar,
      onRemove,
      disabled,
      onClick,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const id = React.useId()
    const labelId = `${id}-label`
    const removeId = `${id}-remove`

    const selectable =
      controlledSelected !== undefined ||
      defaultSelected !== undefined ||
      onSelectChange !== undefined
    const isControlled = controlledSelected !== undefined
    const [internalSelected, setInternalSelected] = React.useState(Boolean(defaultSelected))
    const selected = selectable && (isControlled ? controlledSelected : internalSelected)
    const actionable = selectable || Boolean(onClick)

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (disabled) return
      if (selectable) {
        const next = !selected
        if (!isControlled) setInternalSelected(next)
        onSelectChange?.(next)
      }
      ;(onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(e)
    }

    const content = (
      <>
        {dot && <span className="fc-chip-dot" aria-hidden="true" />}
        {icon && (
          <span className="fc-chip-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {avatar && (
          <span className="fc-chip-avatar" aria-hidden="true">
            {avatar}
          </span>
        )}
        <span id={labelId}>{children}</span>
      </>
    )

    const rootProps = {
      className: cn('fc-chip', `fc-chip-${size}`, className),
      'data-selected': selected || undefined,
      'data-disabled': disabled || undefined,
    }

    // Input chip: wrapper + sibling buttons (never nested)
    if (onRemove) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          {...rootProps}
          {...(props as React.HTMLAttributes<HTMLSpanElement>)}
        >
          {actionable ? (
            <button
              type="button"
              className="fc-chip-toggle"
              disabled={disabled}
              aria-pressed={selectable ? selected : undefined}
              onClick={handleClick}
            >
              {content}
            </button>
          ) : (
            content
          )}
          <button
            type="button"
            className="fc-chip-close"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-labelledby={`${removeId} ${labelId}`}
          >
            <span id={removeId} hidden>
              Remove
            </span>
            <X strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      )
    }

    // Filter / Assist chip: one button
    if (actionable) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          {...rootProps}
          disabled={disabled}
          aria-pressed={selectable ? selected : undefined}
          onClick={handleClick}
          {...(props as React.HTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      )
    }

    // Static chip: nothing to operate
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        {...rootProps}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {content}
      </span>
    )
  }
)

Chip.displayName = 'Chip'
