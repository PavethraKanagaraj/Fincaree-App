'use client'

/**
 * Fincaree Checkbox Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 10066:970 ("Checkbox base")
 * Variants: size (sm 16px / md 20px), checked, indeterminate, disabled
 *
 * The native input stays in the DOM (visually hidden) and drives every
 * visual state through CSS (:checked, :indeterminate, :disabled,
 * :focus-visible), so both controlled (`checked`) and uncontrolled
 * (`defaultChecked`) use work. `indeterminate` is set on the element,
 * which screen readers announce as "mixed".
 *
 * Pass `children` to label the box — they render inside the same <label>,
 * so there's no need to wrap the Checkbox in another label.
 */

import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  indeterminate?: boolean
  size?: 'sm' | 'md'
  /** Optional label content, rendered after the box inside its <label> */
  children?: React.ReactNode
}

/* Figma: the check fills 70% of the box, the minus ~80% */
const ICON = { sm: { check: 11, minus: 13 }, md: { check: 14, minus: 16 } }

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate = false, size = 'md', children, ...props }, ref) => {
    const inner = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inner.current as HTMLInputElement)
    React.useEffect(() => {
      if (inner.current) inner.current.indeterminate = indeterminate
    }, [indeterminate])

    return (
      <label className={cn('fc-checkbox-root', className)}>
        <input type="checkbox" ref={inner} className="fc-checkbox-input sr-only" {...props} />
        <span className={cn('fc-checkbox-control', `fc-checkbox-${size}`)} aria-hidden="true">
          <Check className="fc-checkbox-check" size={ICON[size].check} strokeWidth={2.5} />
          <Minus className="fc-checkbox-minus" size={ICON[size].minus} strokeWidth={2.5} />
        </span>
        {children}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
