'use client'
// Figma: E3iIKwdE2far5TdrPYla2z  node: 10390:14617
// Page: Tabs
// Style (prop `variant`): Pill | Line   ×   Orientation: Horizontal | Vertical
// `variant`, not `style`: `style` stays React's inline-style prop (a custom
// `style` shadowed it, which also broke the prop types).
//
// Components: TabsTrigger, TabsList, Tabs (composite)
// Built on @base-ui/react/tabs

import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'

// ── Style context ─────────────────────────────────────────────────────────────
// Passed from Tabs → TabsList → TabsTrigger so consumers don't repeat it.

export type TabsVariant = 'pill' | 'line'

const TabsVariantContext = React.createContext<TabsVariant>('pill')

// ── Tabs (Root) ───────────────────────────────────────────────────────────────

export interface TabsProps extends React.ComponentProps<typeof BaseTabs.Root> {
  /** Figma: Style — 'pill' (segmented) or 'line' (underline indicator) */
  variant?: TabsVariant
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ variant = 'pill', className, children, ...props }, ref) => (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.Root ref={ref} className={cn('fc-tabs-root', className)} {...props}>
        {children}
      </BaseTabs.Root>
    </TabsVariantContext.Provider>
  )
)
Tabs.displayName = 'Tabs'

// ── TabsList ──────────────────────────────────────────────────────────────────

export interface TabsListProps extends React.ComponentProps<typeof BaseTabs.List> {
  /** Overrides the variant from the parent <Tabs> if needed */
  variant?: TabsVariant
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ variant: variantProp, className, children, ...props }, ref) => {
    const ctxVariant = React.useContext(TabsVariantContext)
    const variant = variantProp ?? ctxVariant

    return (
      <TabsVariantContext.Provider value={variant}>
        <BaseTabs.List
          ref={ref}
          className={cn(
            'fc-tabs-list',
            variant === 'pill' ? 'fc-tabs-list-pill' : 'fc-tabs-list-line',
            className
          )}
          {...props}
        >
          {children}
        </BaseTabs.List>
      </TabsVariantContext.Provider>
    )
  }
)
TabsList.displayName = 'TabsList'

// ── TabsTrigger ───────────────────────────────────────────────────────────────

export interface TabsTriggerProps extends React.ComponentProps<typeof BaseTabs.Tab> {
  /** Leading icon node */
  icon?: React.ReactNode
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ icon, className, children, ...props }, ref) => {
    const variant = React.useContext(TabsVariantContext)

    return (
      <BaseTabs.Tab
        ref={ref}
        className={cn(
          'fc-tabs-trigger',
          variant === 'pill' ? 'fc-tabs-trigger-pill' : 'fc-tabs-trigger-line',
          className
        )}
        {...props}
      >
        {icon && (
          <span className="fc-tabs-trigger-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </BaseTabs.Tab>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

// ── TabsIndicator ─────────────────────────────────────────────────────────────
// Used with Line style only. Place as the last child of <TabsList>.
// @base-ui/react sets --active-tab-left + --active-tab-width (horizontal) or
// --active-tab-top + --active-tab-height (vertical) as inline CSS vars.

export const TabsIndicator = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof BaseTabs.Indicator>
>(({ className, ...props }, ref) => (
  <BaseTabs.Indicator ref={ref} className={cn('fc-tabs-indicator', className)} {...props} />
))
TabsIndicator.displayName = 'TabsIndicator'

// ── TabsPanel ─────────────────────────────────────────────────────────────────

export const TabsPanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseTabs.Panel>
>(({ className, ...props }, ref) => (
  <BaseTabs.Panel ref={ref} className={cn('fc-tabs-panel', className)} {...props} />
))
TabsPanel.displayName = 'TabsPanel'
