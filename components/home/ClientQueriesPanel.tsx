"use client";

/* ============================================================
   ClientQueriesPanel — pending client questions with an inline
   reply box, same "local state only, no backend simulated"
   pattern as the Meeting Desk drawer's Advisor Notes: typing and
   sending updates this session's view, there's no queries API to
   call (AGENT.md — "do not simulate APIs/databases").
   ============================================================ */

import { useState } from "react";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Textarea } from "@/components/fincaree/textarea";
import { CLIENT_QUERIES, type ClientQuery } from "./home-data";

/** Collapsed by default to the first 3 — the pending ones, since
    CLIENT_QUERIES is already ordered unanswered-first — so the card
    stays compact without hiding what actually needs a reply. */
const COLLAPSED_COUNT = 3;

function QueryRow({
  query,
  answer,
  onAnswer,
}: {
  query: ClientQuery;
  answer?: string;
  onAnswer: (reply: string) => void;
}) {
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const sent = answer;

  function send() {
    const trimmed = reply.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
    setReplying(false);
  }

  function cancel() {
    setReplying(false);
    setReply("");
  }

  return (
    <div className="py-2.5">
      <div className="flex items-start gap-2.5">
        <Avatar size="xs" initials={query.initials} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{query.clientName}</span>
              <span className="text-xs text-[var(--text-tertiary)]">{query.date}</span>
            </div>
            {!sent && !replying && (
              <Button variant="secondary" size="sm" className="shrink-0" onClick={() => setReplying(true)}>
                Reply
              </Button>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-snug mt-0.5">{query.question}</p>
          {sent ? (
            <p className="text-xs text-[var(--text-tertiary)] border-l border-[var(--border-secondary)] pl-2.5 mt-1.5 leading-relaxed">
              {sent}
            </p>
          ) : replying ? (
            <div className="mt-1.5">
              <Textarea
                rows={1}
                autoFocus
                placeholder={`Reply to ${query.clientName.split(" ")[0]}...`}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                aria-label={`Reply to ${query.clientName}`}
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <Button variant="primary" size="sm" disabled={!reply.trim()} onClick={send}>
                  Send
                </Button>
                <Button variant="tertiary" size="sm" onClick={cancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ClientQueriesPanel() {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const q of CLIENT_QUERIES) {
      if (q.status === "answered" && q.reply) initial[q.id] = q.reply;
    }
    return initial;
  });
  const [expanded, setExpanded] = useState(false);

  const pendingCount = CLIENT_QUERIES.filter((q) => !answers[q.id]).length;
  const visibleQueries = expanded ? CLIENT_QUERIES : CLIENT_QUERIES.slice(0, COLLAPSED_COUNT);

  return (
    <section id="client-queries" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 scroll-mt-4">
      <div className="flex items-center justify-between gap-3 mb-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold text-[var(--text-primary)]">Client Queries</span>
          {pendingCount > 0 && (
            <Badge size="sm" color="warning" className="ml-1">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        {CLIENT_QUERIES.length > COLLAPSED_COUNT && (
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show less" : "View All"}
          </Button>
        )}
      </div>

      {CLIENT_QUERIES.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] mt-2">No queries right now.</p>
      ) : (
        <div className="divide-y divide-[var(--border-tertiary)]">
          {visibleQueries.map((q) => (
            <QueryRow
              key={q.id}
              query={q}
              answer={answers[q.id]}
              onAnswer={(reply) => setAnswers((prev) => ({ ...prev, [q.id]: reply }))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
