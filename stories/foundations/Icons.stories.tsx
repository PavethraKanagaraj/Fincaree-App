import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertCircle, Bell, Calendar, Check, ChevronRight, FileText, Plus, Search, Settings, Users } from "lucide-react";
import icons from "../../design-system/figma/icons.json";
import { Page, Section, Table, mono } from "./_shared";

/* Figma "8.Icon System" (icons.json) is the source for size and stroke
   weight; the library is lucide-react. These are passed as props
   (size / strokeWidth), so there are no CSS variables. Icon colours
   come from the semantic Icon/* tokens — see Foundations/Semantic Colors. */

type Tok = { $value: number };
const icon = (icons as { modes: { Light: { Icon: Record<string, Record<string, Tok>> } } }).modes.Light.Icon;
const SIZES = Object.entries(icon.Size!).map(([k, v]) => ({ name: `Icon/Size/${k}`, key: k, value: v.$value }));
const WEIGHTS = Object.entries(icon.Weight!).map(([k, v]) => ({ name: `Icon/Weight/${k}`, key: k, value: v.$value }));

const SIZE_USE: Record<string, string> = {
  XS: "Very compact UI, badges",
  SM: "Dense UI, table actions",
  MD: "Default UI icon",
  LG: "Buttons, navigation",
  XL: "Feature / empty-state icons",
  "2XL": "Large illustrations, prominent states",
};
const SAMPLES = [Search, Bell, Calendar, Users, FileText, Settings, Plus, Check, ChevronRight, AlertCircle];

function IconSystem() {
  return (
    <Page
      title="Icons"
      description={
        <>
          Figma's 8.Icon System, drawn with lucide-react. Default is <strong>MD (20px)</strong> at <strong>Regular (1.5)</strong>. Pass the values as <code style={mono}>size</code> and <code style={mono}>strokeWidth</code>; colour icons with the semantic Icon/* tokens, never hex.
        </>
      }
      summary={`${SIZES.length} sizes · ${WEIGHTS.length} stroke weights in Figma · applied as component props, no CSS variables`}
    >
      <Section title="Size">
        <Table
          head={["Token", "Value", "Preview", "Use"]}
          rows={SIZES.map((s) => [
            <span key="n" style={{ fontWeight: 500 }}>{s.name}</span>,
            <span key="v" style={mono}>{s.value}px</span>,
            <Search key="p" size={s.value} strokeWidth={1.5} aria-hidden="true" style={{ color: "var(--icon-primary)" }} />,
            <span key="u" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{SIZE_USE[s.key] ?? ""}</span>,
          ])}
        />
      </Section>
      <Section title="Stroke weight" note="Shown at MD (20px).">
        <Table
          head={["Token", "Value", "Preview"]}
          rows={WEIGHTS.map((w) => [
            <span key="n" style={{ fontWeight: 500 }}>{w.name}</span>,
            <span key="v" style={mono}>{w.value}</span>,
            <span key="p" style={{ display: "flex", gap: 12, color: "var(--icon-primary)" }} aria-hidden="true">
              {SAMPLES.slice(0, 6).map((C, i) => (
                <C key={i} size={20} strokeWidth={w.value} />
              ))}
            </span>,
          ])}
        />
      </Section>
      <Section title="Colour" note="Icons take their colour from the semantic Icon/* tokens, which switch with the theme.">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            ["--icon-primary", "Icon/Default/Primary"],
            ["--icon-secondary", "Icon/Default/Secondary"],
            ["--icon-tertiary", "Icon/Default/Tertiary"],
            ["--icon-brand-primary", "Icon/Brand/Primary"],
            ["--icon-status-success", "Icon/Status/Success"],
            ["--icon-status-warning", "Icon/Status/Warning"],
            ["--icon-status-error", "Icon/Status/Error"],
          ].map(([v, n]) => (
            <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 120 }}>
              <AlertCircle size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: `var(${v})` }} />
              <span style={{ fontSize: 12, textAlign: "center" }}>{n}</span>
              <span style={{ ...mono, color: "var(--text-tertiary)" }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

const meta = { title: "Foundations/Icons", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const IconSystem_: StoryObj<typeof meta> = { name: "Icon System", render: () => <IconSystem /> };
