import { B2CShell } from "@/components/b2c/B2CShell";
import { GoalsPlanner } from "@/components/goals/GoalsPlanner";

/* ============================================================
   Goals & priorities — /goals
   Step 04 of the customer journey: the life goals the user wants
   to plan for, with a guidance-only plan preview for each.
   ============================================================ */

export default function GoalsPage() {
  return (
    <B2CShell user={{ name: "Arjun Mehta", initials: "AM" }}>
      <GoalsPlanner />
    </B2CShell>
  );
}
