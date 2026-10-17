import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable, type DataTableColumn } from "./data-table";
import { Badge } from "./badge";

interface Row {
  id: string;
  name: string;
  owner: string;
  status: "active" | "paused" | "done";
}

const NAMES = ["Retirement basics", "Tax saving tips", "SIP explorer", "Child education", "Market volatility", "Home purchase"];
const OWNERS = ["Anita", "Rahul", "Meera"];
const STATUS: Row["status"][] = ["active", "paused", "done"];
const ROWS: Row[] = Array.from({ length: 47 }, (_, i) => ({
  id: `r-${i}`,
  name: `${NAMES[i % NAMES.length]} #${i + 1}`,
  owner: OWNERS[i % OWNERS.length],
  status: STATUS[i % STATUS.length],
}));

const COLUMNS: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", className: "text-sm font-medium text-[var(--text-primary)]", cell: (r) => r.name },
  { id: "owner", header: "Owner", width: "w-32", className: "text-sm text-[var(--text-secondary)]", cell: (r) => r.owner },
  {
    id: "status",
    header: "Status",
    width: "w-32",
    cell: (r) => (
      <Badge size="sm" color={r.status === "active" ? "success" : r.status === "paused" ? "warning" : "gray"}>
        {r.status}
      </Badge>
    ),
  },
];

const meta: Meta<typeof DataTable<Row>> = {
  title: "Fincaree/Data Table",
  component: DataTable,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof DataTable<Row>>;

/** Search, a tab filter and a select filter, 47 rows at 10 per page. */
export const Default: Story = {
  render: () => (
    <DataTable<Row>
      aria-label="Example"
      rows={ROWS}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      pageSize={10}
      noun="items"
      search={{ placeholder: "Search items…", width: "w-[240px]", getText: (r) => [r.name, r.owner] }}
      filters={[
        {
          id: "status",
          kind: "tabs",
          label: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "done", label: "Done" },
          ],
          match: (r, v) => r.status === v,
        },
        {
          id: "owner",
          kind: "select",
          label: "Owner",
          allLabel: "Everyone",
          options: OWNERS.map((o) => ({ value: o, label: o })),
          match: (r, v) => r.owner === v,
        },
      ]}
    />
  ),
};

export const Empty: Story = {
  render: () => <DataTable<Row> aria-label="Empty" rows={[]} columns={COLUMNS} getRowId={(r) => r.id} noun="items" emptyMessage="Nothing here yet." />,
};
