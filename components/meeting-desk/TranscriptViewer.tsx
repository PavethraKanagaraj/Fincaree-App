"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Input } from "@/components/fincaree/input";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { AlertTriangle, Lock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRANSCRIPTS } from "./meeting-notes";

/* ============================================================
   Transcript viewer — the evidence behind a meeting note.

   Read-only: the transcript is the record of what was said, so it
   is never edited — corrections go in the note. Passages the note
   cites are highlighted and scrolled into view, so a point can be
   checked against its source in one click. Passages the
   speech-to-text was unsure about are marked, because that is where
   the advisor should listen to the recording rather than trust the
   words.
   ============================================================ */

interface TranscriptViewerProps {
  meetingId: string;
  /** "Anika Rao · Plan Discussion" */
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Segments to highlight and scroll to, e.g. the sources of a note point. */
  highlight: string[];
}

export function TranscriptViewer({ meetingId, title, open, onOpenChange, highlight }: TranscriptViewerProps) {
  const transcript = TRANSCRIPTS[meetingId];
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const segments = useMemo(
    () => (transcript ? transcript.segments.filter((s) => !q || s.text.toLowerCase().includes(q) || s.speaker.toLowerCase().includes(q)) : []),
    [transcript, q],
  );

  /* Bring the cited passage into view once the viewer is on screen. */
  useEffect(() => {
    if (!open || highlight.length === 0) return;
    const t = window.setTimeout(() => document.getElementById(`seg-${highlight[0]}`)?.scrollIntoView({ block: "center" }), 80);
    return () => window.clearTimeout(t);
  }, [open, highlight]);

  if (!transcript) return null;

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) setQuery("");
        onOpenChange(o);
      }}
    >
      <ModalContent className="max-w-[640px] z-[70]">
        <div className="px-5 pt-5 pb-3 pr-12 border-b border-[var(--border-tertiary)]">
          <ModalTitle>Transcript</ModalTitle>
          <ModalDescription className="mt-0.5">
            {title} · {transcript.recordedOn} · {transcript.length}
          </ModalDescription>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <Lock size={12} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
            {transcript.consent}. Read-only — change the note, not the transcript.
          </p>
          <div className="mt-3">
            <Input
              size="sm"
              aria-label="Search the transcript"
              placeholder="Search the transcript…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leadingIcon={<Search size={14} strokeWidth={1.75} />}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3">
          {segments.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">Nothing in the transcript matches “{query}”.</p>
          ) : (
            <ol className="divide-y divide-[var(--border-tertiary)]">
              {segments.map((s) => {
                const cited = highlight.includes(s.id);
                return (
                  <li
                    key={s.id}
                    id={`seg-${s.id}`}
                    className={cn("flex gap-3 py-3", cited && "-mx-5 px-5 bg-[var(--bg-brand-subtle)]")}
                    aria-current={cited ? "true" : undefined}
                  >
                    <span className="w-12 shrink-0 text-xs tabular-nums text-[var(--text-tertiary)] pt-0.5">{s.at}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">{s.speaker}</p>
                      <p className="text-sm text-[var(--text-primary)] leading-snug mt-0.5">{s.text}</p>
                      {s.lowConfidence && (
                        <Badge size="sm" color="warning" className="mt-1.5" leadingIcon={<AlertTriangle size={11} strokeWidth={2} />}>
                          Low confidence — check the recording
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
