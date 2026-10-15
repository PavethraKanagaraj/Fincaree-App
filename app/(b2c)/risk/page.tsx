import { B2CShell } from "@/components/b2c/B2CShell";
import { RiskPreferences } from "@/components/risk/RiskPreferences";

/* ============================================================
   Risk & investment preferences — /risk
   Step 05 of the customer journey: comfort with market change,
   priorities, emergency cash and openness to advice.
   ============================================================ */

export default function RiskPage() {
  return (
    <B2CShell user={{ name: "Arjun Mehta", initials: "AM" }}>
      <RiskPreferences />
    </B2CShell>
  );
}
