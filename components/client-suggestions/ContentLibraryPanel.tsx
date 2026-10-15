"use client";

/* ============================================================
   ContentLibraryPanel — LEFT PANEL
   Browse and filter the content library. Click any item to add
   it to the package builder in the center.
   Sourcing: Fincaree Input · Badge · custom
   ============================================================ */

import { Input } from "@/components/fincaree/input";
import { Badge } from "@/components/fincaree/badge";
import { ContentItemCard } from "./ContentItemCard";
import { cn } from "@/lib/utils";
import type { ContentItem, ContentCategory, LearningFormat } from "./data";
import { CONTENT_CATEGORY_LABEL, LEARNING_FORMAT_LABEL } from "./data";
import { Search } from "lucide-react";

export type CategoryFilter = "all" | ContentCategory;
export type FormatFilter = "all" | LearningFormat;

interface ContentLibraryPanelProps {
  items: ContentItem[];
  addedIds: Set<string>;
  onAdd: (item: ContentItem) => void;
  activeCategory: CategoryFilter;
  onCategoryChange: (f: CategoryFilter) => void;
  activeFormat: FormatFilter;
  onFormatChange: (f: FormatFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

const CATEGORY_CHIPS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...(Object.entries(CONTENT_CATEGORY_LABEL) as [ContentCategory, string][]).map(([id, label]) => ({ id, label })),
];

const FORMAT_CHIPS: { id: FormatFilter; label: string }[] = [
  { id: "all", label: "All formats" },
  ...(Object.entries(LEARNING_FORMAT_LABEL) as [LearningFormat, string][]).map(([id, label]) => ({ id, label })),
];

export function ContentLibraryPanel({
  items,
  addedIds,
  onAdd,
  activeCategory,
  onCategoryChange,
  activeFormat,
  onFormatChange,
  searchQuery,
  onSearchChange,
  totalCount,
}: ContentLibraryPanelProps) {
  return (
    <div className="flex flex-col h-full border-r border-[var(--border-tertiary)] bg-[var(--bg-primary)]">
      {/* Panel header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-[var(--border-tertiary)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">My Content</p>
          <Badge size="sm" color="gray">{totalCount}</Badge>
        </div>

        {/* Search */}
        <Input
          size="sm"
          placeholder="Search by title or topic"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search size={14} strokeWidth={1.75} />}
        />

        {/* Category chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORY_CHIPS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                onCategoryChange(f.id);
                if (f.id !== "learning") onFormatChange("all");
              }}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium border whitespace-nowrap",
                "transition-colors duration-100 focus-visible:outline-none",
                activeCategory === f.id
                  ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-primary)] text-[var(--text-brand-primary)]"
                  : "bg-[var(--bg-primary)] border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Format sub-chips — only meaningful once Learning is selected */}
        {activeCategory === "learning" && (
          <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {FORMAT_CHIPS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFormatChange(f.id)}
                className={cn(
                  "shrink-0 px-2 py-0.5 rounded-[var(--radius-full)] text-[11px] font-medium border whitespace-nowrap",
                  "transition-colors duration-100 focus-visible:outline-none",
                  activeFormat === f.id
                    ? "bg-[var(--bg-secondary)] border-[var(--border-secondary)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-primary)] border-[var(--border-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search size={20} strokeWidth={1.5} className="text-[var(--icon-tertiary)] mb-2" />
            <p className="text-xs font-medium text-[var(--text-secondary)]">No content found</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Try a different filter or search term.</p>
          </div>
        ) : (
          items.map((item) => (
            <ContentItemCard key={item.id} item={item} isAdded={addedIds.has(item.id)} onAdd={onAdd} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-2.5 border-t border-[var(--border-tertiary)]">
        <p className="text-[11px] text-[var(--text-tertiary)]">
          {items.length} of {totalCount} items · Click to add to package
        </p>
      </div>
    </div>
  );
}
