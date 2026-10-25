"use client";

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Checkbox } from "@/components/fincaree/checkbox";
import { DataTable, type DataTableColumn } from "@/components/fincaree/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/fincaree/dropdown-menu";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { ArrowRightLeft, Pause, Play, Send, SkipForward, UserMinus, MoreHorizontal } from "lucide-react";
import type { ContentItem } from "./content-data";
import { isSendableToLeads, type NurtureLead, type NurtureSequence } from "./delivery-data";
import { marketing } from "./marketing-store";

/* ============================================================
   Loop leads — the advisor's per-lead control

   The loop is the default; this is the exception. Each lead can
   be held, have their next message skipped or sent early, be
   moved to another loop, or be removed. Select several to hold or
   remove a group.

   Guardrails, not suggestions:
   - Send now sends only the lead's next message in this loop, and
     only when that content is still approved for leads.
   - A lead who opted out has no controls at all.
   - Removing and sending ask first; both are logged.
   ============================================================ */

type Status = "opted-out" | "finished" | "held" | "loop-paused" | "active";

function statusOf(l: NurtureLead, seq: NurtureSequence, loopPaused: boolean): Status {
  if (l.optedOut) return "opted-out";
  if (l.sentCount >= seq.steps.length) return "finished";
  if (l.held) return "held";
  if (loopPaused) return "loop-paused";
  return "active";
}

const STATUS_LABEL: Record<Status, string> = {
  "opted-out": "Opted out",
  finished: "Finished",
  held: "Paused",
  "loop-paused": "Loop paused",
  active: "Active",
};
const STATUS_COLOR: Record<Status, "gray" | "success" | "warning" | "error" | "brand" | "gray-blue"> = {
  "opted-out": "error",
  finished: "gray",
  held: "warning",
  "loop-paused": "gray",
  active: "success",
};

type Confirm =
  | { kind: "remove"; ids: string[] }
  | { kind: "send"; id: string; title: string; day: number }
  | null;

interface LoopLeadsTableProps {
  seq: NurtureSequence;
  loopPaused: boolean;
  byId: Map<string, ContentItem>;
  /** Other loops a lead can move to. */
  otherLoops: NurtureSequence[];
}

export function LoopLeadsTable({ seq, loopPaused, byId, otherLoops }: LoopLeadsTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const total = seq.steps.length;
  const controllable = seq.leadList.filter((l) => !l.optedOut);
  const allSelected = controllable.length > 0 && controllable.every((l) => selected.includes(l.id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const nextContent = (l: NurtureLead) => (l.sentCount < total ? byId.get(seq.steps[l.sentCount].contentId) : undefined);
  const nameOf = (id: string) => seq.leadList.find((l) => l.id === id)?.name ?? "this lead";

  const columns: DataTableColumn<NurtureLead>[] = [
    {
      id: "select",
      header: (
        <Checkbox
          size="sm"
          aria-label="Select all leads in this loop"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={() => setSelected(allSelected ? [] : controllable.map((l) => l.id))}
        />
      ),
      width: "w-10",
      cell: (l) => (
        <Checkbox size="sm" aria-label={`Select ${l.name}`} disabled={l.optedOut} checked={selected.includes(l.id)} onChange={() => toggle(l.id)} />
      ),
    },
    {
      id: "lead",
      header: "Lead",
      cell: (l) => (
        <>
          <p className="text-sm font-medium text-[var(--text-primary)]">{l.name}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{l.source}</p>
        </>
      ),
    },
    {
      id: "sent",
      header: "Messages",
      width: "w-36",
      className: "text-sm text-[var(--text-secondary)] tabular-nums",
      cell: (l) => (
        <>
          {l.sentCount} of {total}
          {l.skipped ? <span className="block text-xs text-[var(--text-tertiary)]">{l.skipped} skipped</span> : null}
        </>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: "w-32",
      cell: (l) => {
        const st = statusOf(l, seq, loopPaused);
        return <Badge size="sm" color={STATUS_COLOR[st]}>{STATUS_LABEL[st]}</Badge>;
      },
    },
    {
      id: "next",
      header: "Next message",
      width: "w-32",
      className: "text-sm text-[var(--text-secondary)] tabular-nums",
      cell: (l) => {
        const st = statusOf(l, seq, loopPaused);
        return st === "opted-out" || st === "finished" ? "—" : st === "active" ? (l.nextSend ?? "—") : "On hold";
      },
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      width: "w-12",
      cell: (l) => rowMenu(l),
    },
  ];

  function rowMenu(lead: NurtureLead) {
    if (lead.optedOut) return <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">No actions</span>;
    const finished = lead.sentCount >= total;
    const next = nextContent(lead);
    const nextOk = Boolean(next && isSendableToLeads(next));
    const canSend = !finished && !lead.held && !loopPaused && nextOk;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          showChevron={false}
          render={<Button variant="tertiary" size="sm" iconOnly leadingIcon={<MoreHorizontal size={15} strokeWidth={1.75} />} aria-label={`Actions for ${lead.name}`} />}
        />
        <DropdownMenuContent alignment="end">
          {lead.held ? (
            <DropdownMenuItem icon={<Play size={14} strokeWidth={1.75} />} onClick={() => marketing.setLeadHeld(seq.id, lead.id, false)}>
              Resume for this lead
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem icon={<Pause size={14} strokeWidth={1.75} />} disabled={finished} onClick={() => marketing.setLeadHeld(seq.id, lead.id, true)}>
              Pause for this lead
            </DropdownMenuItem>
          )}
          <DropdownMenuItem icon={<SkipForward size={14} strokeWidth={1.75} />} disabled={finished} onClick={() => marketing.skipNext(seq.id, lead.id)}>
            Skip next message
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<Send size={14} strokeWidth={1.75} />}
            disabled={!canSend}
            onClick={() => next && setConfirm({ kind: "send", id: lead.id, title: next.title, day: seq.steps[lead.sentCount].day })}
          >
            {finished || nextOk ? "Send next message now" : "Next message on hold"}
          </DropdownMenuItem>
          {otherLoops.length > 0 && <DropdownMenuSeparator />}
          {otherLoops.map((o) => (
            <DropdownMenuItem key={o.id} icon={<ArrowRightLeft size={14} strokeWidth={1.75} />} onClick={() => marketing.moveLead(seq.id, o.id, lead.id)}>
              Move to “{o.name}”
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={<UserMinus size={14} strokeWidth={1.75} />} onClick={() => setConfirm({ kind: "remove", ids: [lead.id] })}>
            Remove from loop
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const statuses: { value: Status; label: string }[] = (Object.keys(STATUS_LABEL) as Status[]).map((v) => ({ value: v, label: STATUS_LABEL[v] }));

  return (
    <div>
      {selected.length > 0 && (
        <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 border-b border-[var(--border-tertiary)] bg-[var(--bg-brand-subtle)] px-4 py-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">{selected.length} selected</span>
          <Button variant="secondary" size="sm" leadingIcon={<Pause size={14} strokeWidth={1.75} />} onClick={() => { selected.forEach((id) => marketing.setLeadHeld(seq.id, id, true)); setSelected([]); }}>
            Pause
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<Play size={14} strokeWidth={1.75} />} onClick={() => { selected.forEach((id) => marketing.setLeadHeld(seq.id, id, false)); setSelected([]); }}>
            Resume
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<UserMinus size={14} strokeWidth={1.75} />} onClick={() => setConfirm({ kind: "remove", ids: selected })}>
            Remove
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <DataTable
        bare
        aria-label={`Leads in ${seq.name}`}
        rows={seq.leadList}
        columns={columns}
        getRowId={(l) => l.id}
        pageSize={8}
        noun="leads"
        search={{ placeholder: "Search leads…", width: "w-[200px]", getText: (l) => [l.name, l.source] }}
        filters={[
          {
            id: "status",
            kind: "select",
            label: "Status",
            allLabel: "All statuses",
            width: "w-[160px]",
            options: statuses,
            match: (l, v) => statusOf(l, seq, loopPaused) === v,
          },
        ]}
      />

      {/* Confirm what reaches a lead or removes one */}
      <Modal open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <ModalContent className="max-w-[420px]">
          {confirm?.kind === "remove" && (
            <>
              <div className="px-5 pt-5 pb-4 pr-12">
                <ModalTitle>
                  Remove {confirm.ids.length === 1 ? nameOf(confirm.ids[0]) : `${confirm.ids.length} leads`} from this loop?
                </ModalTitle>
                <ModalDescription className="mt-1.5">
                  They stop getting messages from “{seq.name}”. This is recorded in the Send log. You can add them to a loop again later.
                </ModalDescription>
              </div>
              <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--border-tertiary)]">
                <Button variant="tertiary" size="md" onClick={() => setConfirm(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  color="destructive"
                  size="md"
                  onClick={() => {
                    marketing.removeLeads(seq.id, confirm.ids);
                    setSelected((s) => s.filter((id) => !confirm.ids.includes(id)));
                    setConfirm(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </>
          )}
          {confirm?.kind === "send" && (
            <>
              <div className="px-5 pt-5 pb-4 pr-12">
                <ModalTitle>Send “{confirm.title}” to {nameOf(confirm.id)} now?</ModalTitle>
                <ModalDescription className="mt-1.5">
                  It goes out straight away as their Day {confirm.day} message. Their following messages stay on the loop&apos;s schedule. This is recorded in the Send log.
                </ModalDescription>
              </div>
              <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--border-tertiary)]">
                <Button variant="tertiary" size="md" onClick={() => setConfirm(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  size="md"
                  leadingIcon={<Send size={14} strokeWidth={2} />}
                  onClick={() => {
                    marketing.sendNow(seq.id, confirm.id, confirm.title);
                    setConfirm(null);
                  }}
                >
                  Send now
                </Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
