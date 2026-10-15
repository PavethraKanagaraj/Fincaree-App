"use client";

/* ============================================================
   AuditLogTable
   Full compliance audit trail — all advisor / AI / client actions.
   Sourcing: components/ui/table.tsx (shadcn adapted to Fincaree)
   Updated: added Package item type + clientName column.
   ============================================================ */

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { cn } from "@/lib/utils";
import type { AuditEntry, AuditAction, AuditActor } from "./data";
import {
  Sparkles,
  User2,
  User,
  Users,
  ShieldCheck,
  AlertTriangle,
  Send,
  Eye,
  Lightbulb,
  Trash2,
  Download,
  FileText,
  FlaskConical,
  CalendarClock,
} from "lucide-react";

interface AuditLogTableProps {
  entries: AuditEntry[];
  onExport: () => void;
}

/* ---- Action config ---- */
const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; icon: React.ReactNode; badgeColor: "success" | "error" | "warning" | "gray" | "brand" | "gray-blue" }
> = {
  "sent":                { label: "Sent",               icon: <Send          size={12} strokeWidth={2} />, badgeColor: "brand"    },
  "suggested":           { label: "Suggested",          icon: <Lightbulb     size={12} strokeWidth={2} />, badgeColor: "gray-blue"},
  "removed":             { label: "Removed",            icon: <Trash2        size={12} strokeWidth={2} />, badgeColor: "gray"     },
  "compliance-approved": { label: "AI Approved",        icon: <ShieldCheck   size={12} strokeWidth={2} />, badgeColor: "success"  },
  "compliance-flagged":  { label: "Compliance Flagged", icon: <AlertTriangle size={12} strokeWidth={2} />, badgeColor: "error"    },
  "viewed":              { label: "Viewed",             icon: <Eye           size={12} strokeWidth={2} />, badgeColor: "gray"     },
  "ai-reviewed":         { label: "AI Reviewed",        icon: <Sparkles      size={12} strokeWidth={2} />, badgeColor: "warning"  },
  "package-created":     { label: "Package Created",    icon: <Lightbulb     size={12} strokeWidth={2} />, badgeColor: "gray-blue"},
  "package-assigned":    { label: "Package Assigned",   icon: <Send          size={12} strokeWidth={2} />, badgeColor: "brand"    },
};

/* ---- Actor config ---- */
const ACTOR_CONFIG: Record<AuditActor, { label: string; icon: React.ReactNode; color: string }> = {
  advisor: { label: "Advisor", icon: <User2    size={13} strokeWidth={1.75} />, color: "text-[var(--icon-secondary)]" },
  ai:      { label: "AI",      icon: <Sparkles size={13} strokeWidth={1.75} />, color: "text-[var(--icon-brand-primary)]"     },
  client:  { label: "Client",  icon: <User     size={13} strokeWidth={1.75} />, color: "text-[var(--icon-tertiary)]"  },
};

/* ---- Item type icon ---- */
const ITEM_TYPE_ICON: Record<string, React.ReactNode> = {
  content:    <FileText     size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  simulation: <FlaskConical size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)] shrink-0"    />,
  session:    <CalendarClock size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)] shrink-0" />,
  package:    <Send         size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)] shrink-0"    />,
};

export function AuditLogTable({ entries, onExport }: AuditLogTableProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-tertiary)]">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Compliance Audit Log</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {entries.length} entries · All advisor, AI and client actions recorded for regulatory audit.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Download size={13} strokeWidth={1.75} />}
          onClick={onExport}
        >
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4 text-xs text-[var(--text-tertiary)] font-medium w-44">Timestamp</TableHead>
            <TableHead className="text-xs text-[var(--text-tertiary)] font-medium w-40">Action</TableHead>
            <TableHead className="text-xs text-[var(--text-tertiary)] font-medium">Item</TableHead>
            <TableHead className="text-xs text-[var(--text-tertiary)] font-medium w-28">Type</TableHead>
            <TableHead className="text-xs text-[var(--text-tertiary)] font-medium w-28">Actor</TableHead>
            <TableHead className="text-xs text-[var(--text-tertiary)] font-medium w-32">Client / Group</TableHead>
            <TableHead className="pr-4 text-xs text-[var(--text-tertiary)] font-medium w-32">Compliance Ref</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-[var(--text-tertiary)]">
                No audit entries found.
              </TableCell>
            </TableRow>
          ) : (
            [...entries].reverse().map((entry) => {
              const actionCfg = ACTION_CONFIG[entry.action];
              const actorCfg  = ACTOR_CONFIG[entry.actor];
              return (
                <TableRow key={entry.id}>
                  {/* Timestamp */}
                  <TableCell className="pl-4 text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                    {entry.timestamp}
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Badge size="sm" color={actionCfg.badgeColor} leadingIcon={actionCfg.icon}>
                      {actionCfg.label}
                    </Badge>
                  </TableCell>

                  {/* Item name + note */}
                  <TableCell className="max-w-[260px]">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {entry.itemName}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
                        {entry.note}
                      </p>
                    )}
                  </TableCell>

                  {/* Item type */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] capitalize">
                      {ITEM_TYPE_ICON[entry.itemType]}
                      {entry.itemType}
                    </span>
                  </TableCell>

                  {/* Actor */}
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1.5 text-xs", actorCfg.color)}>
                      {actorCfg.icon}
                      {actorCfg.label}
                    </span>
                  </TableCell>

                  {/* Client / Group */}
                  <TableCell>
                    {entry.clientName ? (
                      <span className="text-xs text-[var(--text-secondary)] truncate max-w-[110px] block">{entry.clientName}</span>
                    ) : entry.groupName ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] truncate max-w-[110px]">
                        <Users size={11} strokeWidth={1.75} className="shrink-0 text-[var(--icon-tertiary)]" />
                        {entry.groupName}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-quaternary)]">—</span>
                    )}
                  </TableCell>

                  {/* Compliance ref */}
                  <TableCell className="pr-4">
                    {entry.complianceRef ? (
                      <span className="text-xs font-mono text-[var(--text-brand-primary)] bg-[var(--bg-brand-subtle)] px-1.5 py-0.5 rounded-[var(--radius-sm)]">
                        {entry.complianceRef}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-quaternary)]">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
