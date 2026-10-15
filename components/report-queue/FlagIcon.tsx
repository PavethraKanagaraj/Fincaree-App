import { AlertCircle, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { AIFlagType } from "./data";

/* ============================================================
   FlagIcon — one consistent glyph + colour per AI flag type,
   shared by the table's AI Signals column and the drawer's
   Finny Intelligence / AI Flags sections.
   ============================================================ */

interface FlagIconProps {
  type: AIFlagType;
  size?: number;
}

export function FlagIcon({ type, size = 13 }: FlagIconProps) {
  const className = "shrink-0";
  switch (type) {
    case "suggestion":
      return <Sparkles size={size} strokeWidth={2} className={`${className} text-[var(--icon-brand-primary)]`} />;
    case "compliance-review":
      return <ShieldAlert size={size} strokeWidth={2} className={`${className} text-[var(--text-status-error)]`} />;
    case "exception":
    case "conflicting-data":
    case "data-gap":
      return <AlertCircle size={size} strokeWidth={2} className={`${className} text-[var(--text-status-error)]`} />;
    case "stale-data":
    case "assumption":
      return <AlertTriangle size={size} strokeWidth={2} className={`${className} text-[var(--text-status-warning)]`} />;
  }
}
