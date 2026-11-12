"use client";

/* ============================================================
   SendWorkspace — Review queue and Compose & send as one screen

   Left     The queue: a compact list, one row per AI-suggested send
            (client, trigger, how long ago, how many items). It stays
            one line per suggestion however many are waiting, and the
            list scrolls on its own. "New send" starts a blank package.
   Right    The composer. Picking a queue row loads that suggestion
            into it, pre-filled, under a short context bar: who it is
            for, why Finny raised it, and the decision (approve as it
            is, or dismiss). Changing the content and sending from the
            composer resolves the suggestion too. Nothing is sent
            without that decision, and every decision is logged.

   Sourcing: Fincaree Avatar, Badge, Button.
   ============================================================ */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { CheckCircle2, ChevronDown, Info, Plus } from "lucide-react";
import type { Client, ContentItem } from "./content-data";
import {
  SEND_TRIGGER_LABEL,
  SKIPPED_TRIGGERS,
  type ReviewQueueItem,
} from "./delivery-data";
import type { ResolvedSend } from "./ReviewQueue";
import { SequenceBuilder, type SequenceSendPayload } from "./SequenceBuilder";

interface SendWorkspaceProps {
  pending: ReviewQueueItem[];
  resolved: ResolvedSend[];
  items: ContentItem[];
  clients: Client[];
  /** The suggestion loaded in the composer, if any. */
  activeId: string | null;
  seed: React.ComponentProps<typeof SequenceBuilder>["seed"];
  onSelect: (q: ReviewQueueItem) => void;
  onNew: () => void;
  onEditSimulation: (item: ContentItem) => void;
  onSend: (payload: SequenceSendPayload) => void;
}

export function SendWorkspace({
  pending,
  resolved,
  items,
  clients,
  activeId,
  seed,
  onSelect,
  onNew,
  onEditSimulation,
  onSend,
}: SendWorkspaceProps) {
  return (
    <div className="flex flex-col gap-4 xl:grid xl:h-full xl:grid-cols-[280px_minmax(0,1fr)]">
      <QueueRail
        pending={pending}
        resolved={resolved}
        clients={clients}
        activeId={activeId}
        onSelect={onSelect}
        onNew={onNew}
      />

      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <div className="xl:flex-1 xl:min-h-0 xl:[&>section]:h-full">
          <SequenceBuilder
            items={items}
            clients={clients}
            seed={seed}
            columnsClassName="xl:grid-cols-[352px_minmax(0,1fr)_300px]"
            onEditSimulation={onEditSimulation}
            onSend={onSend}
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Queue rail
   ════════════════════════════════════════════════ */
function QueueRail({
  pending,
  resolved,
  clients,
  activeId,
  onSelect,
  onNew,
}: {
  pending: ReviewQueueItem[];
  resolved: ResolvedSend[];
  clients: Client[];
  activeId: string | null;
  onSelect: (q: ReviewQueueItem) => void;
  onNew: () => void;
}) {
  const [showResolved, setShowResolved] = useState(false);

  return (
    <aside
      aria-label="Content assign queue"
      className="flex flex-col min-h-0 max-h-[360px] xl:max-h-none overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)]"
    >
      <div className="shrink-0 px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Content assign queue
          <span className="font-normal text-[var(--text-tertiary)]"> · {pending.length}</span>
        </h2>
        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Pick a client to assign content to, or start a new one.</p>
        <Button variant="secondary" size="sm" className="mt-3 w-full" leadingIcon={<Plus size={14} strokeWidth={2} />} onClick={onNew}>
          Assign content
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto border-t border-[var(--border-tertiary)]">
        {pending.length === 0 ? (
          <div className="flex items-start gap-2.5 px-4 py-5">
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-[var(--icon-status-success)] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">You&apos;re all caught up</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">No content is waiting to be assigned.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-tertiary)]">
            {pending.map((q) => {
              const client = clients.find((c) => c.id === q.clientId);
              const selected = q.id === activeId;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(q)}
                    className={cn(
                      "relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--border-brand-primary)]",
                      selected ? "bg-[var(--bg-brand-subtle)]" : "hover:bg-[var(--bg-secondary)]"
                    )}
                  >
                    {/* The selected row is marked by a solid bar on its edge, and its avatar and count switch
                        to white, so nothing grey sits on the green wash and fades into it. */}
                    {selected && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--bg-brand-primary)]" />}
                    <Avatar size="sm" initials={client?.initials ?? "?"} className={selected ? "bg-[var(--bg-primary)] ring-1 ring-[var(--border-brand-secondary)]" : undefined} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--text-primary)] truncate">
                        {client?.name ?? "Client"}
                      </span>
                      <span className="block text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                        {SEND_TRIGGER_LABEL[q.trigger]} · {q.raisedAt}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        selected
                          ? "bg-[var(--bg-primary)] text-[var(--text-brand-primary)] border border-[var(--border-brand-secondary)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                      )}
                    >
                      {q.contentIds.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {SKIPPED_TRIGGERS.length > 0 && (
          <ul className="space-y-2 border-t border-[var(--border-tertiary)] px-4 py-3">
            {SKIPPED_TRIGGERS.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-xs text-[var(--text-tertiary)]">
                <Info size={13} strokeWidth={1.75} className="shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-[var(--text-secondary)]">
                    {SEND_TRIGGER_LABEL[s.trigger]} for {s.clientName} was not queued.
                  </span>{" "}
                  {s.reason}.
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {resolved.length > 0 && (
        <div className="shrink-0 border-t border-[var(--border-tertiary)]">
          <button
            type="button"
            aria-expanded={showResolved}
            onClick={() => setShowResolved((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Resolved this session · {resolved.length}
            <ChevronDown size={14} strokeWidth={1.75} className={cn("transition-transform", showResolved && "rotate-180")} />
          </button>
          {showResolved && (
            <ul className="max-h-48 overflow-y-auto divide-y divide-[var(--border-tertiary)] border-t border-[var(--border-tertiary)]">
              {resolved.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-[var(--text-primary)] truncate">{r.clientName}</span>
                    <span className="block text-xs text-[var(--text-tertiary)] truncate">{r.detail}</span>
                  </span>
                  <Badge size="sm" color={r.outcome === "sent" ? "success" : "gray"}>
                    {r.outcome === "sent" ? "Sent" : "Dismissed"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
