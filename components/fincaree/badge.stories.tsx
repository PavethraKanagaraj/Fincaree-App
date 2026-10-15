import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge, type BadgeColor, type BadgeSize } from "./badge";

/* Figma Icon=Country / Icon=Avatar fill a 16px round slot. Both are drawn
   inline so stories never depend on an external image. */
const Flag = () => (
  <svg viewBox="0 0 16 16">
    <rect width="16" height="5.34" fill="#FF9933" />
    <rect y="5.33" width="16" height="5.34" fill="#FFFFFF" />
    <rect y="10.66" width="16" height="5.34" fill="#138808" />
    <circle
      cx="8"
      cy="8"
      r="1.6"
      fill="none"
      stroke="#000080"
      strokeWidth="0.6"
    />
  </svg>
);
/* A photo-style silhouette, like Figma's avatar image. Deliberately no
   text: SVG <text> over an SVG shape can't be contrast-checked by axe
   (it reports "incomplete"), and initials at 16px fall under the 12px
   text floor anyway. */
const Avatar = () => (
  <svg viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="var(--color-brand-100)" />
    <circle cx="8" cy="6.2" r="2.8" fill="var(--color-brand-500)" />
    <path d="M2.6 14.2a5.6 5.6 0 0 1 10.8 0A8 8 0 0 1 2.6 14.2Z" fill="var(--color-brand-500)" />
  </svg>
);

const LEADING = {
  None: undefined,
  Dot: "dot",
  Country: <Flag />,
  Avatar: <Avatar />,
};
const COLORS: BadgeColor[] = [
  "gray",
  "brand",
  "error",
  "warning",
  "success",
  "gray-blue",
];
const SIZES: BadgeSize[] = ["sm", "md", "lg"];

const meta = {
  title: "Fincaree/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Figma: Badge (9971:2598) — Size × Color × Icon. `leadingIcon="dot"` is Icon=Dot; a flag or avatar node is Icon=Country / Icon=Avatar (a 16px round slot). Figma\'s colour names map as Neutral → `gray`, Purple → `brand`, Info → `gray-blue`. Colours come from the `--badge-*` tokens. Badges are static labels — use Tag or Chip for anything removable or selectable.',
      },
    },
  },
  args: {
    children: "Label",
    size: "md",
    color: "brand",
    leadingIcon: "None" as never,
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    color: { control: "select", options: COLORS },
    leadingIcon: {
      options: Object.keys(LEADING),
      mapping: LEADING,
      control: { type: "select" },
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Figma "Icon" variants ── */

export const Default: Story = {};
export const Dot: Story = {
  args: { leadingIcon: "Dot" as never, children: "Active" },
};
export const Country: Story = {
  args: { leadingIcon: "Country" as never, children: "India" },
};
export const WithAvatar: Story = {
  name: "Avatar",
  args: { leadingIcon: "Avatar" as never, children: "Anita Thomas" },
};

/* ── Figma "Color" variants, in the meaning each carries in the product ── */

export const Gray: Story = { args: { color: "gray", children: "Draft" } };
export const Brand: Story = { args: { color: "brand", children: "New" } };
export const ErrorColor: Story = {
  name: "Error",
  args: { color: "error", leadingIcon: "Dot" as never, children: "Overdue" },
};
export const Warning: Story = {
  args: { color: "warning", leadingIcon: "Dot" as never, children: "Due soon" },
};
export const Success: Story = {
  args: {
    color: "success",
    leadingIcon: "Dot" as never,
    children: "Completed",
  },
};
export const GrayBlue: Story = {
  name: "Gray blue",
  args: { color: "gray-blue", children: "Scheduled" },
};

/* ── Matrices (visual regression coverage for Chromatic) ── */

const cell = {
  padding: "8px 20px 8px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
} as const;
const ICONS = [
  { label: "None", icon: undefined },
  { label: "Dot", icon: "dot" as const },
  { label: "Country", icon: <Flag /> },
  { label: "Avatar", icon: <Avatar /> },
];

function Matrix({ size }: { size: BadgeSize }) {
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Color
          </th>
          {ICONS.map((i) => (
            <th key={i.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {i.label}
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
            {ICONS.map((i) => (
              <td key={i.label} style={cell}>
                <Badge size={size} color={c} leadingIcon={i.icon}>
                  Label
                </Badge>
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
