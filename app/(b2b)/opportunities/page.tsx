import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { UnderResearch } from "@/components/layout/UnderResearch";

/* ============================================================
   Opportunities — /opportunities
   Not built yet: a placeholder while the section is researched and designed.
   ============================================================ */

export default function OpportunitiesPage() {
  return (
    <AppShell>
      <PageFrame width="full" title="Opportunities">
        <UnderResearch area="Opportunities" />
      </PageFrame>
    </AppShell>
  );
}
