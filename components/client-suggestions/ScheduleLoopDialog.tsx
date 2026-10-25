"use client";

import { useRef, useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Button } from "@/components/fincaree/button";
import { CalendarClock, Eye, Plus, ShieldCheck, X } from "lucide-react";
import type { ContentItem } from "./content-data";
import type { NurtureLead, NurtureSequence } from "./delivery-data";
import { sendableContent, type LoopAudience, type PreparedLoop } from "./marketing-intelligence";
import { typeLabel } from "./content-visual";
import { ContentPreviewBody } from "./ContentPreview";

/* ============================================================
   Schedule a loop — the advisor builds a follow-up loop and
   chooses when it starts.

   Compliance is not a field here. The message picker lists only
   content that is already Approved and written for leads; there
   is no way to add anything else, and the dialog says how many
   items are left out and why. Finny can prefill this dialog, but
   nothing is scheduled until the advisor presses the button.
   ============================================================ */

const MAX_MESSAGES = 6;

const SEND_TIMES: Record<string, string> = {
  "09:00": "Morning · 9:00 AM",
  "13:00": "Afternoon · 1:00 PM",
  "18:00": "Evening · 6:00 PM",
};

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s: string) => new Date(`${s}T00:00:00`);
const addDays = (s: string, n: number) => {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return d;
};
export const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

interface Row {
  id: number;
  day: string;
  contentId: string;
}

interface ScheduleLoopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ContentItem[];
  audiences: LoopAudience[];
  /** What Finny prepared, if the advisor started from a suggestion. */
  initial?: PreparedLoop | null;
  onSchedule: (loop: NurtureSequence) => void;
}

export function ScheduleLoopDialog({ open, onOpenChange, items, audiences, initial, onSchedule }: ScheduleLoopDialogProps) {
  const today = toISO(new Date());
  const tomorrow = toISO(addDays(today, 1));
  const nextId = useRef(1);
  const newRow = (day = "", contentId = ""): Row => ({ id: nextId.current++, day, contentId });

  const [name, setName] = useState(initial?.name ?? "");
  const [audienceKey, setAudienceKey] = useState(initial?.audienceKey ?? audiences[0]?.key ?? "");
  const [rows, setRows] = useState<Row[]>(() =>
    initial && initial.steps.length > 0 ? initial.steps.map((s) => newRow(String(s.day), s.contentId)) : [newRow("1", "")],
  );
  const [start, setStart] = useState(tomorrow);
  const [time, setTime] = useState("09:00");
  const [submitted, setSubmitted] = useState(false);
  /* One message's preview is open at a time, under its row. */
  const [previewRow, setPreviewRow] = useState<number | null>(null);

  const audience = audiences.find((a) => a.key === audienceKey);
  const sendable = sendableContent(items, audience?.goal ?? null);
  const leftOut = items.length - sendable.length;
  const contentItems = Object.fromEntries(sendable.map((i) => [i.id, i.title]));
  const audienceItems = Object.fromEntries(audiences.map((a) => [a.key, `${a.label} · ${a.leads.length}`]));

  /* ---- validation ---- */
  const nameError = name.trim() ? undefined : "Give the loop a name";
  const audienceError = audience ? undefined : "Choose who joins";
  const startError = start && start >= today ? undefined : "Choose a date from today";
  const days = rows.map((r) => Number(r.day));
  const rowErrors = rows.map((r, i) => {
    if (!r.contentId) return "Choose a message";
    if (!Number.isInteger(days[i]) || days[i] < 1 || days[i] > 90) return "Day must be 1–90";
    if (i > 0 && days[i] <= days[i - 1]) return "Must come after the message above";
    return undefined;
  });
  const valid = !nameError && !audienceError && !startError && rows.length > 0 && rowErrors.every((e) => !e);

  function reset() {
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!valid || !audience) return;

    const steps = rows.map((r) => ({ day: Number(r.day), contentId: r.contentId, sent: 0, opened: 0 }));
    const lastDay = steps[steps.length - 1].day;
    const leadList: NurtureLead[] = audience.leads.map((l) => ({
      id: l.id,
      name: l.name,
      source: "Lead pipeline",
      joined: fmtDate(fromISO(start)),
      sentCount: 0,
      nextSend: fmtDate(addDays(start, steps[0].day - 1)),
    }));

    onSchedule({
      id: `ns-${Date.now()}`,
      name: name.trim(),
      description: `${steps.length} message${steps.length === 1 ? "" : "s"} over ${lastDay} day${lastDay === 1 ? "" : "s"}, chosen by you.`,
      audience: audience.label,
      leads: leadList.length,
      converted: 0,
      status: "scheduled",
      startsOn: start,
      sendTime: time,
      steps,
      leadList,
    });
    handleOpenChange(false);
  }

  const lastDay = rows.length > 0 ? Math.max(...days.filter((d) => Number.isFinite(d)), 0) : 0;

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-[620px]">
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="px-5 pt-5 pb-3 pr-12">
            <ModalTitle>Schedule a loop</ModalTitle>
            <ModalDescription className="mt-1">
              Pick who joins, the messages and the days they go out, and when it starts. Each lead stops getting messages once they subscribe.
            </ModalDescription>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4">
            <Input label="Loop name" required value={name} onChange={(e) => setName(e.target.value)} error={submitted ? nameError : undefined} autoComplete="off" />

            {audiences.length > 0 ? (
              <SelectField
                label="Who joins"
                required
                hint="Leads who had a discovery call, haven't subscribed, and aren't in another loop"
                value={audienceKey}
                onValueChange={(v: unknown) => setAudienceKey(v as string)}
                items={audienceItems}
                error={submitted ? audienceError : undefined}
              >
                {audiences.map((a) => (
                  <SelectItem key={a.key} value={a.key}>{audienceItems[a.key]}</SelectItem>
                ))}
              </SelectField>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">Every lead who had a discovery call is already in a loop.</p>
            )}

            {/* Messages */}
            <fieldset className="min-w-0">
              <legend className="text-sm font-medium text-[var(--text-primary)]">Messages</legend>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 flex items-start gap-1.5">
                <ShieldCheck size={13} strokeWidth={1.75} className="mt-px shrink-0 text-[var(--icon-status-success)]" aria-hidden="true" />
                <span>
                  Only content that has passed compliance for leads is listed — {sendable.length} available
                  {leftOut > 0 ? `. ${leftOut} more can't be used: still in review, expired, or written for clients.` : "."}
                </span>
              </p>

              <p className="mt-3 mb-2 text-sm text-[var(--text-secondary)]">
                Each message goes out on the day you set, counted from the day the lead joins. Day 1 is the start date.
              </p>
              <ul className="flex flex-col gap-2">
                {rows.map((r, i) => (
                  <li key={r.id}>
                    <div className="flex items-start gap-2">
                    <div className="w-[120px] shrink-0">
                      <Input
                        size="sm"
                        type="number"
                        min={1}
                        max={90}
                        aria-label={`Day for message ${i + 1}`}
                        leadingAddon="Day"
                        value={r.day}
                        onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, day: e.target.value } : x)))}
                        error={submitted && rowErrors[i] && r.contentId ? rowErrors[i] : undefined}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <SelectField
                        size="sm"
                        aria-label={`Content for message ${i + 1}`}
                        placeholder="Choose approved content"
                        value={r.contentId || null}
                        onValueChange={(v: unknown) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, contentId: v as string } : x)))}
                        items={contentItems}
                        error={submitted && rowErrors[i] === "Choose a message" ? rowErrors[i] : undefined}
                      >
                        {sendable.map((it) => (
                          <SelectItem key={it.id} value={it.id}>
                            {it.title} · {typeLabel(it)}
                          </SelectItem>
                        ))}
                      </SelectField>
                    </div>
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      iconOnly
                      leadingIcon={<Eye size={14} strokeWidth={1.75} />}
                      aria-label={`Preview message ${i + 1}`}
                      aria-expanded={previewRow === r.id}
                      disabled={!r.contentId}
                      onClick={() => setPreviewRow((cur) => (cur === r.id ? null : r.id))}
                    />
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      iconOnly
                      leadingIcon={<X size={14} strokeWidth={2} />}
                      aria-label={`Remove message ${i + 1}`}
                      disabled={rows.length === 1}
                      onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                    />
                    </div>
                    {Number.isInteger(days[i]) && days[i] >= 1 && start && (
                      <p className="mt-1 pl-0.5 text-xs text-[var(--text-tertiary)]">
                        Day {days[i]} · goes out {fmtDate(addDays(start, days[i] - 1))}
                      </p>
                    )}
                    {previewRow === r.id && r.contentId && (() => {
                      const it = items.find((x) => x.id === r.contentId);
                      return it ? (
                        <div className="mt-2 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-subtle)] p-3">
                          <ContentPreviewBody item={it} />
                        </div>
                      ) : null;
                    })()}
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant="link-brand"
                size="sm"
                className="mt-2"
                leadingIcon={<Plus size={14} strokeWidth={2} />}
                disabled={rows.length >= MAX_MESSAGES || sendable.length === 0}
                onClick={() => setRows((rs) => [...rs, newRow(String((Number(rs[rs.length - 1]?.day) || 0) + 3), "")])}
              >
                Add a message
              </Button>
              {sendable.length === 0 && (
                <p role="alert" className="mt-1 text-xs text-[var(--text-status-error)]">No content is approved for leads yet, so there is nothing to schedule.</p>
              )}
            </fieldset>

            {/* When */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Starts on"
                required
                type="date"
                min={today}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                error={submitted ? startError : undefined}
                hint="Day 1 goes out this day"
              />
              <SelectField label="Send at" value={time} onValueChange={(v: unknown) => setTime(v as string)} items={SEND_TIMES}>
                {Object.keys(SEND_TIMES).map((t) => (
                  <SelectItem key={t} value={t}>{SEND_TIMES[t]}</SelectItem>
                ))}
              </SelectField>
            </div>

            {audience && start >= today && lastDay > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <CalendarClock size={13} strokeWidth={1.75} className="shrink-0 text-[var(--icon-tertiary)]" aria-hidden="true" />
                {audience.leads.length} lead{audience.leads.length === 1 ? "" : "s"} join on {fmtDate(fromISO(start))}; the last message goes out on{" "}
                {fmtDate(addDays(start, lastDay - 1))}.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border-tertiary)]">
            <Button type="button" variant="tertiary" size="md" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={audiences.length === 0 || sendable.length === 0} leadingIcon={<CalendarClock size={14} strokeWidth={2} />}>
              Schedule loop
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
