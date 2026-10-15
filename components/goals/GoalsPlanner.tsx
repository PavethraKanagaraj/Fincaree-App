"use client";

import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { categoryGuidance, guidanceBasis, subgoalGuidance } from "@/components/goals/goal-intelligence";
import { AiInsightCard } from "@/components/goals/AiInsightCard";
import { StageStepper } from "@/components/b2c/StageStepper";
import { PageHero } from "@/components/b2c/PageHero";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Ambulance, Check, CreditCard, Landmark, Lock, Palmtree, Pencil, Plus, Receipt, Search, ShieldCheck, Sparkles, Target, TrendingUp, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   Goals & priorities — step 04 of the customer journey.
   Layout follows the goal-planning mock: a category list on the
   left, a questionnaire for the chosen category on the right, and
   a summary of saved goals below. Figures and guidance carried
   over from the static "4th page" prototype.
   ============================================================ */

type CategoryId = "retirement" | "grow" | "major" | "protect" | "emergency" | "family" | "taxes" | "legacy" | "loans";
type Frequency = "onetime" | "monthly" | "yearly" | "all";
type InvestType = "sip" | "lumpsum";

/* Reference year and the customer's current age, matching the rest of the journey. */
const CURRENT_YEAR = 2026;
const CURRENT_AGE = 61;
const INFLATION = 0.1;
const RETURN_RATE = 0.07;
const LUMPSUM_RATE = 0.08;

type Category = { id: CategoryId; title: string; description: string; icon: LucideIcon; subs: string[]; included: boolean };

/* Customer-facing goal categories, each with the sub-goals it covers. */
const CATEGORIES: Category[] = [
  { id: "retirement", included: true, title: "Plan my retirement", description: "Retirement income, corpus and lifestyle after retirement.", icon: Palmtree, subs: ["Retirement income", "Retirement corpus", "Early retirement", "Lifestyle after retirement"] },
  { id: "grow", included: true, title: "Grow & manage my money", description: "Investments, portfolio balance and wealth creation.", icon: TrendingUp, subs: ["Investments", "Portfolio", "Diversification", "Wealth creation"] },
  { id: "major", included: true, title: "Plan a major goal", description: "Home, education, travel or a large purchase.", icon: Target, subs: ["Home", "Education", "Travel", "Large purchase"] },
  { id: "protect", included: true, title: "Protect myself & my family", description: "Health, life insurance and income protection.", icon: ShieldCheck, subs: ["Health", "Life insurance", "Income protection"] },
  { id: "emergency", included: true, title: "Prepare for emergencies", description: "Emergency fund, medical expenses and access to money.", icon: Ambulance, subs: ["Emergency fund", "Medical expenses", "Access to money"] },
  { id: "family", included: true, title: "Plan for my family", description: "Children's education, dependent parents and family support.", icon: Users, subs: ["Children's education", "Dependent parents", "Family support"] },
  { id: "taxes", included: true, title: "Manage my taxes", description: "Tax saving, capital gains and tax-efficient withdrawals.", icon: Receipt, subs: ["Tax saving", "Capital gains", "Tax-efficient withdrawals"] },
  { id: "legacy", included: false, title: "Plan my legacy", description: "Estate, inheritance, nomination and wealth transfer.", icon: Landmark, subs: ["Estate", "Inheritance", "Nomination", "Wealth transfer"] },
  { id: "loans", included: false, title: "Manage my loans", description: "Debt reduction, repayment and loan planning.", icon: CreditCard, subs: ["Debt reduction", "Repayment", "Loan planning"] },
];

const AI_DETECT: { keywords: string[]; category: CategoryId; sub: string; insight: string }[] = [
  { keywords: ["wedding", "marriage", "shaadi"], category: "family", sub: "Family support", insight: "Wedding costs in India typically grow about 10% a year. Would you like us to adjust your estimate for inflation?" },
  { keywords: ["education", "college", "school", "study"], category: "family", sub: "Children's education", insight: "Education costs in India rise about 10–12% a year. A course costing ₹10L today may need about ₹17L in 5 years." },
  { keywords: ["retire", "retirement"], category: "retirement", sub: "Retirement income", insight: "To keep your lifestyle after retirement, you need a corpus that can provide regular income. We can estimate the amount based on typical withdrawal rates." },
  { keywords: ["travel", "trip", "vacation", "holiday"], category: "major", sub: "Travel", insight: "International trip costs typically rise about 8% a year. We can estimate for your destination." },
  { keywords: ["health", "insurance", "medical", "hospital"], category: "protect", sub: "Health", insight: "Medical inflation in India is about 12% a year, one of the highest globally. Adequate health cover matters." },
  { keywords: ["house", "home", "property", "flat", "apartment"], category: "major", sub: "Home", insight: "Property prices in metros grow about 6–8% a year. Would you like us to plan for a down payment?" },
  { keywords: ["parents", "parent", "mother", "father", "support"], category: "family", sub: "Dependent parents", insight: "Support for parents usually covers healthcare, living costs and emergencies. We can structure this as a monthly provision." },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "onetime", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "all", label: "All options" },
];

const ASSET_OPTIONS = [
  { key: "fd", label: "₹15L FD" },
  { key: "mf", label: "Mutual funds" },
  { key: "gold", label: "Gold" },
  { key: "ppf", label: "PPF" },
  { key: "none", label: "None yet" },
];

const FREQUENCY_LABEL: Record<Frequency, string> = { onetime: "One-time", monthly: "Monthly", yearly: "Yearly", all: "All options" };
const INVEST_LABEL: Record<InvestType, string> = { sip: "Monthly", lumpsum: "Lump sum" };

type FormState = {
  category: CategoryId | null;
  sub: string;
  amount: string;
  frequency: Frequency;
  invest: string;
  investType: InvestType;
  startDate: string;
  withdrawDate: string;
  priority: number;
  assets: Set<string>;
};

type SavedGoal = FormState & { id: number; category: CategoryId; sub: string };

const EMPTY_FORM: FormState = {
  category: null,
  sub: "",
  amount: "",
  frequency: "onetime",
  invest: "",
  investType: "sip",
  startDate: `${CURRENT_YEAR}-04-22`,
  withdrawDate: `${CURRENT_YEAR + 4}-04-22`,
  priority: 7,
  assets: new Set(),
};

/* Parses "30,00,000", "25 lakh", "1.2 cr" etc. into rupees. */
function parseIndianAmount(str: string) {
  const s = str.trim().toLowerCase().replace(/,/g, "");
  const num = parseFloat(s);
  if (Number.isNaN(num)) return 0;
  if (s.includes("cr")) return num * 10000000;
  if (s.includes("lakh") || s.endsWith("l")) return num * 100000;
  if (s.includes("k")) return num * 1000;
  return num;
}

function formatINR(n: number) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function yearOf(iso: string) {
  return parseInt(iso.slice(0, 4), 10) || CURRENT_YEAR;
}

function priorityLabel(v: number) {
  if (v >= 9) return "Must happen";
  if (v >= 7) return "High priority";
  if (v >= 5) return "Moderate";
  if (v >= 3) return "Flexible";
  return "Aspirational";
}

export function GoalsPlanner() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [goals, setGoals] = useState<SavedGoal[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nextId, setNextId] = useState(1);
  const [aiQuery, setAiQuery] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiResult, setAiResult] = useState<{ text: string; match: { category: CategoryId; sub: string } | null } | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [lockedId, setLockedId] = useState<CategoryId | null>(null);
  const [infoNote, setInfoNote] = useState<string | null>(null);

  const category = CATEGORIES.find((c) => c.id === form.category) ?? null;
  const lockedCategory = CATEGORIES.find((c) => c.id === lockedId) ?? null;
  const startYear = yearOf(form.startDate);
  const withdrawYear = yearOf(form.withdrawDate);
  const years = Math.max(1, withdrawYear - startYear);
  const startAge = CURRENT_AGE + (startYear - CURRENT_YEAR);
  const withdrawAge = CURRENT_AGE + (withdrawYear - CURRENT_YEAR);

  const todayAmt = parseIndianAmount(form.amount);
  const futureAmt = todayAmt * Math.pow(1 + INFLATION, years);
  const monthlyRate = RETURN_RATE / 12;
  const sipNeeded = (futureAmt * monthlyRate) / (Math.pow(1 + monthlyRate, years * 12) - 1);
  const lumpsumNeeded = futureAmt / Math.pow(1 + LUMPSUM_RATE, years);

  const canSave = Boolean(form.category && form.sub && todayAmt > 0 && withdrawYear > startYear);
  const investValue = parseIndianAmount(form.invest);

  /* ── actions ── */
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectCategory(id: CategoryId) {
    if (!CATEGORIES.find((c) => c.id === id)?.included) {
      setLockedId(id);
      return;
    }
    const cat = CATEGORIES.find((c) => c.id === id);
    setForm((prev) => ({ ...prev, category: id, sub: cat?.subs[0] ?? "" }));
    setNotice(null);
  }

  /* Clears the answers but keeps the chosen category and its first subcategory, as in the mock. */
  function clearFields() {
    const cat = CATEGORIES.find((c) => c.id === form.category);
    setForm({ ...EMPTY_FORM, category: form.category, sub: cat?.subs[0] ?? "" });
    setEditingId(null);
    setNotice(null);
  }

  function saveGoal() {
    if (!canSave || !form.category) return;
    const goal: SavedGoal = { ...form, id: editingId ?? nextId, category: form.category };
    if (editingId !== null) {
      setGoals((prev) => prev.map((g) => (g.id === editingId ? goal : g)));
    } else {
      setGoals((prev) => [...prev, goal]);
      setNextId((n) => n + 1);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setNotice(editingId !== null ? "Goal updated." : "Goal saved to your summary.");
  }

  function editGoal(goal: SavedGoal) {
    setForm({ ...goal });
    setEditingId(goal.id);
    setNotice(null);
  }

  function detectGoal() {
    const q = aiQuery.trim().toLowerCase();
    if (!q) return;
    setAiBusy(true);
    setTimeout(() => {
      const match = AI_DETECT.find((r) => r.keywords.some((k) => q.includes(k)));
      setAiResult(
        match
          ? { text: `I detected a ${match.sub.toLowerCase()} goal. ${match.insight}`, match: { category: match.category, sub: match.sub } }
          : { text: "Your goal looks like a custom plan. We'll structure it as a timeline-based goal.", match: null }
      );
      setAiBusy(false);
    }, 900);
  }

  function useDetected() {
    if (!aiResult?.match) return;
    setForm({ ...EMPTY_FORM, category: aiResult.match.category, sub: aiResult.match.sub });
    setEditingId(null);
    setAiResult(null);
    setAiQuery("");
  }

  function addCustomSub() {
    const name = customName.trim();
    if (!name || !category) return;
    update("sub", name);
    setCustomOpen(false);
    setCustomName("");
  }

  return (
    <div className="px-6 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 gap-5">
        <StageStepper activeIndex={3} completedIndices={[0, 1, 2]} />

        {/* Page header — title on the left, goal search on the right */}
        <PageHero
          eyebrow="Goals & priorities"
          title="Plan your life goals"
          description="Choose a category, then answer a few questions about the goal. You can add as many goals as you need."
          trailing={
            <div
              className={cn(
                "flex shrink-0 items-center justify-end transition-[width] duration-200 ease-out",
                searchOpen ? "w-[480px] max-w-[calc(100%-4rem)]" : "w-10"
              )}
            >
              {searchOpen ? (
                <form
                  className="flex w-full items-center gap-2 rounded-full border border-[var(--border-secondary)] bg-[var(--bg-primary)] py-1 pl-3 pr-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    detectGoal();
                  }}
                >
                  <Search size={16} strokeWidth={1.75} className="shrink-0 text-[var(--icon-tertiary)]" aria-hidden />
                  <input
                    autoFocus
                    aria-label="Describe your goal"
                    placeholder="e.g. Daughter's wedding in 5 years"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={aiBusy || !aiQuery.trim()}
                    leadingIcon={<Sparkles size={14} strokeWidth={1.75} aria-hidden />}
                  >
                    {aiBusy ? "Detecting…" : "Detect goal"}
                  </Button>
                  <Button
                    type="button"
                    variant="tertiary"
                    size="sm"
                    iconOnly
                    aria-label="Close search"
                    leadingIcon={<X size={14} strokeWidth={1.75} />}
                    onClick={() => {
                      setSearchOpen(false);
                      setAiQuery("");
                    }}
                  />
                </form>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  iconOnly
                  aria-label="Describe your goal"
                  aria-expanded={false}
                  leadingIcon={<Search size={16} strokeWidth={1.75} />}
                  onClick={() => setSearchOpen(true)}
                />
              )}
            </div>
          }
        />

        {aiResult && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
            <Badge size="sm" color="brand" className="mb-2">
              Finny insight
            </Badge>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{aiResult.text}</p>
            {aiResult.match && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={useDetected}>
                  Yes, use this goal
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setAiResult(null)}>
                  Let me choose
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Three columns: categories | goal details & sub-goals | AI layer */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px] gap-4 items-start">
          {/* Categories */}
          <section aria-labelledby="category-heading" className="flex flex-col gap-2">
            <h2 id="category-heading" className="text-base font-semibold text-[var(--text-primary)]">
              Select the goal category
            </h2>
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const selected = form.category === c.id;
              const locked = !c.included;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={locked ? undefined : selected}
                  aria-haspopup={locked ? "dialog" : undefined}
                  onClick={() => selectCategory(c.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius-xl)] border p-3 text-left transition-colors",
                    locked
                      ? "border-dashed border-[var(--border-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)]"
                      : selected
                        ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
                        : "border-[var(--border-tertiary)] bg-[var(--bg-primary)] hover:border-[var(--border-secondary)]"
                  )}
                >
                  <span
                    className={cn(
                      "w-10 h-10 shrink-0 rounded-[var(--radius-lg)] flex items-center justify-center",
                      locked
                        ? "bg-[var(--bg-primary)] text-[var(--icon-tertiary)]"
                        : selected
                          ? "bg-[var(--color-brand-600)] text-white"
                          : "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]"
                    )}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        locked ? "text-[var(--text-secondary)]" : selected ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]"
                      )}
                    >
                      {c.title}
                    </span>
                    <span className="block text-xs text-[var(--text-tertiary)] leading-relaxed mt-0.5">{c.description}</span>
                    {locked && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[var(--text-tertiary)]">
                        <Lock size={12} strokeWidth={2} aria-hidden />
                        Not in your current plan
                      </span>
                    )}
                  </span>
                </button>
              );
            })}

            {/* Optional discovery — subtle, below the list */}
            <div className="mt-1 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-3.5">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Looking for more financial help?</div>
              <p className="mt-0.5 text-xs text-[var(--text-tertiary)] leading-relaxed">
                Explore other advisory services that aren&apos;t included in your current plan.
              </p>
              <Button variant="link-brand" size="sm" className="mt-1" onClick={() => setInfoNote("Advisory services are coming soon.")}>
                Explore advisory services →
              </Button>
            </div>
            {infoNote && (
              <p role="status" className="text-xs text-[var(--text-tertiary)]">
                {infoNote}
              </p>
            )}
          </section>

          {/* Questionnaire */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5 flex flex-col gap-5">
            {!category ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Choose a category to begin</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Your questions will appear here.</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{category.title}</h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{editingId !== null ? "Editing a saved goal" : category.description}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{guidanceBasis()}</p>
                </div>

                <Field label="Choose subcategory">
                  <div className="flex flex-wrap gap-2">
                    {category.subs.map((s) => (
                      <Button
                        key={s}
                        variant={form.sub === s ? "primary" : "secondary"}
                        size="sm"
                        aria-pressed={form.sub === s}
                        onClick={() => update("sub", s)}
                      >
                        {s}
                      </Button>
                    ))}
                    <Button variant="tertiary" size="sm" onClick={() => setCustomOpen(true)} leadingIcon={<Plus size={14} strokeWidth={1.75} />}>
                      Add new
                    </Button>
                  </div>
                  {form.sub && !category.subs.includes(form.sub) && (
                    <p className="text-xs text-[var(--text-secondary)]">Custom: {form.sub}</p>
                  )}
                </Field>

                <div className="flex flex-col gap-3">
                  <Input
                    label="Enter estimated amount needed"
                    placeholder="e.g. 30,00,000"
                    value={form.amount}
                    onChange={(e) => update("amount", e.target.value)}
                    leadingIcon={<span aria-hidden className="font-semibold">₹</span>}
                  />
                </div>

                <Field label="Choose withdrawal frequency">
                  <div role="radiogroup" aria-label="Withdrawal frequency" className="flex flex-wrap gap-2.5">
                    {FREQUENCY_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={form.frequency === o.value}
                        onClick={() => update("frequency", o.value)}
                        className={cn(
                          "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                          form.frequency === o.value
                            ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]"
                            : "border-[var(--border-tertiary)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--border-secondary)]"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="How much can you invest?"
                    placeholder="e.g. 30,000"
                    value={form.invest}
                    onChange={(e) => update("invest", e.target.value)}
                    leadingIcon={<span aria-hidden className="font-semibold">₹</span>}
                  />
                  <SelectField
                      size="md"
                      label="Investment type"
                      value={form.investType}
                      onValueChange={(v: unknown) => update("investType", v as InvestType)}
                      items={INVEST_LABEL}
                    >
                      <SelectItem value="sip">Monthly</SelectItem>
                      <SelectItem value="lumpsum">Lump sum</SelectItem>
                  </SelectField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    type="date"
                    label="Start investing from"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    hint={`Age ${startAge}`}
                  />
                  <Input
                    type="date"
                    label="Withdraw on"
                    value={form.withdrawDate}
                    onChange={(e) => update("withdrawDate", e.target.value)}
                    hint={`Age ${withdrawAge}`}
                    error={withdrawYear > startYear ? undefined : "Withdrawal must be after the start date."}
                  />
                </div>

                {/* Additional planning inputs, kept from the prototype */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="How important is this goal?">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={form.priority}
                        aria-label="Goal priority"
                        onChange={(e) => update("priority", parseInt(e.target.value, 10))}
                        className="flex-1 accent-[var(--color-brand-600)] cursor-pointer"
                      />
                      <span className="min-w-[110px] text-center rounded-[var(--radius-md)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] px-2 py-1 text-xs font-bold text-[var(--text-brand-primary)] tabular-nums">
                        {form.priority} · {priorityLabel(form.priority)}
                      </span>
                    </div>
                  </Field>
                  <Field label="Reserved existing assets">
                    <div className="flex flex-wrap gap-2">
                      {ASSET_OPTIONS.map((a) => {
                        const on = form.assets.has(a.key);
                        return (
                          <Button
                            key={a.key}
                            variant={on ? "primary" : "secondary"}
                            size="sm"
                            aria-pressed={on}
                            onClick={() =>
                              update(
                                "assets",
                                (() => {
                                  const next = new Set(form.assets);
                                  if (next.has(a.key)) next.delete(a.key);
                                  else next.add(a.key);
                                  return next;
                                })()
                              )
                            }
                          >
                            {a.label}
                          </Button>
                        );
                      })}
                    </div>
                  </Field>
                </div>

                {/* Plan preview — guidance only */}
                {todayAmt > 0 && withdrawYear > startYear && (
                  <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge size="sm" color="brand">
                        Guidance only
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      To reach <strong>{formatINR(futureAmt)}</strong> in <strong>{years} year{years === 1 ? "" : "s"}</strong>, you may
                      need to set aside about <strong>{formatINR(sipNeeded)}/month</strong>, or a lump sum of{" "}
                      <strong>{formatINR(lumpsumNeeded)}</strong>. A certified advisor will review this with you.
                    </p>
                    {investValue > 0 && investValue < sipNeeded && form.investType === "sip" && (
                      <p className="mt-2 text-xs text-[var(--text-status-warning)]">
                        Your monthly contribution is below the estimate. You can adjust it or extend the timeline.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2 border-t border-[var(--border-tertiary)]">
                  <Button variant="secondary" size="md" onClick={clearFields}>
                    Clear fields
                  </Button>
                  <Button variant="primary" size="md" onClick={saveGoal} disabled={!canSave} leadingIcon={<Check size={14} strokeWidth={2} />}>
                    {editingId !== null ? "Update goal" : "Save goal"}
                  </Button>
                </div>
              </>
            )}
            {notice && (
              <p role="status" className="text-xs text-[var(--text-status-success)]">
                {notice}
              </p>
            )}
          </section>

          {/* AI layer: why this helps, and what is recommended for the customer */}
          <aside aria-label="Finny insights" className="flex flex-col gap-3 lg:sticky lg:top-4">
            {category ? (
              <AiInsightCard
                categoryId={category.id}
                heading={form.sub ? `Why ${form.sub.toLowerCase()} helps?` : `Why plan for ${category.title.toLowerCase()}?`}
                guidance={form.sub ? subgoalGuidance(form.sub, category.id) : categoryGuidance(category.id)}
              />
            ) : (
              <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
                Finny insights for the category and sub-goal you choose will appear here.
              </p>
            )}
          </aside>
        </div>

        {/* Current goals summary */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
          <div className="flex items-start justify-between gap-3 p-5 border-b border-[var(--border-tertiary)]">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Current goals summary</h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Review and manage your configured planning goals.</p>
            </div>
            <Badge size="sm" color="gray">
              {goals.length} {goals.length === 1 ? "goal" : "goals"}
            </Badge>
          </div>

          {goals.length === 0 ? (
            <p className="p-5 text-sm text-[var(--text-tertiary)]">No goals saved yet. Save a goal above and it will appear here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Sub category</th>
                    <th scope="col" className="px-4 py-3">Amount needed</th>
                    <th scope="col" className="px-4 py-3">Withdrawal frequency</th>
                    <th scope="col" className="px-4 py-3">How much you can invest</th>
                    <th scope="col" className="px-4 py-3">Investment frequency</th>
                    <th scope="col" className="px-4 py-3">Start – withdraw date</th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-tertiary)] text-[var(--text-primary)]">
                  {goals.map((g) => (
                    <tr key={g.id} className={cn(editingId === g.id && "bg-[var(--bg-brand-subtle)]")}>
                      <td className="px-4 py-3 font-medium text-[var(--text-brand-primary)]">
                        {CATEGORIES.find((c) => c.id === g.category)?.title}
                      </td>
                      <td className="px-4 py-3">{g.sub}</td>
                      <td className="px-4 py-3 tabular-nums">₹{g.amount}</td>
                      <td className="px-4 py-3">{FREQUENCY_LABEL[g.frequency]}</td>
                      <td className="px-4 py-3 tabular-nums">{g.invest ? `₹${g.invest}` : "—"}</td>
                      <td className="px-4 py-3">{INVEST_LABEL[g.investType]}</td>
                      <td className="px-4 py-3 text-xs leading-relaxed">
                        {formatDate(g.startDate)}
                        <br />
                        <span className="text-[var(--text-tertiary)]">to {formatDate(g.withdrawDate)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="tertiary" size="sm" onClick={() => editGoal(g)} leadingIcon={<Pencil size={13} strokeWidth={1.75} />}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" size="md" onClick={() => router.back()}>
            Back
          </Button>
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="primary"
              size="md"
              disabled={goals.length === 0}
              onClick={() => router.push("/risk")}
            >
              Continue to risk &amp; preferences
            </Button>
          </div>
        </div>
      </div>

      {/* Locked goal: explain that the advisory plan doesn't cover it */}
      <Modal open={lockedCategory !== null} onOpenChange={(open) => !open && setLockedId(null)}>
        <ModalContent className="max-w-[420px]">
          {lockedCategory && (
            <div className="p-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
                <Lock size={12} strokeWidth={2} aria-hidden />
                {lockedCategory.title}
              </span>
              <ModalTitle className="mt-2">Not included in your current plan</ModalTitle>
              <ModalDescription className="mt-1">This service is outside your current advisory subscription.</ModalDescription>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                This is still a valid goal. Your current plan simply doesn&apos;t cover advice on it yet.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setLockedId(null);
                    setInfoNote("Advisory options for this service are coming soon.");
                  }}
                >
                  Explore this service →
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Add a custom subcategory */}
      <Modal open={customOpen} onOpenChange={setCustomOpen}>
        <ModalContent className="max-w-[420px]">
          <div className="p-5">
            <ModalTitle>Name your goal</ModalTitle>
            <ModalDescription className="mt-1">Give it a name that means something to you.</ModalDescription>
            <div className="mt-4">
              <Input
                label="Goal name"
                required
                placeholder="e.g. Sabbatical year"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustomSub();
                }}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCustomOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={addCustomSub} disabled={!customName.trim()}>
                Use this goal
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

/* ── helpers ── */

function Field({ label, children }: { label: string; children: ReactNode }) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2.5">
      <div id={labelId} className="text-sm font-semibold text-[var(--text-primary)]">
        {label}
      </div>
      {children}
    </div>
  );
}
