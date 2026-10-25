"use client";

/* ============================================================
   Meeting notes — transcript → note, with the source on every line

   A transcript is the evidence; the note is what Finny drafts from
   it and the advisor signs off. The two are linked: every point in
   the note carries the transcript passages it came from, so the
   advisor checks a line by opening its source instead of trusting it.

   The transcript is read-only. Edits go in the note.

   Prototype data: three meetings have a recording. The rest were not
   recorded, which is a real state (no consent, or a phone call) and
   the UI says so rather than hiding it. The "draft" below is what a
   model would return; generation is simulated, not live.
   ============================================================ */

import { useSyncExternalStore } from "react";
import type { AuditAction, AuditEntry } from "@/components/client-suggestions/content-data";

export interface TranscriptSegment {
  id: string;
  /** Position in the recording, "12:40". */
  at: string;
  speaker: "Advisor" | "Client";
  text: string;
  /** The speech-to-text was unsure here; the advisor should check the recording. */
  lowConfidence?: boolean;
}

export interface MeetingTranscript {
  recordedOn: string;
  length: string;
  consent: string;
  segments: TranscriptSegment[];
}

export interface NotePoint {
  id: string;
  text: string;
  /** Ids of the transcript segments this point came from. */
  sources: string[];
}

export interface MeetingNote {
  summary: NotePoint[];
  decisions: NotePoint[];
  actions: NotePoint[];
}

export type NoteSection = keyof MeetingNote;

/* ---- Prototype transcripts, keyed by the meeting they are the *last meeting* of ---- */

const seg = (id: string, at: string, speaker: "Advisor" | "Client", text: string, lowConfidence = false): TranscriptSegment => ({ id, at, speaker, text, ...(lowConfidence ? { lowConfidence } : {}) });

export const TRANSCRIPTS: Record<string, MeetingTranscript> = {
  M001: {
    recordedOn: "20 May 2025",
    length: "42 min",
    consent: "Recorded with the client's consent on 20 May 2025",
    segments: [
      seg("a1", "00:42", "Advisor", "Thanks for joining, Anika. Today I want to walk through your retirement plan and the portfolio allocation behind it."),
      seg("a2", "02:15", "Client", "My main worry is retirement. I'd like to stop working at 60, but I'm not sure the numbers support it."),
      seg("a3", "04:30", "Advisor", "On your current savings rate, retiring at 60 is achievable. I'd keep the current investment strategy as it is."),
      seg("a4", "07:05", "Client", "Can you explain how my money is split across equity and debt? I don't fully understand the allocation."),
      seg("a5", "09:20", "Advisor", "Today it's about sixty-five percent equity and thirty-five percent debt. I'll send you a one-page breakdown after this call."),
      seg("a6", "12:40", "Client", "That would help. And my insurance — I have a term policy through work, but I'm not sure what it actually covers."),
      seg("a7", "14:10", "Advisor", "We should revisit your coverage. Can you send me the policy document?"),
      seg("a8", "14:55", "Client", "I'll upload it by the weekend.", true),
      seg("a9", "17:30", "Advisor", "Then to confirm: retirement target of sixty, we keep the current strategy, and we review insurance in our next meeting."),
      seg("a10", "18:05", "Client", "Agreed."),
    ],
  },
  M002: {
    recordedOn: "12 May 2025",
    length: "35 min",
    consent: "Recorded with the client's consent on 12 May 2025",
    segments: [
      seg("b1", "00:30", "Advisor", "Let's look at the education fund for your daughter's studies and whether it's on track."),
      seg("b2", "03:10", "Advisor", "At the current monthly SIP, the projection comes out about four lakh rupees short.", true),
      seg("b3", "05:45", "Client", "What would the SIP need to be to close that gap?"),
      seg("b4", "07:20", "Advisor", "Roughly eighteen and a half thousand a month, but I want to rerun it with updated fund charges before you commit."),
      seg("b5", "09:00", "Client", "I'd rather see the revised amount before I raise anything. Can we speak again?"),
      seg("b6", "10:15", "Advisor", "Yes. We'll leave the SIP as it is, and I'll come back to you with the revised numbers."),
    ],
  },
  M014: {
    recordedOn: "20 May 2025",
    length: "28 min",
    consent: "Recorded with the client's consent on 20 May 2025",
    segments: [
      seg("c1", "00:25", "Advisor", "Let's go through your asset allocation. Right now you're at about seventy-five percent equity."),
      seg("c2", "02:40", "Client", "Honestly, that feels too aggressive for me, especially with retirement getting closer."),
      seg("c3", "04:05", "Advisor", "What mix would you be comfortable with?"),
      seg("c4", "05:30", "Client", "Something more conservative. Maybe fifty-five to sixty percent in equity."),
      seg("c5", "07:10", "Advisor", "Understood. I'll rework the split and send you two options to compare."),
    ],
  },
};

/** What Finny returns for each transcript. Each point cites the segments it came from. */
const NOTE_DRAFTS: Record<string, MeetingNote> = {
  M001: {
    summary: [
      { id: "s1", text: "Retirement is the client's main concern; the target age is 60.", sources: ["a2", "a3"] },
      { id: "s2", text: "The client wanted a clearer view of the equity and debt split (about 65 / 35).", sources: ["a4", "a5"] },
      { id: "s3", text: "Insurance cover is unclear — the client has a term policy through work.", sources: ["a6", "a7"] },
    ],
    decisions: [
      { id: "d1", text: "Continue the current investment strategy.", sources: ["a3", "a9"] },
      { id: "d2", text: "Review insurance coverage in the next meeting.", sources: ["a9"] },
    ],
    actions: [
      { id: "x1", text: "Advisor: send a one-page allocation breakdown.", sources: ["a5"] },
      { id: "x2", text: "Client: upload the insurance policy document by the weekend.", sources: ["a7", "a8"] },
    ],
  },
  M002: {
    summary: [
      { id: "s1", text: "The education fund projection is about ₹4L short at the current SIP.", sources: ["b2"] },
      { id: "s2", text: "The client wants to see the revised SIP amount before committing.", sources: ["b3", "b4", "b5"] },
    ],
    decisions: [{ id: "d1", text: "Hold off on increasing the SIP until the follow-up call.", sources: ["b5", "b6"] }],
    actions: [{ id: "x1", text: "Advisor: rerun the projection with updated fund charges and follow up.", sources: ["b4", "b6"] }],
  },
  M014: {
    summary: [
      { id: "s1", text: "The client found the current equity split (about 75%) too aggressive.", sources: ["c1", "c2"] },
      { id: "s2", text: "The client prefers a more conservative mix of 55–60% equity.", sources: ["c4"] },
    ],
    decisions: [{ id: "d1", text: "Rework the equity split based on the client's feedback.", sources: ["c4", "c5"] }],
    actions: [{ id: "x1", text: "Advisor: send two revised allocation options.", sources: ["c5"] }],
  },
};

export const hasTranscript = (meetingId: string) => meetingId in TRANSCRIPTS;

/* ---- Note state, per meeting. In-session only. ---- */

export type NoteStatus = "none" | "drafting" | "draft" | "reviewed";

interface NoteState {
  status: NoteStatus;
  /** "Plan Discussion · Anika Rao" — how the Send log names this note. */
  label: string;
  note?: MeetingNote;
  /** Points the advisor changed from Finny's draft. */
  edited: string[];
}

let notes: Record<string, NoteState> = {};
/* Every step on a note is an audit entry the Send log reads: a note is a record of
   what was said to a client, so who drafted, changed and approved it must be traceable. */
let events: AuditEntry[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getNotes = () => notes;
const getEvents = () => events;
function commit(next: Record<string, NoteState>, entry?: AuditEntry) {
  notes = next;
  if (entry) events = [...events, entry];
  listeners.forEach((fn) => fn());
}

const entry = (action: AuditAction, itemName: string, actor: AuditEntry["actor"], detail: string): AuditEntry => ({
  id: `mn-${Date.now()}-${counter++}`,
  timestamp: "Just now",
  action,
  itemName,
  actor,
  detail,
});

const clip = (t: string, n = 90) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

export function useMeetingNotes() {
  return useSyncExternalStore(subscribe, getNotes, getNotes);
}

/** The audit entries the note steps have produced this session. */
export function useNoteEvents() {
  return useSyncExternalStore(subscribe, getEvents, getEvents);
}

export const meetingNotes = {
  /** Finny reads the transcript and drafts the note. Simulated delay; the draft is the authored one above. */
  generate(meetingId: string, label: string) {
    const draft = NOTE_DRAFTS[meetingId];
    if (!draft || (notes[meetingId] && notes[meetingId].status !== "none")) return;
    commit({ ...notes, [meetingId]: { status: "drafting", label, edited: [] } });
    window.setTimeout(() => {
      const length = TRANSCRIPTS[meetingId]?.length ?? "";
      commit(
        { ...notes, [meetingId]: { status: "draft", label, note: structuredClone(draft), edited: [] } },
        entry("note-generated", label, "ai", `Drafted by Finny from the ${length} transcript — awaiting advisor review`),
      );
    }, 1400);
  },

  editPoint(meetingId: string, section: NoteSection, pointId: string, text: string) {
    const cur = notes[meetingId];
    if (!cur?.note || cur.status === "reviewed") return;
    const before = cur.note[section].find((p) => p.id === pointId)?.text ?? "";
    if (before === text) return;
    const note: MeetingNote = { ...cur.note, [section]: cur.note[section].map((p) => (p.id === pointId ? { ...p, text } : p)) };
    commit(
      { ...notes, [meetingId]: { ...cur, note, edited: cur.edited.includes(pointId) ? cur.edited : [...cur.edited, pointId] } },
      entry("note-edited", cur.label, "advisor", `“${clip(before)}” → “${clip(text)}”`),
    );
  },

  /** Only the advisor moves a note from AI draft to reviewed. */
  approve(meetingId: string) {
    const cur = notes[meetingId];
    if (!cur || cur.status !== "draft") return;
    commit(
      { ...notes, [meetingId]: { ...cur, status: "reviewed" } },
      entry("note-approved", cur.label, "advisor", `Approved as the record of the meeting${cur.edited.length > 0 ? ` — ${cur.edited.length} point${cur.edited.length === 1 ? "" : "s"} reworded` : " — no changes to Finny's draft"}`),
    );
  },
};
