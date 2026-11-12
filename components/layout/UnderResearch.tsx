/* ============================================================
   UnderResearch — the placeholder for a section that is still being
   researched and designed. A quiet, centred message with one small
   line illustration (a wireframe, a pencil and a magnifier), so the
   page reads as "coming, on purpose" and not as broken or empty.
   ============================================================ */

function Illustration() {
  return (
    <svg viewBox="0 0 220 160" width="220" height="160" fill="none" role="img" aria-label="A wireframe being sketched and inspected" className="fc-rise">
      {/* ground */}
      <ellipse cx="110" cy="142" rx="74" ry="7" className="fill-[var(--bg-secondary)]" />

      {/* the wireframe */}
      <rect x="48" y="26" width="112" height="92" rx="10" className="fill-[var(--bg-primary)] stroke-[var(--border-secondary)]" strokeWidth="2" />
      <circle cx="62" cy="40" r="3" className="fill-[var(--border-secondary)]" />
      <circle cx="72" cy="40" r="3" className="fill-[var(--border-secondary)]" />
      <circle cx="82" cy="40" r="3" className="fill-[var(--border-secondary)]" />
      <line x1="48" y1="52" x2="160" y2="52" className="stroke-[var(--border-tertiary)]" strokeWidth="2" />
      <rect x="60" y="64" width="38" height="38" rx="6" className="fill-[var(--bg-secondary)]" />
      <rect x="108" y="64" width="40" height="7" rx="3.5" className="fill-[var(--bg-secondary)]" />
      <rect x="108" y="79" width="30" height="7" rx="3.5" className="fill-[var(--bg-secondary)]" />
      <rect x="108" y="94" width="36" height="7" rx="3.5" className="fill-[var(--bg-secondary)]" />

      {/* the pencil, sketching */}
      <g transform="translate(150 60) rotate(40)">
        <rect x="0" y="0" width="12" height="52" rx="2" className="fill-[var(--bg-brand-subtle)] stroke-[var(--icon-brand-primary)]" strokeWidth="2" />
        <path d="M0 52 L6 66 L12 52 Z" className="fill-[var(--bg-primary)] stroke-[var(--icon-brand-primary)]" strokeWidth="2" strokeLinejoin="round" />
        <line x1="0" y1="10" x2="12" y2="10" className="stroke-[var(--icon-brand-primary)]" strokeWidth="2" />
      </g>

      {/* the magnifier, inspecting */}
      <circle cx="78" cy="108" r="17" className="fill-[var(--bg-primary)] stroke-[var(--icon-brand-primary)]" fillOpacity="0.85" strokeWidth="3" />
      <line x1="90" y1="120" x2="104" y2="134" className="stroke-[var(--icon-brand-primary)]" strokeWidth="4" strokeLinecap="round" />
      <path d="M70 105 a9 9 0 0 1 8 -6" className="stroke-[var(--icon-brand-primary)]" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* a few sparks of ideas */}
      <path d="M182 34 v10 M177 39 h10" className="stroke-[var(--icon-status-warning)]" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 62 v8 M30 66 h8" className="stroke-[var(--icon-brand-primary)]" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="190" cy="92" r="2.5" className="fill-[var(--icon-brand-primary)]" opacity="0.5" />
    </svg>
  );
}

export function UnderResearch({ area }: { area: string }) {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-10 text-center">
      <Illustration />
      <h2 className="mt-6 text-xl font-semibold text-[var(--text-primary)]">Under research and design</h2>
      <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-[var(--text-tertiary)]">
        {area} is still being shaped. It will appear here once it is ready.
      </p>
    </div>
  );
}
