import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Switch, type SwitchSize, type SwitchVariant } from "./switch";

const onCheckedChange = fn().mockName("onCheckedChange");

const meta = {
  title: "Fincaree/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Switch (9971:7786) — Type × Pressed × Size × State. **Default** has a padded track with a borderless inset thumb; **Slim** has a full-height thumb with a 1px border. Pass `children` for a visible label (clicking it toggles the switch), or `aria-label` when there's no visible text. Colours come from the `--switch-*` tokens.",
      },
    },
  },
  args: {
    variant: "default",
    size: "md",
    disabled: false,
    children: "Email me when a report is ready",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "slim"],
      name: "variant (Figma Type)",
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    children: { control: "text", name: "children (label)" },
    defaultChecked: { control: "boolean" },
    checked: { table: { disable: true } },
    onCheckedChange: { table: { disable: true } },
  },
  render: function Render(args) {
    const [on, setOn] = useState(Boolean(args.defaultChecked));
    return (
      <Switch
        {...args}
        defaultChecked={undefined}
        checked={on}
        onCheckedChange={(v, e) => {
          setOn(v);
          onCheckedChange(v, e);
        }}
      />
    );
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Slim: Story = { args: { variant: "slim", defaultChecked: true } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
};
export const Unlabelled: Story = {
  args: { children: undefined, "aria-label": "Dark mode" },
};

/** A settings list — each switch is labelled by its row text. */
export const SettingsList: Story = {
  name: "Settings list",
  render: function SettingsRender() {
    const [prefs, setPrefs] = useState({
      reports: true,
      meetings: true,
      digest: false,
    });
    const row = {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid var(--border-tertiary)",
      width: 360,
    } as const;
    return (
      <div role="group" aria-label="Notifications">
        {(
          [
            ["reports", "Report ready"],
            ["meetings", "Meeting reminders"],
            ["digest", "Weekly digest"],
          ] as const
        ).map(([k, label]) => (
          <div key={k} style={row}>
            <Switch
              size="sm"
              checked={prefs[k]}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))}
              className="w-full justify-between flex-row-reverse"
            >
              {label}
            </Switch>
          </div>
        ))}
      </div>
    );
  },
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover and focus need a pointer or keyboard, so they're tested by
   interaction; every static state is here. */

const cell = {
  padding: "8px 24px 8px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
} as const;
const COMBOS: { variant: SwitchVariant; size: SwitchSize }[] = [
  { variant: "default", size: "md" },
  { variant: "default", size: "sm" },
  { variant: "slim", size: "md" },
  { variant: "slim", size: "sm" },
];
const STATES = [
  { label: "Off", props: {} },
  { label: "On", props: { defaultChecked: true } },
  { label: "Disabled · off", props: { disabled: true } },
  { label: "Disabled · on", props: { disabled: true, defaultChecked: true } },
];

export const Matrix: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Type · size
          </th>
          {STATES.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COMBOS.map((c) => (
          <tr key={`${c.variant}-${c.size}`}>
            <th scope="row" style={{ ...cell, fontWeight: 600 }}>
              {c.variant} · {c.size}
            </th>
            {STATES.map((s) => (
              <td key={s.label} style={cell}>
                <Switch
                  variant={c.variant}
                  size={c.size}
                  aria-label={`${c.variant} ${c.size} ${s.label}`}
                  {...s.props}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
