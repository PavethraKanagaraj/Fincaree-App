import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import screens from "../../design-system/figma/screen-widths.json";
import { Page, Section, Table, mono } from "./_shared";

/* Figma "4.Screen widths" is the source. There are no --screen-* CSS
   variables: responsive layout in code uses Tailwind's breakpoints, so
   those are compared here instead (Tailwind v4 defaults, with 2xl and 3xl set to match Figma). */

const TOKENS = Object.entries(screens as Record<string, unknown>)
  .filter(([k]) => !k.startsWith("$"))
  .map(([k, v]) => {
    const t = v as { $value: number; $description?: string };
    return { name: k, key: k.split("/")[1]!.toLowerCase(), value: t.$value, description: t.$description ?? "" };
  });

// What `sm:` … `3xl:` resolve to in code: Tailwind v4 defaults, with 2xl and 3xl
// overridden in app/globals.css to match Figma. Keep the two in step.
const TAILWIND: Record<string, number> = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1440, "3xl": 1600 };
const MAX = Math.max(...TOKENS.map((t) => t.value));

function ScreenWidths() {
  return (
    <Page
      title="Screen widths"
      description="Figma's 4.Screen widths collection: the viewport widths designs are made at. XL (1280) is the primary desktop target — design there first."
      summary={`${TOKENS.length} tokens in Figma · no CSS variables (code uses Tailwind breakpoint prefixes)`}
    >
      <Section title="Scale">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TOKENS.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 90, fontSize: 13, fontWeight: 500 }}>{t.name}</span>
              <span
                aria-hidden="true"
                style={{
                  height: 20,
                  width: `${(t.value / MAX) * 60}%`,
                  borderRadius: 4,
                  background: t.key === "xl" ? "var(--bg-brand-primary)" : "var(--bg-brand-secondary)",
                }}
              />
              <span style={mono}>{t.value}px</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Figma vs Tailwind breakpoints" note="A Tailwind prefix like lg: applies from that width up. Where Figma and Tailwind disagree, layouts built with the prefix switch at a different width than the design shows.">
        <Table
          head={["Token", "Figma", "Tailwind prefix", "Tailwind value", "Use"]}
          rows={TOKENS.map((t) => {
            const tw = TAILWIND[t.key];
            const differs = tw !== undefined && tw !== t.value;
            return [
              <span key="n" style={{ fontWeight: 500 }}>{t.name}</span>,
              <span key="f" style={mono}>{t.value}px</span>,
              <span key="p" style={mono}>{tw !== undefined ? `${t.key}:` : "—"}</span>,
              tw !== undefined ? (
                <span key="t">
                  <span style={mono}>{tw}px</span>
                  {differs && <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-status-warning)" }}>Differs from Figma</span>}
                </span>
              ) : (
                <span key="t" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No Tailwind prefix</span>
              ),
              <span key="u" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.description}</span>,
            ];
          })}
        />
      </Section>
    </Page>
  );
}

const meta = { title: "Foundations/Screen Widths", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Scale: StoryObj<typeof meta> = { render: () => <ScreenWidths /> };
