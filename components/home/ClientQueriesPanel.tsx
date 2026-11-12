"use client";

/* ============================================================
   ClientQueriesPanel — pending client questions with an inline
   reply box, same "local state only, no backend simulated"
   pattern as the Meeting Desk drawer's Advisor Notes: typing and
   sending updates this session's view, there's no queries API to
   call (AGENT.md — "do not simulate APIs/databases").
   ============================================================ */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Textarea } from "@/components/fincaree/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/fincaree/tabs";
import { Flag } from "lucide-react";
import { CLIENT_QUERIES, planOfClient, queryDayNumber, queryLevel, type ClientQuery, type QueryLevel } from "./home-data";
import type { PlanTier } from "@/components/report-queue/data";

/* Queries are split by subscription, and inside each subscription by urgency.

   Urgency is how long a query has waited against the reply target for that tier. The targets below
   are placeholders (same day, one day, two days) until the real service levels are set; they live
   here so they can be changed in one place. "Today" is the newest query in the list, since the
   sample queries carry no year. */
const TIERS: { plan: PlanTier; badge: "brand" | "warning" | "gray"; dot: string; targetDays: number; targetLabel: string }[] = [
  { plan: "Platinum", badge: "brand", dot: "var(--icon-brand-primary)", targetDays: 0, targetLabel: "Reply the same day" },
  { plan: "Gold", badge: "warning", dot: "var(--icon-status-warning)", targetDays: 1, targetLabel: "Reply within 1 day" },
  { plan: "Silver", badge: "gray", dot: "var(--icon-tertiary)", targetDays: 2, targetLabel: "Reply within 2 days" },
];

type Level = QueryLevel;
const LEVELS: Record<Level, { rank: number; label: string; chip: string }> = {
  overdue: { rank: 0, label: "Overdue", chip: "bg-[var(--bg-status-error-subtle)] text-[var(--text-status-error)]" },
  "due-today": { rank: 1, label: "Due today", chip: "bg-[var(--bg-status-warning-subtle)] text-[var(--text-status-warning)]" },
  "on-track": { rank: 2, label: "On track", chip: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]" },
};

const dayNumber = queryDayNumber;

/** How many queries to show per subscription before "View All". */
const COLLAPSED_PER_TIER = 2;

function QueryRow({
  query,
  level,
  answer,
  onAnswer,
}: {
  query: ClientQuery;
  level: Level;
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

  /* Avatar, text and Reply share one centre line, so nothing sits higher than its neighbour.
     While the reply box is open the row grows, so everything aligns to the top instead. */
  return (
    <div className={cn("flex gap-3.5 py-4", replying ? "items-start" : "items-center")}>
      <Avatar size="sm" initials={query.initials} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--text-primary)]">{query.clientName}</span>
          <span className="text-xs text-[var(--text-tertiary)]">{query.date}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{query.question}</p>

        {sent ? (
          <p className="mt-2.5 border-l-2 border-[var(--border-secondary)] pl-3 text-xs text-[var(--text-tertiary)] leading-relaxed">{sent}</p>
        ) : replying ? (
          <div className="mt-3">
            <Textarea
              rows={2}
              autoFocus
              placeholder={`Reply to ${query.clientName.split(" ")[0]}...`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              aria-label={`Reply to ${query.clientName}`}
            />
            <div className="mt-2 flex items-center gap-2">
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

      {!sent && !replying && (
        <div className="flex shrink-0 items-center gap-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", LEVELS[level].chip)}>
            <Flag size={12} strokeWidth={2} aria-hidden="true" />
            {LEVELS[level].label}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setReplying(true)}>
            Reply
          </Button>
        </div>
      )}
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
  const [activePlan, setActivePlan] = useState<PlanTier>("Platinum");

  const pendingCount = CLIENT_QUERIES.filter((q) => !answers[q.id]).length;

  /* Group by subscription; inside each, unanswered first, then most urgent, then longest waiting. */
  const groups = TIERS.map((tier) => {
    const rows = CLIENT_QUERIES.filter((q) => planOfClient(q.clientName) === tier.plan)
      .map((q) => ({ query: q, level: queryLevel(q) ?? "on-track", answered: Boolean(answers[q.id]) }))
      .sort(
        (a, b) =>
          Number(a.answered) - Number(b.answered) ||
          LEVELS[a.level].rank - LEVELS[b.level].rank ||
          dayNumber(a.query.date) - dayNumber(b.query.date)
      );
    const pending = rows.filter((r) => !r.answered);
    return { tier, rows, pending, overdue: pending.filter((r) => r.level === "overdue").length };
  }).filter((g) => g.rows.length > 0);
  const overdueTotal = groups.reduce((n, g) => n + g.overdue, 0);

  return (
    <section id="client-queries" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 scroll-mt-4">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold text-[var(--text-primary)]">Client Queries</span>
          {pendingCount > 0 && (
            <Badge size="sm" color="warning" className="ml-1">
              {pendingCount} pending
            </Badge>
          )}
          {overdueTotal > 0 && (
            <Badge size="sm" color="error">
              {overdueTotal} overdue
            </Badge>
          )}
        </div>
        {groups.some((g) => g.rows.length > COLLAPSED_PER_TIER) && (
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show less" : "View All"}
          </Button>
        )}
      </div>

      {CLIENT_QUERIES.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] mt-2">No queries right now.</p>
      ) : (
        <div className="mt-2">
          {/* One tab per subscription, each with its waiting count. */}
          <Tabs value={activePlan} onValueChange={(v) => setActivePlan(v as PlanTier)} variant="pill">
            <TabsList aria-label="Subscription">
              {groups.map(({ tier, pending }) => (
                <TabsTrigger key={tier.plan} value={tier.plan}>
                  <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: tier.dot }} />
                  {tier.plan}
                  <span className="ml-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">{pending.length}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {(() => {
            const group = groups.find((g) => g.tier.plan === activePlan) ?? groups[0];
            if (!group) return null;
            const { tier, rows, pending, overdue } = group;
            const shown = expanded ? rows : rows.slice(0, COLLAPSED_PER_TIER);
            return (
              <div key={tier.plan}>
                <div className="flex items-center gap-2 pt-3 pb-1 text-xs text-[var(--text-tertiary)]">
                  <span className="tabular-nums">
                    {pending.length} pending{overdue > 0 ? ` · ${overdue} overdue` : ""}
                  </span>
                  <span className="ml-auto">{tier.targetLabel}</span>
                </div>
                <div className="divide-y divide-[var(--border-tertiary)] border-t border-[var(--border-tertiary)]">
                  {shown.map(({ query, level }) => (
                    <QueryRow
                      key={query.id}
                      query={query}
                      level={level}
                      answer={answers[query.id]}
                      onAnswer={(reply) => setAnswers((prev) => ({ ...prev, [query.id]: reply }))}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}
