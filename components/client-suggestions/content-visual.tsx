"use client";

/* ============================================================
   Shared visual mapping for Content Studio.
   Compliance and publication are separate badge scales because
   they answer different questions: "can I share this?" vs
   "have I shared it?".
   ============================================================ */

import type { ReactNode } from "react";
import type { BadgeColor } from "@/components/fincaree/badge";
import type { ContentItem, ComplianceStatus, PublicationStatus, LearningFormat } from "./content-data";
import { LEARNING_FORMAT_LABEL } from "./content-data";
import { Play, Layers, Image as ImageIcon, FileText, FlaskConical, Presentation, Globe, MapPin } from "lucide-react";

export const COMPLIANCE_BADGE_COLOR: Record<ComplianceStatus, BadgeColor> = {
  "not-reviewed": "gray",
  "ai-review-complete": "gray-blue",
  "advisor-review-required": "warning",
  "changes-required": "error",
  "approved-for-use": "success",
};

export const PUBLICATION_BADGE_COLOR: Record<PublicationStatus, BadgeColor> = {
  draft: "gray",
  scheduled: "brand",
  published: "success",
  archived: "gray",
};

export interface TypeVisual {
  icon: ReactNode;
  bgColor: string;
  iconColor: string;
  label: string;
}

const FORMAT_VISUAL: Record<LearningFormat, TypeVisual> = {
  video: { icon: <Play size={14} strokeWidth={2} />, bgColor: "bg-[var(--bg-status-info-subtle)]", iconColor: "text-[var(--icon-status-info)]", label: "Video" },
  course: { icon: <Layers size={14} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-brand-subtle)]", iconColor: "text-[var(--icon-brand-primary)]", label: "Course" },
  "image-post": { icon: <ImageIcon size={14} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-status-warning-subtle)]", iconColor: "text-[var(--icon-status-warning)]", label: "Image Post" },
  pdf: { icon: <FileText size={14} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-secondary)]", iconColor: "text-[var(--icon-secondary)]", label: "PDF" },
};

const SIMULATION_VISUAL: TypeVisual = {
  icon: <FlaskConical size={14} strokeWidth={1.75} />,
  bgColor: "bg-[var(--bg-brand-subtle)]",
  iconColor: "text-[var(--icon-brand-primary)]",
  label: "Simulation",
};

const WORKSHOP_VISUAL: TypeVisual = {
  icon: <Presentation size={14} strokeWidth={1.75} />,
  bgColor: "bg-[var(--bg-status-success-subtle)]",
  iconColor: "text-[var(--icon-status-success)]",
  label: "Workshop",
};

export function getTypeVisual(item: ContentItem): TypeVisual {
  if (item.category === "learning") return FORMAT_VISUAL[item.format];
  if (item.category === "simulation") return SIMULATION_VISUAL;
  return WORKSHOP_VISUAL;
}

/** "Video" · "Simulation" · "Online Workshop" */
export function typeLabel(item: ContentItem): string {
  if (item.category === "learning") return LEARNING_FORMAT_LABEL[item.format];
  if (item.category === "simulation") return "Simulation";
  return item.mode === "online" ? "Online Workshop" : "Offline Workshop";
}

export function getFormatVisual(format: LearningFormat): TypeVisual {
  return FORMAT_VISUAL[format];
}

export function modeIcon(mode: "online" | "offline"): ReactNode {
  return mode === "online" ? <Globe size={11} strokeWidth={2} /> : <MapPin size={11} strokeWidth={2} />;
}

/** Secondary descriptor shown under a title in the table. */
export function itemMeta(item: ContentItem): string | undefined {
  if (item.category === "learning") {
    if (item.format === "video") return item.duration;
    if (item.format === "course") return item.moduleCount ? `${item.moduleCount} modules` : undefined;
    if (item.format === "pdf") return item.pageCount ? `${item.pageCount} pages` : undefined;
    return undefined;
  }
  if (item.category === "simulation") return item.estimatedTime;
  return item.scheduledFor ?? item.duration;
}
