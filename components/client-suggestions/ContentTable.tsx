"use client";

/* ============================================================
   ContentTable — the primary surface.

   One column set per status tab, because the advisor is asking
   a different question in each:
     ready        — "can I send this?"     → audience, label, approved
                    until, last sent, send count, [Send]
     needs-check  — "what's holding it?"   → status, open flags, [Review]
     expired      — "what lapsed?"         → expired on, last sent, [Re-review]
     all          — "where is everything?" → status, last edited, last sent

   Type finds the content; status decides whether it can be sent.
   Sourcing: components/ui/table.tsx (shadcn, Fincaree tokens)
   ============================================================ */

import type { ReactNode } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/fincaree/button";
import { Checkbox } from "@/components/fincaree/checkbox";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import type { ContentItem } from "./content-data";
import { TOPIC_LABEL, openIssueCount } from "./content-data";
import {
  CONTENT_INTENT_LABEL,
  audienceOf,
  contentIntent,
  contentStatus,
  isAiLabelled,
  reviewByLabel,
} from "./delivery-data";
import { AiTag, AudienceTag, StatusChip } from "./ContentTags";
import { getTypeVisual, typeLabel, itemMeta } from "./content-visual";

export type LibraryTab = "ready" | "needs-check" | "expired" | "all";

/** States that mean the client has it but hasn't done anything with it. */
const IDLE_STATES = new Set(["Assigned", "Not Started", "Invited", "Opened"]);

export function followUpCount(item: ContentItem): number {
  return item.engagement.clients.filter((c) => IDLE_STATES.has(c.state)).length;
}

interface ContentTableProps {
  items: ContentItem[];
  selectedId: string | null;
  onSelect: (item: ContentItem) => void;
  mode: LibraryTab;
  /** Multi-select — feeds the "N items selected → Add to learning path" bar. */
  checkedIds: Set<string>;
  onToggleChecked: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  /** When each item last went out, from the send log. */
  lastSent: Map<string, string>;
  onSend: (item: ContentItem) => void;
  onReview: (item: ContentItem) => void;
  /** Shown instead of rows when the tab has nothing to list. */
  empty: ReactNode;
}

interface Column {
  key: string;
  head: string;
  /** Responsive visibility — the title and the action always show. */
  hide?: string;
  width?: string;
  cell: (item: ContentItem, lastSent: Map<string, string>) => ReactNode;
}

const muted = (text: string) => <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">{text}</span>;
const plain = (text: string) => <span className="text-xs text-[var(--text-secondary)]">{text}</span>;

const TYPE: Column = { key: "type", head: "Type", hide: "hidden min-[1400px]:table-cell", width: "w-32", cell: (i) => plain(typeLabel(i)) };
const AUDIENCE: Column = { key: "audience", head: "Audience", width: "w-28", cell: (i) => <AudienceTag audience={audienceOf(i)} /> };
const STATUS: Column = { key: "status", head: "Status", width: "w-28", cell: (i) => <StatusChip status={contentStatus(i)} /> };
const LAST_SENT: Column = { key: "last-sent", head: "Last sent", width: "w-28", cell: (i, sent) => muted(sent.get(i.id) ?? "—") };
const LAST_EDITED: Column = { key: "edited", head: "Last edited", width: "w-28", cell: (i) => muted(i.updatedAt) };

const COLUMNS: Record<LibraryTab, Column[]> = {
  ready: [
    TYPE,
    AUDIENCE,
    { key: "goal", head: "Goal", hide: "hidden min-[1240px]:table-cell", width: "w-32", cell: (i) => plain(TOPIC_LABEL[i.topic]) },
    { key: "label", head: "Label", hide: "hidden min-[1240px]:table-cell", width: "w-24", cell: (i) => plain(CONTENT_INTENT_LABEL[contentIntent(i)]) },
    { key: "until", head: "Approved until", width: "w-32", cell: (i) => muted(reviewByLabel(i)) },
    LAST_SENT,
    {
      key: "count",
      head: "Sent",
      hide: "hidden min-[1100px]:table-cell",
      width: "w-16",
      cell: (i) => <span className="text-xs text-[var(--text-secondary)] tabular-nums">{i.engagement.assignedCount}</span>,
    },
  ],
  "needs-check": [
    TYPE,
    AUDIENCE,
    STATUS,
    {
      key: "flags",
      head: "Open flags",
      width: "w-24",
      cell: (i) => {
        const n = openIssueCount(i.compliance);
        return n > 0 ? (
          <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--check-advisory-text)" }}>
            {n}
          </span>
        ) : (
          muted("—")
        );
      },
    },
    LAST_EDITED,
  ],
  expired: [
    TYPE,
    AUDIENCE,
    { key: "expired-on", head: "Expired on", width: "w-32", cell: (i) => <span className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--content-status-expired-text)" }}>{reviewByLabel(i)}</span> },
    LAST_SENT,
  ],
  all: [TYPE, AUDIENCE, STATUS, LAST_EDITED, LAST_SENT],
};

const ACTION_LABEL: Partial<Record<LibraryTab, string>> = { ready: "Send", "needs-check": "Review", expired: "Re-review" };

export function ContentTable({
  items,
  selectedId,
  onSelect,
  mode,
  checkedIds,
  onToggleChecked,
  onToggleAll,
  lastSent,
  onSend,
  onReview,
  empty,
}: ContentTableProps) {
  const columns = COLUMNS[mode];
  const actionLabel = ACTION_LABEL[mode];
  const colCount = 2 + columns.length + (actionLabel ? 1 : 0);
  const visibleIds = items.map((i) => i.id);
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => checkedIds.has(id));
  const someChecked = visibleIds.some((id) => checkedIds.has(id));

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5 pr-0 py-3 w-9">
              <Checkbox
                size="sm"
                checked={allChecked}
                indeterminate={someChecked && !allChecked}
                onChange={() => onToggleAll(visibleIds)}
                aria-label={allChecked ? "Clear selection" : "Select all shown"}
              />
            </TableHead>
            <TableHead className="pl-3 pr-3 py-3 text-xs text-[var(--text-tertiary)] font-medium">Title</TableHead>
            {columns.map((c) => (
              <TableHead key={c.key} className={cn("px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium", c.width, c.hide)}>
                {c.head}
              </TableHead>
            ))}
            {actionLabel && <TableHead className="pl-3 pr-5 py-3 w-28 text-right">
              <span className="sr-only">Action</span>
            </TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="px-5 py-16 text-center">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const cfg = getTypeVisual(item);
              const meta = itemMeta(item);
              const isSelected = selectedId === item.id;
              const isChecked = checkedIds.has(item.id);
              return (
                <TableRow
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isChecked ? "bg-[var(--bg-brand-subtle)]" : isSelected && "bg-[var(--bg-secondary)]"
                  )}
                >
                  <TableCell className="pl-5 pr-0 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox size="sm" checked={isChecked} onChange={() => onToggleChecked(item.id)} aria-label={`Select ${item.title}`} />
                  </TableCell>

                  {/* Title — with the AI label when AI wrote or assisted it */}
                  <TableCell className="pl-3 pr-3 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-9 h-9 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center", cfg.bgColor, cfg.iconColor)}>
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
                          {isAiLabelled(item) && <AiTag />}
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                          {/* The Type column is hidden below 1400px; keep the information. */}
                          <span className="min-[1400px]:hidden">{typeLabel(item)}{meta && " · "}</span>
                          {meta}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn("px-3 py-4", c.hide)}>
                      {c.cell(item, lastSent)}
                    </TableCell>
                  ))}

                  {actionLabel && (
                    <TableCell className="pl-3 pr-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          leadingIcon={mode === "ready" ? <Send size={13} strokeWidth={1.75} /> : undefined}
                          onClick={() => (mode === "ready" ? onSend(item) : onReview(item))}
                        >
                          {actionLabel}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
