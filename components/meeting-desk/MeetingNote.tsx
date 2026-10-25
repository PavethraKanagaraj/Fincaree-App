"use client";

import { useState } from "react";
import { Button } from "@/components/fincaree/button";
import { Textarea } from "@/components/fincaree/textarea";
import { AIReviewNotice, AdvisorReviewStatus } from "@/components/finny/ai-pattern";
import { CheckCheck, FileText, Pencil, Sparkles } from "lucide-react";
import { TRANSCRIPTS, hasTranscript, meetingNotes, useMeetingNotes, type NotePoint, type NoteSection } from "./meeting-notes";

/* ============================================================
   Meeting note — drafted by Finny from the transcript, signed off
   by the advisor.

   Every point shows where in the recording it came from (the
   timestamp chips). Click one and the transcript opens at that
   passage. An advisor can reword any point; only the advisor can
   mark the note reviewed, and once reviewed it is locked.
   ============================================================ */

const SECTION_LABEL: Record<NoteSection, string> = {
  summary: "Summary",
  decisions: "Decisions",
  actions: "Action items",
};

interface MeetingNoteProps {
  meetingId: string;
  /** "Plan Discussion · Anika Rao" — how the note is named in the Send log. */
  label: string;
  onOpenTranscript: (segmentIds: string[]) => void;
}

export function MeetingNote({ meetingId, label, onOpenTranscript }: MeetingNoteProps) {
  const all = useMeetingNotes();
  const state = all[meetingId];
  const [editing, setEditing] = useState<{ section: NoteSection; id: string } | null>(null);
  const [text, setText] = useState("");

  /* No recording: say so. The hand-written summary on the card is all there is. */
  if (!hasTranscript(meetingId)) {
    return (
      <p className="flex items-start gap-1.5 text-xs text-[var(--text-tertiary)]">
        <FileText size={13} strokeWidth={1.75} className="mt-px shrink-0" aria-hidden="true" />
        This meeting wasn&apos;t recorded, so there is no transcript and Finny can&apos;t draft a note. The summary above was written by hand.
      </p>
    );
  }

  const transcript = TRANSCRIPTS[meetingId];
  const status = state?.status ?? "none";
  const note = state?.note;
  const timeOf = (id: string) => transcript.segments.find((s) => s.id === id)?.at ?? "";

  if (status === "none" || status === "drafting") {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] p-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)]" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Meeting note</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-snug">
          A {transcript.length} recording is on file. Finny can draft the note from it, with every point linked to what was said.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leadingIcon={<Sparkles size={13} strokeWidth={2} />}
            disabled={status === "drafting"}
            onClick={() => meetingNotes.generate(meetingId, label)}
          >
            {status === "drafting" ? "Finny is reading the transcript…" : "Generate meeting note"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onOpenTranscript([])}>
            View transcript
          </Button>
        </div>
        <AIReviewNotice className="mt-2" />
      </div>
    );
  }

  const locked = status === "reviewed";

  function renderPoint(section: NoteSection, p: NotePoint) {
    const isEditing = editing?.section === section && editing.id === p.id;
    const first = p.sources[0];
    return (
      <li key={p.id} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)] leading-snug">
        <span className="text-[var(--text-tertiary)] shrink-0">•</span>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea aria-label="Edit this point" value={text} rows={2} onChange={(e) => setText(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => { meetingNotes.editPoint(meetingId, section, p.id, text.trim() || p.text); setEditing(null); }}>
                  Save
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              {p.text}{" "}
              {first && (
                <button
                  type="button"
                  onClick={() => onOpenTranscript(p.sources)}
                  aria-label={`See the source in the transcript at ${timeOf(first)}`}
                  className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-1.5 text-[11px] font-semibold tabular-nums text-[var(--text-brand-primary)] hover:bg-[var(--bg-brand-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)]"
                >
                  {timeOf(first)}
                  {p.sources.length > 1 ? ` +${p.sources.length - 1}` : ""}
                </button>
              )}
              {state?.edited.includes(p.id) && <span className="ml-1 text-[11px] text-[var(--text-tertiary)]">· edited</span>}
            </>
          )}
        </div>
        {!isEditing && !locked && (
          <button
            type="button"
            onClick={() => { setEditing({ section, id: p.id }); setText(p.text); }}
            aria-label="Edit this point"
            className="shrink-0 rounded-[var(--radius-sm)] p-0.5 text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)]"
          >
            <Pencil size={12} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </li>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} strokeWidth={2} className="text-[var(--icon-brand-primary)]" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Meeting note</span>
        </div>
        <AdvisorReviewStatus status={locked ? "reviewed" : "draft"} />
      </div>

      <div className="space-y-4">
        {(Object.keys(SECTION_LABEL) as NoteSection[]).map((section) => (
          <div key={section}>
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">{SECTION_LABEL[section]}</div>
            <ul className="space-y-1.5">
              {note?.[section].map((p) => renderPoint(section, p))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-tertiary)] flex flex-wrap items-center gap-2">
        {locked ? (
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <CheckCheck size={13} strokeWidth={2} className="text-[var(--icon-status-success)]" aria-hidden="true" />
            Reviewed by you. This is now the record of the meeting.
          </span>
        ) : (
          <>
            <Button size="sm" variant="primary" leadingIcon={<CheckCheck size={13} strokeWidth={2} />} onClick={() => meetingNotes.approve(meetingId)}>
              Approve note
            </Button>
            <AIReviewNotice />
          </>
        )}
        <Button size="sm" variant="secondary" className="ml-auto" onClick={() => onOpenTranscript([])}>
          View transcript
        </Button>
      </div>
    </div>
  );
}
