import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { User } from "lucide-react";
import {
  SelectField,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  type SelectFieldProps,
} from "./select";

/* Photo-style silhouette like Figma's avatars — no text, so nothing axe
   can't contrast-check. */
const Avatar = ({ hue = "var(--color-brand-100)" }: { hue?: string }) => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill={hue} />
    <circle cx="12" cy="9.3" r="4.2" fill="var(--color-brand-500)" />
    <path
      d="M3.9 21.3a8.4 8.4 0 0 1 16.2 0A12 12 0 0 1 3.9 21.3Z"
      fill="var(--color-brand-500)"
    />
  </svg>
);

const PEOPLE = [
  { value: "olivia", name: "Olivia Rhye", handle: "@olivia" },
  { value: "phoenix", name: "Phoenix Baker", handle: "@phoenix" },
  { value: "lana", name: "Lana Steiner", handle: "@lana" },
  { value: "demi", name: "Demi Wilkinson", handle: "@demi" },
  { value: "candice", name: "Candice Wu", handle: "@candice" },
  { value: "natali", name: "Natali Craig", handle: "@natali" },
  { value: "drew", name: "Drew Cano", handle: "@drew" },
];
/* The closed field shows the label from `items` — pass it whenever values
   differ from their labels. */
const PEOPLE_ITEMS = Object.fromEntries(PEOPLE.map((p) => [p.value, p.name]));

const LEADING = {
  None: undefined,
  Icon: "icon",
  Avatar: "avatar",
  Dot: "dot",
} as const;

type Args = SelectFieldProps & {
  supportingText?: boolean;
  leading?: keyof typeof LEADING;
};

function People({
  size,
  supportingText,
  leading,
}: {
  size?: "sm" | "md";
  supportingText?: boolean;
  leading?: SelectFieldProps["leadingType"];
}) {
  return (
    <>
      {PEOPLE.map((p) => (
        <SelectItem
          key={p.value}
          value={p.value}
          size={size}
          secondaryText={supportingText ? p.handle : undefined}
          leadingType={leading}
          leadingContent={
            leading === "icon" ? (
              <User />
            ) : leading === "avatar" ? (
              <Avatar />
            ) : undefined
          }
        >
          {p.name}
        </SelectItem>
      ))}
    </>
  );
}

function Render({ supportingText, leading = "None", ...args }: Args) {
  const type = LEADING[leading];
  return (
    <div style={{ width: 320 }}>
      <SelectField
        {...args}
        items={PEOPLE_ITEMS}
        leadingType={type}
        leadingContent={
          type === "icon" ? (
            <User />
          ) : type === "avatar" ? (
            <Avatar />
          ) : undefined
        }
      >
        <People
          size={args.size}
          supportingText={supportingText}
          leading={type}
        />
      </SelectField>
    </div>
  );
}

const meta = {
  title: "Fincaree/Select",
  component: SelectField,
  parameters: {
    docs: {
      description: {
        component:
          'Figma: Dropdowns/select (9971:33409) — Size × Type × State. Types: Default, Icon leading (`leadingType="icon"`), Avatar leading (`"avatar"`), Dot leading (`"dot"`). Pass `items` (value → label) so the closed field shows labels, and `aria-label` when there\'s no visible `label`. Label, required mark and hint share the Input\'s styling so fields match. Figma\'s Search and Tags types aren\'t implemented yet.',
      },
    },
  },
  args: {
    label: "Team member",
    hint: "The advisor who owns this client.",
    placeholder: "Select team member",
    size: "sm",
    required: false,
    disabled: false,
    supportingText: true,
    leading: "None",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    leading: {
      control: "select",
      options: Object.keys(LEADING),
      name: "leading (Figma Type)",
    },
    supportingText: {
      control: "boolean",
      description: 'Adds inline supporting text to each option ("@olivia")',
    },
    error: { control: "text" },
    leadingType: { table: { disable: true } },
    leadingContent: { table: { disable: true } },
    items: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  render: (args) => <Render {...args} />,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Figma "State" ── */

export const Placeholder: Story = {};
export const Filled: Story = { args: { defaultValue: "olivia" } };
/** The open menu, for visual regression. Five options, so none is half
    scrolled out of view (a clipped row can't be contrast-checked). */
export const Open: Story = {
  args: { defaultValue: "olivia", defaultOpen: true },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: 240 }}>
        <Story />
      </div>
    ),
  ],
  render: ({ supportingText, leading, ...args }) => (
    <div style={{ width: 320 }}>
      <SelectField {...args} items={PEOPLE_ITEMS}>
        {PEOPLE.slice(0, 5).map((p) => (
          <SelectItem
            key={p.value}
            value={p.value}
            secondaryText={supportingText ? p.handle : undefined}
          >
            {p.name}
          </SelectItem>
        ))}
      </SelectField>
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const ErrorState: Story = {
  name: "Error",
  args: { error: "Choose who owns this client.", required: true },
};
export const Medium: Story = { args: { size: "md", defaultValue: "olivia" } };

/* ── Figma "Type" ── */

export const IconLeading: Story = {
  name: "Icon leading",
  args: { leading: "Icon", defaultValue: "olivia" },
};
export const AvatarLeading: Story = {
  name: "Avatar leading",
  args: { leading: "Avatar", defaultValue: "olivia" },
};
export const DotLeading: Story = {
  name: "Dot leading",
  args: { leading: "Dot", defaultValue: "olivia" },
};

/** Groups and a separator inside the menu. */
export const Grouped: Story = {
  args: {
    label: "Report type",
    hint: undefined,
    placeholder: "Select report type",
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <SelectField
        {...args}
        items={{
          annual: "Annual review",
          quarterly: "Quarterly review",
          tax: "Tax summary",
          goal: "Goal tracker",
        }}
      >
        <SelectGroup>
          <SelectGroupLabel>Reviews</SelectGroupLabel>
          <SelectItem value="annual">Annual review</SelectItem>
          <SelectItem value="quarterly">Quarterly review</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Summaries</SelectGroupLabel>
          <SelectItem value="tax">Tax summary</SelectItem>
          <SelectItem value="goal">Goal tracker</SelectItem>
        </SelectGroup>
      </SelectField>
    </div>
  ),
};

/** A label-less filter bar, as on /meetings and /reports — each select is
    named with `aria-label`. */
export const FilterBar: Story = {
  name: "Filter bar",
  render: function FilterBarRender() {
    const [status, setStatus] = useState("all");
    const [mode, setMode] = useState("all");
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <SelectField
          size="sm"
          aria-label="Status"
          className="w-[150px]"
          value={status}
          onValueChange={(v) => setStatus(v as string)}
          items={{
            all: "All statuses",
            upcoming: "Upcoming",
            done: "Completed",
          }}
        >
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="done">Completed</SelectItem>
        </SelectField>
        <SelectField
          size="sm"
          aria-label="Mode"
          className="w-[140px]"
          value={mode}
          onValueChange={(v) => setMode(v as string)}
          items={{
            all: "All modes",
            video: "Video",
            call: "Call",
            visit: "In person",
          }}
        >
          <SelectItem value="all">All modes</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="visit">In person</SelectItem>
        </SelectField>
      </div>
    );
  },
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover and focus need a pointer or keyboard; the Open story covers the menu. */

const cell = {
  padding: "8px 20px 12px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
  verticalAlign: "top",
} as const;
const TYPES: { label: string; type?: SelectFieldProps["leadingType"] }[] = [
  { label: "Default" },
  { label: "Icon leading", type: "icon" },
  { label: "Avatar leading", type: "avatar" },
  { label: "Dot leading", type: "dot" },
];
const STATES: { label: string; props: Partial<SelectFieldProps> }[] = [
  { label: "Placeholder", props: {} },
  { label: "Filled", props: { defaultValue: "olivia" } },
  { label: "Disabled", props: { disabled: true, defaultValue: "olivia" } },
  { label: "Error", props: { error: "Required.", defaultValue: "olivia" } },
];

function Matrix({ size }: { size: "sm" | "md" }) {
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, fontWeight: 600 }}>
            Type
          </th>
          {STATES.map((s) => (
            <th key={s.label} scope="col" style={{ ...cell, fontWeight: 600 }}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TYPES.map((t) => (
          <tr key={t.label}>
            <th
              scope="row"
              style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {t.label}
            </th>
            {STATES.map((s) => (
              <td key={s.label} style={cell}>
                <div style={{ width: 220 }}>
                  <SelectField
                    size={size}
                    label="Label"
                    placeholder="Select"
                    items={PEOPLE_ITEMS}
                    leadingType={t.type}
                    leadingContent={
                      t.type === "icon" ? (
                        <User />
                      ) : t.type === "avatar" ? (
                        <Avatar />
                      ) : undefined
                    }
                    {...s.props}
                  >
                    <People size={size} />
                  </SelectField>
                </div>
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
