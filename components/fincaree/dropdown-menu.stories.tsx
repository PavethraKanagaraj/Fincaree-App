import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  CalendarPlus,
  Copy,
  FilePlus,
  LogOut,
  MoreHorizontal,
  Pencil,
  Settings,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

/* Photo-style silhouette — no text, so nothing axe can't contrast-check. */
const Avatar = () => (
  <svg viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20" fill="var(--color-brand-100)" />
    <circle cx="20" cy="15.5" r="7" fill="var(--color-brand-500)" />
    <path
      d="M6.5 35.5a14 14 0 0 1 27 0A20 20 0 0 1 6.5 35.5Z"
      fill="var(--color-brand-500)"
    />
  </svg>
);
const I = (C: typeof User) => <C strokeWidth={1.75} />;
const onSelect = fn().mockName("item selected");

type Args = {
  open?: boolean;
  alignment?: "start" | "center" | "end";
  triggerLabel?: string;
};

const meta = {
  title: "Fincaree/Dropdown Menu",
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Action menu built on Base UI Menu (keyboard: Enter/Space/↓ opens, arrows move, Esc closes and returns focus). Its Figma node (9971:33038) no longer exists, so the panel chrome follows the Figma-backed Select menu. Use `render={<Button iconOnly aria-label=… />}` for a ⋯ trigger. For choosing a value in a form, use Select instead.",
      },
    },
  },
  args: { open: false, alignment: "start", triggerLabel: "Quick Action" },
  argTypes: {
    open: {
      control: "boolean",
      description: "Opens the menu (for inspecting it)",
    },
    alignment: { control: "inline-radio", options: ["start", "center", "end"] },
    triggerLabel: { control: "text" },
  },
  render: ({ open, alignment, triggerLabel }) => (
    <div style={{ minHeight: 300 }}>
      <DropdownMenu open={open || undefined}>
        <DropdownMenuTrigger icon={I(UserPlus)}>
          {triggerLabel}
        </DropdownMenuTrigger>
        <DropdownMenuContent alignment={alignment}>
          <DropdownMenuItem
            icon={I(UserPlus)}
            onClick={() => onSelect("Add lead")}
          >
            Add lead
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={I(CalendarPlus)}
            onClick={() => onSelect("Schedule meeting")}
          >
            Schedule meeting
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={I(FilePlus)}
            onClick={() => onSelect("New report")}
          >
            New report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The open menu, for visual regression. */
export const Open: Story = { args: { open: true } };

/** A ⋯ row menu — the trigger is an icon-only Fincaree Button with an aria-label. */
export const IconTrigger: Story = {
  name: "Icon trigger",
  render: () => (
    <div
      style={{
        minHeight: 280,
        display: "flex",
        justifyContent: "flex-end",
        width: 360,
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          showChevron={false}
          render={
            <Button
              variant="tertiary"
              size="sm"
              iconOnly
              leadingIcon={<MoreHorizontal size={16} strokeWidth={1.75} />}
              aria-label="More options for Anita Thomas"
            />
          }
        />
        <DropdownMenuContent alignment="end">
          <DropdownMenuItem icon={I(Pencil)} shortcut="E">
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem icon={I(Copy)} shortcut="D">
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={I(Trash2)} disabled>
            Delete (no permission)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

/** Account menu with the header, groups, labels, shortcuts and a separator. */
export const AccountMenu: Story = {
  name: "Account menu",
  args: { open: true },
  render: ({ open }) => (
    <div style={{ minHeight: 360 }}>
      <DropdownMenu open={open || undefined}>
        <DropdownMenuTrigger>Aditya Sharma</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuHeader
            avatar={<Avatar />}
            name="Aditya Sharma"
            email="aditya@fincaree.com"
            showStatus
          />
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Account</DropdownMenuGroupLabel>
            <DropdownMenuItem icon={I(User)} shortcut="⌘P">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem icon={I(Settings)} shortcut="⌘,">
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={I(LogOut)}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

/** Checkbox items — toggles that keep the menu open. */
export const CheckboxItems: Story = {
  name: "Checkbox items",
  args: { open: true },
  render: function CheckboxRender({ open }) {
    const [cols, setCols] = useState({
      client: true,
      stage: true,
      owner: false,
      updated: true,
    });
    const toggle = (k: keyof typeof cols) => (v: boolean) =>
      setCols((c) => ({ ...c, [k]: v }));
    return (
      <div style={{ minHeight: 280 }}>
        <DropdownMenu open={open || undefined}>
          <DropdownMenuTrigger>Columns</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuGroupLabel>Show columns</DropdownMenuGroupLabel>
              <DropdownMenuCheckboxItem
                checked={cols.client}
                onCheckedChange={toggle("client")}
              >
                Client
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.stage}
                onCheckedChange={toggle("stage")}
              >
                Stage
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.owner}
                onCheckedChange={toggle("owner")}
              >
                Owner
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.updated}
                onCheckedChange={toggle("updated")}
              >
                Last updated
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
};
