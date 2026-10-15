'use client'

/**
 * Fincaree ButtonGroup — maps to Figma "Button group"
 *
 * Figma source: E3iIKwdE2far5TdrPYla2z  node: 9971:2358
 * Page: Button Groups
 *
 * Icon variants (Figma: Icon) : none | leading | dot | only — set per item
 *
 * Supports both controlled (value prop) and uncontrolled (defaultValue prop)
 * selection. Each item maps to a ButtonGroupItem (_Button group base).
 *
 * Usage:
 *   <ButtonGroup
 *     options={[
 *       { value: 'day',   label: 'Day' },
 *       { value: 'week',  label: 'Week' },
 *       { value: 'month', label: 'Month' },
 *     ]}
 *     defaultValue="week"
 *     onChange={(v) => console.log(v)}
 *   />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ButtonGroupItem, type ButtonGroupItemIconType } from './button-group-item'

export interface ButtonGroupOption {
  /** Unique key used for selection state */
  value: string
  /** Label text */
  label?: string
  /** Icon element */
  icon?: React.ReactNode
  /** Maps to Figma Icon property */
  iconType?: ButtonGroupItemIconType
  /** Disable this individual option */
  disabled?: boolean
  /** Accessible label for icon-only items */
  'aria-label'?: string
}

export interface ButtonGroupProps {
  /** The items to render */
  options: ButtonGroupOption[]
  /** Controlled selected value */
  value?: string
  /** Initial selected value for uncontrolled mode */
  defaultValue?: string
  /** Called when the selected item changes */
  onChange?: (value: string) => void
  /** Disables all items in the group */
  disabled?: boolean
  className?: string
  /** Accessible label for the group */
  'aria-label'?: string
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      disabled: groupDisabled = false,
      className,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue ?? ''
    )
    const currentValue = isControlled ? value : internalValue

    function handleSelect(optionValue: string) {
      if (!isControlled) setInternalValue(optionValue)
      onChange?.(optionValue)
    }

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn('fc-btn-group', className)}
      >
        {options.map((option) => (
          <ButtonGroupItem
            key={option.value}
            label={option.label}
            icon={option.icon}
            iconType={option.iconType ?? 'none'}
            isCurrent={currentValue === option.value}
            disabled={groupDisabled || option.disabled}
            aria-label={option['aria-label']}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'
