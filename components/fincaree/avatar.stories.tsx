import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  Avatar,
  AvatarAddButton,
  AvatarGroup,
  AvatarLabelGroup,
  type AvatarLabelGroupSize,
  type AvatarSize,
  type AvatarStatus,
} from "./avatar";

/* Portraits from the Figma Avatar page ("Avatar user square/<name>" image
   styles), served locally from public/avatars so Chromatic runs are stable. */
const PEOPLE = [
  "Olivia Rhye",
  "Phoenix Baker",
  "Lana Steiner",
  "Demi Wilkinson",
  "Candice Wu",
  "Natali Craig",
  "Drew Cano",
  "Orlando Diggs",
  "Andi Lane",
  "Kate Morrison",
].map((name) => ({
  name,
  src: `/avatars/${name.toLowerCase().replace(" ", "-")}.jpg`,
}));

const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const onClick = fn().mockName("onClick");

type Content = "Photo" | "Initials" | "Placeholder";
type Args = {
  size: AvatarSize;
  content: Content;
  alt: string;
  initials: string;
  indicator: "none" | AvatarStatus | "verified";
  interactive: boolean;
};

const meta = {
  title: "Fincaree/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Figma: Avatar (9971:35607) — Size × Placeholder × Text × Status icon, plus Group, Label group, Add button and Interactive. Pass `alt` (the person's name): it becomes the photo's alt text, or the avatar's accessible name when there's no photo. Leave it out only when the name is printed beside the avatar. `interactive` renders a `<button>` with hover/active overlay and a focus ring. Colours come from the `--avatar-*` tokens.",
      },
    },
  },
  args: {
    size: "md",
    content: "Initials",
    alt: "Olivia Rhye",
    initials: "OR",
    indicator: "none",
    interactive: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    content: {
      control: "inline-radio",
      options: ["Photo", "Initials", "Placeholder"],
      description: "Figma Placeholder / Text properties",
    },
    alt: { control: "text", description: "The person's name" },
    initials: { control: "text", if: { arg: "content", eq: "Initials" } },
    indicator: {
      control: "select",
      options: ["none", "online", "offline", "away", "busy", "verified"],
      name: "indicator (Figma Status icon)",
    },
    interactive: { control: "boolean" },
  },
  render: ({ content, indicator, interactive, ...args }: Args) => (
    <Avatar
      size={args.size}
      alt={args.alt || undefined}
      src={content === "Photo" ? PEOPLE[0].src : undefined}
      initials={content === "Initials" ? args.initials : undefined}
      status={
        indicator === "none" || indicator === "verified" ? undefined : indicator
      }
      verified={indicator === "verified"}
      interactive={interactive}
      onClick={interactive ? onClick : undefined}
    />
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Photo: Story = { args: { content: "Photo" } };
export const Placeholder: Story = { args: { content: "Placeholder" } };
export const Online: Story = {
  name: "Online indicator",
  args: { content: "Photo", indicator: "online" },
};
export const Verified: Story = {
  args: { content: "Photo", indicator: "verified" },
};
/** A profile-menu trigger — tab to it to see the focus ring. */
export const Interactive: Story = {
  args: { content: "Photo", interactive: true, alt: "Account menu" },
};

/* ── Group ── */

export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["xs", "sm", "md"] as const).map((size) => (
        <AvatarGroup
          key={size}
          size={size}
          overflow={5}
          aria-label={`Advisors on this account (${size})`}
          action={<AvatarAddButton size={size} tooltip="Add advisor" />}
        >
          {PEOPLE.map((p) => (
            <Avatar key={p.name} size={size} src={p.src} alt={p.name} />
          ))}
        </AvatarGroup>
      ))}
    </div>
  ),
};

/* ── Label group ── */

const LABEL_SIZES: { size: AvatarLabelGroupSize; avatar: AvatarSize }[] = [
  { size: "sm", avatar: "sm" },
  { size: "md", avatar: "md" },
  { size: "lg", avatar: "lg" },
  { size: "xl", avatar: "xl" },
];

export const LabelGroup: Story = {
  name: "Label group",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {LABEL_SIZES.map(({ size, avatar }, i) => (
        <AvatarLabelGroup
          key={size}
          size={size}
          avatar={
            <Avatar
              size={avatar}
              src={PEOPLE[0].src}
              alt=""
              status={i === 1 ? "online" : undefined}
              verified={i === 2}
            />
          }
          name="Olivia Rhye"
          subtitle="olivia@fincaree.com"
        />
      ))}
    </div>
  ),
};

/* ── Add button ── */

export const AddButton: Story = {
  name: "Add button",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {(["xs", "sm", "md"] as const).map((size) => (
        <AvatarAddButton key={size} size={size} tooltip="Add advisor" />
      ))}
      {(["xs", "sm", "md"] as const).map((size) => (
        <AvatarAddButton
          key={`d-${size}`}
          size={size}
          aria-label="Add advisor (limit reached)"
          disabled
        />
      ))}
    </div>
  ),
};

/* ── Matrix (visual regression coverage for Chromatic) ──
   Hover, active and focus need a pointer or keyboard; every static state
   is here. */

const cell = {
  padding: "8px 20px 8px 0",
  fontSize: 12,
  color: "var(--text-tertiary)",
  textAlign: "left",
  verticalAlign: "middle",
} as const;

const ROWS: {
  label: string;
  props: (s: AvatarSize) => ComponentProps<typeof Avatar>;
}[] = [
  { label: "Photo", props: () => ({ src: PEOPLE[1].src, alt: "Phoenix Baker" }) },
  { label: "Initials", props: () => ({ initials: "OR", alt: "Olivia Rhye" }) },
  { label: "Placeholder", props: () => ({ alt: "Unknown client" }) },
  {
    label: "Photo · online",
    props: () => ({ src: PEOPLE[2].src, alt: "Lana Steiner", status: "online" }),
  },
  {
    label: "Initials · online",
    props: () => ({ initials: "OR", alt: "Olivia Rhye", status: "online" }),
  },
  {
    label: "Placeholder · online",
    props: () => ({ alt: "Unknown client", status: "online" }),
  },
  {
    label: "Photo · verified",
    props: () => ({ src: PEOPLE[3].src, alt: "Demi Wilkinson", verified: true }),
  },
];

export const Matrix: Story = {
  parameters: { layout: "padded", controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th scope="col" style={{ ...cell, fontWeight: 600 }}>
              Content · indicator
            </th>
            {SIZES.map((s) => (
              <th key={s} scope="col" style={{ ...cell, fontWeight: 600 }}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label}>
              <th scope="row" style={{ ...cell, fontWeight: 600 }}>
                {r.label}
              </th>
              {SIZES.map((s) => (
                <td key={s} style={cell}>
                  <Avatar size={s} {...r.props(s)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ ...cell, fontWeight: 600 }}>Status</span>
        {(["online", "offline", "away", "busy"] as const).map((st) => (
          <Avatar
            key={st}
            size="lg"
            src={PEOPLE[4].src}
            alt={`Candice Wu, ${st}`}
            status={st}
          />
        ))}
      </div>
    </div>
  ),
};
