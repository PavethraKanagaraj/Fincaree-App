"use client";

import { Badge } from "@/components/fincaree/badge";
import { Tag } from "@/components/fincaree/tag";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { FileText, Play, ShieldCheck } from "lucide-react";
import { TOPIC_LABEL, type ContentItem } from "./content-data";
import { getTypeVisual, itemMeta, typeLabel } from "./content-visual";

/* ============================================================
   Content preview — look at a piece of content before it goes
   to leads.

   A video shows its player (the file plays when the item has a
   media file; until then the frame says so rather than pretending).
   Everything else shows what it is: format, length, a short
   description, topic and tags, and the compliance reference it was
   approved under — so the advisor sees what the lead will see, and
   that it has been cleared.

   `ContentPreviewBody` is for placing inside another panel (the
   schedule dialog opens it under the message row);
   `ContentPreviewDialog` is for pages with no panel to put it in.
   ============================================================ */

function MediaFrame({ item }: { item: ContentItem }) {
  const visual = getTypeVisual(item);
  const meta = itemMeta(item);
  const isVideo = item.category === "learning" && item.format === "video";

  if (isVideo && item.mediaUrl) {
    return (
      <video
        controls
        preload="metadata"
        poster={item.posterUrl}
        src={item.mediaUrl}
        aria-label={`Video: ${item.title}`}
        className="w-full max-w-[440px] aspect-video rounded-[var(--radius-lg)] bg-black"
      />
    );
  }

  if (isVideo) {
    return (
      <div
        role="img"
        aria-label={`Video preview: ${item.title}, ${meta ?? "length unknown"}. The video file is not attached yet.`}
        className="relative w-full max-w-[440px] aspect-video rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] flex items-center justify-center"
      >
        <span className="w-14 h-14 rounded-full bg-[var(--bg-primary)] shadow-[var(--shadow-sm)] flex items-center justify-center text-[var(--icon-brand-primary)]">
          <Play size={22} strokeWidth={2} className="ml-0.5" aria-hidden="true" />
        </span>
        {meta && (
          <span className="absolute bottom-2 right-2 rounded-[var(--radius-sm)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--text-primary)]">{meta}</span>
        )}
        <span className="absolute bottom-2 left-2 text-xs text-[var(--text-tertiary)]">Video file not attached yet</span>
      </div>
    );
  }

  /* Not a video: show what it is */
  return (
    <div className="w-full rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-6 flex items-center gap-3">
      <span className={`w-11 h-11 shrink-0 rounded-[var(--radius-lg)] flex items-center justify-center ${visual.bgColor} ${visual.iconColor}`} aria-hidden="true">
        {visual.icon ?? <FileText size={18} />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{typeLabel(item)}</p>
        {meta && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{meta}</p>}
      </div>
    </div>
  );
}

export function ContentPreviewBody({ item }: { item: ContentItem }) {
  const review = item.compliance;
  return (
    <div className="flex flex-col gap-3">
      <MediaFrame item={item} />

      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug">{item.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge size="sm" color="gray-blue">{typeLabel(item)}</Badge>
        <Badge size="sm" color="gray">{TOPIC_LABEL[item.topic]}</Badge>
        {item.tags.slice(0, 4).map((t) => (
          <Tag key={t} color="grey" size="sm">{t}</Tag>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <ShieldCheck size={13} strokeWidth={1.75} className="shrink-0 text-[var(--icon-status-success)]" aria-hidden="true" />
        {review.status === "approved-for-use" ? "Approved for use" : "Not approved"}
        {review.ref ? ` · ${review.ref}` : ""}
        {review.approvedBy ? ` · by ${review.approvedBy}` : ""}
        {review.approvedAt ? ` on ${review.approvedAt}` : ""}
      </p>
    </div>
  );
}

export function ContentPreviewDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal open={open && item !== null} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[560px]">
        <div className="px-5 pt-5 pb-2 pr-12">
          <ModalTitle>Preview</ModalTitle>
          <ModalDescription className="mt-0.5">This is what the lead will receive.</ModalDescription>
        </div>
        <div className="px-5 pb-5 overflow-y-auto">{item && <ContentPreviewBody item={item} />}</div>
      </ModalContent>
    </Modal>
  );
}
