"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Input } from "@/components/fincaree/input";
import { Switch } from "@/components/fincaree/switch";
import { StageStepper } from "@/components/b2c/StageStepper";
import { PageHero } from "@/components/b2c/PageHero";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Fuel,
  GraduationCap,
  Home,
  Info,
  Lightbulb,
  Pencil,
  Plane,
  Repeat,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Utensils,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   Monthly cashflow — step 03 of the customer journey. Figures and
   interactions carried over from the static "3rd page" prototype:
   surplus = income − expenses − EMIs (incl. prepayments), adjustable
   expense tiles, loan prepayment impact and a rotating AI insight.
   Copy is kept calm and non-investment-led.
   ============================================================ */

type TileKey = "essential" | "lifestyle" | "annual";
type LoanKey = "home" | "car";

const INCOME = 73000;
const SURPLUS_LABEL_THRESHOLD = { high: 25000, mid: 15000, low: 5000 };

const TILE_CONFIG: Record<TileKey, { title: string; desc: string; name: string; includes: string }> = {
  essential: {
    title: "Adjust essential living",
    desc: "Review and adjust your estimated essential living spend (rent, groceries, utilities).",
    name: "Essential living",
    includes: "Rent · Groceries · Utilities",
  },
  lifestyle: {
    title: "Adjust lifestyle & leisure",
    desc: "Review and adjust your lifestyle and leisure spend (dining, subscriptions, travel).",
    name: "Lifestyle & leisure",
    includes: "Dining · Subscriptions · Travel",
  },
  annual: {
    title: "Adjust annual expenses",
    desc: "Adjust your annual expenses. We've spread them as a monthly equivalent for you.",
    name: "Annual expenses",
    includes: "Insurance · School fees",
  },
};

const BREAKDOWN: { name: string; value: number; icon: LucideIcon }[] = [
  { name: "Rent", value: 12000, icon: Home },
  { name: "Groceries", value: 7000, icon: ShoppingCart },
  { name: "Utilities", value: 6000, icon: Zap },
  { name: "Dining", value: 3500, icon: Utensils },
  { name: "Subscriptions", value: 1500, icon: Repeat },
  { name: "Travel", value: 3000, icon: Plane },
  { name: "Fuel", value: 2500, icon: Fuel },
  { name: "Insurance", value: 4000, icon: ShieldCheck },
  { name: "School fees", value: 2000, icon: GraduationCap },
];

const LOAN_CONFIG: Record<LoanKey, { name: string; bank: string; rate: number; months: number; defaultExtra: number }> = {
  home: { name: "Home loan EMI", bank: "SBI Home Loans · 8.5% p.a.", rate: 0.085, months: 240, defaultExtra: 5000 },
  car: { name: "Car loan EMI", bank: "HDFC Bank · 11.2% p.a.", rate: 0.112, months: 60, defaultExtra: 2000 },
};

const SCHEDULE_NUDGE_ESSENTIAL = 23000;
const SCHEDULE_NUDGE_LIFESTYLE = 7000;
const LIFESTYLE_BASELINE = 6000;

function fmtRupee(n: number) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  return "₹" + n.toLocaleString("en-IN");
}

function insightLines(surplus: number, emiRatio: number, lifestyleSaving: number) {
  const ratio = emiRatio;
  const future = Math.round((lifestyleSaving * 12 * (Math.pow(1.12, 15) - 1)) / 0.12 / 100) * 100;
  return [
    <>
      Your EMIs are <strong>{ratio}%</strong> of your income.{" "}
      {ratio <= 40
        ? "Staying below 40% is considered safe. You're in a healthy range."
        : "This is above the 40% guideline. You can choose to explore prepaying a loan."}
    </>,
    <>
      Reducing ₹{lifestyleSaving.toLocaleString("en-IN")} in lifestyle expenses could add about{" "}
      <strong>₹{(future / 100000).toFixed(1)} Lakhs</strong> to your savings over 15 years.
    </>,
    <>
      Your monthly surplus of <strong>{fmtRupee(surplus)}</strong> could support your goals, such as an{" "}
      <strong>emergency fund</strong> or long-term savings.
    </>,
  ];
}

export function SpendingCashflow() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<Record<TileKey, number>>({ essential: 25000, lifestyle: 8000, annual: 6000 });
  const [emis] = useState<Record<LoanKey, number>>({ home: 15000, car: 5000 });
  const [prepayOn, setPrepayOn] = useState<Record<LoanKey, boolean>>({ home: false, car: false });
  const [prepayInput, setPrepayInput] = useState<Record<LoanKey, string>>({ home: "5000", car: "2000" });
  const [syncDismissed, setSyncDismissed] = useState(false);
  const [sheet, setSheet] = useState<{ tile: TileKey; value: string } | null>(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [flashTile, setFlashTile] = useState<TileKey | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /* ── derived figures ── */
  const prepay: Record<LoanKey, number> = {
    home: prepayOn.home ? parseInt(prepayInput.home, 10) || 0 : 0,
    car: prepayOn.car ? parseInt(prepayInput.car, 10) || 0 : 0,
  };
  const totalExpenses = expenses.essential + expenses.lifestyle + expenses.annual;
  const totalEMIs = emis.home + emis.car + prepay.home + prepay.car;
  const commitments = totalExpenses + totalEMIs;
  const surplus = Math.max(0, INCOME - commitments);
  const emiRatio = Math.round(((emis.home + emis.car) / INCOME) * 100);

  const gaugeTotal = surplus + commitments;
  const expPct = ((commitments / gaugeTotal) * 100).toFixed(1);
  const surPct = ((surplus / gaugeTotal) * 100).toFixed(1);

  const insights = insightLines(surplus, emiRatio, 3000);

  /* ── insight rotation ── */
  useEffect(() => {
    const id = setInterval(() => setInsightIdx((i) => (i + 1) % insights.length), 4500);
    return () => clearInterval(id);
  }, [insights.length]);

  /* ── toast auto-hide ── */
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  /* ── sheet ── */
  function openSheet(tile: TileKey) {
    setSheet({ tile, value: String(expenses[tile]) });
  }

  function sheetPreview(): number {
    if (!sheet) return surplus;
    const dummy = { ...expenses, [sheet.tile]: parseInt(sheet.value, 10) || 0 };
    return Math.max(0, INCOME - (dummy.essential + dummy.lifestyle + dummy.annual) - totalEMIs);
  }

  function saveSheet() {
    if (!sheet) return;
    const value = parseInt(sheet.value, 10);
    if (Number.isNaN(value) || value < 0) return;
    setExpenses((prev) => ({ ...prev, [sheet.tile]: value }));
    setFlashTile(sheet.tile);
    setTimeout(() => setFlashTile(null), 600);
    setToast(`${TILE_CONFIG[sheet.tile].name} updated to ${fmtRupee(value)}`);
    setSheet(null);
  }

  function nudge(tile: TileKey) {
    if (tile === "essential" && expenses.essential > SCHEDULE_NUDGE_ESSENTIAL) {
      return "Your utility spend is higher than average. Please review.";
    }
    if (tile === "lifestyle" && expenses.lifestyle > SCHEDULE_NUDGE_LIFESTYLE) {
      return `Reducing ₹${(expenses.lifestyle - LIFESTYLE_BASELINE).toLocaleString("en-IN")} here could improve your long-term savings.`;
    }
    return null;
  }

  /* ── prepayment impact (rough approximation, as in the prototype) ── */
  function prepayImpact(loan: LoanKey) {
    const extra = prepay[loan];
    const cfg = LOAN_CONFIG[loan];
    const savedMonths = extra > 0 ? Math.max(0, Math.round((extra / emis[loan]) * cfg.months * 0.4)) : 0;
    return (savedMonths / 12).toFixed(1);
  }

  function confirm() {
    setLeaving(true);
    timers.current.push(setTimeout(() => router.push("/goals"), 300));
  }

  const tileRows: { key: TileKey; icon: ReactNode }[] = [
    { key: "essential", icon: <Home size={18} strokeWidth={1.75} aria-hidden /> },
    { key: "lifestyle", icon: <Target size={18} strokeWidth={1.75} aria-hidden /> },
    { key: "annual", icon: <Calendar size={18} strokeWidth={1.75} aria-hidden /> },
  ];

  const sheetValue = sheet ? parseInt(sheet.value, 10) || 0 : 0;
  const newSurplus = sheetPreview();
  const newSurplusColor = newSurplus >= surplus ? "text-[var(--text-status-success)]" : "text-[var(--text-status-error)]";

  return (
    <div className="px-6 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 gap-5">
        <StageStepper activeIndex={2} completedIndices={[0, 1]} />

        <div
          className={cn(
            "w-full min-w-0 flex flex-col gap-5 transition-[opacity,transform] duration-300 ease-out",
            leaving && "opacity-0 -translate-x-4"
          )}
        >
          {/* Page header */}
          <PageHero
            eyebrow="Spending & expenses"
            title="Your monthly cashflow"
            description="We've organised your income and spending to understand what's available for your goals."
            illustration={false}
          />

          {/* AI sync banner */}
          {!syncDismissed && (
            <section className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
              <Sparkles size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--icon-brand-primary)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge size="sm" color="brand">
                    Finny sync
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong>Arjun</strong>, we&apos;ve analysed your transactions to estimate your monthly spending. Please review
                  and adjust if needed.
                </p>
              </div>
              <Button variant="tertiary" size="sm" iconOnly aria-label="Dismiss" onClick={() => setSyncDismissed(true)}>
                <X size={14} strokeWidth={1.75} />
              </Button>
            </section>
          )}

          {/* Where your money goes — the breakdown as a chart, up front */}
          <ExpenseBreakdownChart />

          {/* 01 — surplus */}
          <SectionLabel num="01" title="Monthly surplus" tag="Finny calculated" />
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--text-tertiary)]">Monthly surplus</div>
                <div key={surplus} className="mt-1 text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                  {fmtRupee(surplus)}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">available each month</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1.5">
                <span>Expenses and EMIs</span>
                <span>Surplus</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]" role="img" aria-label={`Expenses and EMIs ${fmtRupee(commitments)}, surplus ${fmtRupee(surplus)}`}>
                <div className="h-full bg-[var(--color-warning-500)] transition-[width] duration-300" style={{ width: `${expPct}%` }} />
                <div className="h-full bg-[var(--color-success-600)] transition-[width] duration-300" style={{ width: `${surPct}%` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-sm font-semibold tabular-nums">
                <span className="text-[var(--text-primary)]">{fmtRupee(commitments)}</span>
                <span className="text-[var(--text-status-success)]">{fmtRupee(surplus)}</span>
              </div>
            </div>
          </section>

          {/* 02 — spending */}
          <SectionLabel num="02" title="Your monthly spending" />
          <div className="flex flex-col gap-3">
            {tileRows.map(({ key, icon }) => {
              const cfg = TILE_CONFIG[key];
              const amount = expenses[key];
              const warning = nudge(key);
              const info = key === "annual";
              return (
                <section
                  key={key}
                  className={cn(
                    "rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4 transition-shadow",
                    flashTile === key && "ring-2 ring-[var(--border-brand-primary)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)] flex items-center justify-center">
                      {icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{cfg.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{cfg.includes}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold tabular-nums text-[var(--text-primary)]">{fmtRupee(amount)}</div>
                      <Button variant="secondary" size="sm" onClick={() => openSheet(key)} aria-label={`Adjust ${cfg.name}`}>
                        Adjust
                      </Button>
                    </div>
                  </div>

                  {warning && (
                    <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--bg-status-warning-subtle)] px-3 py-2 text-xs text-[var(--text-status-warning)]">
                      <AlertTriangle size={14} strokeWidth={1.75} className="mt-px shrink-0" aria-hidden />
                      <span>{warning}</span>
                    </div>
                  )}
                  {info && (
                    <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--bg-status-info-subtle)] px-3 py-2 text-xs text-[var(--text-status-info)]">
                      <Sparkles size={14} strokeWidth={1.75} className="mt-px shrink-0" aria-hidden />
                      <span>We&apos;ve spread your annual costs into a monthly equivalent.</span>
                    </div>
                  )}

                  <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden" aria-hidden>
                    <div
                      className="h-full rounded-full bg-[var(--color-brand-600)] transition-[width] duration-300"
                      style={{ width: `${Math.min(100, (amount / INCOME) * 100)}%` }}
                    />
                  </div>
                </section>
              );
            })}

          </div>

          {/* 03 — fixed commitments */}
          <SectionLabel num="03" title="Your fixed commitments" />
          <div className="flex flex-col gap-3">
            {(["home", "car"] as LoanKey[]).map((loan) => {
              const cfg = LOAN_CONFIG[loan];
              const on = prepayOn[loan];
              const assetBuilding = loan === "home";
              return (
                <section key={loan} className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)] flex items-center justify-center">
                      {loan === "home" ? <Home size={18} strokeWidth={1.75} aria-hidden /> : <Calendar size={18} strokeWidth={1.75} aria-hidden />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{cfg.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{cfg.bank}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold tabular-nums text-[var(--text-primary)]">{fmtRupee(emis[loan])}</div>
                      <Badge size="sm" color={assetBuilding ? "success" : "warning"}>
                        {assetBuilding ? "Asset-building" : "High cost"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[var(--border-tertiary)] pt-4">
                    <Switch
                      checked={on}
                      onCheckedChange={(checked: boolean) => setPrepayOn((prev) => ({ ...prev, [loan]: checked }))}
                    >
                      Try reducing loan faster
                    </Switch>

                    {on && (
                      <div className="mt-4 flex flex-col gap-4">
                        <Input
                          label="Extra payment each month"
                          type="number"
                          min={0}
                          step={500}
                          value={prepayInput[loan]}
                          onChange={(e) => setPrepayInput((prev) => ({ ...prev, [loan]: e.target.value }))}
                          leadingIcon={<span aria-hidden className="font-semibold">₹</span>}
                          trailingAddon={<span className="text-xs text-[var(--text-tertiary)]">/ month extra</span>}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Stat label="Loan reduces by" value={`${prepayImpact(loan)} yrs`} tone="success" />
                          <Stat label="New surplus" value={fmtRupee(surplus)} />
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* AI insights */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Image src="/brand/finny-icon.png" alt="" width={16} height={16} className="h-4 w-4" unoptimized />
              <Badge size="sm" color="brand">
                Finny whisper
              </Badge>
            </div>
            <div className="min-h-[72px] text-sm text-[var(--text-secondary)] leading-relaxed" aria-live="polite">
              {insights[insightIdx]}
            </div>
            <div className="mt-4 flex items-center gap-2" role="tablist" aria-label="Insights">
              {insights.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === insightIdx}
                  aria-label={`Insight ${i + 1}`}
                  onClick={() => setInsightIdx(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === insightIdx ? "w-6 bg-[var(--color-brand-600)]" : "w-2 bg-[var(--border-secondary)]"
                  )}
                />
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Button variant="secondary" size="md" onClick={() => router.back()}>
              Back
            </Button>
            <div className="text-right">
              <div className="text-xs text-[var(--text-tertiary)]">Monthly surplus</div>
              <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">{fmtRupee(surplus)}</div>
            </div>
            <Button variant="primary" size="md" onClick={confirm}>
              Confirm &amp; continue
            </Button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Your data is securely processed to calculate your financial readiness.
          </p>
        </div>
      </div>

      {/* Adjust expense */}
      <Modal open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
        <ModalContent className="max-w-[440px]">
          {sheet && (
            <div className="p-5">
              <ModalTitle>{TILE_CONFIG[sheet.tile].title}</ModalTitle>
              <ModalDescription className="mt-1">{TILE_CONFIG[sheet.tile].desc}</ModalDescription>

              <div className="mt-5">
                <Input
                  label="Monthly amount"
                  required
                  type="number"
                  min={0}
                  step={500}
                  value={sheet.value}
                  onChange={(e) => setSheet({ ...sheet, value: e.target.value })}
                  leadingIcon={<span aria-hidden className="font-semibold">₹</span>}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--text-tertiary)] mr-1">Quick adjust:</span>
                {[-2000, -1000, 1000, 2000].map((delta) => (
                  <Button
                    key={delta}
                    variant="secondary"
                    size="sm"
                    onClick={() => setSheet({ ...sheet, value: String(Math.max(0, sheetValue + delta)) })}
                  >
                    {delta > 0 ? "+" : "−"}₹{Math.abs(delta).toLocaleString("en-IN")}
                  </Button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] px-4 py-3">
                <span className="text-sm text-[var(--text-secondary)]">New surplus after adjustment</span>
                <span className={cn("text-base font-bold tabular-nums", newSurplusColor)}>{fmtRupee(newSurplus)}</span>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSheet(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={saveSheet}>
                  Save amount
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>

      {toast && (
        <div
          role="status"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-[480px] flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-status-success)] border-l-4 border-l-[var(--color-success-600)] bg-[var(--bg-primary)] px-5 py-3.5 text-sm font-semibold text-[var(--text-status-success)] shadow-lg"
        >
          <Check size={16} strokeWidth={2.25} aria-hidden />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── helpers ── */

const TABLE_GRID_COLS = "grid-cols-[1.75rem_9rem_minmax(0,1fr)_3rem_2.5rem]";

/* The mid-tone 500-tier chart colours don't pass contrast for white text set
   inside a filled bar — swap those three for their darker 700-tier
   counterparts so an in-bar amount label always stays readable. */
const BAR_SAFE_COLOR: Record<string, string> = {
  "var(--chart-series-02)": "var(--color-blue-700)",
  "var(--chart-series-03)": "var(--color-purple-700)",
  "var(--chart-series-04)": "var(--color-green-700)",
};

/* A ranked, ruler-axis bar per category — number, label, a bar scaled
   against a shared rupee-value track with gridlines and the amount set
   inside (or just past) the fill, share and an edit action trailing —
   plus transaction insights, built from the app's nine-colour chart series. */
function ExpenseBreakdownChart() {
  const total = BREAKDOWN.reduce((sum, b) => sum + b.value, 0);
  const sorted = [...BREAKDOWN]
    .map((item, i) => {
      const base = `var(--chart-series-0${i + 1})`;
      return { ...item, color: BAR_SAFE_COLOR[base] ?? base, pct: Math.round((item.value / total) * 100) };
    })
    .sort((a, b) => b.value - a.value);

  const axisMax = Math.ceil(sorted[0].value / 2000) * 2000;
  const axisTicks = Array.from({ length: 7 }, (_, i) => Math.round((axisMax * i) / 6));

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Where your money goes</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Your monthly spending by category (from your connected accounts)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            6 accounts connected
            <Info size={13} aria-hidden />
          </span>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]"
          >
            Last 3 months (avg)
            <ChevronDown size={14} aria-hidden />
          </button>
        </div>
      </div>

      {/* Body: category table | insights */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        {/* Category table — ranked, ruler-axis bars */}
        <div className="min-w-0">
          <div className={cn("grid items-end gap-4 pb-1.5", TABLE_GRID_COLS)}>
            <span />
            <span />
            <span className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
              {axisTicks.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
            <span />
            <span />
          </div>
          <ul>
            {sorted.map((item, i) => {
              const fillPct = Math.max((item.value / axisMax) * 100, 3);
              const labelInside = fillPct >= 28;
              return (
                <li key={item.name} className={cn("grid items-center gap-4 border-b border-[var(--border-tertiary)] py-3 last:border-b-0", TABLE_GRID_COLS)}>
                  <span className="text-sm font-semibold tabular-nums text-[var(--text-tertiary)]">{i + 1}</span>
                  <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{item.name}</span>
                  <span
                    className="relative h-7 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]"
                    style={{ backgroundImage: "repeating-linear-gradient(to right, var(--border-tertiary) 0, var(--border-tertiary) 1px, transparent 1px, transparent 16.6667%)" }}
                  >
                    <span
                      className="flex h-full items-center justify-end rounded-[var(--radius-sm)] px-2 transition-[width] duration-300"
                      style={{ width: `${fillPct}%`, backgroundColor: item.color }}
                    >
                      {labelInside && <span className="text-xs font-bold tabular-nums text-white">{fmtRupee(item.value)}</span>}
                    </span>
                    {!labelInside && (
                      <span
                        className="absolute inset-y-0 flex items-center text-xs font-semibold tabular-nums text-[var(--text-primary)]"
                        style={{ left: `calc(${fillPct}% + 8px)` }}
                      >
                        {fmtRupee(item.value)}
                      </span>
                    )}
                  </span>
                  <span className="text-right text-sm tabular-nums text-[var(--text-tertiary)]">{item.pct}%</span>
                  <button
                    type="button"
                    aria-label={`Edit ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center justify-self-end rounded-[var(--radius-md)] text-[var(--icon-tertiary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <Pencil size={15} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Insights */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Lightbulb size={15} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" aria-hidden />
                Insights from your transactions
              </span>
              <ChevronRight size={14} className="shrink-0 text-[var(--icon-tertiary)]" aria-hidden />
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Based on the last 3 months average</p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
              <Home size={14} strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Rent takes up {sorted.find((s) => s.name === "Rent")?.pct}% of your monthly expenses.</span>{" "}
              This is within the recommended range (25–30%) for your income group.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]">
              <ShoppingCart size={14} strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                Your grocery spending is {fmtRupee(BREAKDOWN.find((b) => b.name === "Groceries")?.value ?? 0)} ({sorted.find((s) => s.name === "Groceries")?.pct}%).
              </span>{" "}
              This is slightly higher than average for similar age group.
            </p>
          </div>

          <button
            type="button"
            className="mt-1 flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-3 py-2.5 text-xs font-semibold text-[var(--text-primary)]"
          >
            <span className="flex items-center gap-2">
              <FileText size={14} className="text-[var(--icon-tertiary)]" aria-hidden />
              View transaction details
            </span>
            <ChevronRight size={14} className="text-[var(--icon-tertiary)]" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ num, title, tag }: { num: string; title: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2.5 -mb-2">
      <span className="text-xs font-bold tabular-nums text-[var(--text-brand-primary)]">{num}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
      {tag && (
        <Badge size="sm" color="brand">
          ✦ {tag}
        </Badge>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] px-3.5 py-3">
      <div className="text-xs text-[var(--text-tertiary)]">{label}</div>
      <div className={cn("mt-1 text-base font-bold tabular-nums", tone === "success" ? "text-[var(--text-status-success)]" : "text-[var(--text-primary)]")}>
        {value}
      </div>
    </div>
  );
}
