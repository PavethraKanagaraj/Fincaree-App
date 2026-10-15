import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import semantic from "../../design-system/figma/semantic-colors.json";
import primitives from "../../design-system/figma/primitives.json";

/* Figma's "1.Semantic color modes" collection, shown Light and Dark side by
   side. Each token's CSS variable is read live in both modes (by switching
   data-theme on <html>, as the app does) and compared with the value
   Figma resolves to, so a missing or drifting token is visible here. */

type Modes = { "Light Mode": string; "Dark Mode": string };
type Leaf = { $value: Modes; $type: string };
type Node = { [k: string]: Node | Leaf };
const isLeaf = (n: unknown): n is Leaf => typeof n === "object" && n !== null && "$value" in n;

/* ---- Figma alias resolution ---- */

function lookup(root: unknown, path: string[]): unknown {
  return path.reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), root);
}

function resolveAlias(value: string, mode: keyof Modes, depth = 0): string | null {
  const ref = value.match(/^\{(.+)\}$/);
  if (!ref) return value;
  if (depth > 8) return null;
  const path = ref[1]!.split(".");
  const prim = lookup(primitives, path) as { $value?: string } | undefined;
  if (prim?.$value) return resolveAlias(prim.$value, mode, depth + 1);
  const sem = lookup(semantic, path) as Leaf | undefined;
  if (sem && isLeaf(sem)) return resolveAlias(sem.$value[mode], mode, depth + 1);
  return null;
}

/* ---- Figma name → CSS variable ---- */

const PREFIX: Record<string, string> = {
  Text: "text",
  Border: "border",
  Foreground: "fg",
  Background: "bg",
  Icon: "icon",
  Overlay: "overlay",
  "Focus Ring": "focus-ring",
  Chart: "chart",
  Sidebar: "sidebar",
};

const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Same rule as scripts/generate-tokens.mjs → semanticCssName(). */
function cssNameFor(path: string[]): string {
  return `--${PREFIX[path[0]!]}-${path.slice(1).filter((p) => p !== "Default").map(kebab).join("-")}`;
}

/* ---- data ---- */

interface Token {
  path: string[];
  name: string;
  light: string | null;
  dark: string | null;
  cssVar: string;
}

function tokensUnder(node: Node, path: string[]): Token[] {
  return Object.entries(node).flatMap(([k, v]) => {
    if (k.startsWith("$")) return [];
    const p = [...path, k];
    if (isLeaf(v))
      return [
        {
          path: p,
          name: p.slice(1).join(" / "),
          light: resolveAlias(v.$value["Light Mode"], "Light Mode"),
          dark: resolveAlias(v.$value["Dark Mode"], "Dark Mode"),
          cssVar: cssNameFor(p),
        },
      ];
    return tokensUnder(v as Node, p);
  });
}

const tokensFor = (category: string) => tokensUnder((semantic as unknown as Record<string, Node>)[category]!, [category]);

/* ---- live CSS reading ---- */

const LIGHT_CANVAS = resolveAlias("{Colors.Primary.Grey.25}", "Light Mode")!;
const DARK_CANVAS = resolveAlias("{Colors.Primary.Grey.950}", "Dark Mode")!;

/** The surface a token is meant to sit on: on-brand content on the brand
    fill, inverse content on the inverse surface, everything else on canvas. */
function groundFor(path: string[], mode: keyof Modes): string {
  const g = path[1] ?? "";
  if (/^On Brand$|^On$/.test(g) && path[path.length - 1] !== "Inverse")
    return resolveAlias("{Colors.Primary.Brand.500}", mode)!;
  if (g === "Inverse" || path[path.length - 1] === "Inverse" || g === "On Status")
    return mode === "Light Mode" ? DARK_CANVAS : LIGHT_CANVAS;
  return mode === "Light Mode" ? LIGHT_CANVAS : DARK_CANVAS;
}

type Live = { light: string; dark: string };

/** Normalizes any CSS color string to the browser's rgb()/rgba() form so
    "#25282d", "var(...)"-substituted values and rgba() compare equal. */
function canonical(color: string, probe: HTMLElement): string {
  probe.style.backgroundColor = "";
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor ? getComputedStyle(probe).backgroundColor : "";
}

function useLiveValues(tokens: Token[]) {
  const [live, setLive] = useState<Record<string, Live> | null>(null);
  useEffect(() => {
    const html = document.documentElement;
    const original = html.dataset.theme;
    const probe = document.createElement("div");
    document.body.append(probe);
    const read = (theme: string) => {
      html.dataset.theme = theme;
      const style = getComputedStyle(html);
      return Object.fromEntries(
        tokens.map((t) => {
          const v = style.getPropertyValue(t.cssVar).trim();
          return [t.cssVar, v && canonical(v, probe)];
        })
      );
    };
    const light = read("light");
    const dark = read("dark");
    if (original) html.dataset.theme = original;
    else delete html.dataset.theme;
    probe.remove();
    setLive(Object.fromEntries(tokens.map((t) => [t.cssVar, { light: light[t.cssVar]!, dark: dark[t.cssVar]! }])));
  }, [tokens]);
  return live;
}

type Status = "match" | "differs" | "missing";

function statusOf(t: Token, live: Live | undefined, probe: HTMLElement | null): { status: Status; note?: string } {
  if (!live || !probe) return { status: "match" };
  if (!live.light && !live.dark) return { status: "missing" };
  if (!live.light || !live.dark) return { status: "differs", note: `only defined in ${live.light ? "light" : "dark"}` };
  const wantL = t.light ? canonical(t.light, probe) : "";
  const wantD = t.dark ? canonical(t.dark, probe) : "";
  const badL = live.light !== wantL;
  const badD = live.dark !== wantD;
  if (!badL && !badD) return { status: "match" };
  return { status: "differs", note: [badL && "light", badD && "dark"].filter(Boolean).join(" + ") };
}

/* ---- rendering ---- */

const mono = { fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12 } as const;

/** Label ink for a sample's ground: whichever of near-black or white has the
    higher WCAG contrast ratio. (A perceived-brightness cut-off picked light
    grey on the brand fill — 4.08:1.) */
function inkOn(hex: string): string {
  const h = hex.replace("#", "").slice(0, 6);
  const lum = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i]!, 0);
  const onWhite = 1.05 / (lum + 0.05);
  const onDark = (lum + 0.05) / (0.0123 + 0.05); // #1b1d21
  return onDark >= onWhite ? "#1b1d21" : "#ffffff";
}

function Sample({ color, canvas, asText }: { color: string | null; canvas: string; asText: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        background: canvas,
        borderRadius: 6,
        boxShadow: "inset 0 0 0 1px rgb(127 127 127 / 0.2)",
        minWidth: 0,
      }}
    >
      {asText ? (
        <span style={{ color: color ?? "transparent", fontSize: 16, fontWeight: 600, width: 28 }}>Aa</span>
      ) : (
        <span
          style={{
            width: 28,
            height: 20,
            borderRadius: 4,
            background: color ?? "transparent",
            boxShadow: "inset 0 0 0 1px rgb(127 127 127 / 0.35)",
            flexShrink: 0,
          }}
        />
      )}
      <span style={{ ...mono, color: inkOn(canvas) }}>{(color ?? "unresolved").toLowerCase()}</span>
    </div>
  );
}

function Category({ title, description, category }: { title: string; description: string; category: string }) {
  const [tokens] = useState(() => tokensFor(category));
  const live = useLiveValues(tokens);
  const [probe, setProbe] = useState<HTMLElement | null>(null);
  const asText = category === "Text";

  const rows = tokens.map((t) => ({ t, ...statusOf(t, live?.[t.cssVar], probe) }));
  const missing = rows.filter((r) => r.status === "missing").length;
  const differs = rows.filter((r) => r.status === "differs").length;

  return (
    <div style={{ maxWidth: 1200, color: "var(--text-primary)" }}>
      <div ref={setProbe} style={{ display: "none" }} />
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: "70ch" }}>{description}</p>
      <p style={{ margin: "8px 0 16px", fontSize: 12, color: "var(--text-tertiary)" }}>
        {tokens.length} tokens in Figma
        {live && ` · ${tokens.length - missing} in code · ${missing} not in code yet · ${differs} differ from Figma`}
      </p>

      <div role="table" style={{ display: "grid", gridTemplateColumns: "minmax(180px,1.1fr) 1fr 1fr minmax(220px,1.2fr)" }}>
        {/* Header cells need a row parent (aria-required-parent); display:contents keeps the grid */}
        <div role="row" style={{ display: "contents" }}>
          {["Token", "Light", "Dark", "CSS variable"].map((h) => (
            <div
              key={h}
              role="columnheader"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                padding: "8px 12px 8px 0",
                borderBottom: "1px solid var(--border-secondary)",
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {rows.map(({ t, status, note }) => (
          <div key={t.path.join("/")} role="row" style={{ display: "contents" }}>
            <div role="cell" style={{ fontSize: 14, fontWeight: 500, padding: "8px 12px 8px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
              {t.name}
            </div>
            <div role="cell" style={{ padding: "6px 12px 6px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
              <Sample color={t.light} canvas={groundFor(t.path, "Light Mode")} asText={asText} />
            </div>
            <div role="cell" style={{ padding: "6px 12px 6px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
              <Sample color={t.dark} canvas={groundFor(t.path, "Dark Mode")} asText={asText} />
            </div>
            <div role="cell" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
              <span style={{ ...mono, color: status === "missing" ? "var(--text-tertiary)" : "var(--text-primary)" }}>{t.cssVar}</span>
              {status !== "match" && (
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: status === "missing" ? 400 : 600,
                    color: status === "missing" ? "var(--text-tertiary)" : "var(--text-status-warning)",
                  }}
                >
                  {status === "missing" ? "Not in code yet" : `Differs in code (${note})`}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Semantic Colors",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The **1.Semantic color modes** collection: intent-named tokens that alias primitives and switch between Light and Dark. Components use these, never primitives. Both modes are shown side by side regardless of the toolbar theme.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const story = (category: string, title: string, description: string): Story => ({
  render: () => <Category category={category} title={title} description={description} />,
});

export const Text = story("Text", "Text", "Colors for copy: default hierarchy, brand, on-brand, status and inverse.");
export const Background = story("Background", "Background", "Surfaces, brand fills and status backgrounds.");
export const Border = story("Border", "Border", "Dividers, input outlines, brand and status borders, focus borders.");
export const Foreground = story("Foreground", "Foreground", "Non-text foreground marks such as dots, bars and indicators.");
export const Icon = story("Icon", "Icon", "Icon colors. Pair with the size and weight tokens from the icon system.");
export const Overlay = story("Overlay", "Overlay", "Scrims, washes and shadow colors.");
export const FocusRing = story("Focus Ring", "Focus Ring", "Halo and border colors for keyboard focus.");
export const Chart = story("Chart", "Chart", "Series and status colors for data visualization.");
export const Sidebar = story("Sidebar", "Sidebar", "Colors for the app side navigation.");
