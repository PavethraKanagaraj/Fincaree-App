import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import primitives from "../../design-system/figma/primitives.json";

/* Figma's x_Primitives collection is the source; each swatch is checked
   against the CSS variable the app actually resolves, so a primitive that
   is missing from code, or differs from Figma, is visible here. */

type Leaf = { $value: string; $type: string };
type Node = { [k: string]: Node | Leaf };
const isLeaf = (n: unknown): n is Leaf => typeof n === "object" && n !== null && "$value" in n;

interface Swatch {
  label: string;
  hex: string;
  cssVar: string | null;
}

interface Family {
  name: string;
  swatches: Swatch[];
}

const PRIMARY_VAR: Record<string, string> = {
  Brand: "brand",
  Grey: "grey",
  Warning: "warning",
  Error: "error",
  Success: "success",
  Info: "info",
};

const byStep = (a: string, b: string) => (parseFloat(a.replace(/\D+/g, "")) || 0) - (parseFloat(b.replace(/\D+/g, "")) || 0);

function familiesOf(group: Node, varFor: (family: string, step: string) => string | null): Family[] {
  const loose: Swatch[] = [];
  const families: Family[] = [];
  for (const [name, node] of Object.entries(group)) {
    if (isLeaf(node)) {
      loose.push({ label: name, hex: node.$value, cssVar: varFor("", name) });
      continue;
    }
    const steps = Object.keys(node).sort(byStep);
    families.push({
      name,
      swatches: steps.map((s) => ({ label: s, hex: (node[s] as Leaf).$value, cssVar: varFor(name, s) })),
    });
  }
  if (loose.length) families.push({ name: "Ungrouped", swatches: loose.sort((a, b) => byStep(a.label, b.label)) });
  return families;
}

const colors = (primitives as unknown as { Colors: Record<string, Node> }).Colors;

const PRIMARY = familiesOf(colors.Primary, (f, s) => (PRIMARY_VAR[f] ? `--color-${PRIMARY_VAR[f]}-${s}` : null));
/* Same naming as scripts/generate-tokens.mjs → primitiveCssName(). */
const SECONDARY = familiesOf(colors.Secondary, (f, s) => (f ? `--color-${f.toLowerCase()}-${s}` : `--color-secondary-${s}`));
const OVERLAY = familiesOf(colors.Overlay, (f, s) =>
  f === "White" ? `--color-overlay-white-${s.replace(/\D+/g, "")}` : f === "Black" ? `--color-overlay-${s.replace(/\D+/g, "")}` : null
);
const BASE = familiesOf(colors.Base, (_f, s) => (/white/i.test(s) ? "--color-white" : /black/i.test(s) ? "--color-black" : /transparent/i.test(s) ? "--color-transparent" : null));

/* ---- helpers ---- */

function normalize(v: string): string {
  const s = v.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(s)) return "#" + [...s.slice(1)].map((c) => c + c).join("");
  return s;
}

type Status = "match" | "differs" | "missing" | "figma-only";

function useResolved(cssVar: string | null): string | null {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (!cssVar) return;
    setValue(getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || "");
  }, [cssVar]);
  return value;
}

/* ---- rendering ---- */

const STATUS_TEXT: Record<Status, string> = {
  match: "",
  differs: "Differs in code",
  missing: "Not in code yet",
  "figma-only": "Figma only",
};

function SwatchTile({ s }: { s: Swatch }) {
  const resolved = useResolved(s.cssVar);
  const status: Status = !s.cssVar
    ? "figma-only"
    : resolved === null
      ? "match"
      : resolved === ""
        ? "missing"
        : normalize(resolved) === normalize(s.hex)
          ? "match"
          : "differs";
  
  return (
    <div style={{ width: 144 }}>
      <div
        style={{
          height: 56,
          borderRadius: 8,
          border: "1px solid var(--border-tertiary)",
          /* translucent white only reads over a dark ground */
          background: /^#ffffff[0-9a-f]{2}$/i.test(s.hex) && !/ff$/i.test(s.hex)
            ? `repeating-conic-gradient(#30333a 0% 25%, #1b1d21 0% 50%) 50% / 12px 12px`
            : `repeating-conic-gradient(#e9eaec 0% 25%, #ffffff 0% 50%) 50% / 12px 12px`,
          overflow: "hidden",
        }}
      >
        {/* Pure colour. The label sits below on the page ground: text drawn
            on mid-tone swatches can't reach 4.5:1 in either black or white. */}
        <div style={{ height: "100%", background: s.hex }} />
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{s.label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-primary)" }}>
        {s.hex.toLowerCase()}
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: 12,
          fontFamily: "var(--font-geist-mono, monospace)",
          color: "var(--text-tertiary)",
          whiteSpace: "nowrap",
        }}
      >
        {s.cssVar ?? "—"}
      </p>
      {status !== "match" && (
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 12,
            color: status === "differs" ? "var(--text-status-warning)" : "var(--text-tertiary)",
            fontWeight: status === "differs" ? 600 : 400,
          }}
          title={status === "differs" ? `Code resolves to ${resolved}` : undefined}
        >
          {STATUS_TEXT[status]}
          {status === "differs" && ` (${resolved})`}
        </p>
      )}
    </div>
  );
}

function FamilyRow({ family }: { family: Family }) {
  return (
    <section style={{ padding: "16px 0", borderTop: "1px solid var(--border-tertiary)" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
        {family.name}
        <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: "var(--text-tertiary)" }}>
          {family.swatches.length} steps
        </span>
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {family.swatches.map((s) => (
          <SwatchTile key={s.label} s={s} />
        ))}
      </div>
    </section>
  );
}

function Palette({ title, description, families }: { title: string; description: string; families: Family[] }) {
  const total = families.reduce((n, f) => n + f.swatches.length, 0);
  const [inCode, setInCode] = useState<number | null>(null);
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    setInCode(
      families.reduce(
        (n, f) => n + f.swatches.filter((s) => s.cssVar && root.getPropertyValue(s.cssVar).trim()).length,
        0
      )
    );
  }, [families]);
  return (
    <div style={{ maxWidth: 1200, color: "var(--text-primary)" }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: "70ch" }}>{description}</p>
      <p style={{ margin: "8px 0 16px", fontSize: 12, color: "var(--text-tertiary)" }}>
        {total} tokens in Figma · {inCode ?? "…"} available as CSS variables
      </p>
      {families.map((f) => (
        <FamilyRow key={f.name} family={f} />
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Primitives",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Raw color values from the Figma **x_Primitives** collection. Components never use these directly — they use the semantic tokens that alias them. Primitives are fixed values and do not change between light and dark.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <Palette
      title="Primary"
      description="Brand, neutral and status ramps — the base of the semantic text, surface, border and status tokens."
      families={PRIMARY}
    />
  ),
};

export const Secondary: Story = {
  render: () => (
    <Palette
      title="Secondary"
      description="Accent ramps for charts, illustration and content-type tints. The Chart semantic tokens alias these."
      families={SECONDARY}
    />
  ),
};

export const Overlay: Story = {
  render: () => (
    <Palette
      title="Overlay"
      description="Translucent black and white for scrims, hover washes and shadows. Shown over a checkerboard so the alpha is visible."
      families={OVERLAY}
    />
  ),
};

export const Base: Story = {
  render: () => <Palette title="Base" description="Pure white, black and transparent." families={BASE} />,
};
