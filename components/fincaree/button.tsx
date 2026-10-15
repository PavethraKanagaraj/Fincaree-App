'use client'

/**
 * Fincaree Button Component
 *
 * All colors are driven by CSS custom properties that are generated from
 * design-system/figma/components.json via `npm run tokens`.
 *
 * To update button tokens:
 *   1. Edit design-system/figma/components.json
 *   2. Run: npm run tokens
 *   3. The CSS vars in globals.css update → this component reflects the change
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 18:11389
 *
 * Variants   (Figma: Hierarchy)       : primary | secondary | tertiary | link-brand | link-grey
 * Color      (Figma: color)           : brand | destructive
 * Size       (Figma: Size)            : sm | md | lg | xl
 * Icon only  (Figma: Button type)     : iconOnly prop
 * States     (Figma: State)           : handled via CSS :hover :focus-visible :disabled data-[loading]
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── CVA variant map ───────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base classes — layout, typography, transitions, focus ring
  [
    'fc-btn',
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-medium leading-none select-none',
    'transition-[background-color,color,border-color,box-shadow] duration-150',
    'focus-visible:outline-none',
    'disabled:pointer-events-none',
    '[&[data-loading]]:pointer-events-none',
  ].join(' '),
  {
    variants: {
      /** Maps to Figma Hierarchy property */
      variant: {
        primary:             'fc-btn-primary',
        secondary:           'fc-btn-secondary',
        tertiary:            'fc-btn-tertiary',
        'link-brand':        'fc-btn-link-brand',
        'link-grey':         'fc-btn-link-grey',
      },
      /** Maps to Figma color property */
      color: {
        brand:       '',
        destructive: 'fc-btn-destructive',
      },
      /** Maps to Figma Size property */
      size: {
        sm: 'fc-btn-sm',
        md: 'fc-btn-md',
        lg: 'fc-btn-lg',
        xl: 'fc-btn-xl',
      },
      /** Maps to Figma Button type=Icon only */
      iconOnly: {
        true:  'fc-btn-icon-only',
        false: '',
      },
    },
    defaultVariants: {
      variant:  'primary',
      color:    'brand',
      size:     'md',
      iconOnly: false,
    },
  }
)

// ── Props ─────────────────────────────────────────────────────────────────────

// `color` is omitted from the HTML attributes: the legacy HTML `color`
// attribute (any string) collided with the variant prop ('brand' |
// 'destructive'), which left `color` unchecked.
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  /** Show a loading spinner and block interaction */
  loading?: boolean
  /** Icon placed before the label */
  leadingIcon?: React.ReactNode
  /** Icon placed after the label */
  trailingIcon?: React.ReactNode
  /**
   * Render as a child element (e.g. <a> for link buttons).
   * Uses Radix Slot — the child must forward refs.
   */
  asChild?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      iconOnly,
      loading = false,
      disabled,
      leadingIcon,
      trailingIcon,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, color, size, iconOnly }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {/* Content stays mounted while loading (hidden via CSS) so the
            button keeps its width; the spinner is centered over it. */}
        <span className="fc-btn-content inline-flex items-center justify-center gap-[inherit]">
          {leadingIcon && (
            <span className="fc-btn-icon shrink-0" aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          {!iconOnly && children && (
            <span className="fc-btn-label">{children}</span>
          )}
          {trailingIcon && (
            <span className="fc-btn-icon shrink-0" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </span>
        {loading && (
          <Loader2 className="fc-btn-spinner-icon animate-spin" aria-hidden="true" />
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

// ── Variant helper re-export (for use in other components) ────────────────────

export { buttonVariants }
