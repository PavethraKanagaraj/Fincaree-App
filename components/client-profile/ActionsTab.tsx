"use client";

import { useState } from "react";
import { Badge } from "@/components/fincaree/badge";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { CLIENT_ACTION_ITEMS, ActionItem } from "./journey.data";

const statusColor: Record<ActionItem["status"], "gray" | "warning" | "success" | "error"> = {
  pending: "gray",
  "in-progress": "warning",
  completed: "success",
  overdue: "error",
};

const statusLabel: Record<ActionItem["status"], string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">{label}</div>
      <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{value}</div>
    </div>
  );
}

export function ActionsTab() {
  const [status, setStatus] = useState<string>("all");
  const [assignee, setAssignee] = useState<string>("all");

  const filtered = CLIENT_ACTION_ITEMS
    .filter((a) => status === "all" || a.status === status)
    .filter((a) => assignee === "all" || a.assignedTo === assignee)
    .sort((a, b) => (a.status === "overdue" ? -1 : b.status === "overdue" ? 1 : 0));

  const completedThisMonth = CLIENT_ACTION_ITEMS.filter((a) => a.status === "completed").length;
  const overdueCount = CLIENT_ACTION_ITEMS.filter((a) => a.status === "overdue").length;
  const completionRate = Math.round((completedThisMonth / CLIENT_ACTION_ITEMS.length) * 100);

  return (
    <div className="space-y-4">
      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Total action items" value={CLIENT_ACTION_ITEMS.length} />
          <Stat label="Completed" value={completedThisMonth} />
          <Stat label="Overdue" value={overdueCount} />
          <Stat label="Completion rate" value={`${completionRate}%`} />
        </div>
      </section>

      <div className="flex items-center gap-2 flex-wrap">
        <SelectField size="sm" value={status} onValueChange={(v: unknown) => setStatus(v as string)} className="w-[160px]" aria-label="Filter by status">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectField>
        <SelectField size="sm" value={assignee} onValueChange={(v: unknown) => setAssignee(v as string)} className="w-[160px]" aria-label="Filter by assignee">
          <SelectItem value="all">All assignees</SelectItem>
          <SelectItem value="Advisor">Advisor</SelectItem>
          <SelectItem value="Client">Client</SelectItem>
        </SelectField>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] divide-y divide-[var(--border-tertiary)]">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{a.task}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {a.assignedTo} · Due {a.dueDate} · from {a.createdIn}
                {a.goal && ` · ${a.goal}`}
              </p>
            </div>
            <Badge color={statusColor[a.status]} size="sm">{statusLabel[a.status]}</Badge>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--text-tertiary)] p-4">No action items match these filters.</p>
        )}
      </section>
    </div>
  );
}
