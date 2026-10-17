"use client";

/* ============================================================
   ReviewQueue — AI-suggested sends waiting for the advisor

   The first thing on the page, because it is the only thing that
   needs a decision. Every item shows who it is for, what triggered
   it, the evidence Finny saw and the content it suggests. The
   advisor approves, edits in the composer, or dismisses (with an
   optional reason). Nothing is sent without that decision, and
   every decision is logged.

   Sourcing: Fincaree Avatar, Badge, Button, Input, Textarea.
   ============================================================ */

import { useState } from "react";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge, type BadgeColor } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Input } from "@/components/fincaree/input";
import { Textarea } from "@/components/fincaree/textarea";
import { CheckCircle2, Info, PenLine, ShieldCheck, Sparkles, X } from "lucide-react";
import type { Client, ContentItem } from "./content-data";
import {
  CONTENT_INTENT_LABEL,
  SEND_TRIGGER_LABEL,
  SKIPPED_TRIGGERS,
  adviceLanguage,
  holdReason,
  contentIntent,
  isSendableToClients,
  type ReviewQueueItem,
  type SendTrigger,
} from "./delivery-data";
import { typeLabel } from "./content-visual";

const TRIGGER_COLOR: Record<SendTrigger, BadgeColor> = {
  "meeting-follow-up": "brand",
  "client-query": "gray-blue",
  "difficulty-detected": "warning",
  "portfolio-drop": "warning",
};

export interface ResolvedSend {
  id: string;
  clientName: string;
  trigger: SendTrigger;
  outcome: "sent" | "dismissed";
  detail: string;
}

interface ReviewQueueProps {
  pending: ReviewQueueItem[];
  resolved: ResolvedSend[];
  items: ContentItem[];
  clients: Client[];
  onApprove: (q: ReviewQueueItem, message: string) => void;
  onEdit: (q: ReviewQueueItem, message: string) => void;
  onDismiss: (q: ReviewQueueItem, reason: string) => void;
}

export function ReviewQueue({ pending, resolved, items, clients, onApprove, onEdit, onDismiss }: ReviewQueueProps) {
  return (
    <section aria-label="Review queue" className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Waiting for your approval
            <span className="text-[var(--text-tertiary)] font-normal"> · {pending.length}</span>
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5 max-w-[640px]">
            Finny suggests these sends for subscribed clients. Nothing goes out until you approve it, and every decision is logged.
          </p>
        </div>
      </div>

      {SKIPPED_TRIGGERS.map((s) => (
        <div
          key={s.id}
          className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-4 py-3"
        >
          <Info size={15} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {SEND_TRIGGER_LABEL[s.trigger]} for {s.clientName} was not queued.
            </span>{" "}
            {s.reason}.
          </p>
        </div>
      ))}

      {pending.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-6">
          <CheckCircle2 size={18} strokeWidth={1.75} className="text-[var(--icon-status-success)] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">You&apos;re all caught up</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">No suggested sends are waiting for review.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {pending.map((q) => (
            <li key={q.id}>
              <ReviewCard q={q} items={items} clients={clients} onApprove={onApprove} onEdit={onEdit} onDismiss={onDismiss} />
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Resolved this session</h3>
          <ul className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] divide-y divide-[var(--border-tertiary)]">
            {resolved.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {r.clientName} <span className="font-normal text-[var(--text-tertiary)]">· {SEND_TRIGGER_LABEL[r.trigger]}</span>
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{r.detail}</p>
                </div>
                <Badge size="sm" color={r.outcome === "sent" ? "success" : "gray"}>
                  {r.outcome === "sent" ? "Sent" : "Dismissed"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════════════════════════ */
function ReviewCard({
  q,
  items,
  clients,
  onApprove,
  onEdit,
  onDismiss,
}: {
  q: ReviewQueueItem;
  items: ContentItem[];
  clients: Client[];
  onApprove: (q: ReviewQueueItem, message: string) => void;
  onEdit: (q: ReviewQueueItem, message: string) => void;
  onDismiss: (q: ReviewQueueItem, reason: string) => void;
}) {
  const client = clients.find((c) => c.id === q.clientId);
  const [message, setMessage] = useState(q.message);
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState("");

  const content = q.contentIds.map((id) => items.find((i) => i.id === id)).filter((i): i is ContentItem => Boolean(i));
  const sendable = content.filter(isSendableToClients);
  const held = content.length - sendable.length;
  const advice = adviceLanguage(message);

  const blocker = advice
    ? `This message reads like a recommendation (“${advice}”). Issue it through the Advice flow, or reword it as education.`
    : sendable.length === 0
      ? "None of the suggested content can be sent yet."
      : null;

  const approveLabel = held > 0 ? `Approve & send ${sendable.length} of ${content.length}` : "Approve & send";

  return (
    <article
      aria-label={`Suggested send for ${client?.name ?? "client"}`}
      className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)]"
    >
      {/* Who, why now */}
      <header className="flex items-start justify-between gap-3 flex-wrap px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar size="md" initials={client?.initials ?? "?"} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {client?.name ?? "Client"} <span className="font-normal text-[var(--text-tertiary)]">· {client?.plan} plan</span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{q.raisedAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge size="sm" color={TRIGGER_COLOR[q.trigger]}>
            {SEND_TRIGGER_LABEL[q.trigger]}
          </Badge>
          <Badge size="sm" color="gray-blue" leadingIcon={<Sparkles size={11} strokeWidth={2} />}>
            AI-suggested
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5 px-5 pb-4">
        {/* Evidence + suggested content */}
        <div className="space-y-4 min-w-0">
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">What Finny saw</h3>
            <ul className="space-y-1">
              {q.evidence.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span aria-hidden="true" className="mt-2 w-1 h-1 rounded-full bg-[var(--icon-tertiary)] shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
            {q.trigger === "portfolio-drop" && (
              <p className="flex items-start gap-1.5 text-xs text-[var(--text-tertiary)] mt-2">
                <ShieldCheck size={13} strokeWidth={1.75} className="shrink-0 mt-0.5" />
                Calm, educational content only — a message at the moment of a fall can read as advice, so it always needs your approval.
              </p>
            )}
          </div>

          {/* Suggested content */}
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Suggested content</h3>
            <ul className="divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)]">
              {content.map((item) => {
                const hold = holdReason(item, "clients");
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.title}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{typeLabel(item)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hold ? (
                        <Badge size="sm" color="warning">
                          {hold}
                        </Badge>
                      ) : (
                        <Badge size="sm" color={contentIntent(item) === "explore" ? "brand" : "gray"}>
                          {CONTENT_INTENT_LABEL[contentIntent(item)]}
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {held > 0 && sendable.length > 0 && (
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                Held content stays out of this send. Only Approved content written for clients can go to a client.
              </p>
            )}
          </div>
        </div>

        {/* Message: the one thing the advisor writes, so it gets its own column */}
        <div className="min-w-0">
          <Textarea
            label="Message to the client"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={advice ? blocker ?? undefined : undefined}
          />
        </div>
      </div>

      {/* Decision */}
      <footer className="border-t border-[var(--border-tertiary)] px-5 py-3">
        {dismissing ? (
          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <Input
                label="Reason for dismissing (optional)"
                size="sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="For example: already discussed on a call"
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => onDismiss(q, reason.trim())}>
              Confirm dismiss
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => setDismissing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-[var(--text-tertiary)]">
              {blocker && !advice ? blocker : "Sent through the client portal, with this send recorded in the log."}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="tertiary" size="sm" leadingIcon={<X size={14} strokeWidth={2} />} onClick={() => setDismissing(true)}>
                Dismiss
              </Button>
              <Button variant="secondary" size="sm" leadingIcon={<PenLine size={14} strokeWidth={1.75} />} onClick={() => onEdit(q, message)}>
                Edit in composer
              </Button>
              <Button variant="primary" size="sm" disabled={Boolean(blocker)} onClick={() => onApprove(q, message)}>
                {approveLabel}
              </Button>
            </div>
          </div>
        )}
      </footer>
    </article>
  );
}
