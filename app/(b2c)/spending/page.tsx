import { B2CShell } from "@/components/b2c/B2CShell";
import { SpendingCashflow } from "@/components/spending/SpendingCashflow";

/* ============================================================
   Spending & expenses — /spending
   Step 03 of the customer journey: monthly cashflow, expense
   tiles, fixed commitments and the surplus that results.
   ============================================================ */

export default function SpendingPage() {
  return (
    <B2CShell user={{ name: "Arjun Mehta", initials: "AM" }}>
      <SpendingCashflow />
    </B2CShell>
  );
}
