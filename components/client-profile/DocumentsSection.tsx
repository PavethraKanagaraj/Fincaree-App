"use client";

import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ClientDocument, DocumentStatus } from "./data";
import { FileText, Upload, ShieldCheck, FileSignature, Receipt } from "lucide-react";

/* ============================================================
   Documents — kept simple per the Foundation scope: what's on
   file and its status, organised by type. Not a full versioning
   or e-signature workflow.
   ============================================================ */

const STATUS_COLOR: Record<DocumentStatus, "success" | "warning" | "error"> = {
  valid: "success",
  pending: "warning",
  expired: "error",
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  valid: "Valid",
  pending: "Pending",
  expired: "Expired",
};

const TYPE_ICON: Record<ClientDocument["type"], React.ReactNode> = {
  KYC: <ShieldCheck size={14} strokeWidth={1.75} />,
  "Risk Profile": <FileText size={14} strokeWidth={1.75} />,
  Agreement: <FileSignature size={14} strokeWidth={1.75} />,
  Statement: <Receipt size={14} strokeWidth={1.75} />,
};

export function DocumentsSection({ documents }: { documents: ClientDocument[] }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <FileText size={16} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Documents</h2>
        </div>
        <Button variant="secondary" size="sm" leadingIcon={<Upload size={13} strokeWidth={1.75} />}>
          Upload
        </Button>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mb-4 max-w-prose">
        KYC, risk profile, agreement and statements on file for this client.
      </p>
      <div className="divide-y divide-[var(--border-tertiary)]">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] text-[var(--icon-tertiary)] flex items-center justify-center shrink-0">
                {TYPE_ICON[doc.type]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{doc.detail}</p>
              </div>
            </div>
            <Badge size="sm" color={STATUS_COLOR[doc.status]}>{STATUS_LABEL[doc.status]}</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
