import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import alias from "./components-alias.generated.json";

/* The "7.Components" collection (component-level color tokens, e.g.
   Badge/Success/Background). Unlike primitives and semantic colors, these
   have no single naming rule — Figma says "Badge/Neutral/Background", code
   says "--badge-gray-bg" — so each token's CSS variable was matched offline
   by resolved color value (scripts/build-components-alias.mjs) rather than
   computed here by a rule. That structural match is the generated JSON this
   file imports; whether it's still CORRECT is checked live below, exactly
   like Primitives and Semantic Colors, so CSS edits still show up as drift
   without re-running the matcher. Re-run it after adding/renaming a token:
   `npm run tokens:components`. */

interface Token {
  top: string;
  name: string;
  light: string;
  dark: string;
  cssVar: string | null;
  /** A variable whose name claims this token but whose value doesn't match. */
  wrongValueVar: string | null;
}
const ALIAS = alias as Token[];

/* ---- live CSS reading (same approach as Semantic Colors) ---- */

function canonical(color: string, probe: HTMLElement): string {
  probe.style.backgroundColor = "";
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor ? getComputedStyle(probe).backgroundColor : "";
}

type Live = { light: string; dark: string };

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
      const names = [...new Set(tokens.flatMap((t) => [t.cssVar, t.wrongValueVar]).filter((n): n is string => !!n))];
      return Object.fromEntries(
        names.map((n) => {
          const v = style.getPropertyValue(`--${n}`).trim();
          return [n, v && canonical(v, probe)];
        })
      );
    };
    const light = read("light");
    const dark = read("dark");
    if (original) html.dataset.theme = original;
    else delete html.dataset.theme;
    probe.remove();
    const names = [...new Set(tokens.flatMap((t) => [t.cssVar, t.wrongValueVar]).filter((n): n is string => !!n))];
    setLive(Object.fromEntries(names.map((n) => [n, { light: light[n]!, dark: dark[n]! }])));
  }, [tokens]);
  return live;
}

/* ---- Figma alias resolution, to render the intended swatch color even
   when a token has no CSS variable yet ---- */

import primitivesJson from "../../design-system/figma/primitives.json";
import semanticJson from "../../design-system/figma/semantic-colors.json";

function lookup(root: unknown, path: string[]): unknown {
  return path.reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), root);
}
function resolveFigmaRef(value: string, mode: "Light Mode" | "Dark Mode", depth = 0): string | null {
  const m = value.match(/^\{(.+)\}$/);
  if (!m) return value;
  if (depth > 10) return null;
  const path = m[1]!.split(".");
  if (path[0] === "Colors") {
    const prim = lookup((primitivesJson as { Colors: unknown }).Colors, path.slice(1)) as { $value?: string } | undefined;
    return prim?.$value ? resolveFigmaRef(prim.$value, mode, depth + 1) : null;
  }
  const sem = lookup(semanticJson, path) as { $value?: Record<string, string> } | undefined;
  return sem?.$value ? resolveFigmaRef(sem.$value[mode]!, mode, depth + 1) : null;
}

type Status = "match" | "differs" | "wrong-value" | "missing";

function statusOf(t: Token, live: Live | undefined, probe: HTMLElement | null): { status: Status; note?: string } {
  if (!t.cssVar) {
    return t.wrongValueVar ? { status: "wrong-value", note: `--${t.wrongValueVar}` } : { status: "missing" };
  }
  if (!live || !probe) return { status: "match" };
  if (!live.light && !live.dark) return { status: "missing" };
  const wantL = resolveFigmaRef(t.light, "Light Mode");
  const wantD = resolveFigmaRef(t.dark, "Dark Mode");
  const badL = wantL !== null && live.light !== canonical(wantL, probe);
  const badD = wantD !== null && live.dark !== canonical(wantD, probe);
  if (!badL && !badD) return { status: "match" };
  return { status: "differs", note: [badL && "light", badD && "dark"].filter(Boolean).join(" + ") };
}

/* ---- rendering ---- */

const mono = { fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12 } as const;

function Swatch({ hex }: { hex: string | null }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 28,
        height: 20,
        borderRadius: 4,
        background: hex ?? "transparent",
        boxShadow: "inset 0 0 0 1px rgb(127 127 127 / 0.35)",
        verticalAlign: "middle",
      }}
    />
  );
}

function ComponentTable({ top }: { top: string }) {
  const [tokens] = useState(() => ALIAS.filter((t) => t.top === top));
  const live = useLiveValues(tokens);
  const [probe, setProbe] = useState<HTMLElement | null>(null);

  const rows = tokens.map((t) => ({ t, ...statusOf(t, t.cssVar ? live?.[t.cssVar] : undefined, probe) }));
  const missing = rows.filter((r) => r.status === "missing").length;
  const wrongValue = rows.filter((r) => r.status === "wrong-value").length;
  const differs = rows.filter((r) => r.status === "differs").length;

  // group by the token's first path segment (e.g. "Brand / Primary", "Grey") for readability
  const groups: { group: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const group = r.t.name.split(" / ").slice(0, -2).join(" / ") || r.t.name.split(" / ").slice(0, 1).join(" / ");
    const g = groups.find((g) => g.group === group);
    if (g) g.rows.push(r);
    else groups.push({ group, rows: [r] });
  }

  return (
    <div style={{ maxWidth: 1200, color: "var(--text-primary)" }}>
      <div ref={setProbe} style={{ display: "none" }} />
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{top}</h2>
      <p style={{ margin: "8px 0 16px", fontSize: 12, color: "var(--text-tertiary)" }}>
        {tokens.length} tokens in Figma
        {live &&
          ` · ${tokens.length - missing - wrongValue} matched · ${wrongValue} wrong color · ${differs} differ from Figma · ${missing} not in code yet`}
      </p>

      {groups.map(({ group, rows }) => (
        <div key={group} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 6px" }}>{group}</h3>
          <div role="table" style={{ display: "grid", gridTemplateColumns: "minmax(160px,1.4fr) auto auto minmax(180px,1fr)" }}>
            {/* Header cells need a row parent (aria-required-parent); display:contents keeps the grid */}
            <div role="row" style={{ display: "contents" }}>
              {["Token", "Light", "Dark", "CSS variable"].map((h) => (
                <div key={h} role="columnheader" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", padding: "4px 10px 4px 0", borderBottom: "1px solid var(--border-secondary)" }}>
                  {h}
                </div>
              ))}
            </div>
            {rows.map(({ t, status, note }) => {
              const wantL = resolveFigmaRef(t.light, "Light Mode");
              const wantD = resolveFigmaRef(t.dark, "Dark Mode");
              const leaf = t.name.split(" / ").slice(-2).join(" / ");
              return (
                <div key={t.name} role="row" style={{ display: "contents" }}>
                  <div role="cell" style={{ fontSize: 13, padding: "6px 10px 6px 0", borderBottom: "1px solid var(--border-tertiary)" }}>{leaf}</div>
                  <div role="cell" style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
                    <Swatch hex={wantL} />
                  </div>
                  <div role="cell" style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
                    <Swatch hex={wantD} />
                  </div>
                  <div role="cell" style={{ padding: "6px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
                    <span style={{ ...mono, color: status === "missing" ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                      {t.cssVar ? `--${t.cssVar}` : "—"}
                    </span>
                    {status !== "match" && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: status === "missing" ? 400 : 600,
                          color: status === "missing" ? "var(--text-tertiary)" : "var(--text-status-warning)",
                        }}
                      >
                        {status === "missing"
                          ? "Not in code yet"
                          : status === "wrong-value"
                            ? `${note} exists, but wrong color`
                            : `Differs in code (${note})`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Components",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The **7.Components** collection: component-specific color tokens (e.g. Badge/Success/Background). These alias the semantic layer, never primitives directly. Unlike Text/Border/Background above, component tokens have no single CSS naming rule — each was matched to its existing CSS variable by resolved color, and a token with no match shows \"Not in code yet\" rather than a wrong guess.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const story = (top: string): Story => ({ render: () => <ComponentTable top={top} /> });

export const Button = story("Button");
export const Input = story("Input");
export const Checkbox = story("Checkbox");
export const Radio = story("Radio");
export const Badge = story("Badge");
export const Select = story("Select");
export const Tag = story("Tag");
export const Chip = story("Chip");
export const ButtonGroup = story("Button Group");
export const Card = story("Card");
export const Switch = story("Switch");
export const Tabs = story("Tabs");
export const Avatar = story("Avatar");
