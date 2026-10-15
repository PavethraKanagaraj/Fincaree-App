'use client'

/**
 * Fincaree ButtonGroupItem — maps to Figma "_Button group base"
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 9971:2277
 * Page: Button Groups
 *
 * Variants (Figma: Icon)    : none | leading | dot | only
 * Current  (Figma: Current) : isCurrent prop  → data-current attribute
 * States   (Figma: State)   : handled via CSS :hover :focus-visible :disabled
 *
 * Intended to be used inside <ButtonGroup>. Can also be used standalone
 * when composed manually.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export type ButtonGroupItemIconType = 'none' | 'leading' | 'dot' | 'only'

export interface ButtonGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text label shown inside the button */
  label?: string
  /** Icon element — used when iconType is 'leading' or 'only' */
  icon?: React.ReactNode
  /** Maps to Figma Icon property */
  iconType?: ButtonGroupItemIconType
  /** Active/selected state — maps to Figma Current=True */
  isCurrent?: boolean
}

export const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  (
    {
      label,
      icon,
      iconType = 'none',
      isCurrent = false,
      disabled,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'fc-btn-group-item',
          iconType === 'only' && 'fc-btn-group-item-icon-only',
          iconType === 'leading' && icon && 'fc-btn-group-item-leading',
          className
        )}
        disabled={disabled}
        data-current={isCurrent || undefined}
        aria-pressed={isCurrent}
        onClick={onClick}
        {...props}
      >
        {iconType === 'leading' && icon && (
          <span className="fc-btn-group-icon" aria-hidden="true">
            {icon}
          </span>
        )}

        {iconType === 'dot' && (
          <span className="fc-btn-group-dot" aria-hidden="true" />
        )}

        {iconType !== 'only' && label && (
          <span>{label}</span>
        )}

        {iconType === 'only' && icon && (
          <span className="fc-btn-group-icon" aria-hidden="true">{icon}</span>
        )}
      </button>
    )
  }
)

ButtonGroupItem.displayName = 'ButtonGroupItem'
