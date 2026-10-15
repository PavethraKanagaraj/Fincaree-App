'use client'
// Figma: E3iIKwdE2far5TdrPYla2z  node: 9420:4201 (frame 9971:7786)
// Page: Switch
// Type: Default | Slim   ×   Size: sm | md   ×   State (Default / Hover / Focus / Disabled) × Pressed
//
// Default — padded track, borderless inset thumb.
// Slim    — no padding; full-height thumb with a 1px border.
//
// Pass `children` to label the switch: they render in a <label> around it,
// so clicking the text toggles it and screen readers read the text as its
// name. Without children, give it an `aria-label`.

import * as React from 'react'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SwitchVariant = 'default' | 'slim'
export type SwitchSize = 'sm' | 'md'

export interface SwitchProps extends React.ComponentProps<typeof BaseSwitch.Root> {
  variant?: SwitchVariant
  size?: SwitchSize
  /** Optional visible label, rendered after the switch */
  children?: React.ReactNode
}

// ── Size → CSS class map ──────────────────────────────────────────────────────

const sizeClass: Record<SwitchVariant, Record<SwitchSize, string>> = {
  default: { sm: 'fc-switch-sm', md: 'fc-switch-md' },
  slim: { sm: 'fc-switch-slim-sm', md: 'fc-switch-slim-md' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const control = (
      <BaseSwitch.Root
        ref={ref}
        className={cn('fc-switch', sizeClass[variant][size], !children && className)}
        {...props}
      >
        <BaseSwitch.Thumb className="fc-switch-thumb" />
      </BaseSwitch.Root>
    )

    if (!children) return control

    return (
      <label className={cn('fc-switch-field', className)}>
        {control}
        {children}
      </label>
    )
  }
)

Switch.displayName = 'Switch'
