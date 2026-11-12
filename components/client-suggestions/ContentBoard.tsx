"use client";

/* ============================================================
   ContentBoard — the library as a board of cards

   Four columns, one per question the advisor asks of a piece of content:
     Active          approved, with clients part-way through it right now
     Ready to send   approved, nobody is mid-way — "can I send this?"
     Needs check     draft or needs fixes — "what is holding it?"
     Expired         approval lapsed — "what needs a fresh review?"

   Type is chosen by the tabs above the board, so a column only ever holds
   one kind of content. Each card carries what that column needs: approval
   date and send count when it is ready, open flags when it needs checking,
   the lapse date when expired. Cards can be ticked to build a learning path.

   Cards can be dragged between columns. Moving a card changes its approval,
   so the page decides what is allowed (canMove) and asks before it happens
   (onMove). Dragging is a shortcut: every move also has a button (Send,
   Review, Re-review) and the detail drawer, so nothing needs a pointer.

   Sourcing: Fincaree Button, Checkbox. Board layout: .fc-board-scroller.
   ============================================================ */

import { useState, type ReactNode } from "react";
import { Button } from "@/components/fincaree/button";
import { Checkbox } from "@/components/fincaree/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/fincaree/dropdown-menu";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Check, Send, TrendingUp } from "lucide-react";
import type { ContentItem } from "./content-data";
import { TOPIC_LABEL, openIssueCount } from "./content-data";
import { audienceOf, contentStatus, isAiLabelled, reviewByLabel } from "./delivery-data";
import { AiTag, AudienceTag, StatusChip } from "./ContentTags";
import { getTypeVisual, itemMeta, typeLabel } from "./content-visual";
import { potentialReach } from "./marketing-intelligence";

export type ColumnId = "active" | "ready" | "needs-check" | "expired";

/** Client states that mean someone is part-way through it (started it, or registered for a session). */
const ACTIVE_STATES = new Set(["Started", "Registered"]);
export const activeClientCount = (item: ContentItem) => item.engagement.clients.filter((c) => ACTIVE_STATES.has(c.state)).length;

export const columnOf = (item: ContentItem): ColumnId => {
  const s = contentStatus(item);
  return s === "approved" ? (activeClientCount(item) > 0 ? "active" : "ready") : s === "expired" ? "expired" : "needs-check";
};

/** Whether a card may be dropped on a column; when not, why (shown to the advisor). */
export type MoveCheck = { ok: true } | { ok: false; reason: string };

const COLUMNS: { id: ColumnId; label: string; accent: string; action: string; empty: string }[] = [
  { id: "active", label: "Active", accent: "var(--icon-brand-primary)", action: "Send", empty: "No client is part-way through any of these" },
  { id: "ready", label: "Ready to send", accent: "var(--icon-status-success)", action: "Send", empty: "Nothing approved yet" },
  { id: "needs-check", label: "Needs check", accent: "var(--icon-status-warning)", action: "Review", empty: "Nothing waiting on a check" },
  { id: "expired", label: "Expired", accent: "var(--icon-status-error)", action: "Re-review", empty: "Nothing has lapsed" },
];

interface ContentBoardProps {
  items: ContentItem[];
  selectedId: string | null;
  onSelect: (item: ContentItem) => void;
  checkedIds: Set<string>;
  onToggleChecked: (id: string) => void;
  /** When each item last went out, from the send log. */
  lastSent: Map<string, string>;
  onSend: (item: ContentItem) => void;
  onReview: (item: ContentItem) => void;
  canMove: (item: ContentItem, to: ColumnId) => MoveCheck;
  onMove: (item: ContentItem, to: ColumnId) => void;
  /** Shown instead of the board when a search or filter leaves nothing at all. */
  empty: ReactNode;
}

export function ContentBoard({ items, selectedId, onSelect, checkedIds, onToggleChecked, lastSent, onSend, onReview, canMove, onMove, empty }: ContentBoardProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ColumnId | null>(null);
  /* Active content is ordered by how many clients finished it, so the advisor can see
     what is landing and what is stalling. Content with no completion data goes last. */
  const [activeSort, setActiveSort] = useState<"high" | "low">("high");
  const dragged = dragId ? items.find((i) => i.id === dragId) ?? null : null;
  const endDrag = () => {
    setDragId(null);
    setOverCol(null);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-16 text-center">{empty}</div>
    );
  }

  return (
    <div className="fc-board-scroller">
      {COLUMNS.map((col) => {
        let colItems = items.filter((i) => columnOf(i) === col.id);
        if (col.id === "active") {
          const rate = (i: ContentItem) => i.engagement.completionRate;
          colItems = [...colItems].sort((a, b) => {
            const ra = rate(a), rb = rate(b);
            if (ra == null && rb == null) return 0;
            if (ra == null) return 1;
            if (rb == null) return -1;
            return activeSort === "high" ? rb - ra : ra - rb;
          });
        }
        const isOwn = dragged ? columnOf(dragged) === col.id : false;
        const check: MoveCheck | null = dragged && !isOwn ? canMove(dragged, col.id) : null;
        const hovering = overCol === col.id && dragged !== null && !isOwn;
        return (
          <section
            key={col.id}
            aria-label={col.label}
            onDragOver={(e) => {
              if (!dragged || isOwn) return;
              if (overCol !== col.id) setOverCol(col.id);
              if (check?.ok) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverCol((c) => (c === col.id ? null : c));
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragged && check?.ok) onMove(dragged, col.id);
              endDrag();
            }}
            className={cn(
              "flex-1 min-w-[280px] max-w-[460px] flex flex-col rounded-[var(--radius-xl)] bg-[var(--bg-subtle)] border-2 border-transparent transition-colors",
              check?.ok && "border-dashed border-[var(--border-brand-secondary)]",
              check?.ok && hovering && "bg-[var(--bg-brand-subtle)]",
              check && !check.ok && "opacity-60"
            )}
          >
            <header className="px-3 pt-3 pb-2.5">
              <div className="flex items-center gap-2">
                <span aria-hidden className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.accent }} />
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--text-primary)]">{col.label}</h2>
                <span className="ml-auto flex items-center gap-1.5">
                  {col.id === "active" && colItems.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        showChevron={false}
                        render={
                          <Button
                            variant="tertiary"
                            size="sm"
                            iconOnly
                            aria-label={`Sort active cards: ${activeSort === "high" ? "high" : "low"} engagement first`}
                            leadingIcon={<ArrowUpDown size={14} strokeWidth={1.75} />}
                          />
                        }
                      />
                      <DropdownMenuContent alignment="end">
                        {([
                          { id: "high", label: "High engagement first" },
                          { id: "low", label: "Low engagement first" },
                        ] as const).map((o) => (
                          <DropdownMenuItem
                            key={o.id}
                            onClick={() => setActiveSort(o.id)}
                            icon={activeSort === o.id ? <Check size={14} strokeWidth={2} /> : <span className="inline-block w-3.5" />}
                          >
                            {o.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <span className="text-xs font-semibold tabular-nums text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-full px-2 py-0.5">
                    {colItems.length}
                  </span>
                </span>
              </div>
              <div className="mt-2.5 h-0.5 rounded-full" style={{ backgroundColor: col.accent }} />
            </header>

            <div className="px-3 pb-3 flex flex-col gap-2 flex-1">
              {check && !check.ok && (
                <p role="status" className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                  {check.reason}
                </p>
              )}
              {check?.ok && (
                <p role="status" className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-brand-secondary)] px-3 py-2 text-center text-xs font-medium text-[var(--text-brand-primary)]">
                  Drop to move to {col.label}
                </p>
              )}
              {colItems.length === 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] py-8 text-center text-xs text-[var(--text-tertiary)]">
                  {col.empty}
                </div>
              ) : (
                colItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    column={col.id}
                    actionLabel={col.action}
                    selected={selectedId === item.id}
                    checked={checkedIds.has(item.id)}
                    lastSent={lastSent.get(item.id)}
                    onSelect={onSelect}
                    onToggleChecked={onToggleChecked}
                    dragging={dragId === item.id}
                    onDragStart={() => setDragId(item.id)}
                    onDragEnd={endDrag}
                    onAction={() => (col.id === "ready" || col.id === "active" ? onSend(item) : onReview(item))}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ContentCard({
  item,
  column,
  actionLabel,
  selected,
  checked,
  lastSent,
  onSelect,
  onToggleChecked,
  dragging,
  onDragStart,
  onDragEnd,
  onAction,
}: {
  item: ContentItem;
  column: ColumnId;
  actionLabel: string;
  selected: boolean;
  checked: boolean;
  lastSent?: string;
  onSelect: (item: ContentItem) => void;
  onToggleChecked: (id: string) => void;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onAction: () => void;
}) {
  const cfg = getTypeVisual(item);
  const meta = itemMeta(item);
  const flags = openIssueCount(item.compliance);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.title}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className={cn(
        "flex flex-col gap-3 rounded-[12px] bg-[var(--bg-primary)] border p-3.5 cursor-grab active:cursor-grabbing transition-colors",
        dragging && "opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand-primary)]",
        checked
          ? "border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)]"
          : selected
            ? "border-[var(--border-secondary)]"
            : "border-transparent hover:border-[var(--border-secondary)]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center", cfg.bgColor, cfg.iconColor)}>{cfg.icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">{item.title}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
            {typeLabel(item)}
            {meta && ` · ${meta}`}
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Checkbox size="sm" checked={checked} onChange={() => onToggleChecked(item.id)} aria-label={`Select ${item.title}`} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <AudienceTag audience={audienceOf(item)} />
        <span className="text-xs text-[var(--text-secondary)]">{TOPIC_LABEL[item.topic]}</span>
        {isAiLabelled(item) && <AiTag />}
      </div>

      {/* Track record, up front. Active shows the live picture (who has it, how far they got);
          Ready shows why to send it: what happened the last time it went out. Only the numbers
          we have; nothing is estimated. */}
      {column === "active" && item.engagement.assignedCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] px-3 py-2.5">
          <TrendingUp size={16} strokeWidth={1.75} className="shrink-0 text-[var(--icon-brand-primary)]" aria-hidden="true" />
          <p className="text-xs text-[var(--text-secondary)] leading-snug tabular-nums">
            <span className="text-sm font-bold text-[var(--text-brand-primary)]">{item.engagement.assignedCount}</span> client
            {item.engagement.assignedCount === 1 ? "" : "s"} received this
            {item.engagement.completionRate != null && (
              <>
                {" · "}
                <span className="text-sm font-bold text-[var(--text-brand-primary)]">{item.engagement.completionRate}%</span> completed it
              </>
            )}
          </p>
        </div>
      )}
      {column === "ready" && (() => {
        const reach = potentialReach(item);
        return (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-status-success-subtle)] px-3 py-2.5">
            <Send size={15} strokeWidth={1.75} className="shrink-0 text-[var(--icon-status-success)]" aria-hidden="true" />
            <p className="text-xs text-[var(--text-secondary)] leading-snug tabular-nums">
              Approx. <span className="text-sm font-bold text-[var(--text-status-success)]">{reach.count}</span> {reach.noun} can benefit from this
            </p>
          </div>
        );
      })()}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-tertiary)] pt-3">
        <div className="min-w-0 text-xs text-[var(--text-tertiary)] space-y-0.5">
          {column === "active" && (
            <>
              <p className="font-medium text-[var(--text-secondary)] tabular-nums">
                {activeClientCount(item)} client{activeClientCount(item) === 1 ? "" : "s"} active now
              </p>
              <p>Approved until {reviewByLabel(item)}</p>
            </>
          )}
          {column === "ready" && (
            <>
              <p>Approved until {reviewByLabel(item)}</p>
              {lastSent && <p>Last sent {lastSent}</p>}
            </>
          )}
          {column === "needs-check" && (
            <>
              <StatusChip status={contentStatus(item)} />
              <p className="tabular-nums">
                {flags > 0 ? `${flags} open flag${flags === 1 ? "" : "s"}` : "No open flags"} · edited {item.updatedAt}
              </p>
            </>
          )}
          {column === "expired" && (
            <>
              <p className="font-medium" style={{ color: "var(--content-status-expired-text)" }}>
                Expired {reviewByLabel(item)}
              </p>
              <p>{lastSent ? `Last sent ${lastSent}` : "Never sent"}</p>
            </>
          )}
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={column === "ready" || column === "active" ? <Send size={13} strokeWidth={1.75} /> : undefined}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
