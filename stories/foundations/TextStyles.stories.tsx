import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import textStyles from "../../design-system/figma/text-styles.json";
import { Page, Section, Table, mono } from "./_shared";

/* Figma text styles (text-styles.json) are the source: each combines a
   size, line height, weight and letter spacing from Foundations/Typography.
   There are no text-style classes in code yet — components set these
   values individually — so each style is rendered from its spec. */

type Style = { name: string; fontSize: number; fontFamily: string; fontStyle: string; lineHeight: number; letterSpacing: number; boundVariables: Record<string, string> };
const STYLES = (textStyles as { styles: Style[] }).styles;

const WEIGHT: Record<string, number> = { Regular: 400, Medium: 500, SemiBold: 600, "Semi Bold": 600, Semibold: 600, Bold: 700 };
const SAMPLE: Record<string, string> = {
  Display: "Plan your future",
  Heading: "Retirement readiness",
  Body: "Your portfolio grew 8% this quarter, ahead of plan.",
  Caption: "Updated 2 days ago",
  Label: "Monthly contribution",
};

const groups = [...new Set(STYLES.map((s) => s.name.split("/")[0]!))];

function TextStyles() {
  return (
    <Page
      title="Text styles"
      description="Figma's text styles — the typography to reach for first. Each combines a size, line height, weight and letter spacing from Foundations/Typography."
      summary={`${STYLES.length} text styles in Figma · no text-style classes in code yet (components set size, weight and line height individually)`}
    >
      {groups.map((g) => (
        <Section key={g} title={g}>
          <Table
            head={["Style", "Sample", "Size / line", "Weight", "Tracking"]}
            rows={STYLES.filter((s) => s.name.startsWith(`${g}/`)).map((s) => [
              <span key="n" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{s.name}</span>,
              <span
                key="s"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: s.fontSize,
                  lineHeight: `${s.lineHeight}px`,
                  fontWeight: WEIGHT[s.fontStyle] ?? 400,
                  letterSpacing: s.letterSpacing,
                  textTransform: g === "Caption" && s.fontSize < 12 ? "uppercase" : undefined,
                  display: "block",
                  maxWidth: 560,
                }}
              >
                {SAMPLE[g] ?? "The quick brown fox"}
              </span>,
              <span key="z" style={mono}>{s.fontSize}/{s.lineHeight}</span>,
              <span key="w" style={mono}>{s.fontStyle}</span>,
              <span key="t" style={mono}>{s.letterSpacing}px</span>,
            ])}
          />
        </Section>
      ))}
    </Page>
  );
}

const meta = { title: "Foundations/Text Styles", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Styles: StoryObj<typeof meta> = { render: () => <TextStyles /> };
