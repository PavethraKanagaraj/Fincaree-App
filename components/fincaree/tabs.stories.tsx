import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BarChart3, FileText, History, User } from "lucide-react";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTrigger,
  type TabsVariant,
} from "./tabs";

const onValueChange = fn().mockName("onValueChange");
const I = (C: typeof User) => <C strokeWidth={1.75} />;

type Args = {
  variant: TabsVariant;
  orientation: "horizontal" | "vertical";
  icons: boolean;
  disableLast: boolean;
};

const TABS = [
  {
    value: "overview",
    label: "Overview",
    icon: BarChart3,
    body: "Portfolio value, goals on track and upcoming reviews.",
  },
  {
    value: "profile",
    label: "Profile",
    icon: User,
    body: "Contact details, risk profile and household members.",
  },
  {
    value: "reports",
    label: "Reports",
    icon: FileText,
    body: "Generated reports and their delivery status.",
  },
  {
    value: "history",
    label: "History",
    icon: History,
    body: "Every meeting, call and note in date order.",
  },
];

const panel = {
  padding: 16,
  border: "1px solid var(--border-secondary)",
  borderRadius: 8,
  fontSize: 14,
  lineHeight: "20px",
  color: "var(--text-secondary)",
  minWidth: 280,
} as const;

function Demo({ variant, orientation, icons, disableLast }: Args) {
  const [value, setValue] = useState("overview");
  return (
    <Tabs
      variant={variant}
      orientation={orientation}
      value={value}
      onValueChange={(v) => {
        setValue(v as string);
        onValueChange(v);
      }}
    >
      <TabsList aria-label="Client sections">
        {TABS.map((t, i) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            icon={icons ? I(t.icon) : undefined}
            disabled={disableLast && i === TABS.length - 1}
          >
            {t.label}
          </TabsTrigger>
        ))}
        {variant === "line" && <TabsIndicator />}
      </TabsList>
      {TABS.map((t) => (
        <TabsPanel key={t.value} value={t.value} style={panel}>
          {t.body}
        </TabsPanel>
      ))}
    </Tabs>
  );
}

const meta = {
  title: "Fincaree/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Figma: Tabs (10390:14617) — Style × Orientation. `variant="pill"` is a segmented control; `variant="line"` underlines the active tab (add `<TabsIndicator />` as the last child of the list). Keyboard: Tab into the list, arrow keys move between tabs, Home/End jump. Give the list an `aria-label`. Colours come from the `--tabs-*` tokens.',
      },
    },
  },
  args: {
    variant: "pill",
    orientation: "horizontal",
    icons: false,
    disableLast: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["pill", "line"],
      name: "variant (Figma Style)",
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    icons: { control: "boolean", description: "Leading icon on each tab" },
    disableLast: { control: "boolean", description: "Disable the last tab" },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pill: Story = {};
export const Line: Story = { args: { variant: "line" } };
export const PillVertical: Story = {
  name: "Pill · vertical",
  args: { orientation: "vertical" },
};
export const WithIcons: Story = { name: "With icons", args: { icons: true } };
export const LineWithIcons: Story = {
  name: "Line · with icons",
  args: { variant: "line", icons: true },
};
export const Disabled: Story = {
  name: "Disabled tab",
  args: { disableLast: true },
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover and focus need a pointer or keyboard; every static state is here. */

export const Matrix: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {(["pill", "line"] as const).map((variant) => (
        <div
          key={variant}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-tertiary)",
            }}
          >
            {variant} · default / active / disabled
          </span>
          <Tabs variant={variant} defaultValue="profile">
            <TabsList aria-label={`${variant} tabs`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="history" disabled>
                History
              </TabsTrigger>
              {variant === "line" && <TabsIndicator />}
            </TabsList>
          </Tabs>
          <Tabs variant={variant} defaultValue="profile">
            <TabsList aria-label={`${variant} tabs with icons`}>
              <TabsTrigger value="overview" icon={I(BarChart3)}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" icon={I(User)}>
                Profile
              </TabsTrigger>
              <TabsTrigger value="history" icon={I(History)} disabled>
                History
              </TabsTrigger>
              {variant === "line" && <TabsIndicator />}
            </TabsList>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};
