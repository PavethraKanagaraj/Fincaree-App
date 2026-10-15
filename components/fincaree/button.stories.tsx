import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Check, ChevronDown, Download, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "./button";

/* Controls can't edit a React element, so icons are picked by name and
   mapped to the real lucide icon (16px / 1.75 stroke, per the icon system). */
const ICON = (C: typeof Plus) => <C size={16} strokeWidth={1.75} />;
const ICON_OPTIONS = {
  None: undefined,
  Plus: ICON(Plus),
  ArrowRight: ICON(ArrowRight),
  Check: ICON(Check),
  ChevronDown: ICON(ChevronDown),
  Download: ICON(Download),
  Send: ICON(Send),
  Trash: ICON(Trash2),
};
const iconControl = {
  options: Object.keys(ICON_OPTIONS),
  mapping: ICON_OPTIONS,
  control: { type: "select" as const },
};

const meta = {
  title: "Fincaree/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Button (Hierarchy × Color × Size × State). `variant` maps to Hierarchy, `color` to Brand/Destructive. Colors come from the `--btn-*` tokens generated from `design-system/figma/components.json`.",
      },
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    color: "brand",
    size: "md",
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "tertiary", "link-brand", "link-grey"] },
    color: { control: "inline-radio", options: ["brand", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    iconOnly: { control: "boolean" },
    leadingIcon: iconControl,
    trailingIcon: iconControl,
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = ["primary", "secondary", "tertiary", "link-brand", "link-grey"] as const;
const SIZES = ["sm", "md", "lg", "xl"] as const;

const cell = { padding: "8px 16px 8px 0", fontSize: 12, color: "var(--text-tertiary)" } as const;

/* ── Single-button stories (use Controls to explore) ── */

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Tertiary: Story = { args: { variant: "tertiary" } };
export const LinkBrand: Story = { args: { variant: "link-brand" } };
export const LinkGrey: Story = { args: { variant: "link-grey" } };
export const Destructive: Story = { args: { color: "destructive" } };
export const WithIcons: Story = {
  args: { leadingIcon: "Plus" as never, trailingIcon: "ArrowRight" as never },
};
export const IconOnly: Story = {
  args: { iconOnly: true, leadingIcon: "Plus" as never, "aria-label": "Add" },
};
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

/* Figma's Hover/Focus states are CSS-only (:hover, :focus-visible), so these
   render each variant with its state tokens applied directly via inline
   style — no pseudo-class forcing, just the `--btn-*` tokens from
   globals.css. Brand and Destructive use separate token sets; Destructive
   has no Link Grey variant. */
const STATE_LABELS: Record<(typeof VARIANTS)[number], string> = {
  primary: "Primary Button",
  secondary: "Secondary Button",
  tertiary: "Tertiary Button",
  "link-brand": "Link brand",
  "link-grey": "Link grey",
};

type VariantStyles = Partial<Record<(typeof VARIANTS)[number], React.CSSProperties>>;

const HOVER_STYLES: Record<"brand" | "destructive", VariantStyles> = {
  brand: {
    primary: { backgroundColor: "var(--btn-primary-bg-hover)" },
    secondary: {
      backgroundColor: "var(--btn-secondary-bg-hover)",
      color: "var(--btn-secondary-text-hover)",
      borderColor: "var(--btn-secondary-border-hover)",
    },
    tertiary: {
      backgroundColor: "var(--btn-tertiary-bg-hover)",
      color: "var(--btn-tertiary-text-hover)",
    },
    "link-brand": { color: "var(--btn-link-brand-text-hover)" },
    "link-grey": { color: "var(--btn-link-grey-text-hover)" },
  },
  destructive: {
    primary: { backgroundColor: "var(--btn-dest-primary-bg-hover)" },
    secondary: {
      backgroundColor: "var(--btn-dest-secondary-bg-hover)",
      color: "var(--btn-dest-secondary-text-hover)",
      borderColor: "var(--btn-dest-secondary-border-hover)",
    },
    tertiary: {
      backgroundColor: "var(--btn-dest-tertiary-bg-hover)",
      color: "var(--btn-dest-tertiary-text-hover)",
    },
    "link-brand": {
      color: "var(--btn-dest-link-text-hover)",
      backgroundColor: "var(--btn-dest-link-bg-hover)",
    },
  },
};

const focusRing = (border: string, halo: string) =>
  `0 0 0 2px var(--color-white), 0 0 0 4px var(${border}), 0 0 0 8px var(${halo})`;

const FOCUS_STYLES: Record<"brand" | "destructive", VariantStyles> = {
  brand: {
    primary: { boxShadow: focusRing("--btn-primary-focus-border", "--btn-primary-focus-halo") },
    secondary: { boxShadow: focusRing("--btn-secondary-focus-border", "--btn-secondary-focus-halo") },
    tertiary: { boxShadow: focusRing("--btn-tertiary-focus-border", "--btn-tertiary-focus-halo") },
    // Link brand/grey have no focus ring in Figma — their focus text color
    // equals the default color, so there's no visible change at all.
  },
  destructive: {
    primary: { boxShadow: focusRing("--btn-dest-primary-focus-border", "--btn-dest-primary-focus-halo") },
    // Secondary/Tertiary destructive focus rings reuse their border/text color, per their CSS.
    secondary: { boxShadow: focusRing("--btn-dest-secondary-border", "--btn-dest-secondary-focus-halo") },
    tertiary: { boxShadow: focusRing("--btn-dest-tertiary-text", "--btn-dest-tertiary-focus-halo") },
    // Link destructive also has no focus ring, same as brand link variants.
  },
};

function renderStateRow(stylesByColor: Record<"brand" | "destructive", VariantStyles>) {
  return (args: React.ComponentProps<typeof Button>) => {
    const color = args.color ?? "brand";
    const variants = VARIANTS.filter((v) => !(color === "destructive" && v === "link-grey"));
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {variants.map((v) => (
          <Button
            key={v}
            variant={v}
            color={color}
            size={args.size}
            disabled={args.disabled}
            loading={args.loading}
            leadingIcon={args.leadingIcon}
            trailingIcon={args.trailingIcon}
            style={stylesByColor[color][v]}
          >
            {STATE_LABELS[v]}
          </Button>
        ))}
      </div>
    );
  };
}

// Each button already has a fixed variant/label by design — variant itself
// isn't controllable, but color (brand/destructive), size, disabled,
// loading, and icons apply uniformly across the row.
const stateArgTypes = {
  variant: { table: { disable: true } },
  children: { table: { disable: true } },
} as const;

export const Hover: Story = {
  render: renderStateRow(HOVER_STYLES),
  argTypes: stateArgTypes,
  parameters: { layout: "padded" },
};

export const Focus: Story = {
  render: renderStateRow(FOCUS_STYLES),
  argTypes: stateArgTypes,
  parameters: { layout: "padded" },
};

/* ── Matrices (visual regression coverage for Chromatic) ── */

function Matrix({ color }: { color: "brand" | "destructive" }) {
  const states: {
    label: string;
    props?: Partial<React.ComponentProps<typeof Button>>;
    style?: (v: (typeof VARIANTS)[number]) => React.CSSProperties | undefined;
  }[] = [
    { label: "Default" },
    { label: "Hover", style: (v) => HOVER_STYLES[color][v] },
    { label: "Focus", style: (v) => FOCUS_STYLES[color][v] },
    { label: "With icon", props: { leadingIcon: color === "destructive" ? <Trash2 size={16} strokeWidth={1.75} /> : <Plus size={16} strokeWidth={1.75} /> } },
    { label: "Loading", props: { loading: true } },
    { label: "Disabled", props: { disabled: true } },
  ];
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, textAlign: "left", fontWeight: 600 }}>Variant</th>
          {states.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, textAlign: "left", fontWeight: 600 }}>{s.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Figma's Destructive group has no Link Grey variant */}
        {VARIANTS.filter((v) => !(color === "destructive" && v === "link-grey")).map((v) => (
          <tr key={v}>
            <th scope="row" style={{ ...cell, textAlign: "left", fontWeight: 600 }}>{v}</th>
            {states.map((s) => (
              <td key={s.label} style={cell}>
                <Button variant={v} color={color} {...s.props} style={s.style?.(v)}>
                  {color === "destructive" ? "Delete" : "Button"}
                </Button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const AllBrandVariants: Story = {
  name: "Matrix · Brand",
  render: () => <Matrix color="brand" />,
  parameters: { layout: "padded" },
};

export const AllDestructiveVariants: Story = {
  name: "Matrix · Destructive",
  render: () => <Matrix color="destructive" />,
  parameters: { layout: "padded" },
};

export const AllSizes: Story = {
  name: "Matrix · Sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ ...cell, width: 32 }}>{size}</span>
          <Button size={size}>Button</Button>
          <Button size={size} variant="secondary">Button</Button>
          <Button size={size} leadingIcon={<Plus size={16} strokeWidth={1.75} />}>Button</Button>
          <Button size={size} iconOnly leadingIcon={<Plus size={16} strokeWidth={1.75} />} aria-label="Add" />
        </div>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
};
