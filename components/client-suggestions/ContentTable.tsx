"use client";

/* ============================================================
   ContentTable — the primary surface.

   Two column sets, because the advisor is asking a different
   question in each case:
     default   — "can I share this?"  → Review + Status
     assigned  — "is it working?"     → Clients + Engagement + Follow-up

   Follow-up counts assigned clients who haven't engaged yet;
   that's the number the advisor can actually act on.
   Sourcing: components/ui/table.tsx (shadcn, Fincaree tokens)
   ============================================================ */

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Checkbox } from "@/components/fincaree/checkbox";
import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Send } from "lucide-react";
import type { ContentItem } from "./content-data";
import { COMPLIANCE_STATUS_LABEL, PUBLICATION_STATUS_LABEL, TOPIC_LABEL, openIssueCount } from "./content-data";
import { COMPLIANCE_BADGE_COLOR, PUBLICATION_BADGE_COLOR, getTypeVisual, typeLabel, itemMeta } from "./content-visual";

/** States that mean the client has it but hasn't done anything with it. */
const IDLE_STATES = new Set(["Assigned", "Not Started", "Invited", "Opened"]);

export function followUpCount(item: ContentItem): number {
  return item.engagement.clients.filter((c) => IDLE_STATES.has(c.state)).length;
}

interface ContentTableProps {
  items: ContentItem[];
  selectedId: string | null;
  onSelect: (item: ContentItem) => void;
  /** Swaps the trailing columns to engagement-oriented ones. */
  variant?: "default" | "assigned";
  /** Multi-select — feeds the "N items selected → Create Learning Path" bar. */
  checkedIds: Set<string>;
  onToggleChecked: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  /** Row actions. Assign is the primary one: most sharing is a single item. */
  onAssign: (item: ContentItem) => void;
  onPreview: (item: ContentItem) => void;
}

function EngagementBar({ item }: { item: ContentItem }) {
  const rate = item.engagement.completionRate;
  if (rate === null) return <span className="text-xs text-[var(--text-tertiary)]">—</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-[var(--bg-secondary)] overflow-hidden shrink-0">
        <div
          className={cn("h-full rounded-full", rate >= 70 ? "bg-[var(--color-success-500)]" : rate >= 45 ? "bg-[var(--color-warning-500)]" : "bg-[var(--icon-quaternary)]")}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{rate}%</span>
    </div>
  );
}

export function ContentTable({
  items,
  selectedId,
  onSelect,
  variant = "default",
  checkedIds,
  onToggleChecked,
  onToggleAll,
  onAssign,
  onPreview,
}: ContentTableProps) {
  const isAssignedView = variant === "assigned";
  const colCount = isAssignedView ? 7 : 8;
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
            <TableHead className="pl-3 pr-3 py-3 text-xs text-[var(--text-tertiary)] font-medium">Content</TableHead>
            <TableHead className="hidden min-[1400px]:table-cell px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-32">Type</TableHead>
            {isAssignedView ? (
              <>
                <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-28">Clients</TableHead>
                <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-36">Engagement</TableHead>
                <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-32">Follow-up</TableHead>
              </>
            ) : (
              <>
                <TableHead className="hidden min-[1240px]:table-cell px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-32">Topic</TableHead>
                <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-60">Review</TableHead>
                <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-24">Status</TableHead>
                <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-24">Updated</TableHead>
              </>
            )}
            <TableHead className="pl-3 pr-5 py-3 text-xs text-[var(--text-tertiary)] font-medium w-[176px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="px-5 py-16 text-center">
                <p className="text-sm font-medium text-[var(--text-secondary)]">No content matches these filters</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Try a different type, topic or search term.</p>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const cfg = getTypeVisual(item);
              const meta = itemMeta(item);
              const openIssues = openIssueCount(item.compliance);
              const followUps = followUpCount(item);
              const isSelected = selectedId === item.id;
              const isChecked = checkedIds.has(item.id);
              /* Only approved content can be sent — the gate lives on the
                 action itself, not in a warning after the fact. */
              const canAssign = item.compliance.status === "approved-for-use";
              return (
                <TableRow
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isChecked ? "bg-[var(--bg-brand-subtle)]" : isSelected && "bg-[var(--bg-secondary)]"
                  )}
                >
                  {/* Selection */}
                  <TableCell className="pl-5 pr-0 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      size="sm"
                      checked={isChecked}
                      onChange={() => onToggleChecked(item.id)}
                      aria-label={`Select ${item.title}`}
                    />
                  </TableCell>

                  {/* Content */}
                  <TableCell className="pl-3 pr-3 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-9 h-9 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center", cfg.bgColor, cfg.iconColor)}>
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                          {/* Type column is hidden below 1400px; keep the information. */}
                          <span className="min-[1400px]:hidden">{typeLabel(item)}{meta && " · "}</span>
                          {meta}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="hidden min-[1400px]:table-cell px-3 py-4">
                    <span className="text-xs text-[var(--text-secondary)]">{typeLabel(item)}</span>
                  </TableCell>

                  {isAssignedView ? (
                    <>
                      {/* Clients */}
                      <TableCell className="px-3 py-4">
                        <span className="text-xs text-[var(--text-secondary)] tabular-nums">{item.engagement.assignedCount}</span>
                      </TableCell>

                      {/* Engagement */}
                      <TableCell className="px-3 py-4">
                        <EngagementBar item={item} />
                      </TableCell>

                      {/* Follow-up — the actionable number */}
                      <TableCell className="px-3 py-4">
                        {followUps > 0 ? (
                          <span className="text-xs font-medium text-[var(--text-status-warning)]">
                            {followUps} client{followUps > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-tertiary)]">—</span>
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      {/* Topic */}
                      <TableCell className="hidden min-[1240px]:table-cell px-3 py-4">
                        <span className="text-xs text-[var(--text-secondary)]">{TOPIC_LABEL[item.topic]}</span>
                      </TableCell>

                      {/* Review (compliance) */}
                      <TableCell className="px-3 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge size="sm" color={COMPLIANCE_BADGE_COLOR[item.compliance.status]}>
                            {COMPLIANCE_STATUS_LABEL[item.compliance.status]}
                          </Badge>
                          {openIssues > 0 && (
                            <span className="text-xs font-medium text-[var(--text-tertiary)]">
                              {openIssues} issue{openIssues > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status (publication) */}
                      <TableCell className="px-3 py-4">
                        <Badge size="sm" color={PUBLICATION_BADGE_COLOR[item.publication]}>
                          {PUBLICATION_STATUS_LABEL[item.publication]}
                        </Badge>
                      </TableCell>

                      {/* Updated */}
                      <TableCell className="px-3 py-4">
                        <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">{item.updatedAt}</span>
                      </TableCell>
                    </>
                  )}

                  {/* Actions — Assign is primary; most sharing is one item to one client */}
                  <TableCell className="pl-3 pr-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="tertiary"
                        size="sm"
                        iconOnly
                        leadingIcon={<Eye size={14} strokeWidth={1.75} />}
                        aria-label={`Preview ${item.title}`}
                        onClick={() => onPreview(item)}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        leadingIcon={<Send size={13} strokeWidth={1.75} />}
                        disabled={!canAssign}
                        title={canAssign ? undefined : "Approve for use before assigning"}
                        onClick={() => onAssign(item)}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="tertiary"
                        size="sm"
                        iconOnly
                        leadingIcon={<MoreHorizontal size={15} strokeWidth={2} />}
                        aria-label={`More actions for ${item.title}`}
                        onClick={() => onSelect(item)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
