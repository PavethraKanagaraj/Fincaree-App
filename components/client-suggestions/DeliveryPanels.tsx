"use client";

/* ============================================================
   Delivery panels — the secondary zones of Content Management

   SendLog         every send: what went to whom, why, who approved
                   it. Exportable for the annual audit.
   MarketingZone   nurture sequences for leads who did not convert.
                   Kept visibly apart from plan-linked client sends.
   PostMeetingStarter
                   starts a package from a meeting: the meeting
                   purpose picks the template, and the package
                   links back to the meeting record.

   Sourcing: Fincaree Badge, Button, Select, ui/table.
   ============================================================ */

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ban, CalendarCheck, Download, Megaphone, ShieldCheck, Sparkles, Users } from "lucide-react";
import {
  AUDIT_ACTION_LABEL,
  type AuditAction,
  type AuditEntry,
  type Client,
  type ContentItem,
} from "./content-data";
import {
  MEETING_TEMPLATES,
  NURTURE_RULES,
  NURTURE_SEQUENCES,
  RECENT_MEETINGS,
  holdReason,
  isSendableToLeads,
  type MeetingRef,
  type MeetingTemplate,
} from "./delivery-data";

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

export function SendLog({ entries }: { entries: AuditEntry[] }) {
  /* Newest first: "Just now" entries are appended, so reverse. */
  const ordered = [...entries].reverse();
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
        <Button variant="secondary" size="sm" leadingIcon={<Download size={14} strokeWidth={1.75} />} onClick={() => exportCsv(ordered)}>
          Export CSV
        </Button>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3 text-xs text-[var(--text-tertiary)] font-medium w-44">Time</TableHead>
              <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-44">Action</TableHead>
              <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium">Content</TableHead>
              <TableHead className="px-3 py-3 text-xs text-[var(--text-tertiary)] font-medium w-28">By</TableHead>
              <TableHead className="px-3 pr-5 py-3 text-xs text-[var(--text-tertiary)] font-medium">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="px-5 py-3 text-xs text-[var(--text-tertiary)] whitespace-nowrap">{e.timestamp}</TableCell>
                <TableCell className="px-3 py-3">
                  <Badge size="sm" color={ACTION_COLOR[e.action]}>
                    {AUDIT_ACTION_LABEL[e.action]}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-sm font-semibold text-[var(--text-primary)]">{e.itemName}</TableCell>
                <TableCell className="px-3 py-3 text-xs text-[var(--text-secondary)]">{ACTOR_LABEL[e.actor]}</TableCell>
                <TableCell className="px-3 pr-5 py-3 text-xs text-[var(--text-secondary)]">{e.detail ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ─── Marketing zone ─── */

export function MarketingZone({ items }: { items: ContentItem[] }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  return (
    <section aria-label="Marketing" className="space-y-5">
      {/* The separation is the point — say it at the top of the zone. */}
      <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] px-5 py-4">
        <Megaphone size={18} strokeWidth={1.75} className="text-[var(--icon-brand-primary)] shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Marketing — for leads who did not convert</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 max-w-[680px]">
            Nurture sequences for people after their discovery call. This is a separate zone from plan-linked client content: nothing here is
            sent to subscribed clients, and client content is never used for marketing.
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {NURTURE_RULES.map((rule) => (
          <li key={rule} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <ShieldCheck size={14} strokeWidth={1.75} className="text-[var(--icon-status-success)] shrink-0" />
            {rule}
          </li>
        ))}
      </ul>

      <ul className="space-y-4">
        {NURTURE_SEQUENCES.map((seq) => {
          const steps = seq.steps.map((s) => ({ ...s, item: byId.get(s.contentId) }));
          const blocked = steps.filter((s) => !s.item || !isSendableToLeads(s.item));
          return (
            <li
              key={seq.id}
              className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{seq.name}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{seq.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge size="sm" color="gray" leadingIcon={<Users size={11} strokeWidth={2} />}>
                    {seq.leads} leads
                  </Badge>
                  <Badge size="sm" color={seq.status === "active" ? "success" : "gray"}>
                    {seq.status === "active" ? "Active" : "Paused"}
                  </Badge>
                </div>
              </div>

              <ol className="mt-3 divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)]">
                {steps.map((s) => (
                  <li key={`${seq.id}-${s.day}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-semibold text-[var(--text-tertiary)] tabular-nums w-14 shrink-0">Day {s.day}</span>
                      <span className="text-sm text-[var(--text-primary)] truncate">{s.item?.title ?? "Content unavailable"}</span>
                    </div>
                    {s.item && isSendableToLeads(s.item) ? (
                      <Badge size="sm" color="success">
                        Approved
                      </Badge>
                    ) : (
                      <Badge size="sm" color="warning" leadingIcon={<Ban size={11} strokeWidth={2} />}>
                        {s.item ? (holdReason(s.item, "leads") ?? "Not for leads") : "Content unavailable"}
                      </Badge>
                    )}
                  </li>
                ))}
              </ol>

              <p className="text-xs text-[var(--text-tertiary)] mt-3">
                {blocked.length > 0
                  ? `${blocked.length} step${blocked.length === 1 ? "" : "s"} can't go out until it's Approved and written for leads — the sequence will skip ${blocked.length === 1 ? "it" : "them"}.`
                  : "Every step is Approved and written for leads."}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─── Post-meeting starter ─── */

export interface PackageStart {
  template: MeetingTemplate;
  clientId: string;
  meeting: MeetingRef;
}

export function PostMeetingStarter({ clients, onStart }: { clients: Client[]; onStart: (p: PackageStart) => void }) {
  const withMeetings = clients.filter((c) => (RECENT_MEETINGS[c.id] ?? []).length > 0);
  const [clientId, setClientId] = useState(withMeetings[0]?.id ?? "");
  const meetings = RECENT_MEETINGS[clientId] ?? [];
  const [meetingId, setMeetingId] = useState<string>("");
  const [templateId, setTemplateId] = useState(MEETING_TEMPLATES[0].id);

  const meeting = meetings.find((m) => m.id === meetingId) ?? meetings[0];
  const template = MEETING_TEMPLATES.find((t) => t.id === templateId) ?? MEETING_TEMPLATES[0];

  /* The trigger shows a label, so each select needs value → label. */
  const clientItems = Object.fromEntries(withMeetings.map((c) => [c.id, c.name]));
  const meetingItems = Object.fromEntries(meetings.map((m) => [m.id, `${m.title} · ${m.date}`]));
  const templateItems = Object.fromEntries(MEETING_TEMPLATES.map((t) => [t.id, t.purpose]));

  return (
    <section
      aria-label="Start a post-meeting package"
      className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4"
    >
      <div className="flex items-start gap-2.5 mb-3">
        <CalendarCheck size={16} strokeWidth={1.75} className="text-[var(--icon-brand-primary)] mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Post-meeting package</h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Pick the meeting and its purpose. We start the package with matching content and link it back to the meeting record.
          </p>
        </div>
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="w-[200px]">
          <SelectField
            label="Client"
            size="sm"
            value={clientId}
            items={clientItems}
            onValueChange={(v: unknown) => {
              setClientId(v as string);
              setMeetingId("");
            }}
          >
            {withMeetings.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectField>
        </div>
        <div className="w-[220px]">
          <SelectField label="Meeting" size="sm" value={meeting?.id ?? ""} items={meetingItems} onValueChange={(v: unknown) => setMeetingId(v as string)}>
            {meetings.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title} · {m.date}
              </SelectItem>
            ))}
          </SelectField>
        </div>
        <div className="w-[240px]">
          <SelectField label="Meeting purpose" size="sm" value={templateId} items={templateItems} onValueChange={(v: unknown) => setTemplateId(v as string)}>
            {MEETING_TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.purpose}
              </SelectItem>
            ))}
          </SelectField>
        </div>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Sparkles size={14} strokeWidth={1.75} />}
          disabled={!meeting}
          onClick={() => meeting && onStart({ template, clientId, meeting })}
        >
          Start package
        </Button>
      </div>
    </section>
  );
}
