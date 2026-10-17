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

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
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

const ROWS_PER_PAGE = 15;
const ALL = "all";
const ACTOR_FILTER_LABEL: Record<string, string> = { [ALL]: "Everyone", ...ACTOR_LABEL };
const ACTION_FILTER_LABEL: Record<string, string> = { [ALL]: "All actions", ...AUDIT_ACTION_LABEL };

export function SendLog({ entries }: { entries: AuditEntry[] }) {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<string>(ALL);
  const [actor, setActor] = useState<string>(ALL);
  const [page, setPage] = useState(0);

  /* Newest first: "Just now" entries are appended, so reverse. */
  const ordered = [...entries].reverse();
  const q = query.trim().toLowerCase();
  const filtered = ordered.filter(
    (e) =>
      (action === ALL || e.action === action) &&
      (actor === ALL || e.actor === actor) &&
      (!q || [e.itemName, e.detail ?? "", e.ref ?? "", AUDIT_ACTION_LABEL[e.action]].some((t) => t.toLowerCase().includes(q))),
  );
  const isFiltered = Boolean(q) || action !== ALL || actor !== ALL;

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const from = safePage * ROWS_PER_PAGE;
  const rows = filtered.slice(from, from + ROWS_PER_PAGE);

  /* Only actions that exist in the log are offered, so every choice returns something. */
  const presentActions = (Object.keys(AUDIT_ACTION_LABEL) as AuditAction[]).filter((a) => entries.some((e) => e.action === a));

  function clearFilters() {
    setQuery("");
    setAction(ALL);
    setActor(ALL);
    setPage(0);
  }

  return (
    <section aria-label="Send log" className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Send log <span className="text-[var(--text-tertiary)] font-normal">· {entries.length}</span>
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5 max-w-[640px]">
            What went to whom, when, why it was triggered and who approved it. Export it for the annual audit.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Download size={14} strokeWidth={1.75} />}
          disabled={filtered.length === 0}
          onClick={() => exportCsv(filtered)}
        >
          {isFiltered ? `Export ${filtered.length} filtered` : "Export CSV"}
        </Button>
      </div>

      {/* Find things: the log can run to thousands of rows */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="w-[280px]">
          <Input
            size="sm"
            label="Search"
            aria-label="Search the send log"
            placeholder="Content, client, reference…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            leadingIcon={<Search size={14} strokeWidth={1.75} />}
          />
        </div>
        <div className="w-[220px]">
          <SelectField
            size="sm"
            label="Action"
            value={action}
            items={Object.fromEntries([[ALL, ACTION_FILTER_LABEL[ALL]], ...presentActions.map((a) => [a, AUDIT_ACTION_LABEL[a]])])}
            onValueChange={(v: unknown) => {
              setAction(v as string);
              setPage(0);
            }}
          >
            <SelectItem value={ALL}>{ACTION_FILTER_LABEL[ALL]}</SelectItem>
            {presentActions.map((a) => (
              <SelectItem key={a} value={a}>
                {AUDIT_ACTION_LABEL[a]}
              </SelectItem>
            ))}
          </SelectField>
        </div>
        <div className="w-[160px]">
          <SelectField
            size="sm"
            label="By"
            value={actor}
            items={ACTOR_FILTER_LABEL}
            onValueChange={(v: unknown) => {
              setActor(v as string);
              setPage(0);
            }}
          >
            {Object.entries(ACTOR_FILTER_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectField>
        </div>
        {isFiltered && (
          <Button variant="tertiary" size="sm" leadingIcon={<X size={14} strokeWidth={1.75} />} onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3 text-xs text-[var(--text-tertiary)] font-medium w-44">Time</TableHead>
              <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-52">Action</TableHead>
              <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium">Content</TableHead>
              <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-28">By</TableHead>
              <TableHead className="px-3 pr-5 py-3 text-xs text-[var(--text-tertiary)] font-medium w-[34%]">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="px-5 py-3 text-xs text-[var(--text-tertiary)] whitespace-nowrap">{e.timestamp}</TableCell>
                <TableCell className="px-3 py-3">
                  <Badge size="sm" color={ACTION_COLOR[e.action]}>
                    {AUDIT_ACTION_LABEL[e.action]}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-sm font-semibold text-[var(--text-primary)]">
                  <span className="line-clamp-2">{e.itemName}</span>
                  {e.ref && <span className="block text-xs font-normal text-[var(--text-tertiary)] tabular-nums">{e.ref}</span>}
                </TableCell>
                <TableCell className="px-3 py-3 text-xs text-[var(--text-secondary)]">{ACTOR_LABEL[e.actor]}</TableCell>
                <TableCell className="px-3 pr-5 py-3 text-xs text-[var(--text-secondary)]">
                  <span className="line-clamp-2" title={e.detail}>
                    {e.detail ?? "—"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--text-tertiary)]">
                  Nothing in the log matches these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--border-tertiary)]">
          <p aria-live="polite" className="text-xs text-[var(--text-secondary)] tabular-nums">
            {filtered.length === 0
              ? "0 entries"
              : `Showing ${from + 1}–${from + rows.length} of ${filtered.length}${isFiltered ? ` (filtered from ${entries.length})` : ""}`}
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
    </section>
  );
}
