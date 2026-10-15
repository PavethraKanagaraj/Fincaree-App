import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import typography from "../../design-system/figma/typography.json";
import { CodeStatus, Page, Section, Table, checkPx, mono, useCssVars, type Check } from "./_shared";

/* Figma "5.Typography" is the source: the raw type scales that text
   styles are built from (see Foundations/Text Styles). npm run tokens
   generates one variable per step (--font-size-500) plus the older named
   aliases (--font-size-base), which must point at a step. */

type Scale = Record<string, { $value: number | string }>;
const T = typography as unknown as { fontFamily: Scale; fontSize: Scale; lineHeight: Scale; fontWeight: Scale; letterSpacing: Scale };
const FAMILY = String(T.fontFamily.base!.$value);

type Row = { step: string; value: number; cssVar: string };
const rows = (s: Scale, prefix: string): Row[] =>
  Object.entries(s).map(([k, v]) => ({ step: k, value: Number(v.$value), cssVar: `--${prefix}-${k.toLowerCase()}` }));

const SIZES = rows(T.fontSize, "font-size");
const LINE_HEIGHTS = rows(T.lineHeight, "line-height");
const WEIGHTS = rows(T.fontWeight, "font-weight");
const TRACKING = rows(T.letterSpacing, "letter-spacing");
const ALL = [...SIZES, ...LINE_HEIGHTS, ...WEIGHTS, ...TRACKING];

/* Named aliases kept for existing code — mirrors TYPE_ALIASES in generate-tokens.mjs. */
const ALIASES: { cssVar: string; value: number; scale: Row[]; unit: string }[] = [
  ...Object.entries({ xs: 11, sm: 12, base: 14, md: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 28, "4xl": 32, "5xl": 40 }).map(([n, v]) => ({ cssVar: `--font-size-${n}`, value: v, scale: SIZES, unit: "px" })),
  ...Object.entries({ xs: 16, sm: 18, base: 20, md: 24, lg: 28, xl: 32, "2xl": 36, "3xl": 40, "4xl": 44, "5xl": 52 }).map(([n, v]) => ({ cssVar: `--line-height-${n}`, value: v, scale: LINE_HEIGHTS, unit: "px" })),
  ...Object.entries({ "tight-2": -2, "tight-1": -1, tight: -0.5, normal: 0, wide: 0.5, wider: 1 }).map(([n, v]) => ({ cssVar: `--tracking-${n}`, value: v, scale: TRACKING, unit: "px" })),
];

const Name = ({ children }: { children: string }) => <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;

function Typography() {
  const live = useCssVars([...ALL.map((r) => r.cssVar), ...ALIASES.map((a) => a.cssVar), "--font-family"]);
  const status = (r: { cssVar: string; value: number }): Check => checkPx(live?.[r.cssVar], r.value);
  const code = (r: Row) => {
    const s = status(r);
    return <CodeStatus key="c" cssVar={r.cssVar} status={s} actual={s === "differs" ? live?.[r.cssVar] : undefined} />;
  };
  const familyStatus: Check = !live ? "match" : !live["--font-family"] ? "missing" : new RegExp(FAMILY, "i").test(live["--font-family"]) ? "match" : "differs";
  const off = live ? [...ALL, ...ALIASES].filter((r) => status(r) !== "match").length + (familyStatus === "match" ? 0 : 1) : 0;

  return (
    <Page
      title="Typography"
      description="Figma's 5.Typography collection: the raw scales for family, size, line height, weight and letter spacing. Build text from the Text Styles, which combine these — reach for a raw value only when no style fits."
      summary={live && `${ALL.length + 1} tokens in Figma · ${ALL.length + 1} in code · ${ALIASES.length} named aliases · ${off} differ from Figma`}
    >
      <Section title="Font family">
        <Table
          head={["Token", "Value", "Sample", "CSS variable"]}
          rows={[[
            <Name key="n">Font Family/Base</Name>,
            <span key="v" style={mono}>{FAMILY}</span>,
            <span key="s" style={{ fontFamily: "var(--font-family)", fontSize: 20 }}>Aa Bb Cc 0123456789 ₹</span>,
            <CodeStatus key="c" cssVar="--font-family" status={familyStatus} actual={familyStatus === "differs" ? live?.["--font-family"] : undefined} />,
          ]]}
        />
      </Section>

      <Section title="Font size" note="Sizes below 12px (100, 200) are for uppercase micro-labels only — functional text should be 12px or larger.">
        <Table
          head={["Token", "Value", "Sample", "CSS variable"]}
          rows={SIZES.map((s) => [
            <Name key="n">{`Font Size/${s.step}`}</Name>,
            <span key="v" style={mono}>{s.value}px</span>,
            <span key="s" style={{ fontSize: `var(${s.cssVar})`, lineHeight: 1.2, whiteSpace: "nowrap" }}>The quick brown fox</span>,
            code(s),
          ])}
        />
      </Section>

      <Section title="Line height">
        <Table
          head={["Token", "Value", "CSS variable"]}
          rows={LINE_HEIGHTS.map((l) => [<Name key="n">{`Line Height/${l.step}`}</Name>, <span key="v" style={mono}>{l.value}px</span>, code(l)])}
        />
      </Section>

      <Section title="Font weight">
        <Table
          head={["Token", "Value", "Sample", "CSS variable"]}
          rows={WEIGHTS.map((w) => [
            <Name key="n">{`Font Weight/${w.step}`}</Name>,
            <span key="v" style={mono}>{w.value}</span>,
            <span key="s" style={{ fontWeight: `var(${w.cssVar})`, fontSize: 18 }}>Portfolio review</span>,
            code(w),
          ])}
        />
      </Section>

      <Section title="Letter spacing" note="Negative tracking is for large display and heading sizes; body text uses 0.">
        <Table
          head={["Token", "Value", "Sample", "CSS variable"]}
          rows={TRACKING.map((t) => [
            <Name key="n">{`Letter Spacing/${t.step}`}</Name>,
            <span key="v" style={mono}>{t.value}px</span>,
            <span key="s" style={{ letterSpacing: `var(${t.cssVar})`, fontSize: 18 }}>Portfolio review</span>,
            code(t),
          ])}
        />
      </Section>

      <Section title="Named aliases" note="Older names kept so existing code keeps working. Each points at a Figma step; prefer the step variable in new code.">
        <Table
          head={["Alias", "Points to", "Value"]}
          rows={ALIASES.map((a) => {
            const target = a.scale.find((r) => r.value === a.value);
            const s = status(a);
            return [
              <CodeStatus key="a" cssVar={a.cssVar} status={s} actual={s === "differs" ? live?.[a.cssVar] : undefined} />,
              <span key="t" style={mono}>{target ? target.cssVar : "— off-scale"}</span>,
              <span key="v" style={mono}>{a.value}{a.unit}</span>,
            ];
          })}
        />
      </Section>
    </Page>
  );
}

const meta = { title: "Foundations/Typography", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Scales: StoryObj<typeof meta> = { render: () => <Typography /> };
