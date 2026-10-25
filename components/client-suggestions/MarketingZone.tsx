"use client";

/* ============================================================
   Marketing — follow-up for leads who did not convert

   A lead is someone who had a discovery call but has not
   subscribed. A sequence sends them a few approved messages on
   set days, and stops by itself when they subscribe.

   One question per level:
     The page   → which sequences are running, and are they working?
     A sequence → what goes out, and when?  (open a row)
     Its leads  → who is in it?             (one more click)

   The advisor schedules their own loops from content that has
   already passed compliance. Finny (the intelligence layer) reads
   the pipeline and the results, and prepares a loop for the advisor
   to review — it never schedules or sends anything itself.

   The explainer and the safeguards are a sentence and a
   disclosure, not sections.

   Sourcing: Fincaree Badge, Switch, ui/table via DataTable.
   ============================================================ */

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Switch } from "@/components/fincaree/switch";
import { Button } from "@/components/fincaree/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AIReviewNotice, FinnyReasoning, InsightList } from "@/components/finny/ai-pattern";
import { KpiCard, type KpiEmphasis } from "@/components/layout/KpiCard";
import { CalendarClock, ChevronDown, Info, MailOpen, Megaphone, Repeat, ShieldCheck, Sparkles, UserCheck, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ContentItem } from "./content-data";
import { NURTURE_RULES, holdReason, isSendableToLeads, type NurtureSequence } from "./delivery-data";
import { LoopLeadsTable } from "./LoopLeadsTable";
import { marketing, useMarketing } from "./marketing-store";
import { typeLabel } from "./content-visual";
import { ScheduleLoopDialog } from "./ScheduleLoopDialog";
import { ContentPreviewDialog } from "./ContentPreview";
import { loopAudiences, overviewInsights, prepareLoop, sequenceInsights, unenrolledLeads, type PreparedLoop } from "./marketing-intelligence";

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

const sentOf = (s: NurtureSequence) => s.steps.reduce((n, st) => n + st.sent, 0);
const openedOf = (s: NurtureSequence) => s.steps.reduce((n, st) => n + st.opened, 0);

const fmtISO = (iso: string, plusDays = 0) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + plusDays);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const TIME_SHORT: Record<string, string> = { "09:00": "9:00 AM", "13:00": "1:00 PM", "18:00": "6:00 PM" };

export function MarketingZone({ items }: { items: ContentItem[] }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  /* Shared with the Lead Pipeline drawer. In-session only: nothing here reaches a sending service yet. */
  const { loops, paused } = useMarketing();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [prefill, setPrefill] = useState<PreparedLoop | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const audiences = loopAudiences(loops);
  const unenrolled = unenrolledLeads(loops);
  const prepared = audiences.length > 0 ? prepareLoop(items, audiences[0]) : null;
  const insights = overviewInsights(loops, paused, byId);

  function openDialog(loop: PreparedLoop | null) {
    setPrefill(loop);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function scheduleLoop(loop: NurtureSequence) {
    marketing.scheduleLoop(loop);
    setNotice(`“${loop.name}” is scheduled. It starts on ${fmtISO(loop.startsOn ?? "")} for ${loop.leads} lead${loop.leads === 1 ? "" : "s"}.`);
    window.setTimeout(() => setNotice(null), 8000);
  }

  const totalLeads = loops.reduce((n, s) => n + s.leads, 0);
  const totalConverted = loops.reduce((n, s) => n + s.converted, 0);
  const totalSent = loops.reduce((n, s) => n + sentOf(s), 0);
  const totalOpened = loops.reduce((n, s) => n + openedOf(s), 0);

  /* Four questions an advisor asks of their loops, in order:
     is it working → are they being read → what's running → who's being missed. */
  const sending = loops.filter((l) => l.status !== "scheduled" && !paused[l.id]).length;
  const scheduled = loops.filter((l) => l.status === "scheduled" && !paused[l.id]).length;
  const onHold = loops.filter((l) => paused[l.id]).length;
  const hasLoopReady = Boolean(prepared && prepared.steps.length > 0);

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const stats: { label: string; icon: React.ReactNode; value: string; detail: string; cta: string; onCta: () => void; emphasis?: KpiEmphasis }[] = [
    {
      label: "Became clients",
      icon: <UserCheck size={18} strokeWidth={1.75} />,
      value: String(totalConverted),
      detail: `${pct(totalConverted, totalLeads + totalConverted)}% of leads who entered a loop`,
      cta: "See by loop",
      onCta: () => goTo("marketing-loops"),
    },
    {
      label: "Messages opened",
      icon: <MailOpen size={18} strokeWidth={1.75} />,
      value: totalSent > 0 ? `${pct(totalOpened, totalSent)}%` : "—",
      detail: totalSent > 0 ? `${totalOpened} of ${totalSent} messages sent` : "Nothing sent yet",
      cta: "What's working",
      onCta: () => {
        setShowInsights(true);
        goTo("marketing-finny");
      },
    },
    {
      label: "In loops now",
      icon: <Repeat size={18} strokeWidth={1.75} />,
      value: String(totalLeads),
      detail: [`${sending} sending`, scheduled > 0 && `${scheduled} scheduled`, onHold > 0 && `${onHold} paused`].filter(Boolean).join(" · "),
      cta: "View loops",
      onCta: () => goTo("marketing-loops"),
    },
    {
      label: "Not in any loop",
      icon: <UserMinus size={18} strokeWidth={1.75} />,
      value: String(unenrolled.length),
      detail: unenrolled.length === 0 ? "Everyone is covered" : hasLoopReady ? `Finny has a loop ready for ${audiences[0].leads.length} of them` : "No approved content to send them",
      cta: hasLoopReady ? "Review prepared loop" : "Schedule a loop",
      onCta: () => openDialog(hasLoopReady ? prepared : null),
      emphasis: unenrolled.length > 0 ? "warning" : "default",
    },
  ];

  return (
    <section aria-label="Marketing" className="space-y-5">
      {/* ══ What this is — one paragraph, safeguards one click away ══ */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
          <Megaphone size={18} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Marketing — follow-up for leads who didn&apos;t subscribe</h2>
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    aria-label="What's always guaranteed"
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--icon-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)]"
                  >
                    <Info size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                }
              />
              <PopoverContent side="bottom" align="start">
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">Always guaranteed</p>
                <ul className="space-y-1.5">
                  {NURTURE_RULES.map((rule) => (
                    <li key={rule} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-snug">
                      <ShieldCheck size={13} strokeWidth={1.75} className="mt-px text-[var(--icon-status-success)] shrink-0" aria-hidden="true" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 max-w-[720px]">
            Leads who had a discovery call but didn&apos;t subscribe get a short series of approved messages. It stops the moment they subscribe.
          </p>
        </div>
        <Button variant="primary" size="sm" className="shrink-0" leadingIcon={<CalendarClock size={14} strokeWidth={2} />} onClick={() => openDialog(null)}>
          Schedule a loop
        </Button>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-[var(--text-secondary)] empty:hidden">{notice}</p>

      {/* ══ Finny — one row; the extra insights wait behind a toggle ══ */}
      {(prepared && prepared.steps.length > 0) || insights.length > 0 ? (
        <section
          id="marketing-finny"
          aria-label="Finny suggestions for marketing"
          className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] px-4 py-3"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="w-7 h-7 shrink-0 rounded-full bg-[var(--bg-brand-primary)] flex items-center justify-center" aria-hidden="true">
              <Sparkles size={13} strokeWidth={2} className="text-white" />
            </span>

            <div className="min-w-0 flex-1 basis-72">
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                {prepared && prepared.steps.length > 0
                  ? prepared.goal
                    ? `Start a ${prepared.goal.toLowerCase()} follow-up loop for ${audiences[0].leads.length} leads who aren't in any loop yet`
                    : `Start a check-in loop for ${audiences[0].leads.length} leads who have been quiet for 5+ days`
                  : `Finny has ${insights.length} thing${insights.length === 1 ? "" : "s"} to flag`}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--text-tertiary)]">
                {prepared && prepared.steps.length > 0 && <span>{prepared.steps.length} messages prepared from approved content</span>}
                <AIReviewNotice />
                {prepared && prepared.steps.length > 0 && (
                  <FinnyReasoning
                    considered={[
                      "Leads who had a discovery call and haven't subscribed",
                      `Which of them are already in a loop (${unenrolled.length} are not)`,
                      prepared.topicLabel ? `Approved-for-leads content on ${prepared.topicLabel}` : "Approved-for-leads content",
                      "Open rates from your earlier messages",
                    ]}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {insights.length > 0 && prepared && prepared.steps.length > 0 && (
                <Button
                  variant="tertiary"
                  size="sm"
                  aria-expanded={showInsights}
                  trailingIcon={<ChevronDown size={14} strokeWidth={2} className={cn("transition-transform", showInsights && "rotate-180")} />}
                  onClick={() => setShowInsights((v) => !v)}
                >
                  {insights.length} insight{insights.length === 1 ? "" : "s"}
                </Button>
              )}
              {prepared && prepared.steps.length > 0 && (
                <Button variant="primary" size="sm" onClick={() => openDialog(prepared)}>
                  Review prepared loop
                </Button>
              )}
            </div>
          </div>

          {insights.length > 0 && (showInsights || !(prepared && prepared.steps.length > 0)) && (
            <InsightList insights={insights} className="mt-2 border-t border-[var(--border-brand-tint)] pt-1 divide-[var(--border-brand-tint)]" />
          )}
        </section>
      ) : null}

      <ScheduleLoopDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        items={items}
        audiences={audiences}
        initial={prefill}
        onSchedule={scheduleLoop}
      />

      {/* ══ KPIs — same cards as Meetings and Reports ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => (
          <KpiCard key={st.label} icon={st.icon} label={st.label} value={st.value} detail={st.detail} cta={st.cta} onCta={st.onCta} emphasis={st.emphasis} />
        ))}
      </div>

      {/* ══ Sequences — one list ══ */}
      <div id="marketing-loops" className="scroll-mt-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
          Sequences <span className="font-normal text-[var(--text-tertiary)]">· {loops.length}</span>
        </h3>
        <ul className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] divide-y divide-[var(--border-tertiary)]">
          {loops.map((seq) => (
            <SequenceRow
              key={seq.id}
              seq={seq}
              byId={byId}
              isPaused={Boolean(paused[seq.id])}
              otherLoops={loops.filter((l) => l.id !== seq.id)}
              onPausedChange={(v) => marketing.setLoopPaused(seq.id, v)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── One sequence: a summary row that opens into its schedule ─── */

function SequenceRow({
  seq,
  byId,
  isPaused,
  otherLoops,
  onPausedChange,
}: {
  seq: NurtureSequence;
  byId: Map<string, ContentItem>;
  isPaused: boolean;
  otherLoops: NurtureSequence[];
  onPausedChange: (paused: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `seq-${seq.id}`;

  return (
    <li>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 basis-64 items-center gap-2 text-left rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)]"
        >
          <ChevronDown size={16} strokeWidth={2} className={cn("shrink-0 text-[var(--icon-tertiary)] transition-transform", !open && "-rotate-90")} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{seq.name}</span>
            <span className="block truncate text-xs text-[var(--text-tertiary)]">{seq.audience}</span>
          </span>
        </button>

        <dl className="flex items-center gap-6">
          <RowStat label="Leads" value={String(seq.leads)} />
          {seq.status === "scheduled" && seq.startsOn ? (
            <RowStat label="Starts" value={`${fmtISO(seq.startsOn)}, ${TIME_SHORT[seq.sendTime ?? "09:00"] ?? ""}`} />
          ) : (
            <>
              <RowStat label="Opened" value={sentOf(seq) > 0 ? `${pct(openedOf(seq), sentOf(seq))}%` : "—"} />
              <RowStat label="Became clients" value={String(seq.converted)} />
            </>
          )}
        </dl>

        <Switch size="sm" checked={!isPaused} onCheckedChange={(on) => onPausedChange(!on)} aria-label={`${seq.name}: ${isPaused ? "paused" : seq.status === "scheduled" ? "scheduled" : "sending"}`}>
          <span className="text-sm font-medium text-[var(--text-primary)] w-[72px] inline-block">{isPaused ? "Paused" : seq.status === "scheduled" ? "Scheduled" : "Sending"}</span>
        </Switch>
      </div>

      {open && (
        <div id={panelId} className="border-t border-[var(--border-tertiary)] bg-[var(--bg-subtle)] px-4 py-4">
          <SequenceDetail seq={seq} byId={byId} isPaused={isPaused} otherLoops={otherLoops} />
        </div>
      )}
    </li>
  );
}

function RowStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-tertiary)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{value}</dd>
    </div>
  );
}

/* ─── What goes out, and when. Leads are one click further. ─── */

function SequenceDetail({ seq, byId, isPaused, otherLoops }: { seq: NurtureSequence; byId: Map<string, ContentItem>; isPaused: boolean; otherLoops: NurtureSequence[] }) {
  const [showLeads, setShowLeads] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const steps = seq.steps.map((s) => ({ ...s, item: byId.get(s.contentId) }));
  const blocked = steps.filter((s) => !s.item || !isSendableToLeads(s.item));
  const readOut = sequenceInsights(seq, (id) => byId.get(id)?.title ?? "This message");

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">{seq.description}</p>

      {isPaused && (
        <p role="status" className="text-xs text-[var(--text-secondary)]">
          Paused — no messages go out. Switch it back on to carry on from the next message.
        </p>
      )}

      {/* Schedule: day, what, how it did */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">Schedule</h4>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Days are counted from the day the lead joins.</p>
        <ol className="mt-2 divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)]">
          {steps.map((s) => {
            const ok = s.item && isSendableToLeads(s.item);
            return (
              <li key={`${seq.id}-${s.day}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <span className="w-14 shrink-0 text-xs font-semibold text-[var(--text-secondary)] tabular-nums">Day {s.day}</span>
                <span className="min-w-0 flex-1 basis-48">
                  {s.item ? (
                    <button
                      type="button"
                      onClick={() => setPreviewItem(s.item!)}
                      className="block max-w-full truncate text-left text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-brand)] rounded-sm"
                      aria-label={`Preview ${s.item.title}`}
                    >
                      {s.item.title}
                    </button>
                  ) : (
                    <span className="block truncate text-sm font-medium text-[var(--text-primary)]">Content unavailable</span>
                  )}
                  {s.item && <span className="block text-xs text-[var(--text-tertiary)]">{typeLabel(s.item)}</span>}
                </span>
                {ok && seq.status === "scheduled" && seq.startsOn ? (
                  <span className="text-xs text-[var(--text-secondary)] tabular-nums">Goes out {fmtISO(seq.startsOn, s.day - 1)}</span>
                ) : ok ? (
                  <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                    {s.sent} sent · {pct(s.opened, s.sent)}% opened
                  </span>
                ) : (
                  <Badge size="sm" color="warning">
                    {s.item ? (holdReason(s.item, "leads") ?? "Not for leads") : "Content unavailable"}
                  </Badge>
                )}
              </li>
            );
          })}
        </ol>
        {blocked.length > 0 && (
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            {blocked.length === 1 ? "One message is" : `${blocked.length} messages are`} on hold until approved and written for leads. The sequence skips{" "}
            {blocked.length === 1 ? "it" : "them"} until then.
          </p>
        )}
      </div>

      {/* What Finny sees in this loop's own results */}
      {seq.status !== "scheduled" && readOut.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">What Finny sees</h4>
          <InsightList insights={readOut} className="mt-1" />
        </div>
      )}

      <ContentPreviewDialog item={previewItem} open={previewItem !== null} onOpenChange={(o) => !o && setPreviewItem(null)} />

      {/* Leads — hidden until asked for */}
      <div>
        <button
          type="button"
          aria-expanded={showLeads}
          onClick={() => setShowLeads((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-brand-primary)] hover:underline"
        >
          {showLeads ? "Hide leads" : `Show and manage the ${seq.leads} leads in this sequence`}
          <ChevronDown size={14} strokeWidth={2} className={cn("transition-transform", showLeads && "rotate-180")} aria-hidden="true" />
        </button>
        {showLeads && (
          <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
            <LoopLeadsTable seq={seq} loopPaused={isPaused} byId={byId} otherLoops={otherLoops} />
          </div>
        )}
      </div>
    </div>
  );
}
