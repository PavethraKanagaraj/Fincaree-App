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
import { Download } from "lucide-react";
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

export function SendLog({ entries }: { entries: AuditEntry[] }) {
  /* Newest first: "Just now" entries are appended, so reverse. */
  const ordered = [...entries].reverse();

  /* Only actions that exist in the log are offered, so every choice returns something. */
  const presentActions = (Object.keys(AUDIT_ACTION_LABEL) as AuditAction[]).filter((a) => entries.some((e) => e.action === a));

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
          What went to whom, when, why it was triggered and who approved it. Export it for the annual audit.
        </p>
      </div>

      <DataTable
        aria-label="Send log"
        rows={ordered}
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
        toolbarEnd={({ filtered, isFiltered }) => (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Download size={14} strokeWidth={1.75} />}
            disabled={filtered.length === 0}
            onClick={() => exportCsv(filtered)}
          >
            {isFiltered ? `Export ${filtered.length} filtered` : "Export CSV"}
          </Button>
        )}
      />
    </section>
  );
}
