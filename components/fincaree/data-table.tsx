'use client'

/**
 * Fincaree Data Table — a table that stays usable at any size.
 *
 * Search box + filters on top, the rows in the middle, and a
 * "Showing 9–14 of 14" footer with Previous / Next below. Search, filters and
 * paging all happen here, so a page only describes its columns and filters.
 *
 * Sourcing: shadcn Table (components/ui/table) for the markup, with Fincaree
 * Input, Select, Tabs and Button on top. No new visual language.
 *
 * Filters come in two kinds: `tabs` for a few short options (All / In
 * progress / Finished) and `select` for longer lists (every action type).
 * Every filter starts at "all"; each option decides which rows it keeps.
 */

import * as React from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { Button } from '@/components/fincaree/button'
import { Input } from '@/components/fincaree/input'
import { SelectField, SelectItem } from '@/components/fincaree/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/fincaree/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export const ALL = 'all'

export interface DataTableColumn<T> {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Width class for the column, e.g. "w-28". Leave out to let it take the rest. */
  width?: string
  /** Extra classes for the body cells, e.g. "whitespace-nowrap". */
  className?: string
}

export interface DataTableFilter<T> {
  id: string
  kind: 'tabs' | 'select'
  /** Visible label (select) and accessible name (both). */
  label: string
  /** Options other than "all". */
  options: { value: string; label: string }[]
  /** Label of the "all" option, e.g. "All actions". */
  allLabel?: string
  /** Width class for a select, e.g. "w-[220px]". */
  width?: string
  /** True when `row` belongs under the chosen option. */
  match: (row: T, value: string) => boolean
}

export interface DataTableSearch<T> {
  label?: string
  placeholder: string
  /** Every piece of text on a row that the search should look in. */
  getText: (row: T) => string[]
  /** Width class, e.g. "w-[280px]". */
  width?: string
}

export interface DataTableProps<T> {
  rows: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  search?: DataTableSearch<T>
  filters?: DataTableFilter<T>[]
  pageSize?: number
  /** What the rows are, plural, for the footer and empty state: "leads", "entries". */
  noun?: string
  emptyMessage?: string
  /** Aligned to the right of the toolbar. Gets the filtered rows, for things like export. */
  toolbarEnd?: (state: { filtered: T[]; isFiltered: boolean }) => React.ReactNode
  /** Drop the outer border and radius, for use inside a panel that already has them. */
  bare?: boolean
  /** Accessible name for the table. */
  'aria-label'?: string
  className?: string
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  search,
  filters = [],
  pageSize = 15,
  noun = 'rows',
  emptyMessage,
  toolbarEnd,
  bare = false,
  className,
  ...rest
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState('')
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [page, setPage] = React.useState(0)

  const valueOf = (id: string) => values[id] ?? ALL
  const q = query.trim().toLowerCase()

  const filtered = rows.filter(
    (row) =>
      (!q || !search || search.getText(row).some((t) => t.toLowerCase().includes(q))) &&
      filters.every((f) => valueOf(f.id) === ALL || f.match(row, valueOf(f.id)))
  )
  const isFiltered = Boolean(q) || filters.some((f) => valueOf(f.id) !== ALL)

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const from = safePage * pageSize
  const pageRows = filtered.slice(from, from + pageSize)

  const setFilter = (id: string, value: string) => {
    setValues((v) => ({ ...v, [id]: value }))
    setPage(0)
  }
  const clear = () => {
    setQuery('')
    setValues({})
    setPage(0)
  }

  const hasToolbar = Boolean(search) || filters.length > 0 || Boolean(toolbarEnd)
  const edge = (i: number) =>
    cn('px-3 py-3', i === 0 && 'px-5', i === columns.length - 1 && 'pr-5')

  return (
    <div className={cn(!bare && 'space-y-4', className)}>
      {hasToolbar && (
        <div className={cn('flex flex-wrap items-end gap-3', bare && 'px-5 pb-3')}>
          {search && (
            <div className={search.width ?? 'w-[240px]'}>
              <Input
                size="sm"
                label={search.label}
                aria-label={search.label ?? search.placeholder}
                placeholder={search.placeholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                leadingIcon={<Search size={14} strokeWidth={1.75} />}
              />
            </div>
          )}

          {filters.map((f) =>
            f.kind === 'tabs' ? (
              <Tabs key={f.id} value={valueOf(f.id)} onValueChange={(v) => setFilter(f.id, v as string)} variant="pill">
                <TabsList aria-label={f.label}>
                  <TabsTrigger value={ALL}>{f.allLabel ?? 'All'}</TabsTrigger>
                  {f.options.map((o) => (
                    <TabsTrigger key={o.value} value={o.value}>
                      {o.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : (
              <div key={f.id} className={f.width ?? 'w-[180px]'}>
                <SelectField
                  size="sm"
                  label={f.label}
                  value={valueOf(f.id)}
                  items={Object.fromEntries([[ALL, f.allLabel ?? 'All'], ...f.options.map((o) => [o.value, o.label])])}
                  onValueChange={(v: unknown) => setFilter(f.id, v as string)}
                >
                  <SelectItem value={ALL}>{f.allLabel ?? 'All'}</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>
            )
          )}

          {isFiltered && (
            <Button variant="tertiary" size="sm" leadingIcon={<X size={14} strokeWidth={1.75} />} onClick={clear}>
              Clear filters
            </Button>
          )}

          {toolbarEnd && <div className="ml-auto">{toolbarEnd({ filtered, isFiltered })}</div>}
        </div>
      )}

      <div
        className={cn(
          'overflow-hidden bg-[var(--bg-primary)]',
          bare ? 'border-t border-[var(--border-tertiary)]' : 'rounded-[var(--radius-xl)] border border-[var(--border-tertiary)]'
        )}
      >
        <Table aria-label={rest['aria-label']}>
          <TableHeader>
            <TableRow>
              {columns.map((c, i) => (
                <TableHead key={c.id} className={cn(edge(i), 'text-xs font-medium text-[var(--text-tertiary)]', c.width)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((c, i) => (
                  <TableCell key={c.id} className={cn(edge(i), c.className)}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-5 py-10 text-center text-sm text-[var(--text-tertiary)]">
                  {emptyMessage ?? `No ${noun} match.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border-tertiary)] px-5 py-3">
          <p aria-live="polite" className="text-xs tabular-nums text-[var(--text-secondary)]">
            {filtered.length === 0
              ? `0 ${noun}`
              : `Showing ${from + 1}–${from + pageRows.length} of ${filtered.length}${isFiltered ? ` (filtered from ${rows.length})` : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              aria-label="Previous page"
              leadingIcon={<ChevronLeft size={14} strokeWidth={2} />}
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            />
            <span className="text-xs tabular-nums text-[var(--text-secondary)]">
              Page {safePage + 1} of {pageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              aria-label="Next page"
              leadingIcon={<ChevronRight size={14} strokeWidth={2} />}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
