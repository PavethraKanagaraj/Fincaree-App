'use client'
// Figma: E3iIKwdE2far5TdrPYla2z
// Select: node 9971:33409 | _Select menu item: node 9971:33106
// Page: Dropdowns

import * as React from 'react'
import { Select } from '@base-ui/react/select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SelectSize = 'sm' | 'md'

// ── SelectField ───────────────────────────────────────────────────────────────
// Complete field: label + trigger + optional hint/error message.
// Children should be SelectItem / SelectSeparator / SelectGroup elements.

export interface SelectFieldProps
  extends Omit<React.ComponentProps<typeof Select.Root>, 'children'> {
  size?: SelectSize
  /** Visible field label */
  label?: string
  /** Shows a red asterisk next to the label */
  required?: boolean
  /** Helper text shown below the field */
  hint?: string
  /** Error message — activates destructive/error state */
  error?: string
  /** Placeholder shown when no value is selected */
  placeholder?: string
  /** Leading slot type — 'dot' | 'icon' | 'avatar' */
  leadingType?: 'dot' | 'icon' | 'avatar'
  /** Content for the leading slot (ReactNode for icon/avatar; omit for dot) */
  leadingContent?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function SelectField({
  size = 'sm',
  label,
  required,
  hint,
  error,
  placeholder,
  leadingType,
  leadingContent,
  disabled,
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: SelectFieldProps & { 'aria-label'?: string; 'aria-labelledby'?: string }) {
  const uid = React.useId()
  const hintId = `${uid}-hint`
  const isError = Boolean(error)

  return (
    <Select.Root disabled={disabled} {...props}>
      <div
        className={cn('fc-select-root', className)}
        data-error={isError || undefined}
        data-disabled={disabled || undefined}
      >
        {/* Label row */}
        {label && (
          <div className="fc-input-label-row">
            <Select.Label className="fc-input-label">{label}</Select.Label>
            {required && (
              <span className="fc-input-required" aria-hidden="true">*</span>
            )}
          </div>
        )}

        {/* Trigger */}
        <Select.Trigger
          className={cn(
            'fc-select-trigger',
            size === 'sm' ? 'fc-select-sm' : 'fc-select-md'
          )}
          aria-describedby={hint || error ? hintId : undefined}
          aria-invalid={isError || undefined}
          // Root doesn't forward ARIA props to the button, so a label-less
          // select (the app's filters) reached screen readers unnamed. Spread
          // only when set: an explicit undefined would override the
          // aria-labelledby Base UI wires to the visible <Select.Label>.
          {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
          {...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {})}
        >
          {/* Leading slot */}
          {leadingType === 'dot' && (
            <span className="fc-select-dot" aria-hidden="true" />
          )}
          {leadingType === 'icon' && leadingContent && (
            <span className="fc-select-leading" aria-hidden="true">
              {leadingContent}
            </span>
          )}
          {leadingType === 'avatar' && leadingContent && (
            <span className="fc-select-leading-avatar" aria-hidden="true">
              {leadingContent}
            </span>
          )}

          <Select.Value className="fc-select-value" placeholder={placeholder} />

          <span className="fc-select-chevron" aria-hidden="true">
            <ChevronDown strokeWidth={1.5} />
          </span>
        </Select.Trigger>

        {/* Hint / error */}
        {(hint || error) && (
          <p id={hintId} className="fc-input-hint" data-error={isError || undefined}>
            {error ?? hint}
          </p>
        )}
      </div>

      {/* Popup */}
      <Select.Portal>
        <Select.Positioner sideOffset={4} align="start" alignItemWithTrigger={false}>
          <Select.Popup className="fc-select-popup" data-size={size}>
            <Select.List>{children}</Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}

// ── SelectItem (_Select menu item) ────────────────────────────────────────────

export interface SelectItemProps
  extends Omit<React.ComponentProps<typeof Select.Item>, 'value'> {
  /** The value this item represents */
  value: string
  size?: SelectSize
  /** Secondary/supporting text shown below the primary label */
  secondaryText?: string
  /** Leading slot type — 'dot' | 'icon' | 'avatar' */
  leadingType?: 'dot' | 'icon' | 'avatar'
  /** Content for the leading slot */
  leadingContent?: React.ReactNode
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  (
    {
      value,
      size = 'sm',
      secondaryText,
      leadingType,
      leadingContent,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <Select.Item
      ref={ref}
      value={value}
      className={cn(
        'fc-select-item',
        size === 'md' && 'fc-select-item-md',
        className
      )}
      {...props}
    >
      {/* Leading */}
      {leadingType === 'dot' && (
        <span className="fc-select-item-dot" aria-hidden="true" />
      )}
      {leadingType === 'icon' && leadingContent && (
        <span className="fc-select-item-leading" aria-hidden="true">
          {leadingContent}
        </span>
      )}
      {leadingType === 'avatar' && leadingContent && (
        <span className="fc-select-item-avatar" aria-hidden="true">
          {leadingContent}
        </span>
      )}

      {/* Text — primary + supporting text sit inline (Figma). The closed field
          shows the label from SelectField's `items` map (or the raw value), so
          pass `items` whenever values differ from their labels. */}
      <Select.ItemText className="fc-select-item-texts">
        <span className="fc-select-item-primary">{children}</span>
        {secondaryText && <span className="fc-select-item-secondary">{secondaryText}</span>}
      </Select.ItemText>

      {/* Selected check */}
      <Select.ItemIndicator className="fc-select-item-indicator">
        <Check strokeWidth={2} />
      </Select.ItemIndicator>
    </Select.Item>
  )
)
SelectItem.displayName = 'SelectItem'

// ── SelectSeparator ───────────────────────────────────────────────────────────

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Select.Separator>
>(({ className, ...props }, ref) => (
  <Select.Separator
    ref={ref}
    className={cn('fc-select-separator', className)}
    {...props}
  />
))
SelectSeparator.displayName = 'SelectSeparator'

// ── SelectGroup + SelectGroupLabel ────────────────────────────────────────────

export const SelectGroup = Select.Group

export const SelectGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Select.GroupLabel>
>(({ className, ...props }, ref) => (
  <Select.GroupLabel
    ref={ref}
    className={cn('fc-select-group-label', className)}
    {...props}
  />
))
SelectGroupLabel.displayName = 'SelectGroupLabel'
