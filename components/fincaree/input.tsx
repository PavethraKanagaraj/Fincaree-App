'use client'

/**
 * Fincaree Input Field Component
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 9971:15525
 * Page: Input
 *
 * Sizes    (Figma: Size)        : sm (40px) | md (44px) — both 16/24 text
 * Types    (Figma: Type)        :
 *   Default           — leadingIcon / trailingIcon
 *   Payment input     — leadingIcon (card brand mark)
 *   Leading dropdown  — leadingDropdown  (inline, no divider)
 *   Trailing dropdown — trailingDropdown (inline, no divider)
 *   Leading text      — leadingAddon     (attached, with divider)
 *   Trailing button   — trailingAddon    (attached, with divider)
 *   Tags              — tags
 *
 * Destructive (Figma: Destructive=True) : error prop
 * Status  (Warning / Success tokens)    : status prop — ignored while error is set
 * States — handled by CSS :hover, :focus-within, :read-only, :disabled,
 *          [data-error], [data-status], [data-disabled]
 */

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Shared tag type + chip (also used by Textarea) ────────────────────────────

export interface InputTag {
  id: string
  label: string
  /** Avatar or icon shown before the label (rendered at 16px, round) */
  icon?: React.ReactNode
}

export function InputTagChip({
  tag,
  onRemove,
}: {
  tag: InputTag
  onRemove?: (id: string) => void
}) {
  return (
    <span className="fc-input-tag">
      <span className="fc-input-tag-content">
        {tag.icon && (
          <span className="fc-input-tag-avatar" aria-hidden="true">
            {tag.icon}
          </span>
        )}
        {tag.label}
      </span>
      {onRemove && (
        <button
          type="button"
          className="fc-input-tag-remove"
          onClick={() => onRemove(tag.id)}
          aria-label={`Remove ${tag.label}`}
        >
          <X size={12} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </span>
  )
}

/** Wraps an addon/dropdown slot. A disabled <fieldset> natively disables any
    button or select passed in, so a disabled Input can't be operated through
    its slots (they'd otherwise stay clickable while looking disabled). */
function Slot({
  className,
  disabled,
  children,
}: {
  className: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset className={className} disabled={disabled} aria-disabled={disabled || undefined}>
      {children}
    </fieldset>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible field label */
  label?: string
  /** Helper text shown below the field */
  hint?: string
  /** Error message — activates destructive/error state */
  error?: string
  /** Non-blocking status border/icon/focus-halo. Ignored while `error` is set. */
  status?: 'warning' | 'success'
  /** Shows a red asterisk next to the label */
  required?: boolean
  /** Maps to Figma Size property */
  size?: 'sm' | 'md'
  /** Decorative icon inside the left edge of the field */
  leadingIcon?: React.ReactNode
  /** Decorative icon inside the right edge of the field */
  trailingIcon?: React.ReactNode
  /** Figma "Leading dropdown" — an interactive trigger (e.g. country code) inline on the left */
  leadingDropdown?: React.ReactNode
  /** Figma "Trailing dropdown" — an interactive trigger (e.g. currency) inline on the right */
  trailingDropdown?: React.ReactNode
  /** Figma "Leading text" — static text attached on the left with a divider (e.g. "http://") */
  leadingAddon?: React.ReactNode
  /** Figma "Trailing button" — attached on the right with a divider; pass a <button> */
  trailingAddon?: React.ReactNode
  /** Optional adornment rendered after the label (e.g. tooltip trigger) */
  labelIcon?: React.ReactNode
  /** Tag chips rendered inside the field (Type=Tags) */
  tags?: InputTag[]
  /** Called with the removed tag's id */
  onTagRemove?: (id: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      status,
      required,
      size = 'md',
      leadingIcon,
      trailingIcon,
      leadingDropdown,
      trailingDropdown,
      leadingAddon,
      trailingAddon,
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
    const inputId = id ?? uid
    const hintId = `${inputId}-hint`
    const isError = Boolean(error)
    // error takes precedence — a field can't be both invalid and "looking good"
    const activeStatus = isError ? undefined : status
    const hasTags = tags !== undefined

    const input = (
      <input
        ref={ref}
        id={inputId}
        className="fc-input-element"
        disabled={disabled}
        aria-describedby={hint || error ? hintId : undefined}
        aria-invalid={isError || undefined}
        aria-required={required || undefined}
        {...props}
      />
    )

    return (
      <div
        className="fc-input-root"
        data-error={isError || undefined}
        data-status={activeStatus}
        data-disabled={disabled || undefined}
      >
        {/* Label row */}
        {label && (
          <div className="fc-input-label-row">
            <label htmlFor={inputId} className="fc-input-label">
              {label}
            </label>
            {required && (
              <span className="fc-input-required" aria-hidden="true">
                *
              </span>
            )}
            {labelIcon && <span className="fc-input-icon">{labelIcon}</span>}
          </div>
        )}

        {/* Bordered field container */}
        <div
          className={cn(
            'fc-input-field',
            size === 'sm' ? 'fc-input-field-sm' : 'fc-input-field-md',
            className
          )}
          data-error={isError || undefined}
          data-status={activeStatus}
          data-disabled={disabled || undefined}
        >
          {leadingAddon && (
            <Slot className="fc-input-addon fc-input-addon-leading" disabled={disabled}>
              {leadingAddon}
            </Slot>
          )}

          {leadingDropdown && !hasTags && (
            <Slot className="fc-input-dropdown fc-input-dropdown-leading" disabled={disabled}>
              {leadingDropdown}
            </Slot>
          )}

          {leadingIcon && !hasTags && (
            <span className="fc-input-icon fc-input-icon-leading" aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          {hasTags ? (
            <div className="fc-input-tags-row">
              {tags!.map((tag) => (
                <InputTagChip
                  key={tag.id}
                  tag={tag}
                  onRemove={disabled ? undefined : onTagRemove}
                />
              ))}
              {input}
            </div>
          ) : (
            input
          )}

          {trailingIcon && (
            <span className="fc-input-icon fc-input-icon-trailing" aria-hidden="true">
              {trailingIcon}
            </span>
          )}

          {trailingDropdown && (
            <Slot className="fc-input-dropdown fc-input-dropdown-trailing" disabled={disabled}>
              {trailingDropdown}
            </Slot>
          )}

          {trailingAddon && (
            <Slot className="fc-input-addon fc-input-addon-trailing" disabled={disabled}>
              {trailingAddon}
            </Slot>
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

Input.displayName = 'Input'
