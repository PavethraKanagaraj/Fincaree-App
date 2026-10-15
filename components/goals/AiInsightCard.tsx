import { cn } from "@/lib/utils";
import { BarChart3, Check, Info, ShieldCheck, Sparkles, Users } from "lucide-react";
import { ADVISOR, guidanceBasis, type Guidance } from "@/components/goals/goal-intelligence";

/* ============================================================
   AI insight card — the layer shown beside the goal questionnaire.
   Each goal category has its own Fincaree colour theme and a small
   illustration, so the card reads as belonging to that goal.
   ============================================================ */

type Tone = "brand" | "success" | "warning" | "error" | "info" | "neutral";

type Theme = {
  tone: Tone;
  /** Tinted top panel, pill and icon chip backgrounds. */
  subtle: string;
  /** Pill and accent text colour. */
  text: string;
  /** Icon colour. */
  icon: string;
  /** Border of the whole card. */
  border: string;
  /** Solid colour used by the illustration, as a CSS colour. */
  solid: string;
  /** Light tint used by the illustration. */
  tint: string;
};

const THEMES: Record<Tone, Theme> = {
  brand: {
    tone: "brand",
    subtle: "bg-[var(--bg-brand-subtle)]",
    text: "text-[var(--text-brand-primary)]",
    icon: "text-[var(--icon-brand-primary)]",
    border: "border-[var(--border-brand-secondary)]",
    solid: "var(--color-brand-600)",
    tint: "var(--color-brand-100)",
  },
  success: {
    tone: "success",
    subtle: "bg-[var(--bg-status-success-subtle)]",
    text: "text-[var(--text-status-success)]",
    icon: "text-[var(--icon-status-success)]",
    border: "border-[var(--border-status-success)]",
    solid: "var(--color-success-600)",
    tint: "var(--color-success-100)",
  },
  warning: {
    tone: "warning",
    subtle: "bg-[var(--bg-status-warning-subtle)]",
    text: "text-[var(--text-status-warning)]",
    icon: "text-[var(--icon-status-warning)]",
    border: "border-[var(--border-status-warning)]",
    solid: "var(--color-warning-500)",
    tint: "var(--color-warning-100)",
  },
  error: {
    tone: "error",
    subtle: "bg-[var(--bg-status-error-subtle)]",
    text: "text-[var(--text-status-error)]",
    icon: "text-[var(--icon-status-error)]",
    border: "border-[var(--border-status-error)]",
    solid: "var(--color-error-500)",
    tint: "var(--color-error-100)",
  },
  info: {
    tone: "info",
    subtle: "bg-[var(--bg-status-info-subtle)]",
    text: "text-[var(--color-info-700)]",
    icon: "text-[var(--icon-status-info)]",
    border: "border-[var(--border-status-info)]",
    solid: "var(--color-info-600)",
    tint: "var(--color-info-100)",
  },
  neutral: {
    tone: "neutral",
    subtle: "bg-[var(--bg-secondary)]",
    text: "text-[var(--text-secondary)]",
    icon: "text-[var(--icon-secondary)]",
    border: "border-[var(--border-secondary)]",
    solid: "var(--text-secondary)",
    tint: "var(--bg-tertiary, var(--bg-secondary))",
  },
};

/* One theme per goal category, following the status colours used across the app. */
export const CATEGORY_THEME: Record<string, Tone> = {
  retirement: "success",
  grow: "brand",
  major: "warning",
  protect: "info",
  emergency: "error",
  family: "brand",
  taxes: "info",
  legacy: "neutral",
  loans: "warning",
};

/* ── illustrations: small flat scenes drawn with the theme colours ── */

function Scene({ id, theme }: { id: string; theme: Theme }) {
  const s = theme.solid;
  const t = theme.tint;
  const paper = "var(--bg-primary)";
  switch (id) {
    case "retirement":
      return (
        <>
          {/* sun */}
          <circle cx="132" cy="26" r="13" fill={s} />
          {/* beach umbrella */}
          <rect x="78" y="46" width="4" height="72" rx="2" fill={s} />
          <path d="M24 66 Q80 6 136 66 Z" fill={s} />
          <path d="M24 66 Q52 36 80 46 Q108 36 136 66 Z" fill={t} />
          <circle cx="80" cy="40" r="4" fill={s} />
          {/* deck chair */}
          <path d="M42 108 L56 84 L76 88 L62 112 Z" fill={t} />
          <rect x="40" y="108" width="46" height="8" rx="4" fill={s} />
          <rect x="52" y="116" width="4" height="10" rx="2" fill={s} />
          <rect x="78" y="116" width="4" height="10" rx="2" fill={s} />
          {/* sand */}
          <ellipse cx="80" cy="128" rx="62" ry="6" fill={t} opacity="0.8" />
        </>
      );
    case "grow":
      return (
        <>
          <rect x="30" y="88" width="20" height="36" rx="4" fill={t} />
          <rect x="60" y="72" width="20" height="52" rx="4" fill={s} />
          <rect x="90" y="56" width="20" height="68" rx="4" fill={t} />
          <path d="M28 52 L70 30 L92 40 L130 14" stroke={s} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M120 14 L132 14 L130 26" stroke={s} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "major":
      return (
        <>
          <path d="M30 70 L80 26 L130 70 V120 H30 Z" fill={t} />
          <path d="M22 72 L80 22 L138 72" stroke={s} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <rect x="68" y="90" width="24" height="30" rx="3" fill={s} />
          <circle cx="112" cy="104" r="8" fill={paper} stroke={s} strokeWidth="4" />
        </>
      );
    case "protect":
      return (
        <>
          <path d="M80 18 L124 34 V70 C124 98 104 116 80 126 C56 116 36 98 36 70 V34 Z" fill={s} />
          <path d="M80 34 L110 46 V70 C110 88 98 100 80 108 C62 100 50 88 50 70 V46 Z" fill={t} />
          <path d="M66 72 L76 82 L96 62" stroke={s} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "emergency":
      return (
        <>
          <rect x="30" y="54" width="60" height="58" rx="10" fill={t} />
          <rect x="44" y="40" width="32" height="14" rx="4" fill={s} />
          <rect x="54" y="72" width="12" height="32" rx="2" fill={s} />
          <rect x="44" y="82" width="32" height="12" rx="2" fill={s} />
          <circle cx="116" cy="92" r="20" fill={s} />
          <path d="M116 82 V102 M106 92 H126" stroke={paper} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case "family":
      return (
        <>
          <circle cx="60" cy="48" r="16" fill={s} />
          <path d="M34 120 C34 92 86 92 86 120 Z" fill={s} />
          <circle cx="104" cy="58" r="13" fill={t} />
          <path d="M84 120 C84 98 124 98 124 120 Z" fill={t} />
          <path d="M136 26 C128 14 112 22 118 34 L136 46 L154 34 C160 22 144 14 136 26 Z" fill={s} transform="translate(-40 6) scale(0.7)" />
        </>
      );
    case "taxes":
      return (
        <>
          <path d="M42 18 H108 V122 L100 116 L92 122 L84 116 L76 122 L68 116 L60 122 L52 116 L42 122 Z" fill={paper} stroke={s} strokeWidth="4" strokeLinejoin="round" />
          <rect x="56" y="36" width="38" height="6" rx="3" fill={t} />
          <rect x="56" y="52" width="38" height="6" rx="3" fill={t} />
          <rect x="56" y="68" width="24" height="6" rx="3" fill={t} />
          <circle cx="118" cy="98" r="18" fill={s} />
          <path d="M110 104 L126 90" stroke={paper} strokeWidth="5" strokeLinecap="round" />
          <circle cx="112" cy="92" r="3" fill={paper} />
          <circle cx="124" cy="104" r="3" fill={paper} />
        </>
      );
    case "legacy":
      return (
        <>
          <path d="M80 16 L134 40 H26 Z" fill={s} />
          <rect x="34" y="44" width="92" height="8" rx="2" fill={s} />
          <rect x="44" y="56" width="10" height="56" fill={t} />
          <rect x="66" y="56" width="10" height="56" fill={t} />
          <rect x="88" y="56" width="10" height="56" fill={t} />
          <rect x="30" y="112" width="100" height="10" rx="2" fill={s} />
        </>
      );
    case "loans":
      return (
        <>
          <rect x="22" y="44" width="84" height="54" rx="8" fill={s} />
          <rect x="22" y="58" width="84" height="10" fill={t} />
          <rect x="34" y="78" width="26" height="6" rx="3" fill={paper} />
          <path d="M116 30 V88 M104 76 L116 88 L128 76" stroke={s} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    default:
      return <circle cx="80" cy="70" r="30" fill={s} />;
  }
}

function Illustration({ categoryId }: { categoryId: string }) {
  const theme = THEMES[CATEGORY_THEME[categoryId] ?? "brand"];
  return (
    <svg viewBox="0 0 160 140" className="h-[104px] w-[118px] shrink-0" aria-hidden focusable="false">
      <ellipse cx="80" cy="128" rx="58" ry="7" fill={theme.tint} opacity="0.7" />
      <Scene id={categoryId} theme={theme} />
    </svg>
  );
}

const FOR_YOU_ICONS = [BarChart3, ShieldCheck] as const;

/* ── the card ── */

export function AiInsightCard({
  categoryId,
  heading,
  guidance,
}: {
  categoryId: string;
  heading: string;
  guidance: Guidance | null;
}) {
  if (!guidance) return null;
  const theme = THEMES[CATEGORY_THEME[categoryId] ?? "brand"];
  const actions = [guidance.recommendation, guidance.followUp].filter(Boolean) as string[];
  const { advisor } = guidance;

  return (
    <section className={cn("overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--bg-primary)]", theme.border)}>
      {/* Top: pill, question, explanation and illustration */}
      <div className={cn("flex flex-col px-5 pt-4 pb-5", theme.subtle)}>
        <div className="flex justify-end">
          <Illustration categoryId={categoryId} />
        </div>
        <div className="min-w-0 -mt-1">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border bg-[var(--bg-primary)] px-3 py-1 text-xs font-semibold", theme.border, theme.text)}>
            <Sparkles size={13} strokeWidth={2} aria-hidden />
            Finny insight
          </span>
          <h3 className="mt-3 text-base font-bold leading-snug text-[var(--text-primary)]">{heading}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{guidance.why}</p>
        </div>
      </div>

      {/* For you */}
      <div className="border-t border-[var(--border-tertiary)] px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">For you</div>
        <ul className="mt-3 flex flex-col gap-3">
          {actions.map((text, i) => {
            const Icon = FOR_YOU_ICONS[i] ?? Check;
            return (
              <li key={text} className="flex items-start gap-3">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", theme.subtle, theme.icon)}>
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                <span className="pt-2 text-sm leading-relaxed text-[var(--text-primary)]">{text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Advisor experience */}
      <div className="border-t border-[var(--border-tertiary)] px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Advisor experience</div>
        <div className="mt-3 flex items-center gap-4">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", theme.subtle, theme.icon)}>
            <Users size={20} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            {advisor.count !== null ? (
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className={cn("text-2xl font-bold tabular-nums", theme.text)}>{advisor.count}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{advisor.label} goals</span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-[var(--text-primary)]">{ADVISOR.name} can help</div>
            )}
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {advisor.count !== null ? `planned by ${ADVISOR.name}.` : "with this goal."}
              {advisor.best && <span className={cn("ml-1.5 font-semibold", theme.text)}>Strongest outcomes</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Basis */}
      <footer className="flex items-start gap-2.5 border-t border-[var(--border-tertiary)] bg-[var(--bg-secondary)] px-5 py-3 text-xs leading-relaxed text-[var(--text-tertiary)]">
        <Info size={14} strokeWidth={1.75} className="mt-px shrink-0" aria-hidden />
        <span>{guidanceBasis()}</span>
      </footer>
    </section>
  );
}
