"use client";

/* ============================================================
   ContentItemCard
   Individual content item in the library panel list.
   Click adds it to the builder.
   Sourcing: Fincaree Badge · custom (Fincaree tokens only)
   ============================================================ */

import { Badge } from "@/components/fincaree/badge";
import { ComplianceBadge } from "./ComplianceBadge";
import { getTypeVisual, getModeVisual } from "./type-visual";
import { cn } from "@/lib/utils";
import type { ContentItem } from "./data";
import { Plus, Check } from "lucide-react";

interface ContentItemCardProps {
  item: ContentItem;
  isAdded: boolean;
  onAdd: (item: ContentItem) => void;
}

function metaLine(item: ContentItem): string | undefined {
  if (item.category === "learning") {
    if (item.format === "video" && item.duration) return item.duration;
    if (item.format === "course-series" && item.moduleCount) return `${item.moduleCount} modules`;
    if (item.format === "pdf" && item.pageCount) return `${item.pageCount} pages`;
    return undefined;
  }
  if (item.category === "simulation") return item.estimatedTime;
  return item.date ?? item.duration; // meeting / workshop
}

export function ContentItemCard({ item, isAdded, onAdd }: ContentItemCardProps) {
  const cfg = getTypeVisual(item);
  const canAdd = item.compliance.status !== "flagged";
  const meta = metaLine(item);
  const isSession = item.category === "meeting" || item.category === "workshop";

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-3 py-2.5 rounded-[var(--radius-lg)]",
        "border transition-all duration-150 cursor-pointer",
        isAdded
          ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
          : canAdd
          ? "border-[var(--border-tertiary)] bg-[var(--bg-primary)] hover:border-[var(--border-secondary)] hover:shadow-[var(--shadow-xs)]"
          : "border-[var(--border-status-error-subtle)] bg-[var(--bg-status-error-subtle)] opacity-70 cursor-not-allowed"
      )}
      onClick={() => canAdd && !isAdded && onAdd(item)}
      role="button"
      aria-pressed={isAdded}
      aria-label={`${isAdded ? "Added" : "Add"} ${item.title}`}
    >
      {/* Thumbnail */}
      <div className={cn("w-14 h-10 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center relative", cfg.bgColor, cfg.iconColor)}>
        {cfg.icon}
        {meta && (
          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-current leading-none">{item.category === "learning" && item.format === "video" ? meta : ""}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-medium leading-snug truncate", isAdded ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>
          {item.title}
        </p>

        {/* Type badge + mode + meta */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Badge size="sm" color={isAdded ? "brand" : "gray"}>{cfg.label}</Badge>
          {isSession && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
              {getModeVisual(item.mode).icon}
              {getModeVisual(item.mode).label}
            </span>
          )}
          {item.tags.slice(0, 1).map((tag) => (
            <Badge key={tag} size="sm" color="gray">{tag}</Badge>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
          {meta && item.category !== "learning" ? `${meta} · ` : ""}
          {item.updatedAt}
        </p>
      </div>

      {/* Compliance + add indicator */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <ComplianceBadge status={item.compliance.status} size="sm" />
        <div className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
          isAdded
            ? "bg-[var(--bg-brand-primary)] border-[var(--border-brand-primary)] text-white"
            : canAdd
            ? "border-[var(--border-secondary)] text-[var(--icon-tertiary)] group-hover:border-[var(--border-brand-primary)] group-hover:text-[var(--icon-brand-primary)]"
            : "border-[var(--border-status-error-subtle)] text-[var(--icon-status-error)]"
        )}>
          {isAdded ? <Check size={11} strokeWidth={2.5} /> : <Plus size={11} strokeWidth={2.5} />}
        </div>
      </div>
    </div>
  );
}
