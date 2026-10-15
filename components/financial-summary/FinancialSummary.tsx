"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { Checkbox } from "@/components/fincaree/checkbox";
import { StageStepper, STAGE_STEPS } from "@/components/b2c/StageStepper";
import { PageHero } from "@/components/b2c/PageHero";
import { useRouter } from "next/navigation";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Pencil, Scale, Sparkles } from "lucide-react";

/* ============================================================
   Financial Summary — the horizon-calibration step of the withdrawal
   simulator. The advisor-facing logic (coverage model, recommended
   horizon per life stage, fiduciary speed bump, AI correction) is
   carried over unchanged from the static prototype; only the
   presentation is rebuilt on Fincaree components and tokens.
   ============================================================ */

const SLIDER_MIN = 55;
const SLIDER_MAX = 100;
const AVG_LIFE_EXP = 75;
const LONGEVITY_BUFFER = 10;

const STAGE_CONFIG: Record<string, { avgLE: number; buffer: number }> = {
  "Early Career": { avgLE: 75, buffer: 10 },
  "Mid Career": { avgLE: 75, buffer: 10 },
  "Pre-retirement": { avgLE: 75, buffer: 10 },
  "Semi-retired": { avgLE: 75, buffer: 12 },
  Retired: { avgLE: 75, buffer: 10 },
};

const STAGE_OPTIONS = Object.keys(STAGE_CONFIG);


const INITIAL_PROFILE = { name: "Arjun Mehta", mobile: "+91 98765 43210", age: 61, stage: "Retired" };

/* Coverage model: at the recommended age → 95%; each year below loses ~3.5%;
   each year above gains ~0.3% (capped at 99%). */
function calcCoverage(horizon: number, rec: number, age: number) {
  if (horizon <= age) return 0;
  const delta = horizon - rec;
  if (delta >= 0) return Math.min(99, 95 + delta * 0.3);
  return Math.max(0, 95 + delta * 3.5);
}

function isRetired(stage: string) {
  return stage === "Retired" || stage === "Semi-retired";
}

function computeRecommended(age: number, stage: string) {
  const cfg = STAGE_CONFIG[stage] ?? STAGE_CONFIG.Retired;
  return Math.max(age + 20, cfg.avgLE + cfg.buffer);
}

function pct(val: number, min: number, max: number) {
  return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
}

/** The live insight copy for the current horizon, banded by how far it sits from the recommendation. */
function liveInsight(horizon: number, profile: { age: number; stage: string }, rec: number, cov: number): ReactNode {
  const delta = horizon - rec;
  const isRetired = profile.stage === "Retired" || profile.stage === "Semi-retired";

  if (horizon < profile.age + 8) {
    return (
      <>
        ⚠️ A target of <strong>age {horizon}</strong> is only <strong>{horizon - profile.age} years</strong> away. At
        this horizon, capital covers only <strong>{cov}%</strong> of projected costs — leaving a serious longevity gap.
        Should we add a safety buffer?
      </>
    );
  }
  if (delta <= -12) {
    return (
      <>
        At age <strong>{horizon}</strong>, capital coverage is only <strong>{cov}%</strong> of projected costs.{" "}
        {isRetired
          ? `This ${LONGEVITY_BUFFER}-year buffer ensures your lifestyle remains dignified even as you live longer. It's always better to over-plan for peace of mind.`
          : `Profiles similar to yours typically need at least ${rec} years of coverage for sustainable withdrawals.`}
      </>
    );
  }
  if (delta <= -6) {
    return (
      <>
        At age <strong>{horizon}</strong>, your capital covers <strong>{cov}%</strong> of projected costs. Would you
        like to see a buffer projection for age <strong>{rec}</strong>? The extra {Math.abs(delta)} years provides
        meaningful protection against outliving your savings.
      </>
    );
  }
  if (delta === 0) {
    return (
      <>
        At age <strong>{horizon}</strong>, your capital covers <strong>{cov}%</strong> of projected costs. Your plan
        sits within the <strong>core planning range</strong>. This is a starting point you can adjust.
      </>
    );
  }
  if (delta > 0 && delta <= 6) {
    return (
      <>
        At age <strong>{horizon}</strong>, capital coverage is <strong>{cov}%</strong>. You&apos;re {delta} years beyond
        our suggested planning age — excellent long-term resilience planning.
      </>
    );
  }
  return (
    <>
      Planning to <strong>age {horizon}</strong> — {delta} years beyond the baseline. Coverage is{" "}
      <strong>{cov}%</strong>. This maximises longevity security, though it may require slightly higher savings targets
      upfront.
    </>
  );
}


export function FinancialSummary() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [confirmed, setConfirmed] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [fiduciaryDismissed, setFiduciaryDismissed] = useState(false);
  const [corrSuppressed, setCorrSuppressed] = useState(false);
  const [horizon, setHorizon] = useState(() => computeRecommended(INITIAL_PROFILE.age, INITIAL_PROFILE.stage));
  const [targetDraft, setTargetDraft] = useState(() => String(computeRecommended(INITIAL_PROFILE.age, INITIAL_PROFILE.stage)));
  const [capital, setCapital] = useState("30 Lakhs");
  const [capitalUnknown, setCapitalUnknown] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", age: "", stage: "" });
  const [draftErrors, setDraftErrors] = useState<{ name?: string; age?: string }>({});

  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /* ── derived values ── */
  const { age, stage } = profile;
  const rec = computeRecommended(age, stage);
  const sliderMin = Math.max(SLIDER_MIN, age + 1);
  const delta = horizon - rec;
  const years = Math.max(0, horizon - age);
  const cov = Math.round(calcCoverage(horizon, rec, age));

  const risk =
    cov >= 85
      ? { label: "Low", badge: "On track", color: "success" as const, text: "text-[var(--text-status-success)]" }
      : cov >= 60
        ? { label: "Medium", badge: "Needs attention", color: "warning" as const, text: "text-[var(--text-status-warning)]" }
        : { label: "High", badge: "Needs review", color: "error" as const, text: "text-[var(--text-status-error)]" };

  const barColor =
    cov >= 80 ? "bg-[var(--color-success-600)]" : cov >= 55 ? "bg-[var(--color-warning-500)]" : "bg-[var(--color-error-500)]";

  const fiduciaryOpen = delta <= -10 && !acknowledged && !fiduciaryDismissed;
  const correctionOpen = delta <= -18 && !corrSuppressed;

  const startPct = pct(age, SLIDER_MIN, SLIDER_MAX);
  const endPct = pct(horizon, SLIDER_MIN, SLIDER_MAX);
  const safePct = pct(rec, SLIDER_MIN, SLIDER_MAX);
  const bufferEndPct = pct(Math.min(rec + 7, SLIDER_MAX), SLIDER_MIN, SLIDER_MAX);
  const markers = [...new Set([SLIDER_MIN, 65, AVG_LIFE_EXP, rec, 95, SLIDER_MAX])].sort((a, b) => a - b);

  /* ── actions ── */
  function setHorizonValue(value: number) {
    setHorizon(value);
    setTargetDraft(String(value));
    setFiduciaryDismissed(false);
  }

  function commitTargetDraft() {
    const parsed = parseInt(targetDraft, 10);
    if (Number.isNaN(parsed)) {
      setTargetDraft(String(horizon));
      return;
    }
    setHorizonValue(Math.max(sliderMin, Math.min(SLIDER_MAX, parsed)));
  }

  function openEdit() {
    setDraft({ name: profile.name, age: String(profile.age), stage: profile.stage });
    setDraftErrors({});
    setEditOpen(true);
  }

  function saveEdit() {
    const name = draft.name.trim();
    const parsedAge = parseInt(draft.age, 10);
    const errors: { name?: string; age?: string } = {};
    if (!name) errors.name = "Enter the account holder's name.";
    if (!parsedAge || parsedAge < 18 || parsedAge > 90) errors.age = "Enter an age between 18 and 90.";
    setDraftErrors(errors);
    if (errors.name || errors.age) return;

    const next = { ...profile, name, age: parsedAge, stage: draft.stage };
    setProfile(next);
    setConfirmed(false);
    setAcknowledged(false);
    setCorrSuppressed(false);
    setFiduciaryDismissed(false);
    setHorizonValue(computeRecommended(next.age, next.stage));
    setEditOpen(false);
  }

  function handleNext() {
    if (!confirmed) return;
    setLeaving(true);
    timers.current.push(setTimeout(() => router.push("/assets"), 300));
  }

  const locked = !confirmed;
  /* Null when the user says they're not sure — the flow continues without a precise figure. */
  const capitalValue = capitalUnknown ? null : capital.trim() || null;

  /* No stages are complete yet on this, the first, page of the journey. */
  const completedSteps = 0;
  const completionPct = Math.round((completedSteps / STAGE_STEPS.length) * 100);

  return (
    <div className="px-6 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 gap-5">
        {/* Stages — horizontal progress across the top */}
        <StageStepper activeIndex={0} />

        <div
          className={cn(
            "w-full min-w-0 flex flex-col gap-5 transition-[opacity,transform] duration-300 ease-out",
            leaving && "opacity-0 -translate-x-4"
          )}
        >
          {/* Page header */}
          <PageHero
            eyebrow="Your financial profile"
            title="Build your financial profile"
            description="Complete a few details about your finances, goals and preferences. Your profile will help your advisor understand your situation before your first meeting."
          />

          {/* Profile completion status + schedule meeting CTA */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Profile completion</h2>
                  <span className="text-sm font-bold tabular-nums text-[var(--text-brand-primary)]">{completionPct}%</span>
                </div>
                <div
                  role="meter"
                  aria-label="Profile completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completionPct}
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]"
                >
                  <div
                    className="h-full rounded-full bg-[var(--color-brand-600)] transition-[width] duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                  {completedSteps} of {STAGE_STEPS.length} steps completed — finish your profile so your advisor can prepare for your meeting.
                </p>
              </div>
              <Button variant="primary" size="md" leadingIcon={<CalendarDays size={16} strokeWidth={2} aria-hidden />}>
                Schedule a meeting
              </Button>
            </div>
          </section>

          {/* 01 — Identity */}
          <SectionLabel num="01" title="Confirm your details" />
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Your name, mobile number, age and retirement status are already connected to your account. Please confirm they&apos;re right.
            </p>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Full name" value={profile.name} />
              <Field label="Mobile number" value={profile.mobile} />
              <Field label="Age" value={String(profile.age)} />
              <Field label="Retirement status" value={isRetired(profile.stage) ? "Retired" : "Not retired yet"} />
            </dl>

            <div className="flex flex-wrap items-center gap-2 mt-5">
              <Button
                variant="primary"
                size="sm"
                disabled={confirmed}
                onClick={() => setConfirmed(true)}
                leadingIcon={<Check size={16} strokeWidth={2} />}
              >
                Confirm — That&apos;s me
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={openEdit}
                leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
              >
                Edit Details
              </Button>
              {confirmed && (
                <span className="inline-flex items-center gap-1.5 ml-1 text-sm font-semibold text-[var(--text-status-success)]">
                  <Check size={14} strokeWidth={2.25} />
                  Identity Confirmed
                </span>
              )}
            </div>
          </section>

          {/* Data-extraction disclosure — kept for trust and regulatory context, shown quietly */}
          <section className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] px-4 py-3">
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              <span className="font-semibold text-[var(--text-secondary)]">Data extraction disclosure. </span>
              The identity details above were extracted from your authenticated FinCaree account under SEBI Investment
              Adviser Regulations 2013, Reg. 16(c). They are used solely to determine your planning horizon and risk
              suitability profile. You can correct any inaccuracies before proceeding. All data is processed under
              strict fiduciary standards.
            </p>
          </section>

          {/* 02 — Financial starting point */}
          <SectionLabel num="02" title="Your financial starting point" />
          <section
            data-capital-amount={capitalValue ?? "unknown"}
            className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5"
          >
            <Input
              label="How much do you currently have set aside for your financial future?"
              hint="You can include savings or investments you may use for retirement. An approximate amount is fine."
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              disabled={capitalUnknown}
              placeholder="e.g. 30 Lakhs"
              leadingIcon={<span aria-hidden className="font-semibold">₹</span>}
            />
            <div className="mt-3">
              <Checkbox checked={capitalUnknown} onChange={(e) => setCapitalUnknown(e.target.checked)}>
                I&apos;m not sure
              </Checkbox>
            </div>
            <WhyWeAsk>
              This helps us understand how much of your money may already be available for future needs. You won&apos;t
              need to decide where to invest yet.
            </WhyWeAsk>
          </section>

          {/* 03 — Planning horizon */}
          <SectionLabel num="03" title="Planning horizon" tag="Finny suggested" />
          <section
            className={cn(
              "rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5 transition-opacity duration-300",
              locked && "pointer-events-none"
            )}
          >
            {locked && (
              <p className="mb-4 text-xs text-[var(--text-tertiary)]">Confirm your details above to adjust your planning age.</p>
            )}
            <div className="mb-5">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We&apos;ve suggested age <strong>{rec}</strong> as a planning starting point. You can adjust it based on
                your expected retirement horizon.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Button variant="secondary" size="sm" disabled={locked} onClick={() => targetInputRef.current?.focus()}>
                  Adjust planning age
                </Button>
                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  aria-expanded={showWhy}
                  className="text-xs font-medium text-[var(--text-brand-primary)] underline underline-offset-2"
                >
                  Why?
                </button>
              </div>
              {showWhy && (
                <p className="mt-3 text-xs text-[var(--text-tertiary)] leading-relaxed max-w-2xl">
                  Planning ages are assumptions used to size how long your money should last. They aren&apos;t a
                  prediction of how long you will live.
                </p>
              )}
              <WhyWeAsk>
                Your planning age sets how long your money may need to last, so we can estimate what stays accessible.
              </WhyWeAsk>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-32">
                <Input label="Current Age" required type="number" value={age} readOnly />
              </div>
              <span aria-hidden className="pb-2.5 text-[var(--text-tertiary)]">
                <ChevronRight size={18} strokeWidth={1.75} />
              </span>
              <div className="w-32">
                <Input
                  label="Planning age" ref={targetInputRef} disabled={locked}
                  required
                  type="number"
                  min={sliderMin}
                  max={SLIDER_MAX}
                  value={targetDraft}
                  onChange={(e) => setTargetDraft(e.target.value)}
                  onBlur={commitTargetDraft}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTargetDraft();
                  }}
                />
              </div>
              <div className="ml-auto flex items-baseline gap-1.5 rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] px-4 py-2">
                <span className="text-2xl font-bold tabular-nums text-[var(--text-brand-primary)]">{years}</span>
                <span className="text-sm font-medium text-[var(--text-brand-primary)]">years</span>
              </div>
            </div>

            {/* Dual zone track */}
            <div className="mt-8">
              <div className="relative h-16">
                {/* markers */}
                {markers.map((m) => (
                  <span
                    key={m}
                    className="absolute top-10 -translate-x-1/2 text-xs tabular-nums text-[var(--text-tertiary)]"
                    style={{ left: `${pct(m, SLIDER_MIN, SLIDER_MAX)}%` }}
                  >
                    {m}
                  </span>
                ))}

                {/* zones */}
                <div className="absolute left-0 right-0 top-7 h-2.5 flex overflow-hidden rounded-full">
                  <div className="h-full bg-[var(--bg-status-success-subtle)]" style={{ width: `${safePct}%` }} />
                  <div className="h-full bg-[var(--bg-status-warning-subtle)]" style={{ width: `${bufferEndPct - safePct}%` }} />
                  <div className="h-full bg-[var(--bg-status-error-subtle)]" style={{ width: `${100 - bufferEndPct}%` }} />
                </div>

                {/* selected span */}
                <div
                  className="absolute top-7 h-2.5 rounded-full bg-[var(--color-brand-600)]"
                  style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }}
                />

                {/* the interactive control, laid over the track */}
                <input
                  type="range"
                  aria-label="Planning age"
                  min={sliderMin}
                  max={SLIDER_MAX}
                  step={1}
                  value={horizon}
                  onChange={(e) => setHorizonValue(parseInt(e.target.value, 10))}
                  disabled={locked}
                  className="peer absolute left-0 right-0 top-[18px] h-6 w-full cursor-pointer opacity-0"
                />

                {/* start thumb (display only) */}
                <div
                  className="pointer-events-none absolute top-[22px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--text-secondary)] shadow-sm"
                  style={{ left: `${startPct}%` }}
                  aria-hidden
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-[var(--text-tertiary)]">
                    Start {age}
                  </span>
                </div>

                {/* end thumb (display) */}
                <div
                  className="pointer-events-none absolute top-[22px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--color-brand-600)] shadow-sm peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--border-brand-primary)]"
                  style={{ left: `${endPct}%` }}
                  aria-hidden
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-[var(--text-brand-primary)]">
                    Plan {horizon}
                  </span>
                </div>

              </div>

              <div className="flex justify-between gap-3 mt-1 text-xs">
                <span className="text-[var(--text-status-success)] font-medium">Core planning range (to {rec})</span>
                <span className="text-[var(--text-status-warning)] font-medium">Extended buffer ({rec}+)</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="mt-6 pt-5 border-t border-[var(--border-tertiary)]">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Coverage confidence</span>
                <span className={cn("text-lg font-bold tabular-nums", risk.text)}>{cov}%</span>
                <Badge size="sm" color={risk.color}>
                  {risk.badge}
                </Badge>
              </div>
              <div
                role="meter"
                aria-label="Coverage confidence"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={cov}
                className="relative h-2.5 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden"
              >
                <div className={cn("h-full rounded-full transition-[width] duration-300", barColor)} style={{ width: `${cov}%` }} />
              </div>

              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Stat label="Years to plan" value={String(years)} />
                <Stat
                  label="Buffer vs. suggestion"
                  value={`${delta >= 0 ? "+" : ""}${delta} yrs`}
                  tone={delta >= 0 ? "success" : "error"}
                />
                <Stat label="Suggested age" value={String(rec)} />
                <Stat label="Planning risk" value={risk.label} tone={risk.color} />
              </dl>
            </div>
          </section>

          {/* Live insight */}
          <div>
            <Insight badge="Live Finny insight" live>
              {liveInsight(horizon, profile, rec, cov)}
            </Insight>
          </div>

          {/* Fiduciary speed bump / acknowledgement */}
          {acknowledged ? (
            <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] border-l-4 border-l-[var(--border-secondary)] bg-[var(--bg-secondary)] p-5">
              <div className="mb-2">
                <Badge size="sm" color="gray">
                  Fiduciary — acknowledged
                </Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                You have acknowledged the longevity risk for <strong>age {horizon}</strong>. This note will be recorded in
                your suitability assessment. You may revise your horizon in the Simulation Sandbox at any time.
              </p>
            </section>
          ) : (
            fiduciaryOpen && (
              <section
                role="alert"
                className="rounded-[var(--radius-xl)] border border-[var(--border-status-error)] bg-[var(--bg-status-error-subtle)] p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Badge size="sm" color="error">
                    <Scale size={12} strokeWidth={2} className="mr-1" aria-hidden />
                    Fiduciary speed bump
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setFiduciaryDismissed(true)}
                    aria-label="Dismiss fiduciary warning"
                    className="text-sm text-[var(--icon-tertiary)] hover:text-[var(--icon-secondary)]"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  Your chosen horizon of <strong>age {horizon}</strong> is <strong>{Math.abs(delta)} years shorter</strong>{" "}
                  than our fiduciary recommendation of <strong>age {rec}</strong>. This choice may leave you vulnerable to
                  outliving your savings. As your registered investment adviser, I&apos;m required to flag this
                  suitability concern before you proceed.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="primary" size="sm" onClick={() => {
                    setAcknowledged(false);
                    setHorizonValue(rec);
                  }}>
                    Reset to Recommended Age
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setAcknowledged(true)}>
                    I understand the risk
                  </Button>
                </div>
              </section>
            )
          )}

          {/* AI correction */}
          {correctionOpen && (
            <section className="flex gap-3 items-start rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
              <span
                aria-hidden
                className="w-8 h-8 shrink-0 rounded-full bg-[var(--bg-primary)] text-[var(--icon-brand-primary)] flex items-center justify-center"
              >
                <Sparkles size={14} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-[var(--text-primary)]">
                  It looks like you meant <strong>{rec}</strong>, not <strong>{horizon}</strong>. Correct?
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setHorizonValue(rec)}
                  >
                    Yes, use {rec}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setCorrSuppressed(true)}>
                    Keep my choice
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Footer navigation */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="secondary" size="md" leadingIcon={<ChevronLeft size={16} strokeWidth={2} />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!confirmed}
              onClick={handleNext}
              trailingIcon={<ChevronRight size={16} strokeWidth={2} />}
            >
              Continue to Assets
            </Button>
          </div>
        </div>
      </div>

      {/* Edit account details */}
      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <ModalContent className="max-w-[440px]">
          <div className="p-5">
            <ModalTitle>Edit Account Details</ModalTitle>
            <ModalDescription className="mt-0.5">
              Changing these resets the horizon to the recommendation and clears any confirmation.
            </ModalDescription>
            <div className="flex flex-col gap-4 mt-5">
              <Input
                label="Full name"
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                error={draftErrors.name}
              />
              <Input
                label="Age"
                required
                type="number"
                min={18}
                max={90}
                value={draft.age}
                onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
                error={draftErrors.age}
              />
              <SelectField
                size="sm"
                label="Life stage"
                value={draft.stage}
                onValueChange={(v: unknown) => setDraft((d) => ({ ...d, stage: String(v) }))}
                items={Object.fromEntries(STAGE_OPTIONS.map((s) => [s, s]))}
              >
                {STAGE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={saveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

/* ── small presentational helpers ── */

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

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[var(--text-tertiary)]">{label}</dt>
      <dd className={cn("mt-1 text-sm font-semibold text-[var(--text-primary)] truncate", mono && "tabular-nums")}>
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "error" }) {
  const toneClass =
    tone === "success"
      ? "text-[var(--text-status-success)]"
      : tone === "warning"
        ? "text-[var(--text-status-warning)]"
        : tone === "error"
          ? "text-[var(--text-status-error)]"
          : "text-[var(--text-primary)]";
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] px-3.5 py-3">
      <dt className="text-xs text-[var(--text-tertiary)]">{label}</dt>
      <dd className={cn("mt-1 text-lg font-bold tabular-nums", toneClass)}>{value}</dd>
    </div>
  );
}

function Insight({ badge, children, live }: { badge: string; children: ReactNode; live?: boolean }) {
  return (
    <section className="flex gap-3 items-start rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
      <span
        aria-hidden
        className="w-8 h-8 shrink-0 rounded-full bg-[var(--bg-primary)] text-[var(--icon-brand-primary)] flex items-center justify-center"
      >
        <Sparkles size={14} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge size="sm" color="brand">
            {badge}
          </Badge>
          {live && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-600)]" />}
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{children}</p>
      </div>
    </section>
  );
}

function WhyWeAsk({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
      <span className="font-semibold uppercase tracking-wide text-[var(--text-secondary)] mr-1.5">Why we&apos;re asking</span>
      {children}
    </p>
  );
}
