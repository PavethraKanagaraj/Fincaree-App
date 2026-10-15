/* ============================================================
   ComplianceBadge — maps ComplianceStatus → Fincaree Badge
   Sourcing: Fincaree Badge component (components/fincaree/badge.tsx)
   ============================================================ */

import { Badge } from "@/components/fincaree/badge";
import { ShieldCheck, Clock, AlertTriangle, HelpCircle } from "lucide-react";
import type { ComplianceStatus } from "./data";

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: "sm" | "md";
}

const CONFIG: Record<
  ComplianceStatus,
  { color: "success" | "warning" | "error" | "gray"; label: string; icon: React.ReactNode }
> = {
  approved:    { color: "success", label: "AI Approved",   icon: <ShieldCheck  size={12} strokeWidth={2} /> },
  pending:     { color: "warning", label: "Pending Review", icon: <Clock        size={12} strokeWidth={2} /> },
  flagged:     { color: "error",   label: "Flagged",        icon: <AlertTriangle size={12} strokeWidth={2} /> },
  "not-reviewed": { color: "gray", label: "Not Reviewed",  icon: <HelpCircle   size={12} strokeWidth={2} /> },
};

export function ComplianceBadge({ status, size = "sm" }: ComplianceBadgeProps) {
  const cfg = CONFIG[status];
  return (
    <Badge size={size} color={cfg.color} leadingIcon={cfg.icon}>
      {cfg.label}
    </Badge>
  );
}
