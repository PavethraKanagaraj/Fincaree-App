import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import spacing from "../../design-system/figma/spacing.json";
import { CodeStatus, Page, Summary, Table, checkPx, mono, useCssVars } from "./_shared";

/* Figma "3.Spacing" is the source. "Spacing/150" → --space-150. */

type Tok = { $value: number; $description?: string };
const TOKENS = Object.entries(spacing as Record<string, unknown>)
  .filter(([k]) => !k.startsWith("$"))
  .map(([k, v]) => {
    const step = k.split("/")[1]!;
    return { name: k, step, value: (v as Tok).$value, description: (v as Tok).$description ?? "", cssVar: `--space-${step}` };
  });

function SpacingScale() {
  const live = useCssVars(TOKENS.map((t) => t.cssVar));
  const rows = TOKENS.map((t) => ({ t, status: checkPx(live?.[t.cssVar], t.value) }));
  const inCode = rows.filter((r) => r.status !== "missing").length;
  const differs = rows.filter((r) => r.status === "differs").length;
  return (
    <Page
      title="Spacing"
      description="Figma's 3.Spacing collection. Use these for padding, gaps and margins — the step number maps to the CSS variable (Spacing/150 → --space-150)."
      summary={live && <Summary total={TOKENS.length} inCode={inCode} differs={differs} />}
    >
      <Table
        head={["Token", "Value", "Scale", "Use", "CSS variable"]}
        rows={rows.map(({ t, status }) => [
          <span key="n" style={{ fontWeight: 500 }}>{t.name}</span>,
          <span key="v" style={mono}>{t.value}px</span>,
          <span key="s" aria-hidden="true" style={{ display: "inline-block", height: 12, width: Math.max(t.value, 1), background: "var(--bg-brand-primary)", borderRadius: 2, verticalAlign: "middle" }} />,
          <span key="d" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.description}</span>,
          <CodeStatus key="c" cssVar={t.cssVar} status={status} actual={live?.[t.cssVar]} />,
        ])}
      />
    </Page>
  );
}

const meta = { title: "Foundations/Spacing", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Scale: StoryObj<typeof meta> = { render: () => <SpacingScale /> };
