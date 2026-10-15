import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Calendar, Plus, Sparkles, Star } from "lucide-react";
import { Chip, type ChipProps, type ChipSize } from "./chip";

/* The element a chip renders follows from its handlers, so Controls get one
   toggle per behaviour; each attaches a logged handler. */
type Args = ChipProps & {
  selectable?: boolean;
  removable?: boolean;
  clickable?: boolean;
};

/* Photo-style silhouette like Figma's avatar image — no text, so there is
   nothing axe can't contrast-check. */
const Avatar = () => (
  <svg viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="var(--color-brand-100)" />
    <circle cx="8" cy="6.2" r="2.8" fill="var(--color-brand-500)" />
    <path
      d="M2.6 14.2a5.6 5.6 0 0 1 10.8 0A8 8 0 0 1 2.6 14.2Z"
      fill="var(--color-brand-500)"
    />
  </svg>
);
const ICONS = {
  None: undefined,
  Star: <Star />,
  Calendar: <Calendar />,
  Sparkles: <Sparkles />,
};
const AVATARS = { None: undefined, Person: <Avatar /> };
const SIZES: ChipSize[] = ["sm", "md", "lg"];

const onSelectChange = fn().mockName("onSelectChange");
const onRemove = fn().mockName("onRemove");
const onClick = fn().mockName("onClick");

function Render({ selectable, removable, clickable, selected, ...args }: Args) {
  const [isSelected, setSelected] = useState(Boolean(selected));
  const [removed, setRemoved] = useState(false);
  if (removed) {
    return (
      <button
        type="button"
        onClick={() => setRemoved(false)}
        style={{
          fontSize: 13,
          color: "var(--text-brand-primary)",
          background: "none",
          border: 0,
          cursor: "pointer",
        }}
      >
        Removed — restore
      </button>
    );
  }
  return (
    <Chip
      {...args}
      selected={selectable ? isSelected : undefined}
      onSelectChange={
        selectable
          ? (v) => {
              setSelected(v);
              onSelectChange(v);
            }
          : undefined
      }
      onClick={clickable ? onClick : undefined}
      onRemove={
        removable
          ? () => {
              setRemoved(true);
              onRemove();
            }
          : undefined
      }
    />
  );
}

const meta = {
  title: "Fincaree/Chip",
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Chip (10259:8318) — Variant × Content × Selection × Size. The variants are semantic and the element follows from the props: **Filter** = `selected`/`onSelectChange` (a toggle, `aria-pressed`), **Assist** = `onClick` (an action button), **Input** = `onRemove` (adds a close button named after the chip), and no handlers = a static label. Colours come from the `--chip-*` tokens.",
      },
    },
  },
  args: {
    children: "Equity",
    size: "md",
    dot: false,
    selectable: true,
    removable: false,
    clickable: false,
    selected: false,
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    icon: {
      options: Object.keys(ICONS),
      mapping: ICONS,
      control: { type: "select" },
    },
    avatar: {
      options: Object.keys(AVATARS),
      mapping: AVATARS,
      control: { type: "select" },
    },
    selectable: {
      control: "boolean",
      description: "Filter chip: toggles on click; logs `onSelectChange`",
    },
    selected: { control: "boolean", if: { arg: "selectable" } },
    removable: {
      control: "boolean",
      description: "Input chip: adds the close button; logs `onRemove`",
    },
    clickable: {
      control: "boolean",
      description: "Assist chip: an action; logs `onClick`",
    },
    children: { control: "text" },
    defaultSelected: { table: { disable: true } },
    onSelectChange: { table: { disable: true } },
    onRemove: { table: { disable: true } },
  },
  render: (args) => <Render {...args} />,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Figma "Variant" ── */

export const Filter: Story = { args: { selected: true } };
export const Input: Story = {
  args: {
    selectable: false,
    removable: true,
    avatar: "Person" as never,
    children: "Anita Thomas",
  },
};
export const Assist: Story = {
  args: {
    selectable: false,
    clickable: true,
    icon: "Sparkles" as never,
    children: "Suggest funds",
  },
};
export const Static: Story = {
  args: { selectable: false, children: "Read only" },
};

/* ── Figma "Content" ── */

export const Dot: Story = { args: { dot: true, children: "Active" } };
export const LeadingIcon: Story = {
  name: "Leading icon",
  args: { icon: "Star" as never, children: "Favourites" },
};
export const LeadingAvatar: Story = {
  name: "Leading avatar",
  args: { avatar: "Person" as never, children: "Anita Thomas" },
};
export const TrailingClose: Story = {
  name: "Trailing close",
  args: { removable: true, children: "Tax saving" },
};
export const Disabled: Story = { args: { disabled: true, selected: true } };

/** A filter bar — multi-select, each chip a toggle button. */
export const FilterGroup: Story = {
  name: "Filter group",
  render: function FilterGroupRender() {
    const all = ["Equity", "Debt", "Hybrid", "Gold", "International"];
    const [on, setOn] = useState<string[]>(["Equity"]);
    return (
      <div
        role="group"
        aria-label="Asset class"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 420 }}
      >
        {all.map((c) => (
          <Chip
            key={c}
            selected={on.includes(c)}
            onSelectChange={(v) =>
              setOn((x) => (v ? [...x, c] : x.filter((y) => y !== c)))
            }
          >
            {c}
          </Chip>
        ))}
      </div>
    );
  },
};

/** Input chips — each close button names its chip ("Remove Anita Thomas"). */
export const InputGroup: Story = {
  name: "Input group",
  render: function InputGroupRender() {
    const [people, setPeople] = useState([
      "Anita Thomas",
      "Rahul Mehta",
      "Priya Nair",
    ]);
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          maxWidth: 420,
          alignItems: "center",
        }}
      >
        {people.map((p) => (
          <Chip
            key={p}
            avatar={<Avatar />}
            onRemove={() => setPeople((x) => x.filter((y) => y !== p))}
          >
            {p}
          </Chip>
        ))}
        <Chip
          icon={<Plus />}
          onClick={() => setPeople((x) => [...x, `Client ${x.length + 1}`])}
        >
          Add client
        </Chip>
      </div>
    );
  },
};

/* ── Matrices (visual regression coverage for Chromatic) ──
   Hover needs a pointer, so it's tested by interaction; every static
   Figma state is here. */

const cell = {
  padding: "8px 20px 8px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
} as const;
const CONTENTS: { label: string; props: Partial<ChipProps> }[] = [
  { label: "Label", props: {} },
  { label: "Dot", props: { dot: true } },
  { label: "Leading icon", props: { icon: <Star /> } },
  { label: "Leading avatar", props: { avatar: <Avatar /> } },
  { label: "Trailing close", props: { onRemove: () => {} } },
];
const SELECTIONS: { label: string; props: Partial<ChipProps> }[] = [
  { label: "Default", props: { selected: false, onSelectChange: () => {} } },
  { label: "Selected", props: { selected: true, onSelectChange: () => {} } },
  {
    label: "Disabled",
    props: { selected: false, onSelectChange: () => {}, disabled: true },
  },
];

function Matrix({ size }: { size: ChipSize }) {
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Content
          </th>
          {SELECTIONS.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CONTENTS.map((c) => (
          <tr key={c.label}>
            <th
              scope="row"
              style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {c.label}
            </th>
            {SELECTIONS.map((s) => (
              <td key={s.label} style={cell}>
                <Chip size={size} {...s.props} {...c.props}>
                  Label
                </Chip>
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
