import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import shadows from "../../design-system/figma/shadows.json";
import { CodeStatus, Page, Section, Table, mono, type Check } from "./_shared";

/* Figma effect styles (shadows.json) are the source. Elevation comes in a
   Light and a Dark set — dark surfaces need a heavier shadow to read.
   Code has one theme-less --shadow-{xs…2xl} scale, compared here against
   the Light set. */

type Drop = { type: "DROP_SHADOW"; x: number; y: number; blur: number; spread: number; color: string; opacity: number };
type Ring = { type: "FOCUS_RING"; halo: { color: string; opacity: number; spread: number }; inner: { color: string; opacity: number; spread: number } };
const ALL = Object.entries(shadows as Record<string, unknown>).filter(([k]) => !k.startsWith("$")) as [string, Drop | Ring][];

const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const dropCss = (d: Drop) => `${d.x}px ${d.y}px ${d.blur}px ${d.spread}px ${rgba(d.color, d.opacity)}`;
const ringCss = (r: Ring) => `0 0 0 ${r.inner.spread}px ${rgba(r.inner.color, r.inner.opacity)}, 0 0 0 ${r.halo.spread}px ${rgba(r.halo.color, r.halo.opacity)}`;

const group = (prefix: string) => ALL.filter(([k]) => k.startsWith(prefix)) as [string, Drop][];
const LIGHT = group("Shadow/Light/");
const DARK = group("Shadow/Dark/");
const OTHER = [...group("Shadow/Glass/"), ...group("Shadow/Blur/")];
const RINGS = ALL.filter(([k]) => k.startsWith("Shadow/Focus Ring/")) as [string, Ring][];

type Theme = "light" | "dark";
type Result = Record<string, { status: Check; actual: string }>;

/** Reads each --shadow-* in both themes and compares it (normalised through
    the browser) with the Figma value. The theme is switched synchronously and
    restored before paint, so nothing flickers. */
function useShadowCheck(pairs: Record<Theme, { cssVar: string; want: string }[]>) {
  const [out, setOut] = useState<Record<Theme, Result> | null>(null);
  useEffect(() => {
    const html = document.documentElement;
    const was = html.getAttribute("data-theme");
    const probe = document.createElement("div");
    document.body.append(probe);
    const norm = (v: string) => {
      probe.style.boxShadow = "";
      probe.style.boxShadow = v;
      return getComputedStyle(probe).boxShadow;
    };
    const read = (theme: Theme): Result => {
      html.setAttribute("data-theme", theme);
      const root = getComputedStyle(html);
      return Object.fromEntries(
        pairs[theme].map(({ cssVar, want }) => {
          const actual = root.getPropertyValue(cssVar).trim();
          const status: Check = !actual ? "missing" : norm(actual) === norm(want) ? "match" : "differs";
          return [cssVar, { status, actual }];
        })
      );
    };
    const next = { light: read("light"), dark: read("dark") };
    if (was === null) html.removeAttribute("data-theme");
    else html.setAttribute("data-theme", was);
    probe.remove();
    setOut(next);
  }, [pairs]);
  return out;
}

function Swatch({ shadow, dark }: { shadow: string; dark?: boolean }) {
  return (
    <div style={{ padding: 28, background: dark ? "#1b1d21" : "#fbfbfb", borderRadius: 12 }}>
      <div style={{ width: 96, height: 64, borderRadius: 10, background: dark ? "#25282d" : "#ffffff", boxShadow: shadow }} />
    </div>
  );
}

const varOf = (k: string) => `--shadow-${k.split("/").pop()!.toLowerCase()}`;
const CODE_PAIRS = {
  light: LIGHT.map(([k, d]) => ({ cssVar: varOf(k), want: dropCss(d) })),
  dark: DARK.map(([k, d]) => ({ cssVar: varOf(k), want: dropCss(d) })),
};

function ElevationTable({ set, theme, check }: { set: [string, Drop][]; theme: Theme; check: Result | undefined }) {
  return (
    <Table
      head={["Token", "Preview", "Figma value", "CSS variable"]}
      rows={set.map(([k, d]) => {
        const v = varOf(k);
        const c = check?.[v];
        return [
          <span key="n" style={{ fontWeight: 500 }}>{k}</span>,
          <Swatch key="s" shadow={dropCss(d)} dark={theme === "dark"} />,
          <span key="f" style={mono}>{`y ${d.y} · blur ${d.blur} · ${Math.round(d.opacity * 100)}%`}</span>,
          <CodeStatus key="c" cssVar={v} status={c?.status ?? "match"} actual={c?.status === "differs" ? c.actual : undefined} />,
        ];
      })}
    />
  );
}

function Shadows() {
  const check = useShadowCheck(CODE_PAIRS);
  const all = check ? [...Object.values(check.light), ...Object.values(check.dark)] : [];
  const off = all.filter((c) => c.status !== "match").length;
  return (
    <Page
      title="Shadows"
      description="Figma's effect styles: elevation (a Light and a Dark set — dark surfaces need a heavier shadow to read), glass/blur surfaces, and keyboard focus rings. Each scale shows its own background so both sets can be compared in any theme."
      summary={`${ALL.length} effect styles in Figma${check ? ` · ${all.length} elevation values in code (light + dark) · ${off} differ from Figma` : ""}`}
    >
      <Section title="Elevation — Light" note="--shadow-xs … --shadow-2xl in :root. Generated from Shadow/Light/* by npm run tokens.">
        <ElevationTable set={LIGHT} theme="light" check={check?.light} />
      </Section>
      <Section title="Elevation — Dark" note={'The same --shadow-* names, overridden under [data-theme="dark"]. Generated from Shadow/Dark/* by npm run tokens.'}>
        <ElevationTable set={DARK} theme="dark" check={check?.dark} />
      </Section>
      <Section title="Glass & blur surfaces">
        <Table
          head={["Token", "Preview", "Figma value"]}
          rows={OTHER.map(([k, d]) => [
            <span key="n" style={{ fontWeight: 500 }}>{k}</span>,
            <Swatch key="s" shadow={dropCss(d)} dark={k.endsWith("Dark")} />,
            <span key="f" style={mono}>{`y ${d.y} · blur ${d.blur} · ${Math.round(d.opacity * 100)}%`}</span>,
          ])}
        />
      </Section>
      <Section title="Focus rings" note="A 2px white inner ring plus a coloured halo. In code these are built from the semantic Focus Ring/* tokens inside each component's :focus-visible rule.">
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {RINGS.map(([k, r]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 130 }}>
              <div style={{ marginTop: 8, width: 72, height: 36, borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border-secondary)", boxShadow: ringCss(r) }} />
              <span style={{ fontSize: 12, textAlign: "center" }}>{k.replace("Shadow/Focus Ring/", "")}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

const meta = { title: "Foundations/Shadows", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Elevation: StoryObj<typeof meta> = { render: () => <Shadows /> };
