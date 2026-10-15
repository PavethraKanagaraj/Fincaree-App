"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/fincaree/badge";
import { Button } from "@/components/fincaree/button";
import { ButtonGroup } from "@/components/fincaree/button-group";
import { StageStepper } from "@/components/b2c/StageStepper";
import { PageHero } from "@/components/b2c/PageHero";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import {
  Building2,
  Check,
  CreditCard,
  FileText,
  Gift,
  HeartPulse,
  Landmark,
  Lock,
  Scale,
  Shield,
  Sprout,
  TrendingUp,
  Wallet,
  X,
  Zap,
  Coins,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   Assets & Wealth Profile — step 02 of the customer journey.
   Interaction model and figures carried over from the static
   "2nd screen" prototype. Presentation uses Fincaree components
   and tokens, matching the financial-summary page.
   ============================================================ */

type Method = "auto" | "manual";
type DocKey = "ais" | "cas" | "epf" | "bank" | "health";
type ResidualKey = "property" | "gold" | "land" | "chit" | "inheritance";

const DOC_ORDER: DocKey[] = ["ais", "cas", "epf", "bank", "health"];

const DOCS: Record<DocKey, { name: string; extracts: string; label: string; icon: LucideIcon; help?: string }> = {
  ais: { name: "AIS / TIS (Income Tax)", extracts: "Extracts: FDs, dividends, interest", label: "₹45L in FDs", icon: FileText, help: "Download from IT Portal" },
  cas: { name: "CAS (Mutual Funds / Stocks)", extracts: "Extracts: total market wealth", label: "₹12L in Mutual Funds", icon: TrendingUp, help: "Get PDF via CAMS Online" },
  epf: { name: "EPF & NPS (Retirement)", extracts: "Extracts: locked-in security", label: "₹28L in EPF / NPS", icon: Landmark, help: "UMANG or eNPS Portal" },
  bank: { name: "Bank statements", extracts: "Extracts: immediate liquidity", label: "₹7L in Savings", icon: CreditCard },
  health: { name: "Health policy schedule", extracts: "Extracts: insurance coverage", label: "₹10L Insurance Cover", icon: HeartPulse, help: "Upload policy PDF" },
};

const EXTRACTION_RESULTS: Record<DocKey, string> = {
  ais: "✓ Found: ₹30L in FDs, ₹15L in dividends & interest",
  cas: "✓ Found: ₹12L in Mutual Funds, ₹3L in equity stocks",
  epf: "✓ Found: ₹28L in EPF, ₹10L in NPS corpus",
  bank: "✓ Found: ₹7L in savings & current accounts",
  health: "✓ Found: ₹10L health policy (floater), valid to 2026",
};

const SCAN_MESSAGES = [
  "Reading document structure...",
  "Extracting financial figures...",
  "Cross-referencing asset classes...",
  "Applying suitability filters...",
  "Done!",
];

const RESIDUALS: { key: ResidualKey; label: string; icon: LucideIcon }[] = [
  { key: "property", label: "Rental property", icon: Building2 },
  { key: "gold", label: "Physical gold", icon: Coins },
  { key: "land", label: "Agricultural land", icon: Sprout },
  { key: "chit", label: "Chit funds", icon: Wallet },
  { key: "inheritance", label: "Inheritance", icon: Gift },
];

const BASE = { liquid: 22, semi: 38, illiquid: 60 };

type ScanState = { status: "idle" | "scanning" | "done"; progress: number };

/* Figures in lakhs. The illiquid and semi-liquid buckets move with residual assets. */
function bucketTotals(selected: Set<ResidualKey>) {
  let illiquid = BASE.illiquid;
  let semi = BASE.semi;
  if (selected.has("property")) illiquid += 25;
  if (selected.has("land")) illiquid += 40;
  if (selected.has("inheritance")) illiquid += 10;
  if (selected.has("gold")) semi += 8;
  if (selected.has("chit")) semi += 5;
  const total = BASE.liquid + semi + illiquid;
  return { liquid: BASE.liquid, semi, illiquid, total };
}

function formatTotal(lakhs: number) {
  return lakhs >= 100 ? `₹${(lakhs / 100).toFixed(1)} Crores` : `₹${lakhs} Lakhs`;
}

export function AssetsWealthProfile() {
  const router = useRouter();

  const [method, setMethod] = useState<Method | null>(null);
  const [scans, setScans] = useState<Record<DocKey, ScanState>>({
    ais: { status: "idle", progress: 0 },
    cas: { status: "idle", progress: 0 },
    epf: { status: "idle", progress: 0 },
    bank: { status: "idle", progress: 0 },
    health: { status: "idle", progress: 0 },
  });
  const [whisperShown, setWhisperShown] = useState(false);
  const [residuals, setResiduals] = useState<Set<ResidualKey>>(new Set());
  const [openPanels, setOpenPanels] = useState<Set<ResidualKey>>(new Set());
  const [fd, setFd] = useState("");
  const [goldPurpose, setGoldPurpose] = useState("wealth");
  const [flashDoc, setFlashDoc] = useState<DocKey | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /* ── scanning simulation ── */
  const scanning = DOC_ORDER.some((k) => scans[k].status === "scanning");

  useEffect(() => {
    if (!scanning) return;
    const id = setInterval(() => {
      setScans((prev) => {
        const next = { ...prev };
        for (const k of DOC_ORDER) {
          const st = prev[k];
          if (st.status !== "scanning") continue;
          const inc = st.progress < 30 ? 8 : st.progress < 70 ? 4 : 9;
          const progress = Math.min(100, st.progress + inc);
          next[k] = { status: progress >= 100 ? "done" : "scanning", progress };
        }
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, [scanning]);

  function startScan(key: DocKey) {
    setScans((prev) => ({ ...prev, [key]: { status: "scanning", progress: 0 } }));
    setWhisperShown(true);
  }

  /* ── derived state ── */
  const uploadedKeys = DOC_ORDER.filter((k) => scans[k].status === "done");
  const uploadedCount = uploadedKeys.length;
  const autoWealthReady = method === "auto" && uploadedCount >= 2;
  const manualWealthReady = method === "manual" && fd.trim().length > 0;
  const wealthReady = autoWealthReady || manualWealthReady;
  const totals = bucketTotals(residuals);
  const residualVisible = method === "manual" || uploadedCount >= 1;
  const activeScanKey = DOC_ORDER.find((k) => scans[k].status === "scanning");

  const whisperText: ReactNode = activeScanKey
    ? (
      <>
        Scanning <strong>{DOCS[activeScanKey].name}</strong> — {SCAN_MESSAGES[Math.min(4, Math.floor(scans[activeScanKey].progress / 20))]}{" "}
        [{scans[activeScanKey].progress}%]
      </>
    )
    : uploadedCount > 0
      ? (
        <>
          Here is what we found: <strong>{uploadedKeys.map((k) => DOCS[k].label).join(", ")}</strong>. Does this look correct?
        </>
      )
      : "Scanning your documents…";

  /* ── actions ── */
  function selectMethod(next: Method) {
    setMethod(next);
  }

  function toggleResidual(key: ResidualKey) {
    setResiduals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function closePanel(key: ResidualKey) {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setResiduals((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  function editExtraction(key: DocKey) {
    setFlashDoc(key);
    timers.current.push(setTimeout(() => setFlashDoc(null), 1800));
  }

  function handleNext() {
    if (!wealthReady) return;
    setLeaving(true);
    timers.current.push(setTimeout(() => router.push("/spending"), 300));
  }

  const pct = (v: number) => `${((v / totals.total) * 100).toFixed(1)}%`;

  return (
    <div className="px-6 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 gap-5">
        {/* Stages — shared stepper, step 02 active, step 01 done */}
        <StageStepper activeIndex={1} completedIndices={[0]} />

        <div
          className={cn(
            "w-full min-w-0 flex flex-col gap-5 transition-[opacity,transform] duration-300 ease-out",
            leaving && "opacity-0 -translate-x-4"
          )}
        >
          {/* Page header */}
          <PageHero
            eyebrow="Your assets & savings"
            title="Your starting power"
            description="To build a plan that protects your future, we need to see your assets and savings. This is the foundation of suitability, a SEBI fiduciary requirement. Choose how you'd like to add your details."
            illustration={false}
          />

          {/* 01 — method choice */}
          <SectionLabel num="01" title="How would you like to add your details?" />
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MethodCard
                selected={method === "auto"}
                onSelect={() => selectMethod("auto")}
                icon={<Zap size={20} strokeWidth={1.75} />}
                title="Secure auto-scan"
                description="Upload documents and let the AI do the work. The fastest way to an accurate plan."
                recommended
              />
              <MethodCard
                selected={method === "manual"}
                onSelect={() => selectMethod("manual")}
                icon={<FileText size={20} strokeWidth={1.75} />}
                title="Manual estimates"
                description="Enter numbers yourself. Quick, but exact figures keep your goals accurately calculated."
              />
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" aria-hidden />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Your privacy is our priority</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PrivacyItem icon={Lock} title="Bank-grade encryption" text="AES-256 encryption, the same standard used by major banks." />
              <PrivacyItem icon={Zap} title="Temporary processing" text="The AI reads the figures to fill your profile, then discards the files." />
              <PrivacyItem icon={Scale} title="DPDP compliance" text="You can erase your files at any time with one tap." />
            </ul>
          </section>

          {/* 02 — auto-scan documents */}
          {method === "auto" && (
            <>
              <SectionLabel num="02" title="Document upload" tag="Finny extraction" />
              <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Break your financial footprint into simple buckets. Upload documents one at a time, and our AI extracts the key
                  numbers.
                </p>
                <ul className="flex flex-col gap-3">
                  {DOC_ORDER.map((key) => (
                    <DocRow
                      key={key}
                      docKey={key}
                      scan={scans[key]}
                      flashing={flashDoc === key}
                      onFile={() => startScan(key)}
                      onEdit={() => editExtraction(key)}
                      result={EXTRACTION_RESULTS[key]}
                    />
                  ))}
                </ul>

                {whisperShown && (
                  <Insight badge="Finny extraction" live={Boolean(activeScanKey)} className="mt-4">
                    {whisperText}
                  </Insight>
                )}
              </section>
            </>
          )}

          {/* 02 — manual entry */}
          {method === "manual" && (
            <>
              <SectionLabel num="02" title="Manual asset entry" />
              <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Fixed deposits (FDs)"
                    required
                    placeholder="e.g. 15 Lakhs"
                    value={fd}
                    onChange={(e) => setFd(e.target.value)}
                    leadingIcon={<span aria-hidden className="font-semibold">₹</span>}
                  />
                  <Input label="Mutual funds / stocks" placeholder="e.g. 12 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                  <Input label="EPF / NPS balance" placeholder="e.g. 38 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                  <Input label="Bank savings" placeholder="e.g. 7 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                  <Input label="Health insurance cover" placeholder="e.g. 10 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                  <Input label="Other (LIC / Post Office)" placeholder="e.g. 5 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                </div>
              </section>
            </>
          )}

          {/* 03 — residual assets */}
          {residualVisible && (
            <>
              <SectionLabel num="03" title="Residual assets" />
              <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {method === "auto"
                    ? "After the auto-scan, tell us about traditional assets that don't appear in digital statements."
                    : "Tell us about traditional assets that don't appear in digital statements."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {RESIDUALS.map((r) => {
                    const on = residuals.has(r.key);
                    const Icon = r.icon;
                    return (
                      <Button
                        key={r.key}
                        variant={on ? "primary" : "secondary"}
                        size="sm"
                        aria-pressed={on}
                        onClick={() => toggleResidual(r.key)}
                        leadingIcon={<Icon size={14} strokeWidth={1.75} />}
                      >
                        {r.label}
                      </Button>
                    );
                  })}
                </div>

                {openPanels.has("property") && (
                  <DetailPanel title="Rental property details" onClose={() => closePanel("property")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Monthly rent received" placeholder="e.g. 25,000" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                      <Input label="Annual increase %" type="number" placeholder="e.g. 5" min={0} max={25} />
                    </div>
                    <RiaInsight>
                      &ldquo;If you have a medical emergency in 2030, can you sell this in 30 days? If not, we need more bonds.&rdquo;
                      Rental property is <strong>illiquid</strong>, so your RIA will allocate a liquid buffer accordingly.
                    </RiaInsight>
                  </DetailPanel>
                )}

                {openPanels.has("gold") && (
                  <DetailPanel title="Physical gold details" onClose={() => closePanel("gold")}>
                    <Input label="Estimated gold value" placeholder="e.g. 8 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                    <div className="mt-4">
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Purpose of this gold</div>
                      <ButtonGroup
                        aria-label="Purpose of this gold"
                        options={[
                          { value: "wealth", label: "Wealth reserve" },
                          { value: "wedding", label: "Daughter's wedding" },
                          { value: "emergency", label: "Emergency use" },
                        ]}
                        value={goldPurpose}
                        onChange={setGoldPurpose}
                      />
                    </div>
                    <RiaInsight>
                      &ldquo;Is this physical or SGB? If physical, have you accounted for making-charge losses on sale?&rdquo;
                      Physical gold typically loses <strong>8–15%</strong> of its value on resale because of making charges.
                    </RiaInsight>
                  </DetailPanel>
                )}

                {openPanels.has("land") && (
                  <DetailPanel title="Agricultural land details" onClose={() => closePanel("land")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Approximate market value" placeholder="e.g. 40 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                      <Input label="Annual farm income" placeholder="e.g. 1.2 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                    </div>
                    <RiaInsight>
                      Agricultural land is classified as <strong>highly illiquid</strong>. A sale may take 60–180 days and needs
                      legal clearance, so we&apos;ll keep it in your reserve bucket only.
                    </RiaInsight>
                  </DetailPanel>
                )}

                {openPanels.has("chit") && (
                  <DetailPanel title="Chit fund details" onClose={() => closePanel("chit")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Monthly contribution" placeholder="e.g. 10,000" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                      <Input label="Maturity date" type="month" />
                    </div>
                    <RiaInsight>
                      &ldquo;The advisor needs this to match your goal horizon.&rdquo; Chit fund maturity will be aligned with your key
                      financial goals.
                    </RiaInsight>
                  </DetailPanel>
                )}

                {openPanels.has("inheritance") && (
                  <DetailPanel title="Inheritance details" onClose={() => closePanel("inheritance")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Estimated value" placeholder="e.g. 20 Lakhs" leadingIcon={<span aria-hidden className="font-semibold">₹</span>} />
                      <SelectField
                        size="sm"
                        label="Asset type"
                        placeholder="Select type"
                        items={{ property: "Property", cash: "Cash / bank transfer", gold: "Gold / jewellery", stocks: "Shares / demat" }}
                      >
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="cash">Cash / bank transfer</SelectItem>
                        <SelectItem value="gold">Gold / jewellery</SelectItem>
                        <SelectItem value="stocks">Shares / demat</SelectItem>
                      </SelectField>
                    </div>
                    <RiaInsight>
                      Inherited assets may carry <strong>tax implications</strong> on sale. Your RIA will factor this into your
                      net-of-tax wealth calculation.
                    </RiaInsight>
                  </DetailPanel>
                )}
              </section>
            </>
          )}

          {/* 04 — consolidated wealth profile */}
          {wealthReady && (
            <>
              <SectionLabel num="04" title="Consolidated wealth profile" tag="Finny computed" />
              <section className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="text-xs text-[var(--text-tertiary)]">Total wealth profile</div>
                    <div className="mt-1 text-2xl font-bold tabular-nums text-[var(--text-primary)]">{formatTotal(totals.total)}</div>
                  </div>
                  <Badge size="sm" color="success">
                    Starting power ✓
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Bucket
                    name="Liquid"
                    sub="Ready to move"
                    amount={`₹${totals.liquid} Lakhs`}
                    sources="Bank, stocks"
                    percent={pct(totals.liquid)}
                    tone="bg-[var(--color-success-600)]"
                  />
                  <Bucket
                    name="Semi-liquid"
                    sub="The safety net"
                    amount={`₹${totals.semi} Lakhs`}
                    sources="EPF, gold"
                    percent={pct(totals.semi)}
                    tone="bg-[var(--color-warning-500)]"
                  />
                  <Bucket
                    name="Illiquid"
                    sub="Locked assets"
                    amount={`₹${totals.illiquid} Lakhs`}
                    sources="Property, land"
                    percent={pct(totals.illiquid)}
                    tone="bg-[var(--color-error-500)]"
                  />
                </div>

                <div className="mt-5">
                  <Insight badge="RIA promise" live={false}>
                    &ldquo;Does this summary look accurate? Your RIA will use this breakdown to suggest which bucket to draw from for
                    your goals, without disrupting your lifestyle.&rdquo;
                  </Insight>
                </div>
              </section>
            </>
          )}

          {/* Vault confirmation */}
          {method === "auto" && uploadedCount >= 2 && (
            <section className="flex flex-wrap items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border-status-success)] bg-[var(--bg-status-success-subtle)] p-5">
              <span className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-primary)] text-[var(--text-status-success)] flex items-center justify-center">
                <Check size={18} strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--text-primary)]">Extraction complete</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your original files have been securely discarded. Your data is now vaulted with bank-grade encryption.
                </p>
              </div>
              <Badge size="sm" color="gray">
                AES-256
              </Badge>
            </section>
          )}

          {/* Footer navigation */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="secondary" size="md" onClick={() => router.back()} leadingIcon={<ChevronBack />}>
              Back
            </Button>
            <Button variant="primary" size="md" disabled={!wealthReady} onClick={handleNext}>
              View wealth profile
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── presentational helpers ── */

function ChevronBack() {
  return <span aria-hidden>‹</span>;
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

function MethodCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  recommended,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-start gap-2 rounded-[var(--radius-xl)] border p-5 text-left transition-colors",
        selected
          ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
          : "border-[var(--border-tertiary)] bg-[var(--bg-primary)] hover:border-[var(--border-secondary)]"
      )}
    >
      {recommended && (
        <span className="absolute top-4 right-4">
          <Badge size="sm" color="brand">
            ★ Recommended
          </Badge>
        </span>
      )}
      <span
        className={cn(
          "w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--icon-brand-primary)]",
          selected ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-brand-subtle)]"
        )}
      >
        {icon}
      </span>
      <span className="text-base font-semibold text-[var(--text-primary)]">{title}</span>
      <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</span>
    </button>
  );
}

function PrivacyItem({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="w-8 h-8 shrink-0 rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)] flex items-center justify-center">
        <Icon size={15} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
        <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">{text}</div>
      </div>
    </li>
  );
}

function DocRow({
  docKey,
  scan,
  flashing,
  onFile,
  onEdit,
  result,
}: {
  docKey: DocKey;
  scan: ScanState;
  flashing: boolean;
  onFile: () => void;
  onEdit: () => void;
  result: string;
}) {
  const doc = DOCS[docKey];
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = doc.icon;
  const scanningNow = scan.status === "scanning";
  const done = scan.status === "done";

  return (
    <li
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-4 transition-shadow",
        flashing && "ring-2 ring-[var(--border-brand-primary)]"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)] flex items-center justify-center">
            <Icon size={16} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--text-primary)]">{doc.name}</div>
            <div className="text-xs text-[var(--text-tertiary)]">{doc.extracts}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.help && (
            <a href="#" className="text-xs font-medium text-[var(--text-brand-primary)] underline underline-offset-2 whitespace-nowrap">
              {doc.help}
            </a>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="sr-only"
            id={`file-${docKey}`}
            aria-label={`Upload ${doc.name}`}
            onChange={(e) => {
              if (e.target.files?.length) onFile();
              e.target.value = "";
            }}
          />
          <Button
            variant={done ? "secondary" : "primary"}
            size="sm"
            disabled={scanningNow || done}
            onClick={() => inputRef.current?.click()}
            leadingIcon={done ? <Check size={14} strokeWidth={2.25} /> : undefined}
          >
            {done ? "Done" : "Upload PDF"}
          </Button>
        </div>
      </div>

      {scanningNow && (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-label={`Scanning ${doc.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={scan.progress}
            className="h-1.5 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden"
          >
            <div className="h-full rounded-full bg-[var(--color-brand-600)] transition-[width] duration-150" style={{ width: `${scan.progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-[var(--text-tertiary)]">Scanning…</div>
        </div>
      )}

      {done && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--text-status-success)]">
          <span>{result}</span>
          <button type="button" onClick={onEdit} className="text-xs font-medium text-[var(--text-brand-primary)] underline underline-offset-2">
            Edit ›
          </button>
        </div>
      )}
    </li>
  );
}

function DetailPanel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <Button variant="tertiary" size="sm" iconOnly aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>
          <X size={14} strokeWidth={1.75} />
        </Button>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function RiaInsight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
      <Badge size="sm" color="brand" className="mb-2">
        RIA insight
      </Badge>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{children}</p>
    </div>
  );
}

function Insight({ badge, children, live, className }: { badge: string; children: ReactNode; live?: boolean; className?: string }) {
  return (
    <section className={cn("flex gap-3 items-start rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4", className)}>
      <span aria-hidden className="w-8 h-8 shrink-0 rounded-full bg-[var(--bg-primary)] text-[var(--icon-brand-primary)] flex items-center justify-center">
        <Sparkles />
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

function Sparkles() {
  return <span aria-hidden>✦</span>;
}

function Bucket({
  name,
  sub,
  amount,
  sources,
  percent,
  tone,
}: {
  name: string;
  sub: string;
  amount: string;
  sources: string;
  percent: string;
  tone: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-tertiary)] p-4">
      <div className="text-sm font-semibold text-[var(--text-primary)]">{name}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{sub}</div>
      <div className="mt-2 text-lg font-bold tabular-nums text-[var(--text-primary)]">{amount}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{sources}</div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden" aria-hidden>
        <div className={cn("h-full rounded-full transition-[width] duration-300", tone)} style={{ width: percent }} />
      </div>
    </div>
  );
}
