import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import grids from "../../design-system/figma/grids.json";
import { Page, Section, Table, mono } from "./_shared";

/* Figma grid styles are the source. Grid styles can't be expressed as
   Figma variables (and have no CSS variables here) — they're layout
   guides, so this shows each one at true proportion. */

type Grid = { columns: number; gutterSize: number; offset: number; alignment: string; breakpoint: number; purpose: string };
const GRIDS = Object.entries(grids as Record<string, unknown>)
  .filter(([k]) => !k.startsWith("$"))
  .map(([k, v]) => ({ name: k, ...(v as Grid) }));

/** Renders a grid at its breakpoint width, scaled to fit the story. */
function GridPreview({ g, width = 1000 }: { g: (typeof GRIDS)[number]; width?: number }) {
  const scale = width / g.breakpoint;
  return (
    <div
      role="img"
      aria-label={`${g.name}: ${g.columns} columns, ${g.gutterSize}px gutter, ${g.offset}px margin at ${g.breakpoint}px`}
      style={{
        width,
        height: 120,
        padding: `0 ${g.offset * scale}px`,
        display: "grid",
        gridTemplateColumns: `repeat(${g.columns}, 1fr)`,
        columnGap: g.gutterSize * scale,
        background: "var(--bg-primary)",
        border: "1px solid var(--border-secondary)",
        borderRadius: 8,
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: g.columns }).map((_, i) => (
        <div key={i} style={{ background: "var(--color-error-100)", opacity: 0.6 }} />
      ))}
    </div>
  );
}

function Grids() {
  return (
    <Page
      title="Grid"
      description="Figma's layout grid styles. Content sits inside the margin (offset) and snaps to columns; gutters stay empty. Grid/XL at 1280px is the primary desktop grid."
      summary={`${GRIDS.length} grid styles in Figma · layout guides, no CSS variables`}
    >
      <Section title="Specs">
        <Table
          head={["Grid", "Breakpoint", "Columns", "Gutter", "Margin", "Use"]}
          rows={GRIDS.map((g) => [
            <span key="n" style={{ fontWeight: 500 }}>{g.name}</span>,
            <span key="b" style={mono}>{g.breakpoint}px</span>,
            <span key="c" style={mono}>{g.columns}</span>,
            <span key="g" style={mono}>{g.gutterSize}px</span>,
            <span key="o" style={mono}>{g.offset}px</span>,
            <span key="u" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{g.purpose}</span>,
          ])}
        />
      </Section>
      {GRIDS.map((g) => (
        <Section key={g.name} title={`${g.name} · ${g.breakpoint}px`} note={`${g.columns} columns · ${g.gutterSize}px gutter · ${g.offset}px margin — shown scaled to fit`}>
          <GridPreview g={g} />
        </Section>
      ))}
    </Page>
  );
}

const meta = { title: "Foundations/Grid", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Layouts: StoryObj<typeof meta> = { render: () => <Grids /> };
