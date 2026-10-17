"use client";

/* ============================================================
   Content tags — the three small signals every content row carries

   StatusChip   one of four: Draft · Needs fixes · Approved · Expired
   AudienceTag  who it is for — a dot and a label, so it reads as a
                different kind of signal from the status chip
   AiTag        written or assisted by AI

   Sourcing: Fincaree Badge. Colours come from the content semantic
   tokens (app/content-tokens.css).
   ============================================================ */

import { Badge, type BadgeColor } from "@/components/fincaree/badge";
import { Sparkles } from "lucide-react";
import type { ContentAudience } from "./content-data";
import { CONTENT_AUDIENCE_TAG, CONTENT_STATUS_LABEL, type ContentStatus } from "./delivery-data";

const STATUS_COLOR: Record<ContentStatus, BadgeColor> = {
  draft: "gray",
  "needs-fixes": "warning",
  approved: "success",
  expired: "error",
};

export function StatusChip({ status }: { status: ContentStatus }) {
  return (
    <Badge size="sm" color={STATUS_COLOR[status]}>
      {CONTENT_STATUS_LABEL[status]}
    </Badge>
  );
}

const AUDIENCE_DOT: Record<ContentAudience, string> = {
  clients: "var(--audience-clients-dot)",
  leads: "var(--audience-leads-dot)",
  public: "var(--audience-public-dot)",
};

export function AudienceTag({ audience }: { audience: ContentAudience }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">
      <span aria-hidden="true" className="w-2 h-2 rounded-full shrink-0" style={{ background: AUDIENCE_DOT[audience] }} />
      {CONTENT_AUDIENCE_TAG[audience]}
    </span>
  );
}

export function AiTag() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium text-[var(--text-brand-primary)] whitespace-nowrap"
      style={{ background: "var(--ai-label-bg)" }}
      title="Written or assisted by AI"
    >
      <Sparkles size={11} strokeWidth={2} style={{ color: "var(--ai-label-icon)" }} aria-hidden="true" />
      AI
    </span>
  );
}
