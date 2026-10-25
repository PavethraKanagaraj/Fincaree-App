"use client";

/* ============================================================
   Delivery panels — the secondary zones of Content Management

   SendLog         every send: what went to whom, why, who approved
                   it. Exportable for the annual audit.
   (Marketing now lives in MarketingZone.tsx.)

   (Post-meeting packages now start from Finny's suggestions in the
   Compose & send builder; see SequenceBuilder.)

   Sourcing: Fincaree Badge, Button, ui/table.
   ============================================================ */

import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { DataTable, type DataTableColumn } from "@/components/fincaree/data-table";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/fincaree/tabs";
import { Download } from "lucide-react";
import { useState } from "react";
import {
  AUDIT_ACTION_LABEL,
  type AuditAction,
  type AuditEntry,
} from "./content-data";

/* ─── Send log ─── */

const ACTION_COLOR: Record<AuditAction, "success" | "warning" | "error" | "gray" | "brand" | "gray-blue"> = {
  created: "gray",
  "simulation-personalised": "gray-blue",
  "ai-review-run": "warning",
  "issue-accepted": "gray",
  "issue-dismissed": "gray",
  "advisor-approved": "success",
  published: "brand",
  assigned: "brand",
  "send-approved": "success",
  "send-dismissed": "gray",
  "flag-overridden": "warning",
  "approval-removed": "warning",
  "client-engaged": "gray-blue",
  "loop-scheduled": "brand",
  "loop-paused": "gray",
  "loop-resumed": "brand",
  "lead-paused": "gray",
  "lead-resumed": "brand",
  "lead-skipped": "gray",
  "lead-sent-now": "success",
  "lead-removed": "warning",
  "lead-moved": "gray-blue",
  "lead-added": "brand",
  "note-generated": "warning",
  "note-edited": "gray",
  "note-approved": "success",
};

const ACTOR_LABEL = { advisor: "Advisor", ai: "AI (Finny)", client: "Client" } as const;

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

function exportCsv(entries: AuditEntry[]) {
  const rows = [
    ["Time", "Action", "Content", "By", "Detail", "Reference"],
    ...entries.map((e) => [e.timestamp, AUDIT_ACTION_LABEL[e.action], e.itemName, ACTOR_LABEL[e.actor], e.detail ?? "", e.ref ?? ""]),
  ];
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fincaree-send-log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const ACTOR_FILTER_OPTIONS = Object.entries(ACTOR_LABEL).map(([value, label]) => ({ value, label }));

/* ---- Scaling: the log is a stream, so it is cut by kind and by date before it is searched.
   Thirteen action types in one list means routine AI checks bury the events an auditor
   cares about (overrides, approvals, sends). Categories keep each slice short. ---- */

type Category = "all" | "compliance" | "sending" | "marketing" | "clients" | "content";

const CATEGORY_LABEL: Record<Category, string> = {
  all: "All",
  compliance: "Compliance",
  sending: "Publishing & sending",
  marketing: "Marketing",
  clients: "Client activity",
  content: "Content",
};

const CATEGORY_OF: Record<AuditAction, Exclude<Category, "all">> = {
  "ai-review-run": "compliance",
  "issue-accepted": "compliance",
  "issue-dismissed": "compliance",
  "advisor-approved": "compliance",
  "flag-overridden": "compliance",
  "approval-removed": "compliance",
  published: "sending",
  assigned: "sending",
  "send-approved": "sending",
  "send-dismissed": "sending",
  "client-engaged": "clients",
  "loop-scheduled": "marketing",
  "loop-paused": "marketing",
  "loop-resumed": "marketing",
  "lead-paused": "marketing",
  "lead-resumed": "marketing",
  "lead-skipped": "marketing",
  "lead-sent-now": "marketing",
  "lead-removed": "marketing",
  "lead-moved": "marketing",
  "lead-added": "marketing",
  "note-generated": "compliance",
  "note-edited": "compliance",
  "note-approved": "compliance",
  created: "content",
  "simulation-personalised": "content",
};

/** A sortable time for an entry. "Just now" entries are this session's. */
function entryTime(e: AuditEntry): number {
  if (e.timestamp === "Just now") return Date.now();
  const t = new Date(e.timestamp.replace(" · ", " ")).getTime();
  return Number.isNaN(t) ? 0 : t;
}

const SORT_LABEL = { newest: "Newest first", oldest: "Oldest first" } as const;

export function SendLog({ entries }: { entries: AuditEntry[] }) {
  const [category, setCategory] = useState<Category>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [order, setOrder] = useState<keyof typeof SORT_LABEL>("newest");

  /* Date range first, so the category counts describe the range the advisor chose. */
  const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : null;
  const toMs = to ? new Date(`${to}T23:59:59`).getTime() : null;
  const inRange = entries.filter((e) => {
    const t = entryTime(e);
    return (fromMs === null || t >= fromMs) && (toMs === null || t <= toMs);
  });

  const counts: Record<Category, number> = { all: inRange.length, compliance: 0, sending: 0, marketing: 0, clients: 0, content: 0 };
  for (const e of inRange) counts[CATEGORY_OF[e.action]]++;

  const inCategory = category === "all" ? inRange : inRange.filter((e) => CATEGORY_OF[e.action] === category);
  const rows = inCategory
    .map((e, i) => ({ e, i, t: entryTime(e) }))
    .sort((a, b) => (order === "newest" ? b.t - a.t || b.i - a.i : a.t - b.t || a.i - b.i))
    .map((x) => x.e);

  /* Only actions that exist in this slice are offered, so every choice returns something. */
  const presentActions = (Object.keys(AUDIT_ACTION_LABEL) as AuditAction[]).filter((a) => inCategory.some((e) => e.action === a));
  const rangeActive = Boolean(from || to);

  const columns: DataTableColumn<AuditEntry>[] = [
    { id: "time", header: "Time", width: "w-44", className: "text-xs text-[var(--text-tertiary)] whitespace-nowrap", cell: (e) => e.timestamp },
    {
      id: "action",
      header: "Action",
      width: "w-52",
      cell: (e) => (
        <Badge size="sm" color={ACTION_COLOR[e.action]}>
          {AUDIT_ACTION_LABEL[e.action]}
        </Badge>
      ),
    },
    {
      id: "content",
      header: "Content",
      className: "text-sm font-semibold text-[var(--text-primary)]",
      cell: (e) => (
        <>
          <span className="line-clamp-2">{e.itemName}</span>
          {e.ref && <span className="block text-xs font-normal text-[var(--text-tertiary)] tabular-nums">{e.ref}</span>}
        </>
      ),
    },
    { id: "by", header: "By", width: "w-28", className: "text-xs text-[var(--text-secondary)]", cell: (e) => ACTOR_LABEL[e.actor] },
    {
      id: "detail",
      header: "Detail",
      width: "w-[34%]",
      className: "text-xs text-[var(--text-secondary)]",
      cell: (e) => (
        <span className="line-clamp-2" title={e.detail}>
          {e.detail ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <section aria-label="Send log" className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Send log <span className="text-[var(--text-tertiary)] font-normal">· {entries.length}</span>
        </h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5 max-w-[640px]">
          Every action on content — checks, approvals, publishing and client activity — with who did it and why. Cut it by kind or date, and export it for the annual audit.
        </p>
      </div>

      {/* Cut the stream before searching it */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <Tabs value={category} onValueChange={(v) => setCategory(v as Category)} variant="pill">
          <TabsList aria-label="Kind of action">
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
              <TabsTrigger key={c} value={c}>
                {CATEGORY_LABEL[c]} <span className="ml-1 tabular-nums text-[var(--text-tertiary)]">{counts[c]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[150px]">
            <Input size="sm" type="date" label="From" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-[150px]">
            <Input size="sm" type="date" label="To" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </div>
          {rangeActive && (
            <Button variant="tertiary" size="sm" onClick={() => { setFrom(""); setTo(""); }}>
              Clear dates
            </Button>
          )}
          <SelectField
            size="sm"
            label="Order"
            className="w-[140px]"
            value={order}
            onValueChange={(v: unknown) => setOrder(v as keyof typeof SORT_LABEL)}
            items={SORT_LABEL}
          >
            {(Object.keys(SORT_LABEL) as (keyof typeof SORT_LABEL)[]).map((k) => (
              <SelectItem key={k} value={k}>{SORT_LABEL[k]}</SelectItem>
            ))}
          </SelectField>
        </div>
      </div>

      <DataTable
        key={category}
        aria-label="Send log"
        rows={rows}
        columns={columns}
        getRowId={(e) => e.id}
        noun="entries"
        emptyMessage="Nothing in the log matches these filters."
        search={{
          label: "Search",
          placeholder: "Content, client, reference…",
          width: "w-[280px]",
          getText: (e) => [e.itemName, e.detail ?? "", e.ref ?? "", AUDIT_ACTION_LABEL[e.action]],
        }}
        filters={[
          {
            id: "action",
            kind: "select",
            label: "Action",
            allLabel: "All actions",
            width: "w-[220px]",
            options: presentActions.map((a) => ({ value: a, label: AUDIT_ACTION_LABEL[a] })),
            match: (e, v) => e.action === v,
          },
          { id: "actor", kind: "select", label: "By", allLabel: "Everyone", width: "w-[160px]", options: ACTOR_FILTER_OPTIONS, match: (e, v) => e.actor === v },
        ]}
        toolbarEnd={({ filtered, isFiltered }) => {
          const narrowed = isFiltered || category !== "all" || rangeActive;
          return (
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Download size={14} strokeWidth={1.75} />}
              disabled={filtered.length === 0}
              onClick={() => exportCsv(filtered)}
            >
              {narrowed ? `Export ${filtered.length} filtered` : "Export CSV"}
            </Button>
          );
        }}
      />
    </section>
  );
}
