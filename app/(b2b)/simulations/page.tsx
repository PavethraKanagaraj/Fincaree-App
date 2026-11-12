import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { UnderResearch } from "@/components/layout/UnderResearch";

/* ============================================================
   Simulations — /simulations
   Not built yet: a placeholder while the section is researched and designed.
   ============================================================ */

export default function SimulationsPage() {
  return (
    <AppShell>
      <PageFrame width="full" title="Simulations">
        <UnderResearch area="Simulations" />
      </PageFrame>
    </AppShell>
  );
}
