import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ChevronDown,
  Copy,
  CreditCard,
  HelpCircle,
  Mail,
  Search,
} from "lucide-react";
import { Input, type InputTag } from "./input";

/* Icons follow the icon system and the Figma component: 20px leading
   (MD), 16px help icon (SM), Regular stroke. */
const LEAD = (C: typeof Mail) => <C size={20} strokeWidth={1.5} />;
const HELP = <HelpCircle size={16} strokeWidth={1.5} />;

const LEADING_ICONS = {
  None: undefined,
  Mail: LEAD(Mail),
  Search: LEAD(Search),
  CreditCard: LEAD(CreditCard),
};
const TRAILING_ICONS = { None: undefined, Help: HELP };
const select = (o: Record<string, unknown>) => ({
  options: Object.keys(o),
  mapping: o,
  control: { type: "select" as const },
});

/** Figma "Leading/Trailing dropdown": a real, keyboard-operable <select>
    styled to sit inline in the field. */
function InlineSelect({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <select
        aria-label={label}
        style={{
          appearance: "none",
          border: "none",
          background: "transparent",
          font: "inherit",
          color: "inherit",
          paddingRight: 18,
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        aria-hidden="true"
        style={{ position: "absolute", right: 0, pointerEvents: "none" }}
      />
    </span>
  );
}

const Frame = ({
  children,
  width = 320,
}: {
  children: React.ReactNode;
  width?: number;
}) => <div style={{ width }}>{children}</div>;

const INITIAL_TAGS: InputTag[] = [
  {
    id: "o",
    label: "Olivia",
    icon: <Initial letter="O" hue="var(--color-brand-200)" />,
  },
  {
    id: "p",
    label: "Phoenix",
    icon: <Initial letter="P" hue="var(--color-warning-200)" />,
  },
];

/* Photo-style silhouette in a person's colour — no text, so nothing for
   axe to mark "can't determine contrast" and nothing under 12px. */
function Initial({ hue }: { letter?: string; hue: string }) {
  return (
    <svg viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="8" fill={hue} />
      <circle cx="8" cy="6.2" r="2.8" fill="#1b1d21" fillOpacity="0.55" />
      <path d="M2.6 14.2a5.6 5.6 0 0 1 10.8 0A8 8 0 0 1 2.6 14.2Z" fill="#1b1d21" fillOpacity="0.55" />
    </svg>
  );
}

const COPY_BUTTON = (
  <button type="button">
    <Copy size={20} strokeWidth={1.5} aria-hidden="true" />
    Copy
  </button>
);

/* Slot props take React nodes, which Controls can't edit — so each gets a
   picker of presets, mapped to the real element (same as the icon controls). */
const LEADING_DROPDOWNS = {
  None: undefined,
  "Country code": (
    <InlineSelect label="Country code" options={["IN", "US", "GB", "SG"]} />
  ),
};
const TRAILING_DROPDOWNS = {
  None: undefined,
  Currency: <InlineSelect label="Currency" options={["INR", "USD", "EUR"]} />,
};
const TRAILING_ADDONS = {
  None: undefined,
  "Copy button": COPY_BUTTON,
  "Verify button": <button type="button">Verify</button>,
  "Static text": ".com",
};
const LABEL_ICONS = { None: undefined, Help: HELP };
const TAG_SETS = {
  None: undefined,
  Empty: [] as InputTag[],
  "Two users": INITIAL_TAGS,
};

const meta = {
  title: "Fincaree/Input",
  component: Input,
  decorators: [
    (Story, ctx) =>
      ctx.parameters.noFrame ? (
        <Story />
      ) : (
        <Frame>
          <Story />
        </Frame>
      ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Input field (9971:15525) — Size × Type × Destructive × State. Each Figma Type maps to a prop: Default → `leadingIcon`/`trailingIcon`, Payment input → `leadingIcon`, Leading/Trailing dropdown → `leadingDropdown`/`trailingDropdown`, Leading text → `leadingAddon`, Trailing button → `trailingAddon`, Tags → `tags`. Colours come from the `--input-*` tokens.",
      },
    },
  },
  args: {
    label: "Email",
    placeholder: "olivia@fincaree.com",
    hint: "We'll only use this for account notices.",
    size: "md",
    required: true,
    disabled: false,
    readOnly: false,
    leadingIcon: "Mail" as never,
    trailingIcon: "Help" as never,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    status: {
      control: "inline-radio",
      options: [undefined, "warning", "success"],
    },
    error: { control: "text" },
    leadingIcon: select(LEADING_ICONS),
    trailingIcon: select(TRAILING_ICONS),
    leadingDropdown: select(LEADING_DROPDOWNS),
    trailingDropdown: select(TRAILING_DROPDOWNS),
    leadingAddon: { control: "text" },
    trailingAddon: select(TRAILING_ADDONS),
    labelIcon: select(LABEL_ICONS),
    tags: select(TAG_SETS),
    onTagRemove: { action: "tag removed" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Figma "Type" variants ── */

export const Default: Story = {};

export const Small: Story = { args: { size: "sm" } };

export const PaymentInput: Story = {
  name: "Payment input",
  args: {
    label: "Card number",
    placeholder: "1234 1234 1234 1234",
    hint: undefined,
    leadingIcon: "CreditCard" as never,
    inputMode: "numeric",
  },
};

export const LeadingDropdown: Story = {
  name: "Leading dropdown",
  args: {
    label: "Phone number",
    placeholder: "+91 98765 43210",
    type: "tel",
    leadingIcon: undefined,
    leadingDropdown: "Country code" as never,
  },
};

export const TrailingDropdown: Story = {
  name: "Trailing dropdown",
  args: {
    label: "Sale amount",
    placeholder: "1,000.00",
    inputMode: "decimal",
    leadingIcon: undefined,
    trailingIcon: undefined,
    trailingDropdown: "Currency" as never,
  },
};

export const LeadingText: Story = {
  name: "Leading text",
  args: {
    label: "Website",
    placeholder: "www.fincaree.com",
    leadingIcon: undefined,
    leadingAddon: "https://",
  },
};

export const TrailingButton: Story = {
  name: "Trailing button",
  args: {
    label: "Referral link",
    defaultValue: "fincaree.com/r/olivia",
    readOnly: true,
    leadingIcon: undefined,
    trailingAddon: "Copy button" as never,
  },
};

/** Type a name and press Enter to add a tag; each chip's × removes it. */
export const Tags: Story = {
  args: {
    label: "Users",
    placeholder: "Add users",
    hint: "Press Enter to add.",
    leadingIcon: undefined,
    tags: "Two users" as never,
  },
  parameters: { noFrame: true },
  render: function Render(args) {
    // Local state so add/remove work; picking a preset in Controls resets it.
    const [tags, setTags] = useState(args.tags ?? []);
    useEffect(() => setTags(args.tags ?? []), [args.tags]);
    return (
      <Frame width={400}>
        <Input
          {...args}
          tags={tags}
          onTagRemove={(id) => {
            setTags((t) => t.filter((x) => x.id !== id));
            args.onTagRemove?.(id);
          }}
          onKeyDown={(e) => {
            const v = e.currentTarget.value.trim();
            if (e.key === "Enter" && v) {
              setTags((t) => [...t, { id: `${v}-${t.length}`, label: v }]);
              e.currentTarget.value = "";
            }
          }}
        />
      </Frame>
    );
  },
};

/* ── States ── */

export const ErrorState: Story = {
  name: "Error",
  args: { error: "Enter a valid email address.", defaultValue: "olivia@" },
};
export const Warning: Story = {
  args: {
    status: "warning",
    hint: "This domain often bounces mail.",
    defaultValue: "olivia@example.co",
  },
};
export const Success: Story = {
  args: {
    status: "success",
    hint: "Email verified.",
    defaultValue: "olivia@fincaree.com",
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultValue: "olivia@fincaree.com" },
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover and focus need a pointer or keyboard, so they're tested by
   interaction; every static state is here. */

type P = React.ComponentProps<typeof Input>;
const TYPES: { label: string; props: P }[] = [
  {
    label: "Default",
    props: {
      leadingIcon: LEAD(Mail),
      trailingIcon: HELP,
      placeholder: "olivia@fincaree.com",
    },
  },
  {
    label: "Leading dropdown",
    props: {
      leadingDropdown: (
        <InlineSelect label="Country code" options={["IN", "US"]} />
      ),
      placeholder: "+91 98765 43210",
    },
  },
  {
    label: "Trailing dropdown",
    props: {
      trailingDropdown: (
        <InlineSelect label="Currency" options={["INR", "USD"]} />
      ),
      placeholder: "1,000.00",
    },
  },
  {
    label: "Leading text",
    props: { leadingAddon: "https://", placeholder: "www.fincaree.com" },
  },
  {
    label: "Payment input",
    props: { leadingIcon: LEAD(CreditCard), placeholder: "Card number" },
  },
  {
    label: "Tags",
    props: {
      tags: INITIAL_TAGS,
      onTagRemove: () => {},
      placeholder: "Add users",
    },
  },
  {
    label: "Trailing button",
    props: {
      trailingAddon: (
        <button type="button">
          <Copy size={20} strokeWidth={1.5} aria-hidden="true" />
          Copy
        </button>
      ),
      placeholder: "fincaree.com/r/olivia",
    },
  },
];
const STATES: { label: string; props: P }[] = [
  { label: "Placeholder", props: {} },
  { label: "Filled", props: { defaultValue: "Filled value" } },
  { label: "Disabled", props: { disabled: true } },
  { label: "Error", props: { error: "This is an error message." } },
  {
    label: "Error · filled",
    props: { error: "This is an error message.", defaultValue: "Filled value" },
  },
];
const cell = {
  padding: "8px 20px 16px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
  verticalAlign: "top",
} as const;

/* Two narrower tables (normal states, error states) instead of one
   ~1,540px-wide table — cells past the canvas edge were clipped, which axe
   reports as text it can't check. */
function MatrixTable({ size, states, caption }: { size: "sm" | "md"; states: typeof STATES; caption: string }) {
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <caption style={{ ...cell, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", captionSide: "top" }}>{caption}</caption>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Type
          </th>
          {states.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TYPES.map((t) => (
          <tr key={t.label}>
            <th scope="row" style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}>
              {t.label}
            </th>
            {states.map((s) => (
              <td key={s.label} style={cell}>
                <Frame width={240}>
                  <Input size={size} label="Label" {...t.props} {...s.props} />
                </Frame>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Matrix({ size }: { size: "sm" | "md" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <MatrixTable size={size} states={STATES.slice(0, 3)} caption="Default states" />
      <MatrixTable size={size} states={STATES.slice(3)} caption="Error states" />
    </div>
  );
}

export const MatrixMd: Story = {
  name: "Matrix · md",
  parameters: { layout: "padded", noFrame: true },
  render: () => <Matrix size="md" />,
};

export const MatrixSm: Story = {
  name: "Matrix · sm",
  parameters: { layout: "padded", noFrame: true },
  render: () => <Matrix size="sm" />,
};
