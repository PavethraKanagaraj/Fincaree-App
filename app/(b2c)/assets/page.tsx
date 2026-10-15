import { B2CShell } from "@/components/b2c/B2CShell";
import { AssetsWealthProfile } from "@/components/assets/AssetsWealthProfile";

/* ============================================================
   Assets & savings — /assets
   Step 02 of the customer journey: the user adds their assets by
   auto-scanning documents or entering estimates by hand.
   ============================================================ */

export default function AssetsPage() {
  return (
    <B2CShell user={{ name: "Arjun Mehta", initials: "AM" }}>
      <AssetsWealthProfile />
    </B2CShell>
  );
}
