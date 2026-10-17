import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FlaskConical, Presentation, Video } from "lucide-react";
import { ListItem } from "./list-item";

const meta: Meta<typeof ListItem> = {
  title: "Fincaree/List Item",
  component: ListItem,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ListItem>;

const BRAND = "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]";
const SUCCESS = "bg-[var(--bg-status-success-subtle)] text-[var(--icon-status-success)]";

const frame = (children: React.ReactNode) => (
  <div role="radiogroup" aria-label="Content type" className="w-[420px] divide-y divide-[var(--border-tertiary)] border-y border-[var(--border-tertiary)] bg-[var(--bg-primary)]">
    {children}
  </div>
);

/** All four states in one list. Hover the first row: the tile keeps its white ring. */
export const States: Story = {
  render: () =>
    frame(
      <>
        <ListItem icon={<FlaskConical size={14} strokeWidth={1.75} />} tileClassName={BRAND}>Default (hover me)</ListItem>
        <ListItem icon={<Presentation size={14} strokeWidth={1.75} />} tileClassName={SUCCESS} selected>Selected</ListItem>
        <ListItem icon={<Video size={14} strokeWidth={1.75} />} tileClassName={BRAND} disabledReason="Not available for leads">Disabled</ListItem>
      </>
    ),
};

export const SingleChoice: Story = {
  render: function Render() {
    const [value, setValue] = useState("simulation");
    const opts = [
      { id: "simulation", label: "Simulation", icon: <FlaskConical size={14} strokeWidth={1.75} />, tile: BRAND },
      { id: "workshop", label: "Workshop", icon: <Presentation size={14} strokeWidth={1.75} />, tile: SUCCESS },
    ];
    return frame(
      opts.map((o) => (
        <ListItem key={o.id} icon={o.icon} tileClassName={o.tile} selected={value === o.id} onClick={() => setValue(o.id)}>
          {o.label}
        </ListItem>
      ))
    );
  },
};
