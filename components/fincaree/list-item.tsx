'use client'

/**
 * Fincaree List Item (selectable)
 *
 * A full-width row you click to choose one option, with an optional tinted
 * icon tile on the left and a trailing slot (a check, a reason, a badge).
 * Used for single-choice lists: content type, audience, picker rows.
 *
 * States: Default · Hover · Selected · Disabled. Hover and Selected fill the
 * row (grey / brand tint), which would swallow a pale icon tile, so the tile
 * takes a 2px ring in the surface colour in those two states to stay
 * distinct. The ring is part of the component, not the page.
 *
 * Group semantics: put rows inside a role="radiogroup"; each row is a
 * role="radio" button.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ListItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'role'> {
  /** Icon shown in the tile. Colour it with `tileClassName`. */
  icon?: React.ReactNode
  /** Background + icon colour for the tile, e.g. "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]". */
  tileClassName?: string
  selected?: boolean
  /** Content of the row — usually the label. */
  children: React.ReactNode
  /** Right-hand content. Defaults to a check when selected. */
  trailing?: React.ReactNode
  /** Why the row is unavailable; shown in the trailing slot and as a tooltip. */
  disabledReason?: string
}

export const ListItem = React.forwardRef<HTMLButtonElement, ListItemProps>(
  (
    { icon, tileClassName, selected = false, disabled, disabledReason, trailing, children, className, ...props },
    ref
  ) => {
    const isDisabled = Boolean(disabled || disabledReason)
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        title={disabledReason}
        className={cn(
          'group flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring-border-primary)]',
          isDisabled
            ? 'cursor-not-allowed'
            : selected
              ? 'bg-[var(--bg-brand-subtle)]'
              : 'hover:bg-[var(--bg-secondary)]',
          className
        )}
        {...props}
      >
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] ring-2 ring-transparent transition-shadow',
              isDisabled
                ? 'bg-[var(--bg-secondary)] text-[var(--text-disabled)]'
                : cn(tileClassName, selected ? 'ring-[var(--bg-primary)]' : 'group-hover:ring-[var(--bg-primary)]')
            )}
          >
            {icon}
          </span>
        )}
        <span className={cn('flex-1 text-sm font-medium', isDisabled ? 'text-[var(--text-disabled)]' : 'text-[var(--text-primary)]')}>
          {children}
        </span>
        {isDisabled ? (
          disabledReason && <span className="text-xs text-[var(--text-disabled)]">{disabledReason}</span>
        ) : (
          (trailing ?? (selected ? <CheckMark /> : null))
        )}
      </button>
    )
  }
)
ListItem.displayName = 'ListItem'

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--icon-brand-primary)]" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
