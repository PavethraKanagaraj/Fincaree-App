'use client'

/**
 * Fincaree Radio Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 10066:970
 * Variants: size (sm / md), checked, disabled
 * States are handled via CSS data attributes — no inline styles.
 *
 * Use inside a <fieldset> or alongside a RadioGroup for correct group semantics.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: 'sm' | 'md'
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, size = 'md', checked, disabled, ...props }, ref) => {
    const state = checked ? 'checked' : 'unchecked'

    return (
      <label className={cn('fc-checkbox-root', className)}>
        <input
          type="radio"
          ref={ref}
          checked={checked}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <span
          className={cn('fc-radio-control', `fc-radio-${size}`)}
          data-state={state}
          data-disabled={disabled || undefined}
          aria-hidden="true"
        >
          {state === 'checked' && (
            <span className={cn('fc-radio-indicator', `fc-radio-${size}`)} />
          )}
        </span>
      </label>
    )
  }
)

Radio.displayName = 'Radio'
