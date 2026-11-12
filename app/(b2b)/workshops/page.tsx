import { AppShell } from "@/components/layout/AppShell";
import { PageFrame } from "@/components/layout/PageFrame";
import { UnderResearch } from "@/components/layout/UnderResearch";

/* ============================================================
   Workshops — /workshops
   Not built yet: a placeholder while the section is researched and designed.
   ============================================================ */

export default function WorkshopsPage() {
  return (
    <AppShell>
      <PageFrame width="full" title="Workshops">
        <UnderResearch area="Workshops" />
      </PageFrame>
    </AppShell>
  );
}
