import { B2CShell } from "@/components/b2c/B2CShell";
import { CustomerHome } from "@/components/customer-home/CustomerHome";

/* ============================================================
   Your financial picture — /customer-home
   The customer's home, reached once the risk and preferences step is
   submitted. Lives under /customer-home because /home is the advisor
   dashboard.
   ============================================================ */

export default function CustomerHomePage() {
  return (
    <B2CShell user={{ name: "Arjun Mehta", initials: "AM" }}>
      <CustomerHome />
    </B2CShell>
  );
}
