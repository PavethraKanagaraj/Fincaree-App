import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Calendar, Star, Users } from "lucide-react";
import { Tag, type TagColor, type TagProps, type TagSize } from "./tag";

/* onRemove / onCheckedChange switch their sub-elements on just by being
   passed, so Controls get two toggles that attach logged handlers. */
type Args = TagProps & { removable?: boolean; selectable?: boolean };

const ICONS = {
  None: undefined,
  Calendar: <Calendar />,
  Star: <Star />,
  Users: <Users />,
};
const COLORS: TagColor[] = ["grey", "brand", "success", "warning", "error"];
const SIZES: TagSize[] = ["sm", "md", "lg"];

const onRemove = fn().mockName("onRemove");
const onCheckedChange = fn().mockName("onCheckedChange");

function Render({ removable, selectable, checked, ...args }: Args) {
  const [isChecked, setChecked] = useState(Boolean(checked));
  return (
    <Tag
      {...args}
      onRemove={removable ? onRemove : undefined}
      checked={selectable ? isChecked : undefined}
      onCheckedChange={
        selectable
          ? (v) => {
              setChecked(v);
              onCheckedChange(v);
            }
          : undefined
      }
    />
  );
}

const meta = {
  title: "Fincaree/Tag",
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Tag (10193:8649) — Size × Color × State × Action. Action=Dot is `dot`, Action=Dismiss is `onRemove`; the sub-components _Tag checkbox (`checked` + `onCheckedChange`) and _Tag count (`count`) are opt-in. The checkbox and remove button are named after the tag's label (\"Remove Retirement\"). Colours come from the `--tag-*` tokens. Use Badge for a status that can't be acted on.",
      },
    },
  },
  args: {
    children: "Retirement",
    size: "md",
    color: "grey",
    dot: false,
    removable: false,
    selectable: false,
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    color: { control: "select", options: COLORS },
    icon: {
      options: Object.keys(ICONS),
      mapping: ICONS,
      control: { type: "select" },
    },
    count: { control: { type: "number", min: 0 } },
    removable: {
      control: "boolean",
      description:
        "Adds the close button (Action=Dismiss); clicks log `onRemove`",
    },
    selectable: {
      control: "boolean",
      description: "Adds the _Tag checkbox; toggles log `onCheckedChange`",
    },
    checked: { control: "boolean", if: { arg: "selectable" } },
    children: { control: "text" },
    onRemove: { table: { disable: true } },
    onCheckedChange: { table: { disable: true } },
  },
  render: (args) => <Render {...args} />,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Figma "Action" variants ── */

export const Label: Story = {};
export const Dot: Story = {
  args: { dot: true, color: "success", children: "On track" },
};
export const Dismiss: Story = {
  args: { removable: true, color: "brand", children: "Equity" },
};

/* ── Sub-components ── */

export const WithCheckbox: Story = {
  name: "With checkbox",
  args: { selectable: true, checked: true, children: "Mutual funds" },
};
export const WithCount: Story = {
  name: "With count",
  args: { count: 5, children: "Clients" },
};
export const WithIcon: Story = {
  name: "With icon",
  args: { icon: "Calendar" as never, children: "This week" },
};
export const Disabled: Story = {
  args: { removable: true, disabled: true, children: "Archived" },
};

/** A removable filter list — each close button names its own tag. */
export const FilterList: Story = {
  name: "Filter list",
  render: function FilterListRender() {
    const [tags, setTags] = useState([
      "Retirement",
      "Equity",
      "Tax saving",
      "SIP",
    ]);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 360 }}>
        {tags.map((t) => (
          <Tag
            key={t}
            color="brand"
            onRemove={() => setTags((x) => x.filter((y) => y !== t))}
          >
            {t}
          </Tag>
        ))}
        {tags.length === 0 && (
          <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            All filters cleared.
          </span>
        )}
      </div>
    );
  },
};

/* ── Matrices (visual regression coverage for Chromatic) ──
   Hover needs a pointer, so it's tested by interaction; every static
   state is here. */

const cell = {
  padding: "8px 20px 8px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
} as const;
const ACTIONS: { label: string; props: Partial<TagProps> }[] = [
  { label: "Label", props: {} },
  { label: "Dot", props: { dot: true } },
  { label: "Dismiss", props: { onRemove: () => {} } },
  { label: "Disabled", props: { onRemove: () => {}, disabled: true } },
  { label: "Checkbox", props: { checked: true, onCheckedChange: () => {} } },
  { label: "Count", props: { count: 5 } },
];

function Matrix({ size }: { size: TagSize }) {
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Color
          </th>
          {ACTIONS.map((a) => (
            <th key={a.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {a.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COLORS.map((c) => (
          <tr key={c}>
            <th scope="row" style={{ ...cell, fontWeight: 600 }}>
              {c}
            </th>
            {ACTIONS.map((a) => (
              <td key={a.label} style={cell}>
                <Tag size={size} color={c} {...a.props}>
                  Label
                </Tag>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const MatrixSm: Story = {
  name: "Matrix · sm",
  parameters: { layout: "padded" },
  render: () => <Matrix size="sm" />,
};
export const MatrixMd: Story = {
  name: "Matrix · md",
  parameters: { layout: "padded" },
  render: () => <Matrix size="md" />,
};
export const MatrixLg: Story = {
  name: "Matrix · lg",
  parameters: { layout: "padded" },
  render: () => <Matrix size="lg" />,
};
