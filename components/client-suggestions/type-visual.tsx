"use client";

/* ============================================================
   Shared type→visual lookup for content items.
   Learning has multiple formats (a video and a PDF are consumed
   completely differently), so the icon/color comes from format
   when the category is learning, and from category otherwise.
   ============================================================ */

import type { ReactNode } from "react";
import type { ContentItem, ContentCategory, LearningFormat, SessionMode } from "./data";
import { Play, Layers, Image as ImageIcon, FileText, FlaskConical, Users2, Building2, Globe, MapPin } from "lucide-react";

export interface TypeVisual {
  icon: ReactNode;
  bgColor: string;
  iconColor: string;
  label: string;
}

const LEARNING_FORMAT_VISUAL: Record<LearningFormat, TypeVisual> = {
  video: { icon: <Play size={15} strokeWidth={2} />, bgColor: "bg-[var(--bg-status-info-subtle)]", iconColor: "text-[var(--icon-status-info)]", label: "Video" },
  "course-series": { icon: <Layers size={15} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-brand-subtle)]", iconColor: "text-[var(--icon-brand-primary)]", label: "Course Series" },
  "image-post": { icon: <ImageIcon size={15} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-status-warning-subtle)]", iconColor: "text-[var(--icon-status-warning)]", label: "Image Post" },
  pdf: { icon: <FileText size={15} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-secondary)]", iconColor: "text-[var(--icon-secondary)]", label: "PDF" },
};

const CATEGORY_VISUAL: Record<Exclude<ContentCategory, "learning">, TypeVisual> = {
  simulation: { icon: <FlaskConical size={15} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-brand-subtle)]", iconColor: "text-[var(--icon-brand-primary)]", label: "Simulation" },
  meeting: { icon: <Users2 size={15} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-status-info-subtle)]", iconColor: "text-[var(--icon-status-info)]", label: "Meeting" },
  workshop: { icon: <Building2 size={15} strokeWidth={1.75} />, bgColor: "bg-[var(--bg-status-success-subtle)]", iconColor: "text-[var(--icon-status-success)]", label: "Workshop" },
};

export function getTypeVisual(item: ContentItem): TypeVisual {
  return item.category === "learning" ? LEARNING_FORMAT_VISUAL[item.format] : CATEGORY_VISUAL[item.category];
}

export function getFormatVisual(format: LearningFormat): TypeVisual {
  return LEARNING_FORMAT_VISUAL[format];
}

export function getCategoryVisual(category: ContentCategory): TypeVisual {
  return category === "learning" ? LEARNING_FORMAT_VISUAL.video : CATEGORY_VISUAL[category];
}

export function getModeVisual(mode: SessionMode): { icon: ReactNode; label: string } {
  return mode === "online"
    ? { icon: <Globe size={11} strokeWidth={2} />, label: "Online" }
    : { icon: <MapPin size={11} strokeWidth={2} />, label: "Offline" };
}
