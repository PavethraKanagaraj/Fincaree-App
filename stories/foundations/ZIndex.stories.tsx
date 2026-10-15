import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import zIndex from "../../design-system/figma/z-index.json";
import { CodeStatus, Page, Summary, Table, mono, useCssVars } from "./_shared";

/* Figma "6.Z Index" is the source. "Dropdown" → --z-dropdown. */

const TOKENS = Object.entries(zIndex as Record<string, unknown>)
  .filter(([k]) => !k.startsWith("$"))
  .map(([k, v]) => ({ name: k, value: (v as { $value: number }).$value, cssVar: `--z-${k.toLowerCase()}` }))
  .sort((a, b) => a.value - b.value);

const USE: Record<string, string> = {
  Base: "Default document flow",
  Sticky: "Sticky headers, top nav",
  Dropdown: "Select menus, dropdown menus",
  Popover: "Popovers, date pickers",
  Modal: "Modals, drawers/sheets and their scrim",
  Toast: "Toasts — must sit above an open modal",
  Tooltip: "Tooltips — above everything, including toasts",
};

function ZIndexScale() {
  const live = useCssVars(TOKENS.map((t) => t.cssVar));
  const rows = TOKENS.map((t) => {
    const v = live?.[t.cssVar];
    const status = v === undefined ? "match" : v === "" ? "missing" : Number(v) === t.value ? "match" : "differs";
    return { t, status: status as "match" | "missing" | "differs", actual: v };
  });
  return (
    <Page
      title="Z-Index"
      description="Figma's 6.Z Index collection: the stacking order for layered UI. Always use a token — never an arbitrary z-index — so layers can't fight each other."
      summary={live && <Summary total={TOKENS.length} inCode={rows.filter((r) => r.status !== "missing").length} differs={rows.filter((r) => r.status === "differs").length} />}
    >
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div aria-hidden="true" style={{ position: "relative", width: 280, height: 260, flexShrink: 0 }}>
          {TOKENS.map((t, i) => (
            <div
              key={t.name}
              style={{
                position: "absolute",
                left: i * 22,
                top: 200 - i * 30,
                width: 150,
                height: 44,
                zIndex: i,
                borderRadius: 8,
                background: "var(--bg-primary)",
                border: "1px solid var(--border-secondary)",
                boxShadow: "0 4px 12px var(--overlay-shadow-medium)",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {t.name} · {t.value}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 420 }}>
          <Table
            head={["Token", "Value", "Use", "CSS variable"]}
            rows={[...rows].reverse().map(({ t, status, actual }) => [
              <span key="n" style={{ fontWeight: 500 }}>{t.name}</span>,
              <span key="v" style={mono}>{t.value}</span>,
              <span key="u" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{USE[t.name] ?? ""}</span>,
              <CodeStatus key="c" cssVar={t.cssVar} status={status} actual={actual} />,
            ])}
          />
        </div>
      </div>
    </Page>
  );
}

const meta = { title: "Foundations/Z-Index", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const Scale: StoryObj<typeof meta> = { render: () => <ZIndexScale /> };
