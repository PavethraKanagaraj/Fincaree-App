"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { StageStepper } from "@/components/b2c/StageStepper";
import { PageHero } from "@/components/b2c/PageHero";
import { AlertTriangle, Briefcase, Building2, Check, Frown, Handshake, Landmark, Shield, Smile, Sparkles, Sprout, TrendingUp, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   Risk & preferences — step 05 of the customer journey. Logic, copy
   four choices build a live dossier for the advisor and a fiduciary
   check for conflicting combinations.
   ============================================================ */

type Sleep = "calm" | "anxious" | "guidance";
type Priority = "protection" | "inflation" | "legacy";
type Liquidity = "3m" | "6m" | "12m";
type Flex = "yes" | "no";

const CUSTOMER_NAME = "Arjun";
const MONTHLY_GAP = "₹15,000";

const SLEEP_OPTIONS: { value: Sleep; title: string; desc: string; icon: LucideIcon }[] = [
  { value: "calm", title: "Stay calm", desc: "I trust the long-term plan", icon: Smile },
  { value: "anxious", title: "Feel anxious", desc: "It would keep me up at night", icon: Frown },
  { value: "guidance", title: "Need expert guidance", desc: "I'd want to talk to someone", icon: Handshake },
];

const PRIORITY_OPTIONS: { value: Priority; title: string; desc: string; icon: LucideIcon }[] = [
  { value: "protection", title: "Capital protection", desc: "I don't want to lose my principal", icon: Shield },
  { value: "inflation", title: "Inflation defence", desc: "I want my money to grow steadily", icon: TrendingUp },
  { value: "legacy", title: "Legacy creation", desc: "I want to build long-term wealth", icon: Sprout },
];

const LIQUIDITY_OPTIONS: { value: Liquidity; title: string; desc: string; icon: LucideIcon }[] = [
  { value: "3m", title: "3 months", desc: "of monthly expenses", icon: Briefcase },
  { value: "6m", title: "6 months", desc: "of monthly expenses", icon: Landmark },
  { value: "12m", title: "12 months", desc: "of monthly expenses", icon: Building2 },
];

const WHISPER_SLEEP: Record<Sleep, string> = {
  calm: "Great. A steady mindset lets us aim for growth without sacrificing your peace of mind.",
  anxious: "Noted. We'll prioritise safer strategies to protect your peace of mind, with lower volatility and steadier growth.",
  guidance: "Understood. Your advisor will walk you through every decision before it's made.",
};

const WHISPER_PRIORITY: Record<Priority, string> = {
  protection: "Choosing maximum safety may reduce long-term growth. Would you like to explore a balanced approach? Your advisor will review this with you.",
  inflation: "A steady growth focus balances safety with purchasing power, a strong choice for your retirement horizon.",
  legacy: "Long-term wealth creation usually needs a higher tolerance for risk. Your advisor will align this with your comfort level.",
};

const WHISPER_LIQUIDITY =
  "This helps make sure you're never forced to sell investments in an emergency, protecting your long-term growth.";
const WHISPER_FLEX = "This helps your advisor tailor your plan beyond traditional options, matched to your risk and goal profile.";

const DOSSIER_SLEEP: Record<Sleep, { label: string; note: string }> = {
  calm: { label: "Calm / stable", note: "Can accept moderate volatility" },
  anxious: { label: "Anxious / cautious", note: "High safety required" },
  guidance: { label: "Guidance-oriented", note: "Advisor-led decisions preferred" },
};
const DOSSIER_PRIORITY: Record<Priority, { label: string; note: string }> = {
  protection: { label: "Capital protection", note: "Low volatility strategy" },
  inflation: { label: "Inflation defence", note: "Balanced growth strategy" },
  legacy: { label: "Legacy creation", note: "Long-term wealth strategy" },
};
const DOSSIER_LIQUIDITY: Record<Liquidity, { label: string; note: string }> = {
  "3m": { label: "3 months", note: "Lean emergency buffer" },
  "6m": { label: "6 months", note: "Standard reserve" },
  "12m": { label: "12 months", note: "High cash reserve" },
};
const DOSSIER_FLEX: Record<Flex, { label: string; note: string }> = {
  yes: { label: "Open to optimise", note: "Advisor may suggest alternatives" },
  no: { label: "Conservative", note: "Comfort-zone approach" },
};

export function RiskPreferences() {
  const router = useRouter();

  const [sleep, setSleep] = useState<Sleep | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [liquidity, setLiquidity] = useState<Liquidity | null>(null);
  const [flex, setFlex] = useState<Flex | null>(null);
  const [bumpHidden, setBumpHidden] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  /* ── derived ── */
  const answered = [sleep, priority, liquidity, flex].filter(Boolean).length;
  const allDone = answered === 4;
  const conflict = (sleep === "anxious" && priority === "legacy") || (sleep === "calm" && priority === "protection" && flex === "no");
  const bumpVisible = conflict && !bumpHidden && !acknowledged;
  const bumpText =
    sleep === "anxious" && priority === "legacy"
      ? "Your risk style (Anxious) and priority (Legacy creation) may conflict. Legacy strategies involve higher short-term volatility. Your advisor will review this with you."
      : "This combination of preferences may limit your long-term goal success. Your advisor will review this with you.";


  function select<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setBumpHidden(false);
  }

  function generateReport() {
    if (!allDone) return;
    router.push("/customer-home");
  }


  return (
    <div className="px-6 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 gap-5">
        <StageStepper activeIndex={4} completedIndices={[0, 1, 2, 3]} />

        {/* Page header */}
        <PageHero
          eyebrow="Risk & preferences"
          title="Risk & investment preferences"
          badge={
            <Badge size="sm" color="gray">
              Fiduciary alignment
            </Badge>
          }
          description="Let's understand your comfort level, so your plan matches both your goals and your peace of mind."
          illustration={false}
        />

        {/* Personalised context */}
        <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
          <Sparkles size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--icon-brand-primary)]" aria-hidden />
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {CUSTOMER_NAME}, we&apos;ve identified a <strong className="text-[var(--text-primary)]">{MONTHLY_GAP} monthly gap</strong> in
            your retirement plan. These preferences help us decide how to bridge it safely, and they&apos;ll be shared with your
            Registered Investment Advisor before your first meeting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 items-start">
          {/* Questions and dossier */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* A — emotional response */}
            <QuestionCard letter="A" title="Emotional risk response" question="How do you react to market changes?">
              <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-4 text-sm italic leading-relaxed text-[var(--text-secondary)]">
                &ldquo;Imagine your daughter&apos;s wedding fund is fully safe, but your retirement investments drop by{" "}
                <strong className="not-italic text-[var(--text-primary)]">10% temporarily</strong> due to market volatility.&rdquo;
              </div>
              <ChoiceGroup label="How would you feel?">
                {SLEEP_OPTIONS.map((o) => (
                  <ChoiceTile key={o.value} selected={sleep === o.value} onClick={() => select(setSleep, o.value)} {...o} />
                ))}
              </ChoiceGroup>
              {sleep && <Insight>{WHISPER_SLEEP[sleep]}</Insight>}
            </QuestionCard>

            {/* B — priority */}
            <QuestionCard letter="B" title="Strategic priority" question="What matters most to you?">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                {PRIORITY_OPTIONS.map((o) => (
                  <ChoiceTile key={o.value} selected={priority === o.value} onClick={() => select(setPriority, o.value)} {...o} row />
                ))}
              </div>
              {priority && <Insight>{WHISPER_PRIORITY[priority]}</Insight>}
            </QuestionCard>

            {/* C — liquidity */}
            <QuestionCard letter="C" title="Liquidity safety net" question="How much ready cash makes you feel secure?">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                {LIQUIDITY_OPTIONS.map((o) => (
                  <ChoiceTile key={o.value} selected={liquidity === o.value} onClick={() => select(setLiquidity, o.value)} {...o} />
                ))}
              </div>
              <Insight>{WHISPER_LIQUIDITY}</Insight>
            </QuestionCard>

            {/* D — flexibility */}
            <QuestionCard letter="D" title="Fiduciary flexibility" question="Are you open to better strategies?" sub="If your advisor suggests a better option than your current habits, would you consider it?">
              <div role="radiogroup" aria-label="Open to better strategies" className="flex flex-wrap gap-2.5">
                {([
                  { value: "yes", label: "Yes, optimise my plan" },
                  { value: "no", label: "No, stay within my comfort zone" },
                ] as const).map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={flex === o.value}
                    onClick={() => select(setFlex, o.value as Flex)}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                      flex === o.value
                        ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]"
                        : "border-[var(--border-tertiary)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--border-secondary)]"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <Insight>{WHISPER_FLEX}</Insight>
            </QuestionCard>

            {/* Compliance check */}
            {bumpVisible && (
              <section role="alert" className="rounded-[var(--radius-xl)] border border-[var(--border-status-warning)] bg-[var(--bg-status-warning-subtle)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge size="sm" color="warning">
                    <AlertTriangle size={12} strokeWidth={2} className="mr-1" aria-hidden />
                    Fiduciary advisory
                  </Badge>
                  <Button variant="tertiary" size="sm" iconOnly aria-label="Dismiss advisory" leadingIcon={<X size={14} strokeWidth={1.75} />} onClick={() => setBumpHidden(true)} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-primary)]">{bumpText}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setBumpHidden(true);
                      document.getElementById("question-b")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Revise preference
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setAcknowledged(true)}>
                    I understand the trade-off
                  </Button>
                </div>
              </section>
            )}
            {acknowledged && (
              <section className="rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] p-4">
                <Badge size="sm" color="gray">
                  Fiduciary: acknowledged
                </Badge>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  You&apos;ve acknowledged the trade-off. This note will be recorded in your suitability assessment, and your RIA will
                  discuss alternatives with you at your first meeting.
                </p>
              </section>
            )}

            {/* Live dossier */}
            <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-tertiary)] p-5">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Behavioural preference summary</div>
                  <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">What your advisor will see, updated as you answer.</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-status-success)] bg-[var(--bg-status-success-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--text-status-success)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success-600)]" aria-hidden />
                  Live
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)]">
                    <tr>
                      <th scope="col" className="px-5 py-3">Preference</th>
                      <th scope="col" className="px-5 py-3">Your choice</th>
                      <th scope="col" className="px-5 py-3">Advisor note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-tertiary)]">
                    <DossierRow label="Risk style" value={sleep ? DOSSIER_SLEEP[sleep] : null} />
                    <DossierRow label="Priority" value={priority ? DOSSIER_PRIORITY[priority] : null} />
                    <DossierRow label="Liquidity" value={liquidity ? DOSSIER_LIQUIDITY[liquidity] : null} />
                    <DossierRow label="Flexibility" value={flex ? DOSSIER_FLEX[flex] : null} />
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[var(--border-tertiary)] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" color="gray">
                    Fiduciary disclosure
                  </Badge>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Data usage</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  These behavioural preferences are captured under SEBI Investment Adviser Regulations 2013, Reg. 16(c). They&apos;re used
                  solely to establish your suitability profile and will be shared with your assigned RIA. You can revise your responses at
                  any time before submitting.
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Button variant="secondary" size="md" onClick={() => router.back()}>
                  Back
                </Button>
                <Button variant="primary" size="md" disabled={!allDone} onClick={generateReport} leadingIcon={<Check size={14} strokeWidth={2} />}>
                  Generate my financial report
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function QuestionCard({
  letter,
  title,
  tag,
  question,
  sub,
  children,
}: {
  letter: string;
  title: string;
  tag?: string;
  question: string;
  sub?: string;
  children: ReactNode;
}) {
  const id = `question-${letter.toLowerCase()}`;
  return (
    <section id={id} className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)]">
          {letter}
        </span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        {tag && (
          <Badge size="sm" color="brand">
            ✦ {tag}
          </Badge>
        )}
      </div>
      <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">{question}</p>
      {sub && <p className="mt-1 text-sm text-[var(--text-tertiary)]">{sub}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-sm font-medium text-[var(--text-secondary)]">{label}</div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">{children}</div>
    </div>
  );
}

function ChoiceTile({
  selected,
  onClick,
  title,
  desc,
  icon: Icon,
  row,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: LucideIcon;
  row?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex gap-3 rounded-[var(--radius-lg)] border p-3.5 text-left transition-colors",
        row ? "items-center" : "flex-col items-start",
        selected
          ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
          : "border-[var(--border-tertiary)] bg-[var(--bg-primary)] hover:border-[var(--border-secondary)]"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
          selected ? "bg-[var(--color-brand-600)] text-white" : "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]"
        )}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-sm font-semibold", selected ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>
          {title}
        </span>
        <span className="block text-xs leading-relaxed text-[var(--text-tertiary)]">{desc}</span>
      </span>
    </button>
  );
}

function Insight({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-3.5">
      <Badge size="sm" color="brand" className="shrink-0">
        Finny insight
      </Badge>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{children}</p>
    </div>
  );
}

function DossierRow({ label, value }: { label: string; value: { label: string; note: string } | null }) {
  return (
    <tr>
      <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{label}</td>
      <td className={cn("px-5 py-3", value ? "font-semibold text-[var(--text-brand-primary)]" : "text-[var(--text-tertiary)]")}>{value ? value.label : "—"}</td>
      <td className={cn("px-5 py-3 text-xs", value ? "text-[var(--text-secondary)]" : "text-[var(--text-tertiary)]")}>
        {value ? value.note : "Awaiting response"}
      </td>
    </tr>
  );
}
