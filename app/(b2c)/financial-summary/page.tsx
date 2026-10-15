import { B2CShell } from "@/components/b2c/B2CShell";
import { FinancialSummary } from "@/components/financial-summary/FinancialSummary";

/* ============================================================
   Your financial starting point — /financial-summary
   Customer-facing discovery step. Uses the FinCaree customer
   header, not the advisor shell.
   ============================================================ */

export default function FinancialSummaryPage() {
  return (
    <B2CShell user={{ name: "Arjun Mehta", initials: "AM" }}>
      <FinancialSummary />
    </B2CShell>
  );
}
