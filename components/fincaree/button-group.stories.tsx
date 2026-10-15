import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowLeft, ArrowRight, Columns3, LayoutGrid, List, Plus } from "lucide-react";
import { ButtonGroup, type ButtonGroupOption } from "./button-group";
import { ButtonGroupItem, type ButtonGroupItemIconType } from "./button-group-item";

/* Icons follow the icon system: MD (20px) at Regular (1.5), as in Figma. */
const ICON = (C: typeof Plus) => <C size={20} strokeWidth={1.5} />;

const TEXT: ButtonGroupOption[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const meta = {
  title: "Fincaree/Button Group",
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Button group (9971:2358), built from _Button group base (Current × Icon × State). A single-select segmented control — each item is a toggle button (`aria-pressed`). Pass `value` + `onChange` to control it, or `defaultValue` to let it manage itself. Colours come from the `--btn-group-*` tokens.",
      },
    },
  },
  args: {
    options: TEXT,
    defaultValue: "week",
    disabled: false,
    "aria-label": "Date range",
  },
  argTypes: {
    value: { control: false },
    onChange: { action: "change" },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Figma "Icon" variants ── */

export const Text: Story = {};

export const LeadingIcon: Story = {
  args: {
    "aria-label": "View",
    defaultValue: "board",
    options: [
      { value: "board", label: "Board", icon: ICON(Columns3), iconType: "leading" },
      { value: "list", label: "List", icon: ICON(List), iconType: "leading" },
      { value: "grid", label: "Grid", icon: ICON(LayoutGrid), iconType: "leading" },
    ],
  },
};

/** The dot is a fixed success-green "has activity" marker, not a per-option status colour. */
export const Dot: Story = {
  args: {
    "aria-label": "Activity",
    defaultValue: "today",
    options: [
      { value: "today", label: "Today", iconType: "dot" },
      { value: "week", label: "This week", iconType: "dot" },
      { value: "month", label: "This month", iconType: "dot" },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    "aria-label": "Navigate",
    defaultValue: undefined,
    options: [
      { value: "prev", icon: ICON(ArrowLeft), iconType: "only", "aria-label": "Previous" },
      { value: "add", icon: ICON(Plus), iconType: "only", "aria-label": "Add" },
      { value: "next", icon: ICON(ArrowRight), iconType: "only", "aria-label": "Next" },
    ],
  },
};

/* ── States ── */

export const Disabled: Story = { args: { disabled: true } };

export const DisabledOption: Story = {
  name: "Disabled option",
  args: {
    options: [TEXT[0]!, TEXT[1]!, { ...TEXT[2]!, disabled: true }],
  },
};

/** Controlled — the parent owns the value, as the pagination in MeetingTable does. */
export const Controlled: Story = {
  render: function Render(args) {
    const [page, setPage] = useState("2");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <ButtonGroup
          {...args}
          aria-label="Select page"
          options={["1", "2", "3", "4", "5"].map((p) => ({ value: p, label: p }))}
          value={page}
          onChange={(v) => {
            setPage(v);
            args.onChange?.(v);
          }}
        />
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Page {page} of 5</span>
      </div>
    );
  },
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover and focus need a pointer or keyboard, so they're tested by
   interaction; the static states are all here. */

const ICON_TYPES: { type: ButtonGroupItemIconType; label: string }[] = [
  { type: "none", label: "Text" },
  { type: "leading", label: "Leading icon" },
  { type: "dot", label: "Dot" },
  { type: "only", label: "Icon only" },
];
const STATES = [
  { label: "Default", current: false, disabled: false },
  { label: "Current", current: true, disabled: false },
  { label: "Disabled", current: false, disabled: true },
  { label: "Current + disabled", current: true, disabled: true },
];
const cell = { padding: "8px 24px 8px 0", fontSize: 12, color: "var(--text-tertiary)", textAlign: "left" } as const;

export const Matrix: Story = {
  name: "Matrix · Items",
  parameters: { layout: "padded" },
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>Icon</th>
          {STATES.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, fontWeight: 600 }}>{s.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ICON_TYPES.map(({ type, label }) => (
          <tr key={type}>
            <th scope="row" style={{ ...cell, fontWeight: 600 }}>{label}</th>
            {STATES.map((s) => (
              <td key={s.label} style={cell}>
                {/* One item in its own group frame, as Figma shows the base */}
                <div className="fc-btn-group">
                  <ButtonGroupItem
                    iconType={type}
                    label="Text"
                    icon={type === "leading" || type === "only" ? ICON(Plus) : undefined}
                    aria-label={type === "only" ? "Add" : undefined}
                    isCurrent={s.current}
                    disabled={s.disabled}
                  />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const AllGroups: Story = {
  name: "Matrix · Groups",
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <ButtonGroup aria-label="Date range" options={TEXT} defaultValue="day" />
      <ButtonGroup aria-label="View" options={LeadingIcon.args!.options!} defaultValue="list" />
      <ButtonGroup aria-label="Status" options={Dot.args!.options!} defaultValue="scheduled" />
      <ButtonGroup aria-label="Navigate" options={IconOnly.args!.options!} />
    </div>
  ),
};
