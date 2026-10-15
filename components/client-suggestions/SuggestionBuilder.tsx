"use client";

/* ============================================================
   SuggestionBuilder — CENTER PANEL
   Build a suggestion package by ordering content items.
   Sequence shown visually with up/down reorder + remove.
   Sourcing: Fincaree Input · Button · Badge · custom
   ============================================================ */

import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { Input } from "@/components/fincaree/input";
import { ComplianceBadge } from "./ComplianceBadge";
import { getTypeVisual } from "./type-visual";
import { cn } from "@/lib/utils";
import type { ContentItem, PackageItem, MeetingStage } from "./data";
import { MEETING_STAGE_LABELS } from "./data";
import {
  ChevronUp,
  ChevronDown,
  X,
  GripVertical,
  Plus,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface SuggestionBuilderProps {
  packageItems: PackageItem[];
  allContent: ContentItem[];
  packageName: string;
  packageDescription: string;
  stage: MeetingStage;
  onPackageNameChange: (v: string) => void;
  onPackageDescChange: (v: string) => void;
  onStageChange: (s: MeetingStage) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string, direction: "up" | "down") => void;
  onOpenLibrary?: () => void;
}

const STAGES = Object.entries(MEETING_STAGE_LABELS) as [MeetingStage, string][];

export function SuggestionBuilder({
  packageItems,
  allContent,
  packageName,
  packageDescription,
  stage,
  onPackageNameChange,
  onPackageDescChange,
  onStageChange,
  onRemoveItem,
  onMoveItem,
}: SuggestionBuilderProps) {

  function getContent(contentId: string): ContentItem | undefined {
    return allContent.find((c) => c.id === contentId);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="shrink-0 px-5 pt-4 pb-3 border-b border-[var(--border-tertiary)] bg-[var(--bg-primary)]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">Build Suggestion Package</p>
          <Badge size="sm" color="brand">New Package</Badge>
        </div>

        {/* Name + description fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            size="sm"
            label="Package Name"
            placeholder="e.g. Retirement Readiness for Working Professionals"
            value={packageName}
            onChange={(e) => onPackageNameChange(e.target.value)}
          />
          <Input
            size="sm"
            label="Description"
            placeholder="A short description for this suggestion package"
            value={packageDescription}
            onChange={(e) => onPackageDescChange(e.target.value)}
          />
        </div>

        {/* Stage selector */}
        <div className="mt-3">
          <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Advisory Stage</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STAGES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onStageChange(id)}
                className={cn(
                  "px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium border transition-colors duration-100",
                  stage === id
                    ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-primary)] text-[var(--text-brand-primary)]"
                    : "bg-[var(--bg-primary)] border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Builder sequence */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-[var(--bg-canvas)]">
        {packageItems.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center">
            <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--bg-primary)] border border-[var(--border-tertiary)] flex items-center justify-center mb-3">
              <BookOpen size={20} strokeWidth={1.5} className="text-[var(--icon-tertiary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">No content added yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-[240px] leading-relaxed">
              Click items in the library panel on the left to add them to this package.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0">

            {/* Start node */}
            <div className="w-24 h-7 rounded-[var(--radius-full)] bg-[var(--bg-brand-primary)] flex items-center justify-center mb-1">
              <span className="text-xs font-semibold text-white">Start</span>
            </div>

            {packageItems.map((pi, index) => {
              const item = getContent(pi.contentId);
              if (!item) return null;
              const cfg   = getTypeVisual(item);
              const isFirst = index === 0;
              const isLast  = index === packageItems.length - 1;

              return (
                <div key={pi.id} className="flex flex-col items-center w-full max-w-[520px]">
                  {/* Connector line */}
                  <div className="w-px h-4 bg-[var(--border-secondary)]" />

                  {/* Step node */}
                  <div className={cn(
                    "w-full rounded-[var(--radius-xl)] border bg-[var(--bg-primary)] px-3 py-2.5",
                    "shadow-[var(--shadow-xs)] flex items-center gap-3"
                  )}>
                    {/* Sequence number */}
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                      {index + 1}
                    </span>

                    {/* Drag handle (visual only) */}
                    <GripVertical size={14} strokeWidth={1.75} className="shrink-0 text-[var(--icon-quaternary)] cursor-grab" />

                    {/* Type icon */}
                    <div className={cn("w-8 h-8 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center", cfg.bgColor, cfg.iconColor)}>
                      {cfg.icon}
                    </div>

                    {/* Content info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge size="sm" color="gray">{cfg.label}</Badge>
                        <ComplianceBadge status={item.compliance.status} />
                      </div>
                    </div>

                    {/* Reorder + remove */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="tertiary" size="sm" iconOnly
                        leadingIcon={<ChevronUp size={13} strokeWidth={2} />}
                        disabled={isFirst}
                        onClick={() => onMoveItem(pi.id, "up")}
                        aria-label="Move up"
                      />
                      <Button
                        variant="tertiary" size="sm" iconOnly
                        leadingIcon={<ChevronDown size={13} strokeWidth={2} />}
                        disabled={isLast}
                        onClick={() => onMoveItem(pi.id, "down")}
                        aria-label="Move down"
                      />
                      <Button
                        variant="tertiary" size="sm" iconOnly
                        leadingIcon={<X size={13} strokeWidth={2} className="text-[var(--icon-tertiary)]" />}
                        onClick={() => onRemoveItem(pi.id)}
                        aria-label="Remove"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End connector + node */}
            <div className="w-px h-4 bg-[var(--border-secondary)]" />
            <div className="w-24 h-7 rounded-[var(--radius-full)] border-2 border-[var(--border-brand-primary)] flex items-center justify-center">
              <span className="text-xs font-semibold text-[var(--text-brand-primary)]">End</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer: add content button */}
      <div className="shrink-0 px-5 py-3 border-t border-[var(--border-tertiary)] bg-[var(--bg-primary)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {packageItems.length} item{packageItems.length !== 1 ? "s" : ""} in package
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={13} strokeWidth={2} />}
          >
            Add Content
          </Button>
        </div>
      </div>
    </div>
  );
}
