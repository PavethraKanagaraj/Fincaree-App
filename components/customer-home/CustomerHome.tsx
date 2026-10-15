import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Coins,
  CreditCard,
  Droplet,
  Hourglass,
  Landmark,
  Link2,
  PieChart,
  Pencil,
  Percent,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Umbrella,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   Your financial picture — the customer home. Shown after the risk
   and preferences step is submitted. Layout and figures follow the
   "Your financial picture" design.
   ============================================================ */

const CUSTOMER = { name: "Arjun", age: 61, lifeStage: "Retired", horizon: "24 years", horizonNote: "Till age 85" };

const SNAPSHOT: { label: string; value: string; note: string; icon: LucideIcon }[] = [
  { label: "Age", value: "61", note: "years", icon: UserRound },
  { label: "Life stage", value: "Retired", note: "Income from savings and investments", icon: Briefcase },
  { label: "Planning horizon", value: CUSTOMER.horizon, note: CUSTOMER.horizonNote, icon: CalendarDays },
  { label: "Total assets", value: "₹30,00,000", note: "Across savings, investments and other assets", icon: Wallet },
  { label: "Monthly expenses", value: "₹42,000", note: "Estimated", icon: Receipt },
  { label: "Selected goals", value: "5", note: "Goals", icon: Target },
];

type AssetRow = { label: string; amount: string; value: number; pct: number; color: string };

const ASSET_MIX: (AssetRow & { icon: LucideIcon; desc: string; textColor?: string; sub?: AssetRow[] })[] = [
  {
    label: "Investments",
    desc: "Mutual funds, stocks, bonds etc.",
    amount: "₹14,00,000",
    value: 1400000,
    pct: 47,
    color: "var(--color-brand-700)",
    icon: TrendingUp,
    sub: [
      { label: "Mutual funds", amount: "₹7,00,000", value: 700000, pct: 23, color: "var(--color-brand-500)" },
      { label: "Equity / stocks", amount: "₹4,00,000", value: 400000, pct: 13, color: "var(--color-brand-400)" },
      { label: "Bonds / debt funds", amount: "₹3,00,000", value: 300000, pct: 10, color: "var(--color-brand-200)" },
    ],
  },
  {
    label: "Fixed deposits",
    desc: "Bank FDs, corporate FDs etc.",
    amount: "₹8,00,000",
    value: 800000,
    pct: 27,
    color: "var(--color-blue-600)",
    textColor: "var(--color-blue-700)",
    icon: Landmark,
    sub: [
      { label: "Bank FDs", amount: "₹5,00,000", value: 500000, pct: 17, color: "var(--color-blue-400)" },
      { label: "Corporate FDs", amount: "₹2,00,000", value: 200000, pct: 7, color: "var(--color-blue-300)" },
      { label: "Tax-saver FD", amount: "₹1,00,000", value: 100000, pct: 3, color: "var(--color-blue-100)" },
    ],
  },
  {
    label: "Savings",
    desc: "Bank accounts, recurring deposits etc.",
    amount: "₹5,00,000",
    value: 500000,
    pct: 17,
    color: "var(--color-purple-600)",
    icon: Wallet,
    sub: [
      { label: "Bank savings account", amount: "₹3,50,000", value: 350000, pct: 12, color: "var(--color-purple-400)" },
      { label: "Recurring deposit", amount: "₹1,50,000", value: 150000, pct: 5, color: "var(--color-purple-200)" },
    ],
  },
  {
    label: "Other assets",
    desc: "Gold, PPF, EPF etc.",
    amount: "₹3,00,000",
    value: 300000,
    pct: 10,
    color: "var(--chart-series-04)",
    textColor: "var(--color-green-700)",
    icon: Link2,
    sub: [
      { label: "Gold", amount: "₹2,00,000", value: 200000, pct: 7, color: "var(--color-green-400)" },
      { label: "PPF / EPF", amount: "₹1,00,000", value: 100000, pct: 3, color: "var(--color-green-200)" },
    ],
  },
];

const ASSET_AXIS_MAX = 1400000;
const ASSET_AXIS_TICKS = [0, 200000, 400000, 600000, 800000, 1000000, 1200000, 1400000];
const ASSET_GRID_COLS = "grid-cols-[14.5rem_1fr_3.5rem]";

function formatLakh(v: number) {
  return v === 0 ? "0" : `${v / 100000}L`;
}

const CONNECTED_ACCOUNTS: { name: string; type: string; icon: LucideIcon; color: string; logo?: string }[] = [
  { name: "HDFC Bank", type: "Savings", icon: Landmark, color: "#004B8D", logo: "/brand/accounts/hdfc-bank.png" },
  { name: "ICICI Bank", type: "Savings", icon: Landmark, color: "#0874D8", logo: "/brand/accounts/icici-bank.png" },
  { name: "SBI Bank", type: "Savings", icon: Landmark, color: "#1166DD", logo: "/brand/accounts/sbi-bank.png" },
  { name: "Groww", type: "Investments", icon: TrendingUp, color: "#16C79A", logo: "/brand/accounts/groww.png" },
  { name: "Zerodha", type: "Investments", icon: BarChart3, color: "#D7272D", logo: "/brand/accounts/zerodha.png" },
  { name: "EPFO", type: "Retirement", icon: ShieldCheck, color: "#174A9C", logo: "/brand/accounts/epfo.png" },
];

type Status = "good" | "attention" | "review";

const HEALTH: { label: string; score: number; status: Status; note: string; icon: LucideIcon }[] = [
  { label: "Liquidity", score: 72, status: "good", note: "You have accessible savings for near-term needs.", icon: Droplet },
  { label: "Tax efficiency", score: 58, status: "attention", note: "There may be opportunities to better manage your tax outgo.", icon: Percent },
  { label: "Longevity", score: 66, status: "attention", note: "Your savings and income may need to stretch for 24+ years.", icon: Hourglass },
  { label: "Protection", score: 60, status: "attention", note: "You may explore additional protection for you and your family.", icon: ShieldCheck },
];

/* The overall score is the average of the four areas above. */
const OVERALL_SCORE = Math.round(HEALTH.reduce((sum, h) => sum + h.score, 0) / HEALTH.length);

const STATUS_STYLE: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  good: { label: "Good", color: "var(--color-success-600)", bg: "bg-[var(--bg-status-success-subtle)]", border: "border-[var(--border-status-success)]" },
  attention: { label: "Needs attention", color: "var(--color-warning-500)", bg: "bg-[var(--bg-status-warning-subtle)]", border: "border-[var(--border-status-warning)]" },
  review: { label: "Review recommended", color: "var(--color-warning-500)", bg: "bg-[var(--bg-status-warning-subtle)]", border: "border-[var(--border-status-warning)]" },
};

const INSIGHTS: { title: string; body: string; icon: LucideIcon; tone: "warning" | "brand" | "success" }[] = [
  {
    title: "Your money is mostly in long-term investments.",
    body: "A significant portion of your assets are in investments and fixed deposits, which may be less accessible for unexpected expenses.",
    icon: Coins,
    tone: "warning",
  },
  {
    title: "Your retirement and emergency needs are closely connected.",
    body: "Planning for regular income and keeping an adequate emergency fund can help you maintain your lifestyle with more confidence.",
    icon: Umbrella,
    tone: "brand",
  },
  {
    title: "There may be opportunities to improve tax efficiency.",
    body: "Your advisor can help explore tax-efficient options based on your income and goals.",
    icon: TrendingUp,
    tone: "success",
  },
];

const TONE: Record<"warning" | "brand" | "success", { surface: string; icon: string }> = {
  warning: { surface: "bg-[var(--bg-status-warning-subtle)]", icon: "text-[var(--icon-status-warning)]" },
  brand: { surface: "bg-[var(--bg-brand-subtle)]", icon: "text-[var(--icon-brand-primary)]" },
  success: { surface: "bg-[var(--bg-status-success-subtle)]", icon: "text-[var(--icon-status-success)]" },
};

const GOAL_ROWS: { goal: string; desc: string; plan: string; planNote: string; position: string; status: Status; statusText: string; icon: LucideIcon }[] = [
  { goal: "Retirement income", desc: "Regular income and lifestyle after retirement.", plan: "₹60,000 / month", planNote: "from age 67", position: "Based on current assets and expected income", status: "attention", statusText: "Needs attention", icon: Umbrella },
  { goal: "Grow & manage my money", desc: "Diversification and wealth creation.", plan: "Invest ₹30,000", planNote: "one-time", position: "Existing portfolio across multiple assets", status: "good", statusText: "On track", icon: TrendingUp },
  { goal: "Major goal", desc: "Home, travel or a large purchase.", plan: "₹30,00,000", planNote: "by 2030", position: "Initial planning done", status: "attention", statusText: "Needs attention", icon: Target },
  { goal: "Protect myself & my family", desc: "Health, life insurance and income protection.", plan: "Review cover", planNote: "in next 6 months", position: "Basic cover in place", status: "review", statusText: "Review recommended", icon: ShieldCheck },
  { goal: "Emergency fund", desc: "6–12 months of expenses.", plan: "₹3,00,000", planNote: "", position: "Currently ₹1,50,000", status: "attention", statusText: "Needs attention", icon: Zap },
];

/* A ruler-axis row for each asset category — icon chip, label and
   description, a bar scaled against a shared rupee-value track with
   gridlines, and the amount/share on the right. Each category's own mix
   (mutual funds, bank FDs, etc.) sits underneath on the same scale,
   connected by a vertical rule. */
function AssetMixRow({
  icon: Icon,
  label,
  desc,
  amount,
  pct,
  value,
  color,
  textColor,
  indent,
}: {
  icon?: LucideIcon;
  label: string;
  desc?: string;
  amount: string;
  pct: number;
  value: number;
  color: string;
  textColor?: string;
  indent?: boolean;
}) {
  const fillPct = Math.max((value / ASSET_AXIS_MAX) * 100, 3);
  const labelInside = fillPct >= 60;
  return (
    <div className={cn("grid items-center gap-3", ASSET_GRID_COLS)}>
      <div className={cn("flex min-w-0 items-start gap-3", indent && "pl-[3.25rem]")}>
        {Icon && (
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, var(--bg-primary))`, color }}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden />
          </span>
        )}
        <div className="min-w-0 pt-0.5">
          <div className={cn("truncate text-[var(--text-primary)]", indent ? "text-sm text-[var(--text-secondary)]" : "text-base font-bold")}>{label}</div>
          {desc && <div className="mt-0.5 text-xs leading-snug text-[var(--text-tertiary)]">{desc}</div>}
        </div>
      </div>
      <div
        className="relative h-8 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]"
        style={{ backgroundImage: "repeating-linear-gradient(to right, var(--border-tertiary) 0, var(--border-tertiary) 1px, transparent 1px, transparent 14.2857%)" }}
      >
        <div
          className="flex h-full items-center justify-end rounded-[var(--radius-sm)] px-2.5 transition-[width] duration-300"
          style={{ width: `${fillPct}%`, backgroundColor: color }}
        >
          {labelInside && <span className="text-xs font-bold tabular-nums text-white">{amount}</span>}
        </div>
        {!labelInside && (
          <span
            className="absolute inset-y-0 flex items-center text-xs font-semibold tabular-nums text-[var(--text-primary)]"
            style={{ left: `calc(${fillPct}% + 8px)` }}
          >
            {amount}
          </span>
        )}
      </div>
      <div className={cn("text-right tabular-nums", indent ? "text-xs text-[var(--text-tertiary)]" : "text-base font-bold")} style={!indent ? { color: textColor ?? color } : undefined}>
        {pct}%
      </div>
    </div>
  );
}

function AssetMixChart() {
  return (
    <div className="flex flex-col">
      <div className={cn("grid items-end gap-3 pb-1.5", ASSET_GRID_COLS)}>
        <div />
        <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
          {ASSET_AXIS_TICKS.map((t) => (
            <span key={t}>{formatLakh(t)}</span>
          ))}
        </div>
        <div />
      </div>
      <div className="flex flex-col">
        {ASSET_MIX.map((a, i) => (
          <div key={a.label} className={cn("flex flex-col gap-2 py-3", i > 0 && "border-t border-[var(--border-tertiary)]")}>
            <AssetMixRow icon={a.icon} label={a.label} desc={a.desc} amount={a.amount} pct={a.pct} value={a.value} color={a.color} textColor={a.textColor} />
            {a.sub && (
              <div className="relative flex flex-col gap-2">
                <div className="absolute bottom-2 left-6 top-0 w-px bg-[var(--border-tertiary)]" aria-hidden />
                {a.sub.map((s) => (
                  <AssetMixRow key={s.label} label={s.label} amount={s.amount} pct={s.pct} value={s.value} color={s.color} indent />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Semicircle gauge for the overall score — a half-ring arc with a rounded
   cap, filled in proportion to the score out of 100. */
function OverallGauge({ score }: { score: number }) {
  const r = 120;
  const cx = 150;
  const cy = 150;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const arcLength = Math.PI * r;
  const filled = (Math.min(100, Math.max(0, score)) / 100) * arcLength;
  const good = score >= 70;
  const color = good ? "var(--color-success-600)" : "var(--color-warning-500)";
  return (
    <div className="relative h-[165px] w-full max-w-[300px]">
      <svg viewBox="0 0 300 165" className="h-full w-full" aria-hidden>
        <path d={arc} fill="none" stroke="var(--bg-secondary)" strokeWidth="20" strokeLinecap="round" />
        <path d={arc} fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeDasharray={`${filled} ${arcLength}`} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-3">
        <span className="text-5xl font-bold tabular-nums text-[var(--text-primary)]">{score}</span>
        <span className="text-xl text-[var(--text-tertiary)]">/100</span>
      </div>
    </div>
  );
}

function ScoreRing({ score, status }: { score: number; status: Status }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = status === "good" ? "var(--color-success-600)" : "var(--color-warning-500)";
  return (
    <div className="relative h-[60px] w-[60px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-[var(--text-primary)]">{score}</div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5", className)}>{children}</section>
  );
}

function SectionHead({ title, subtitle, action, tag }: { title: string; subtitle?: string; action?: React.ReactNode; tag?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
          {tag && <Badge size="sm" color="brand">✦ {tag}</Badge>}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function TextAction({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline">
      {children}
    </button>
  );
}

export function CustomerHome() {
  return (
    <div className="px-6 py-6 max-w-[1280px] mx-auto flex flex-col gap-5">
      {/* Greeting header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">Good morning, {CUSTOMER.name}! 👋</h1>
          <p className="mt-1.5 text-sm text-[var(--text-tertiary)] leading-relaxed">
            Here&apos;s your financial overview and what matters to you today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <RefreshCw size={13} aria-hidden /> Last synced: Today, 7:30 AM
          </span>
          <Button variant="secondary" size="sm" leadingIcon={<Link2 size={15} aria-hidden />}>
            Connect Accounts
          </Button>
          <button
            type="button"
            aria-label="Notifications, 3 unread"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-secondary)] text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)]"
          >
            <Bell size={16} aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error-500)] text-[9px] font-bold text-white">3</span>
          </button>
        </div>
      </div>

      {/* Profile completion status + schedule meeting CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--border-status-success)] bg-[var(--bg-status-success-subtle)] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-600)] text-white">
            <Check size={18} strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[var(--text-status-success)]">Your profile is complete!</div>
            <div className="truncate text-xs text-[var(--text-secondary)]">Your profile is ready for personalised insights and advisory support.</div>
          </div>
        </div>
        <Button variant="primary" size="md" leadingIcon={<CalendarDays size={16} strokeWidth={2} aria-hidden />} trailingIcon={<ChevronRight size={16} aria-hidden />}>
          Schedule a meeting
        </Button>
      </div>

      {/* Snapshot and connected accounts */}
      <Card>
        <SectionHead title="Your current financial snapshot" subtitle="Key details based on the information you've shared." action={<TextAction><Pencil size={13} aria-hidden /> Edit details</TextAction>} />
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {SNAPSHOT.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
                  <Icon size={17} strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-xs text-[var(--text-tertiary)]">{s.label}</div>
                  <div className="truncate text-base font-bold tabular-nums text-[var(--text-primary)]">{s.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[var(--border-tertiary)] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Connected Accounts <span className="font-normal text-[var(--text-tertiary)]">({CONNECTED_ACCOUNTS.length})</span>
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline"
            >
              <RefreshCw size={13} aria-hidden />
              Sync accounts
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 xl:grid-cols-6">
            {CONNECTED_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <div key={acc.name} className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-secondary)] bg-white"
                    style={{ color: acc.color }}
                  >
                    {acc.logo ? (
                      <Image src={acc.logo} alt="" aria-hidden width={22} height={22} className="h-[22px] w-[22px] object-contain" unoptimized />
                    ) : (
                      <Icon size={16} strokeWidth={1.75} aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-[var(--text-primary)]">{acc.name}</div>
                    <div className="truncate text-[10px] text-[var(--text-tertiary)]">{acc.type}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-[var(--border-tertiary)] pt-3 text-xs text-[var(--text-tertiary)]">
            Next automatic sync: <span className="font-semibold text-[var(--text-secondary)]">Tomorrow, 8:00 AM</span>
          </div>
        </div>
      </Card>

      {/* Health scores */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <SectionHead title="Financial health scores" subtitle="Key areas that impact your long-term financial well-being." />
          <TextAction>How are these scores calculated?</TextAction>
        </div>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
          {/* Overall score — a single number the four areas roll up to */}
          <div className="flex w-full shrink-0 flex-col items-center gap-3 lg:w-[320px] lg:border-r lg:border-[var(--border-tertiary)] lg:pr-8">
            <OverallGauge score={OVERALL_SCORE} />
            <div className="text-lg font-semibold text-[var(--text-primary)]">Overall score</div>
            <Badge size="md" color={OVERALL_SCORE >= 70 ? "success" : "warning"}>
              {OVERALL_SCORE >= 70 ? "Good" : "Needs attention"}
            </Badge>
          </div>

          {/* The five areas, compact, two to a row */}
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:ml-2">
            {HEALTH.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.label}
                  className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
                      <Icon size={14} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{h.label}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ScoreRing score={h.score} status={h.status} />
                    <span className={cn("text-xs font-semibold", h.status === "good" ? "text-[var(--text-status-success)]" : "text-[var(--text-status-warning)]")}>
                      {STATUS_STYLE[h.status].label}
                    </span>
                  </div>
                  <p className="text-xs leading-snug text-[var(--text-secondary)]">{h.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Your money today */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Where your money is</h2>
            <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">A detailed view of your assets across different types.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">₹30,00,000</div>
            <div className="text-sm text-[var(--text-tertiary)]">Total assets</div>
          </div>
        </div>
        <div className="mt-4">
          <AssetMixChart />
        </div>

        <div className="mt-4 border-t border-[var(--border-tertiary)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">How you use your money</span>
            <span className="rounded-[var(--radius-md)] border border-[var(--border-secondary)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">Monthly</span>
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-secondary)] px-3 py-2">
              <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Landmark size={14} aria-hidden /> Monthly income</span>
              <span className="text-sm font-bold tabular-nums text-[var(--text-primary)]">₹62,000</span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-secondary)] px-3 py-2">
              <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><CreditCard size={14} aria-hidden /> Monthly expenses</span>
              <span className="text-sm font-bold tabular-nums text-[var(--text-primary)]">₹42,000</span>
            </div>
          </div>
          <div className="mt-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-status-success-subtle)] p-3">
            <div className="text-xs text-[var(--text-secondary)]">Available after expenses</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-[var(--text-status-success)]">₹20,000</div>
          </div>
          <div className="mt-2"><TextAction>View breakdown <ChevronRight size={13} aria-hidden /></TextAction></div>
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <SectionHead title="Key insights for you" subtitle="Based on your inputs and your advisor's experience with clients like you." tag="Finny insight" />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {INSIGHTS.map((i) => {
            const Icon = i.icon;
            const t = TONE[i.tone];
            return (
              <div key={i.title} className={cn("flex flex-col gap-3 rounded-[var(--radius-lg)] p-4", t.surface)}>
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-primary)]", t.icon)}>
                    <Icon size={17} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="text-sm font-semibold leading-snug text-[var(--text-primary)]">{i.title}</div>
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{i.body}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Goals and position */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5">
          <SectionHead title="Your goals and current position" subtitle="How your selected goals look based on the information you've shared." action={<TextAction><Pencil size={13} aria-hidden /> Edit goals</TextAction>} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)]">
              <tr>
                <th scope="col" className="px-5 py-3">Goal</th>
                <th scope="col" className="px-5 py-3">Your plan</th>
                <th scope="col" className="px-5 py-3">Current position</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-tertiary)]">
              {GOAL_ROWS.map((g) => {
                const Icon = g.icon;
                const st = STATUS_STYLE[g.status];
                return (
                  <tr key={g.goal} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
                          <Icon size={15} strokeWidth={1.75} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--text-primary)]">{g.goal}</div>
                          <div className="text-xs text-[var(--text-tertiary)]">{g.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold tabular-nums text-[var(--text-primary)]">{g.plan}</div>
                      {g.planNote && <div className="text-xs text-[var(--text-tertiary)]">{g.planNote}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-xs leading-relaxed text-[var(--text-secondary)]">{g.position}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", st.bg, st.border)}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} aria-hidden />
                        <span className="text-[var(--text-primary)]">{g.statusText}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right"><ChevronRight size={16} className="text-[var(--icon-tertiary)]" aria-hidden /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Advisor-ready summary */}
      <Card>
        <SectionHead title="Advisor-ready summary" subtitle="This summary will be shared with your advisor before your meeting." />
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-start">
          <SummaryColumn icon={Receipt} title="Your situation" items={["Age 61, retired", "₹30,00,000 total assets", "₹42,000 monthly expenses"]} />
          <SummaryColumn icon={Target} title="Your priorities" items={["Retirement income", "Grow & manage my money", "Emergency readiness", "Family protection"]} />
          <SummaryColumn icon={PieChart} title="Your preferences" items={["Moderate risk preference", "Regular income in retirement", "One-time and monthly investments"]} />
          <div className="flex md:justify-end md:pt-2">
            <Link href="#" className="w-full md:w-auto">
              <Button variant="primary" size="lg" className="w-full md:w-auto" trailingIcon={<ChevronRight size={16} aria-hidden />}>
                Continue to advisor
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <Sparkles size={12} aria-hidden /> Figures are estimates based on the information you&apos;ve shared. Your advisor will review them with you.
      </p>
    </div>
  );
}

function SummaryColumn({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
        <Icon size={18} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
        <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-xs text-[var(--text-secondary)] marker:text-[var(--text-tertiary)]">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
