'use client'
// Figma: E3iIKwdE2far5TdrPYla2z
// Dropdown: node 9971:33038 | _Dropdown list item: node 9971:32973 | _Dropdown list header: node 9971:33033
// Page: Dropdowns

import * as React from 'react'
import { Menu } from '@base-ui/react/menu'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Root ──────────────────────────────────────────────────────────────────────
// Re-export for controlled open/close usage.
export const DropdownMenu = Menu.Root
export type DropdownMenuProps = React.ComponentProps<typeof Menu.Root>

// ── Trigger ───────────────────────────────────────────────────────────────────

export interface DropdownMenuTriggerProps
  extends React.ComponentProps<typeof Menu.Trigger> {
  /** Optional leading icon node */
  icon?: React.ReactNode
  /** Whether to show the trailing chevron (default: true) */
  showChevron?: boolean
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ icon, showChevron = true, className, children, ...props }, ref) => (
  <Menu.Trigger
    ref={ref}
    className={cn('fc-dropdown-trigger', className)}
    {...props}
  >
    {icon && (
      <span className="fc-dropdown-trigger-icon" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
    {showChevron && (
      <span className="fc-dropdown-trigger-icon" aria-hidden="true">
        <ChevronDown size={16} strokeWidth={1.5} />
      </span>
    )}
  </Menu.Trigger>
))
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

// ── Content (Portal + Positioner + Popup) ─────────────────────────────────────

export interface DropdownMenuContentProps
  extends React.ComponentProps<typeof Menu.Popup> {
  sideOffset?: number
  alignment?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(
  (
    {
      sideOffset = 4,
      alignment = 'start',
      side = 'bottom',
      className,
      children,
      ...props
    },
    ref
  ) => (
    <Menu.Portal>
      {/* Base UI calls this prop `align`; the DS exposes it as `alignment`.
          Passing `alignment` straight through silently did nothing, so every
          menu fell back to the default `start` — including the `end` ones. */}
      <Menu.Positioner sideOffset={sideOffset} align={alignment} side={side}>
        <Menu.Popup
          ref={ref}
          className={cn('fc-dropdown-panel', className)}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

// ── Header (_Dropdown list header) ────────────────────────────────────────────

export interface DropdownMenuHeaderProps {
  /** Avatar image/element rendered in the circular slot */
  avatar?: React.ReactNode
  /** Primary name text */
  name?: string
  /** Secondary email/subtitle text */
  email?: string
  /** Simple text label (used instead of avatar+name) */
  label?: string
  /** Online status indicator dot */
  showStatus?: boolean
  className?: string
}

export function DropdownMenuHeader({
  avatar,
  name,
  email,
  label,
  showStatus,
  className,
}: DropdownMenuHeaderProps) {
  return (
    <div className={cn('fc-dropdown-header', className)}>
      {avatar && (
        <div className="fc-dropdown-header-avatar">
          {avatar}
          {showStatus && <span className="fc-dropdown-header-status" aria-hidden="true" />}
        </div>
      )}
      {(name || email) && (
        <div className="fc-dropdown-header-info">
          {name  && <p className="fc-dropdown-header-name">{name}</p>}
          {email && <p className="fc-dropdown-header-email">{email}</p>}
        </div>
      )}
      {label && <p className="fc-dropdown-header-label">{label}</p>}
    </div>
  )
}

// ── Group ─────────────────────────────────────────────────────────────────────

export const DropdownMenuGroup = Menu.Group

export const DropdownMenuGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Menu.GroupLabel>
>(({ className, ...props }, ref) => (
  <Menu.GroupLabel
    ref={ref}
    className={cn('fc-dropdown-group-label', className)}
    {...props}
  />
))
DropdownMenuGroupLabel.displayName = 'DropdownMenuGroupLabel'

// ── Item (_Dropdown list item) ────────────────────────────────────────────────

export interface DropdownMenuItemProps
  extends React.ComponentProps<typeof Menu.Item> {
  /** Optional leading icon */
  icon?: React.ReactNode
  /** Keyboard shortcut label shown at trailing edge (e.g. "⌘K") */
  shortcut?: string
}

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ icon, shortcut, className, children, ...props }, ref) => (
  <Menu.Item
    ref={ref}
    className={cn('fc-dropdown-item', className)}
    {...props}
  >
    {icon && (
      <span className="fc-dropdown-item-icon" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
    {shortcut && (
      <span className="fc-dropdown-shortcut" aria-hidden="true">
        {shortcut}
      </span>
    )}
  </Menu.Item>
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

// ── CheckboxItem ──────────────────────────────────────────────────────────────

export interface DropdownMenuCheckboxItemProps
  extends React.ComponentProps<typeof Menu.CheckboxItem> {
  icon?: React.ReactNode
  shortcut?: string
}

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(({ icon, shortcut, className, children, ...props }, ref) => (
  <Menu.CheckboxItem
    ref={ref}
    className={cn('fc-dropdown-item', className)}
    {...props}
  >
    <span className="fc-dropdown-checkbox-indicator">
      <Menu.CheckboxItemIndicator>
        <Check size={14} strokeWidth={2} />
      </Menu.CheckboxItemIndicator>
    </span>
    {icon && (
      <span className="fc-dropdown-item-icon" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
    {shortcut && (
      <span className="fc-dropdown-shortcut" aria-hidden="true">
        {shortcut}
      </span>
    )}
  </Menu.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

// ── Separator ─────────────────────────────────────────────────────────────────

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Menu.Separator>
>(({ className, ...props }, ref) => (
  <Menu.Separator
    ref={ref}
    className={cn('fc-dropdown-separator', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'
