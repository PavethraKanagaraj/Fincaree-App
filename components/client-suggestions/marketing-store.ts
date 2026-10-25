"use client";

/* ============================================================
   Marketing store — the loops, shared across pages

   The Marketing tab and the Lead Pipeline drawer both show and
   change the same loops, so they read one store instead of each
   keeping a copy. In-session only for now: nothing here reaches a
   sending service yet.

   Rules the store enforces, whatever the screen does:
   - an opted-out lead can't be paused, resumed, sent to or moved
   - "send now" only sends the lead's next message in the loop; it
     can't send anything outside the loop
   - every change appends an audit entry (who, which lead, which
     loop), which the Send log reads
   ============================================================ */

import { useSyncExternalStore } from "react";
import type { AuditAction, AuditEntry } from "./content-data";
import { CONTENT_ITEMS } from "./content-data";
import { NURTURE_SEQUENCES, seedContentItems, type NurtureLead, type NurtureSequence } from "./delivery-data";

/** The content library as Marketing sees it, with audiences and approvals applied. Pages outside
    Content Management read this, so they offer exactly the content that has passed compliance for leads. */
export const MARKETING_CONTENT = seedContentItems(CONTENT_ITEMS);

interface MarketingState {
  loops: NurtureSequence[];
  paused: Record<string, boolean>;
  events: AuditEntry[];
}

/* One lead in the demo data has opted out, so the guard is visible. */
function seed(): NurtureSequence[] {
  return NURTURE_SEQUENCES.map((seq, si) => ({
    ...seq,
    leadList: seq.leadList.map((l, i) => (si === 0 && i === 3 ? { ...l, optedOut: true } : l)),
  }));
}

let state: MarketingState = {
  loops: seed(),
  paused: Object.fromEntries(NURTURE_SEQUENCES.map((s) => [s.id, s.status === "paused"])),
  events: [],
};

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getState = () => state;
function commit(next: Partial<MarketingState>) {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
}

export function useMarketing(): MarketingState {
  return useSyncExternalStore(subscribe, getState, getState);
}

/* ---- helpers ---- */

let counter = 0;
const entry = (action: AuditAction, itemName: string, detail: string): AuditEntry => ({
  id: `mk-${Date.now()}-${counter++}`,
  timestamp: "Just now",
  action,
  itemName,
  actor: "advisor",
  detail,
});

const dateLabel = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

/** Date of the lead's next message once they've moved one step on. */
function nextAfter(seq: NurtureSequence, newSentCount: number): string | null {
  if (newSentCount >= seq.steps.length) return null;
  const prevDay = newSentCount > 0 ? seq.steps[newSentCount - 1].day : 0;
  return dateLabel(Math.max(1, seq.steps[newSentCount].day - prevDay));
}

function updateLead(seqId: string, leadId: string, fn: (l: NurtureLead, seq: NurtureSequence) => NurtureLead): void {
  commit({
    loops: state.loops.map((s) =>
      s.id !== seqId ? s : { ...s, leadList: s.leadList.map((l) => (l.id === leadId ? fn(l, s) : l)) },
    ),
  });
}

const find = (seqId: string, leadId: string) => {
  const seq = state.loops.find((s) => s.id === seqId);
  const lead = seq?.leadList.find((l) => l.id === leadId);
  return seq && lead ? { seq, lead } : null;
};

/** Where a lead is in the loops, matched by name (the pipeline and the loops share names). */
export function loopsOfLead(loops: NurtureSequence[], name: string) {
  return loops.flatMap((seq) => seq.leadList.filter((l) => l.name === name).map((lead) => ({ seq, lead })));
}

/* ---- loop-level ---- */

export const marketing = {
  scheduleLoop(loop: NurtureSequence) {
    commit({
      loops: [loop, ...state.loops],
      paused: { ...state.paused, [loop.id]: false },
      events: [...state.events, entry("loop-scheduled", loop.name, `Starts ${loop.startsOn} for ${loop.leads} leads, ${loop.steps.length} messages`)],
    });
  },

  setLoopPaused(seqId: string, paused: boolean) {
    const seq = state.loops.find((s) => s.id === seqId);
    if (!seq) return;
    commit({
      paused: { ...state.paused, [seqId]: paused },
      events: [...state.events, entry(paused ? "loop-paused" : "loop-resumed", seq.name, paused ? "All leads on hold" : "Carries on from each lead's next message")],
    });
  },

  /* ---- lead-level ---- */

  setLeadHeld(seqId: string, leadId: string, held: boolean) {
    const f = find(seqId, leadId);
    if (!f || f.lead.optedOut || Boolean(f.lead.held) === held) return;
    updateLead(seqId, leadId, (l) => ({ ...l, held }));
    commit({ events: [...state.events, entry(held ? "lead-paused" : "lead-resumed", f.seq.name, `${f.lead.name} — ${held ? "held, the rest of the loop carries on" : "carries on from the next message"}`)] });
  },

  /** Skip the lead's next message: it is counted as passed, and never sent. */
  skipNext(seqId: string, leadId: string) {
    const f = find(seqId, leadId);
    if (!f || f.lead.optedOut || f.lead.sentCount >= f.seq.steps.length) return;
    const step = f.seq.steps[f.lead.sentCount];
    updateLead(seqId, leadId, (l, seq) => ({ ...l, sentCount: l.sentCount + 1, skipped: (l.skipped ?? 0) + 1, nextSend: nextAfter(seq, l.sentCount + 1) }));
    commit({ events: [...state.events, entry("lead-skipped", f.seq.name, `${f.lead.name} — Day ${step.day} message skipped`)] });
  },

  /** Send the lead's next message today. Only the next one in the loop, nothing else. */
  sendNow(seqId: string, leadId: string, title: string) {
    const f = find(seqId, leadId);
    if (!f || f.lead.optedOut || f.lead.held || state.paused[seqId] || f.lead.sentCount >= f.seq.steps.length) return;
    const idx = f.lead.sentCount;
    commit({
      loops: state.loops.map((s) =>
        s.id !== seqId
          ? s
          : {
              ...s,
              steps: s.steps.map((st, i) => (i === idx ? { ...st, sent: st.sent + 1 } : st)),
              leadList: s.leadList.map((l) => (l.id === leadId ? { ...l, sentCount: l.sentCount + 1, nextSend: nextAfter(s, l.sentCount + 1) } : l)),
            },
      ),
      events: [...state.events, entry("lead-sent-now", f.seq.name, `${f.lead.name} — “${title}” (Day ${f.seq.steps[idx].day}) sent early`)],
    });
  },

  /** Add pipeline leads to an existing loop. They start from its first message. */
  addLeadsToLoop(seqId: string, leads: { id: string; name: string }[]) {
    const seq = state.loops.find((s) => s.id === seqId);
    if (!seq || leads.length === 0) return;
    const already = new Set(seq.leadList.map((l) => l.name));
    const fresh = leads.filter((l) => !already.has(l.name));
    if (fresh.length === 0) return;
    const first = seq.steps[0] ? dateLabel(Math.max(1, seq.steps[0].day)) : null;
    const added: NurtureLead[] = fresh.map((l) => ({ id: `${seqId}-ad-${l.id}`, name: l.name, source: "Lead pipeline", joined: dateLabel(0), sentCount: 0, nextSend: first }));
    commit({
      loops: state.loops.map((s) => (s.id === seqId ? { ...s, leadList: [...added, ...s.leadList], leads: s.leads + added.length } : s)),
      events: [...state.events, ...added.map((l) => entry("lead-added", seq.name, `${l.name} — added from the lead pipeline, starts from the first message`))],
    });
  },

  removeLeads(seqId: string, leadIds: string[]) {
    const seq = state.loops.find((s) => s.id === seqId);
    if (!seq) return;
    const gone = seq.leadList.filter((l) => leadIds.includes(l.id) && !l.optedOut);
    if (gone.length === 0) return;
    commit({
      loops: state.loops.map((s) =>
        s.id !== seqId ? s : { ...s, leadList: s.leadList.filter((l) => !gone.some((g) => g.id === l.id)), leads: s.leads - gone.length },
      ),
      events: [...state.events, ...gone.map((l) => entry("lead-removed", seq.name, `${l.name} — removed, no more messages from this loop`))],
    });
  },

  moveLead(fromId: string, toId: string, leadId: string) {
    const f = find(fromId, leadId);
    const to = state.loops.find((s) => s.id === toId);
    if (!f || !to || f.lead.optedOut || fromId === toId) return;
    const moved: NurtureLead = { ...f.lead, id: `${toId}-mv-${leadId}`, sentCount: 0, skipped: 0, held: false, joined: dateLabel(0), nextSend: to.steps[0] ? dateLabel(Math.max(1, to.steps[0].day)) : null };
    commit({
      loops: state.loops.map((s) =>
        s.id === fromId
          ? { ...s, leadList: s.leadList.filter((l) => l.id !== leadId), leads: s.leads - 1 }
          : s.id === toId
            ? { ...s, leadList: [moved, ...s.leadList], leads: s.leads + 1 }
            : s,
      ),
      events: [...state.events, entry("lead-moved", to.name, `${f.lead.name} — moved from “${f.seq.name}”, starts from the first message`)],
    });
  },
};
