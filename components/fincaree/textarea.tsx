'use client'

/**
 * Fincaree Textarea Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 9971:16810
 * Page: Input
 *
 * Types (Figma: Type):
 *   default — standard resizable textarea
 *   tags    — tag chips + grow-as-you-type input area
 *
 * Destructive (Figma: Destructive=True) : error prop
 * States — handled by CSS :focus-within, :disabled, :has(), [data-error], [data-disabled]
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { InputTagChip, type InputTag } from './input'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible field label */
  label?: string
  /** Helper text shown below the field */
  hint?: string
  /** Error message — activates destructive/error state */
  error?: string
  /** Shows a red asterisk next to the label */
  required?: boolean
  /** Optional adornment rendered after the label (e.g. tooltip icon) */
  labelIcon?: React.ReactNode
  /** Tag chips rendered inside the textarea (Type=Tags) */
  tags?: InputTag[]
  /** Called with the removed tag's id */
  onTagRemove?: (id: string) => void
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      required,
      labelIcon,
      tags,
      onTagRemove,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const uid = React.useId()
    const textareaId = id ?? uid
    const hintId = `${textareaId}-hint`
    const isError = Boolean(error)
    const hasTags = tags !== undefined

    return (
      <div
        className="fc-input-root"
        data-error={isError || undefined}
        data-disabled={disabled || undefined}
      >
        {/* Label row */}
        {label && (
          <div className="fc-input-label-row">
            <label htmlFor={textareaId} className="fc-input-label">
              {label}
            </label>
            {required && (
              <span className="fc-input-required" aria-hidden="true">*</span>
            )}
            {labelIcon && (
              <span className="fc-input-icon" style={{ color: 'var(--input-icon)' }}>
                {labelIcon}
              </span>
            )}
          </div>
        )}

        {/* Bordered field container */}
        <div
          className={cn('fc-textarea-field', className)}
          data-error={isError || undefined}
          data-disabled={disabled || undefined}
        >
          {/* Tags variant */}
          {hasTags ? (
            <div className="fc-textarea-tags-area">
              {tags!.map((tag) => (
                <InputTagChip key={tag.id} tag={tag} onRemove={disabled ? undefined : onTagRemove} />
              ))}
              <textarea
                ref={ref}
                id={textareaId}
                className="fc-textarea-element"
                disabled={disabled}
                aria-describedby={hint || error ? hintId : undefined}
                aria-invalid={isError || undefined}
                aria-required={required || undefined}
                {...props}
              />
            </div>
          ) : (
            /* Standard textarea */
            <textarea
              ref={ref}
              id={textareaId}
              className="fc-textarea-element"
              disabled={disabled}
              aria-describedby={hint || error ? hintId : undefined}
              aria-invalid={isError || undefined}
              aria-required={required || undefined}
              {...props}
            />
          )}
        </div>

        {/* Hint / error message */}
        {(hint || error) && (
          <p id={hintId} className="fc-input-hint">
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
