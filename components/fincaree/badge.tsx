'use client'

/**
 * Fincaree Badge Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 9971:2598
 * Page: Badges
 *
 * Size   (Figma: Size)  : sm | md | lg
 * Color  (Figma: Color) : gray | brand | error | warning | success | gray-blue
 * Icon   (Figma: Icon)  :
 *   false   → no leadingIcon prop
 *   dot     → leadingIcon="dot"
 *   country → leadingIcon={<img src={flagUrl} alt="AU" />}
 *   avatar  → leadingIcon={<img src={avatarUrl} alt="Name" />}
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeSize  = 'sm' | 'md' | 'lg'
export type BadgeColor = 'gray' | 'brand' | 'error' | 'warning' | 'success' | 'gray-blue'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Maps to Figma Size property */
  size?: BadgeSize
  /** Maps to Figma Color property */
  color?: BadgeColor
  /**
   * Maps to Figma Icon property.
   * - `"dot"` renders a colored circle indicator
   * - Any ReactNode renders in the leading icon slot (country flag, avatar, lucide icon)
   */
  leadingIcon?: 'dot' | React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ size = 'md', color = 'gray', leadingIcon, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'fc-badge',
          `fc-badge-${size}`,
          `fc-badge-${color}`,
          className
        )}
        {...props}
      >
        {leadingIcon === 'dot' ? (
          <span className="fc-badge-dot" aria-hidden="true" />
        ) : leadingIcon ? (
          <span className="fc-badge-icon" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
