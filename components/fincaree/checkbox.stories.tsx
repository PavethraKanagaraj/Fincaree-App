import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Fincaree/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Checkbox base (10066:970) — Checked × Indeterminate × Size × State. The native input drives every state, so `checked` (controlled) and `defaultChecked` (uncontrolled) both work. Pass `children` to label it; without them, give it an `aria-label`. Colours come from the `--checkbox-*` tokens.",
      },
    },
  },
  args: {
    size: "md",
    checked: false,
    indeterminate: false,
    disabled: false,
    children: "Send me the weekly portfolio summary",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text", name: "children (label)" },
    onChange: { action: "change" },
  },
  render: function Render(args) {
    // Controlled from the Checked control, and clickable in the canvas too.
    const [checked, setChecked] = useState(args.checked);
    const [last, setLast] = useState(args.checked);
    if (args.checked !== last) {
      setLast(args.checked);
      setChecked(args.checked);
    }
    return (
      <Checkbox
        {...args}
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          args.onChange?.(e);
        }}
        className="gap-2 text-sm text-[var(--text-primary)]"
      />
    );
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Indeterminate: Story = {
  args: { checked: false, indeterminate: true },
};
export const Small: Story = { args: { size: "sm", checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
  name: "Disabled · checked",
  args: { disabled: true, checked: true },
};
export const Unlabelled: Story = {
  args: { children: undefined, "aria-label": "Select row" },
};

/** Uncontrolled — `defaultChecked`, the component tracks its own state. */
export const Uncontrolled: Story = {
  render: (args) => (
    <Checkbox
      size={args.size}
      defaultChecked
      className="gap-2 text-sm text-[var(--text-primary)]"
    >
      Remember this device
    </Checkbox>
  ),
};

/** The table pattern: a header box that is indeterminate while some rows are selected. */
export const SelectAll: Story = {
  name: "Select all",
  render: function Render() {
    const rows = ["Anita Thomas", "Rahul Mehta", "Priya Nair"];
    const [picked, setPicked] = useState<string[]>(["Rahul Mehta"]);
    const all = picked.length === rows.length;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Checkbox
          size="sm"
          checked={all}
          indeterminate={picked.length > 0 && !all}
          onChange={() => setPicked(all ? [] : rows)}
          className="gap-2 text-sm font-medium text-[var(--text-primary)]"
        >
          Select all
        </Checkbox>
        {rows.map((r) => (
          <Checkbox
            key={r}
            size="sm"
            checked={picked.includes(r)}
            onChange={() =>
              setPicked((p) =>
                p.includes(r) ? p.filter((x) => x !== r) : [...p, r],
              )
            }
            className="ml-6 gap-2 text-sm text-[var(--text-secondary)]"
          >
            {r}
          </Checkbox>
        ))}
      </div>
    );
  },
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover and focus need a pointer or keyboard, so they're tested by
   interaction; every static state is here. */

const STATES = [
  { label: "Unchecked", props: {} },
  { label: "Checked", props: { defaultChecked: true } },
  { label: "Indeterminate", props: { indeterminate: true } },
];
const cell = {
  padding: "8px 24px 8px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
} as const;

export const Matrix: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Size · state
          </th>
          {STATES.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(["md", "sm"] as const).flatMap((size) =>
          [false, true].map((disabled) => (
            <tr key={`${size}-${disabled}`}>
              <th scope="row" style={{ ...cell, fontWeight: 600 }}>
                {size} · {disabled ? "disabled" : "default"}
              </th>
              {STATES.map((s) => (
                <td key={s.label} style={cell}>
                  <Checkbox
                    size={size}
                    disabled={disabled}
                    aria-label={`${s.label} ${size}`}
                    {...s.props}
                  />
                </td>
              ))}
            </tr>
          )),
        )}
      </tbody>
    </table>
  ),
};
