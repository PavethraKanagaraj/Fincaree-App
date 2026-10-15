'use client'

/**
 * Fincaree Tag Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z
 *   Tag            node 10193:8649 — Size × Color × State × Action (Label | Dot | Dismiss)
 *   _Tag checkbox  node 9971:7298
 *   _Tag count     node 9971:7289
 *   _Tag close X   node 9971:7276
 * Page: Tags
 *
 * Unlike Chip, Tag is a label element (radius-md rectangle). Interactive
 * sub-elements are opt-in via props:
 *
 *   Action=Dot     → dot
 *   Action=Dismiss → onRemove   (_Tag close X)
 *   _Tag checkbox  → checked / onCheckedChange
 *   _Tag count     → count
 *
 * The checkbox and remove button are named after the tag's own label
 * ("Remove Retirement"), so a list of tags is distinguishable to screen
 * readers.
 *
 * Color  : grey | brand | error | success | warning
 * Size   : sm (22px) | md (24px) | lg (28px)
 */

import * as React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export type TagColor = 'grey' | 'brand' | 'error' | 'success' | 'warning'
export type TagSize = 'sm' | 'md' | 'lg'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color variant — maps to Figma Color property */
  color?: TagColor
  /** Size variant — maps to Figma Size property */
  size?: TagSize
  /** Figma Action=Dot — a status dot in the colour's icon token */
  dot?: boolean
  /** Leading icon node */
  icon?: React.ReactNode
  /** _Tag checkbox: pair with onCheckedChange for controlled behavior */
  checked?: boolean
  /** Called when the checkbox is toggled */
  onCheckedChange?: (checked: boolean) => void
  /** _Tag count: a neutral count chip at the trailing edge */
  count?: number
  /** Figma Action=Dismiss (_Tag close X): called when the close button is clicked */
  onRemove?: () => void
  /** Disables all interactive sub-elements */
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

// ── Component ──────────────────────────────────────────────────────────────────

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      color = 'grey',
      size = 'md',
      dot,
      icon,
      checked,
      onCheckedChange,
      count,
      onRemove,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const id = React.useId()
    const labelId = `${id}-label`
    const removeId = `${id}-remove`

    return (
      <span
        ref={ref}
        className={cn('fc-tag', `fc-tag-${size}`, `fc-tag-${color}`, className)}
        data-disabled={disabled || undefined}
        {...props}
      >
        {/* _Tag checkbox — visually hidden input + styled indicator; the
            input drives the visual state, and is named by the tag label. */}
        {onCheckedChange !== undefined && (
          <label className="fc-tag-checkbox-wrap">
            <input
              type="checkbox"
              className="fc-tag-checkbox-input sr-only"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onCheckedChange(e.target.checked)}
              aria-labelledby={labelId}
            />
            <span className="fc-tag-checkbox" aria-hidden="true">
              <Check strokeWidth={2.5} />
            </span>
          </label>
        )}

        {dot && <span className="fc-tag-dot" aria-hidden="true" />}

        {icon && (
          <span className="fc-tag-icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <span id={labelId}>{children}</span>

        {count !== undefined && <span className="fc-tag-count">{count}</span>}

        {onRemove && (
          <button
            type="button"
            className="fc-tag-close"
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
        )}
      </span>
    )
  }
)

Tag.displayName = 'Tag'
