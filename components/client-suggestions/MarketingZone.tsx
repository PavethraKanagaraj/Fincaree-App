"use client";

/* ============================================================
   Marketing — follow-up for leads who did not convert

   A lead is someone who had a discovery call but has not
   subscribed. A sequence sends them a few approved messages on
   set days, and stops by itself when they subscribe.

   Layout: what this is and how it works → totals → a searchable
   list of sequences beside the one you're looking at (schedule,
   results, a filterable, paged table of its leads) → safeguards.
   Built for many sequences and many leads: the list and the table
   search, filter and scroll or page instead of growing the page.

   Sourcing: Fincaree Badge, Switch, ui/table.
   ============================================================ */

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Input } from "@/components/fincaree/input";
import { Switch } from "@/components/fincaree/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/fincaree/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ban, CalendarClock, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Megaphone, MessageSquareText, PhoneCall, Search, ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ContentItem } from "./content-data";
import { NURTURE_RULES, NURTURE_SEQUENCES, holdReason, isSendableToLeads, type NurtureSequence } from "./delivery-data";
import { getTypeVisual, typeLabel } from "./content-visual";

const LEADS_PER_PAGE = 8;
type LeadFilter = "all" | "waiting" | "finished";
type SeqFilter = "all" | "sending" | "paused";

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

const HOW_IT_WORKS = [
  { icon: PhoneCall, title: "Discovery call", body: "The lead talks to an advisor but doesn't subscribe." },
  { icon: MessageSquareText, title: "Joins a sequence", body: "They're matched to one by what the call was about." },
  { icon: CalendarClock, title: "Messages go out", body: "Approved content is sent on the days you set." },
  { icon: UserCheck, title: "Stops on subscribing", body: "Once they subscribe, the messages stop on their own." },
];

export function MarketingZone({ items }: { items: ContentItem[] }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const [selectedId, setSelectedId] = useState(NURTURE_SEQUENCES[0].id);
  /* Local for now: pausing here doesn't reach a sending service yet. */
  const [paused, setPaused] = useState<Record<string, boolean>>(
    Object.fromEntries(NURTURE_SEQUENCES.map((s) => [s.id, s.status === "paused"])),
  );

  const [seqQuery, setSeqQuery] = useState("");
  const [seqFilter, setSeqFilter] = useState<SeqFilter>("all");
  const [showHow, setShowHow] = useState(true);

  const visibleSeqs = NURTURE_SEQUENCES.filter(
    (sq) =>
      sq.name.toLowerCase().includes(seqQuery.trim().toLowerCase()) &&
      (seqFilter === "all" || (seqFilter === "paused") === Boolean(paused[sq.id])),
  );

  const selected = NURTURE_SEQUENCES.find((s) => s.id === selectedId) ?? NURTURE_SEQUENCES[0];
  const activeCount = NURTURE_SEQUENCES.filter((s) => !paused[s.id]).length;
  const totalLeads = NURTURE_SEQUENCES.reduce((n, s) => n + s.leads, 0);
  const totalConverted = NURTURE_SEQUENCES.reduce((n, s) => n + s.converted, 0);
  const allSteps = NURTURE_SEQUENCES.flatMap((s) => s.steps);
  const totalSent = allSteps.reduce((n, st) => n + st.sent, 0);
  const totalOpened = allSteps.reduce((n, st) => n + st.opened, 0);

  const stats = [
    { label: "Leads in sequences", value: String(totalLeads), hint: "across all sequences" },
    { label: "Sequences sending", value: `${activeCount} of ${NURTURE_SEQUENCES.length}`, hint: "the rest are paused" },
    { label: "Messages sent", value: String(totalSent), hint: `${pct(totalOpened, totalSent)}% were opened` },
    { label: "Became clients", value: String(totalConverted), hint: `${pct(totalConverted, totalLeads + totalConverted)}% of all leads` },
  ];

  return (
    <section aria-label="Marketing" className="space-y-6">
      {/* ══ What this is ══ */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
          <Megaphone size={18} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Marketing — follow-up for leads who didn&apos;t subscribe</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 max-w-[720px]">
            After a discovery call, a lead can join a short series of messages that builds trust over a few weeks. This is separate from content
            you send to subscribed clients. Nothing here reaches a client, and client content is never used for marketing.
          </p>
        </div>
      </div>

      <div>
        <button
          type="button"
          aria-expanded={showHow}
          onClick={() => setShowHow((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-brand-primary)] hover:underline"
        >
          How it works
          <ChevronDown size={14} strokeWidth={2} className={cn("transition-transform", showHow && "rotate-180")} aria-hidden="true" />
        </button>
        <ol hidden={!showHow} aria-label="How it works" className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-secondary)] tabular-nums border border-[var(--border-tertiary)]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                  <step.icon size={14} strokeWidth={1.75} className="text-[var(--icon-secondary)]" aria-hidden="true" />
                  {step.title}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ══ Totals ══ */}
      <dl className="grid grid-cols-2 xl:grid-cols-4 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] divide-x divide-y xl:divide-y-0 divide-[var(--border-tertiary)]">
        {stats.map((st) => (
          <div key={st.label} className="px-5 py-4">
            <dt className="text-xs font-medium text-[var(--text-tertiary)]">{st.label}</dt>
            <dd className="text-xl font-bold text-[var(--text-primary)] tabular-nums mt-1">{st.value}</dd>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{st.hint}</p>
          </div>
        ))}
      </dl>

      {/* ══ Sequences: list + detail ══ */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Sequences <span className="font-normal text-[var(--text-tertiary)]">· {NURTURE_SEQUENCES.length}</span>
          </h3>
          <Input
            size="sm"
            aria-label="Search sequences"
            placeholder="Search sequences…"
            value={seqQuery}
            onChange={(e) => setSeqQuery(e.target.value)}
            leadingIcon={<Search size={14} strokeWidth={1.75} />}
          />
          <Tabs value={seqFilter} onValueChange={(v) => setSeqFilter(v as SeqFilter)} variant="pill">
            <TabsList aria-label="Filter sequences" className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="sending" className="flex-1">Sending</TabsTrigger>
              <TabsTrigger value="paused" className="flex-1">Paused</TabsTrigger>
            </TabsList>
          </Tabs>
          <ul className="relative max-h-[420px] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] divide-y divide-[var(--border-tertiary)]">
            {visibleSeqs.map((seq) => {
              const isPaused = paused[seq.id];
              const on = seq.id === selected.id;
              return (
                <li key={seq.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelectedId(seq.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors",
                      on ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{seq.name}</span>
                      <span className="block text-xs text-[var(--text-tertiary)] tabular-nums">
                        {seq.leads} leads · {seq.steps.length} messages
                      </span>
                    </span>
                    <Badge size="sm" color={isPaused ? "gray" : "success"}>
                      {isPaused ? "Paused" : "Sending"}
                    </Badge>
                  </button>
                </li>
              );
            })}
            {visibleSeqs.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">No sequences match.</li>
            )}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <SequenceDetail
            key={selected.id}
            seq={selected}
            byId={byId}
            isPaused={paused[selected.id]}
            onPausedChange={(v) => setPaused((p) => ({ ...p, [selected.id]: v }))}
          />

        {/* ══ Safeguards ══ */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Built-in safeguards</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Every sequence follows these. You can&apos;t switch them off.</p>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {NURTURE_RULES.map((rule) => (
              <li key={rule} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <ShieldCheck size={14} strokeWidth={1.75} className="text-[var(--icon-status-success)] shrink-0" aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>
    </section>
  );
}

/* ─── One sequence, in full ─── */

function SequenceDetail({
  seq,
  byId,
  isPaused,
  onPausedChange,
}: {
  seq: NurtureSequence;
  byId: Map<string, ContentItem>;
  isPaused: boolean;
  onPausedChange: (paused: boolean) => void;
}) {
  const steps = seq.steps.map((s) => ({ ...s, item: byId.get(s.contentId) }));
  const blocked = steps.filter((s) => !s.item || !isSendableToLeads(s.item));
  const maxSent = Math.max(...steps.map((s) => s.sent), 1);

  const [leadQuery, setLeadQuery] = useState("");
  const [leadFilter, setLeadFilter] = useState<LeadFilter>("all");
  const [page, setPage] = useState(0);
  const filteredLeads = seq.leadList.filter(
    (l) =>
      l.name.toLowerCase().includes(leadQuery.trim().toLowerCase()) &&
      (leadFilter === "all" || (leadFilter === "finished") === l.sentCount >= seq.steps.length),
  );
  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const from = safePage * LEADS_PER_PAGE;
  const pageLeads = filteredLeads.slice(from, from + LEADS_PER_PAGE);

  return (
    <article aria-label={seq.name} className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)]">
      {/* Header: what it is, and the one control */}
      <header className="flex items-start justify-between gap-4 flex-wrap px-5 py-4 border-b border-[var(--border-tertiary)]">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{seq.name}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{seq.description}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Who joins: {seq.audience}</p>
        </div>
        <Switch size="sm" checked={!isPaused} onCheckedChange={(on) => onPausedChange(!on)}>
          <span className="text-sm font-medium text-[var(--text-primary)]">{isPaused ? "Paused" : "Sending"}</span>
        </Switch>
      </header>

      {isPaused && (
        <p role="status" className="px-5 py-2.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-b border-[var(--border-tertiary)]">
          Paused — no messages go out and leads stay where they are. Switch it back on to carry on from the next message.
        </p>
      )}

      {/* Schedule: what goes out, when, and how it did */}
      <div className="px-5 py-4">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">Schedule</h4>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Days are counted from the day the lead joins.</p>

        <ol className="mt-3">
          {steps.map((s, i) => {
            const ok = s.item && isSendableToLeads(s.item);
            const v = s.item ? getTypeVisual(s.item) : null;
            return (
              <li key={`${seq.id}-${s.day}`} className="relative flex gap-4 pb-5 last:pb-0">
                {i < steps.length - 1 && (
                  <span aria-hidden="true" className="absolute left-7 top-9 bottom-0 w-px bg-[var(--border-tertiary)]" />
                )}
                <span className="flex h-7 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                  Day {s.day}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      {v && (
                        <span className={cn("w-6 h-6 shrink-0 rounded-[var(--radius-sm)] flex items-center justify-center", v.bgColor, v.iconColor)} aria-hidden="true">
                          {v.icon}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{s.item?.title ?? "Content unavailable"}</p>
                        {s.item && <p className="text-xs text-[var(--text-tertiary)]">{typeLabel(s.item)}</p>}
                      </div>
                    </div>
                    {ok ? (
                      <Badge size="sm" color="success" leadingIcon={<CheckCircle2 size={11} strokeWidth={2} />}>
                        Approved for leads
                      </Badge>
                    ) : (
                      <Badge size="sm" color="warning" leadingIcon={<Ban size={11} strokeWidth={2} />}>
                        {s.item ? (holdReason(s.item, "leads") ?? "Not for leads") : "Content unavailable"}
                      </Badge>
                    )}
                  </div>

                  {/* Results: how far it got and how many opened it */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <div
                      role="img"
                      aria-label={`${s.sent} sent, ${s.opened} opened`}
                      className="h-1.5 flex-1 max-w-[220px] overflow-hidden rounded-full bg-[var(--bg-tertiary)]"
                    >
                      <div className="h-full rounded-full bg-[var(--bg-brand-primary)]" style={{ width: `${pct(s.sent, maxSent)}%` }} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                      {s.sent} sent · {s.opened} opened ({pct(s.opened, s.sent)}%)
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="text-xs text-[var(--text-tertiary)] mt-4">
          {blocked.length > 0
            ? `${blocked.length} message${blocked.length === 1 ? "" : "s"} can't go out until it's Approved and written for leads — the sequence skips ${blocked.length === 1 ? "it" : "them"} until then.`
            : "Every message is Approved and written for leads."}
        </p>
      </div>

      {/* Leads inside: search, filter and page, so it stays usable at any size */}
      <div className="border-t border-[var(--border-tertiary)]">
        <div className="flex items-end justify-between gap-3 flex-wrap px-5 pt-4 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Leads in this sequence <span className="font-normal text-[var(--text-tertiary)]">· {seq.leads}</span>
            </h4>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {seq.converted} lead{seq.converted === 1 ? "" : "s"} from this sequence became clients and left it.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-[200px]">
              <Input
                size="sm"
                aria-label="Search leads"
                placeholder="Search leads…"
                value={leadQuery}
                onChange={(e) => {
                  setLeadQuery(e.target.value);
                  setPage(0);
                }}
                leadingIcon={<Search size={14} strokeWidth={1.75} />}
              />
            </div>
            <Tabs
              value={leadFilter}
              onValueChange={(v) => {
                setLeadFilter(v as LeadFilter);
                setPage(0);
              }}
              variant="pill"
            >
              <TabsList aria-label="Filter leads">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="waiting">In progress</TabsTrigger>
                <TabsTrigger value="finished">Finished</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-2.5 text-xs text-[var(--text-tertiary)] font-medium">Lead</TableHead>
              <TableHead className="px-3 py-2.5 text-xs text-[var(--text-tertiary)] font-medium w-28">Joined</TableHead>
              <TableHead className="px-3 py-2.5 text-xs text-[var(--text-tertiary)] font-medium w-40">Messages sent</TableHead>
              <TableHead className="px-3 pr-5 py-2.5 text-xs text-[var(--text-tertiary)] font-medium w-36">Next message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageLeads.map((lead) => {
              const done = lead.sentCount >= seq.steps.length;
              return (
                <TableRow key={lead.id}>
                  <TableCell className="px-5 py-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{lead.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{lead.source}</p>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-[var(--text-secondary)] tabular-nums">{lead.joined}</TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                        <span
                          className="block h-full rounded-full bg-[var(--bg-brand-primary)]"
                          style={{ width: `${pct(lead.sentCount, seq.steps.length)}%` }}
                        />
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] tabular-nums whitespace-nowrap">
                        {lead.sentCount} of {seq.steps.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 pr-5 py-3 text-sm text-[var(--text-secondary)] tabular-nums">
                    {done ? "Finished" : isPaused ? "On hold" : (lead.nextSend ?? "On hold")}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-8 text-center text-sm text-[var(--text-tertiary)]">
                  No leads match.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--border-tertiary)]">
          <p aria-live="polite" className="text-xs text-[var(--text-secondary)] tabular-nums">
            {filteredLeads.length === 0 ? "0 leads" : `Showing ${from + 1}–${from + pageLeads.length} of ${filteredLeads.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" iconOnly aria-label="Previous page" leadingIcon={<ChevronLeft size={14} strokeWidth={2} />} disabled={safePage === 0} onClick={() => setPage(safePage - 1)} />
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              Page {safePage + 1} of {pageCount}
            </span>
            <Button variant="secondary" size="sm" iconOnly aria-label="Next page" leadingIcon={<ChevronRight size={14} strokeWidth={2} />} disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} />
          </div>
        </div>
      </div>
    </article>
  );
}
