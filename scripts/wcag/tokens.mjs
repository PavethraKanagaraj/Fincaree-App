/**
 * WCAG contrast check for the intended token pairings (light mode).
 *
 *   npm run wcag:tokens
 *
 * Resolves every colour token in app/globals.css to a hex value, then tests the pairings the
 * design actually uses: text on its surfaces (4.5:1), icons, control borders, focus rings and
 * chart colours (3:1). Exits 1 on any failure that is not in KNOWN_EXCEPTIONS, so a regression
 * fails the check while the documented usage rules do not. See
 * design-system/docs/Semantics/semantic-changes.md for why each exception exists.
 */
import fs from "node:fs";
import postcss from "postcss";

const css = fs.readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const decls = {};
postcss.parse(css).walkRules((rule) => {
  if (rule.selector.trim() !== ":root") return;
  rule.walkDecls((d) => { if (d.prop.startsWith("--")) decls[d.prop] = d.value.trim(); });
});

function resolve(value, depth = 0) {
  const v = (value ?? "").trim();
  const m = v.match(/^var\((--[\w-]+)(?:\s*,\s*([^)]*))?\)$/);
  if (m && depth < 20) return decls[m[1]] !== undefined ? resolve(decls[m[1]], depth + 1) : m[2] ? resolve(m[2], depth + 1) : null;
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return hex(v);
  const rgb = v.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) { const p = rgb[1].split(/[\s,/]+/).map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p[3] > 1 ? p[3] / 100 : (p[3] ?? 1) }; }
  return null;
}
function hex(h) {
  let s = h.replace("#", "");
  if (s.length === 3) s = [...s].map((c) => c + c).join("");
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16), a: s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1 };
}
const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
function ratio(fgTok, bgTok) {
  const fg = resolve(decls[fgTok]), bg0 = resolve(decls[bgTok]);
  if (!fg || !bg0) return null;
  const bg = bg0.a < 1 ? over(bg0, { r: 255, g: 255, b: 255, a: 1 }) : bg0;
  const f = fg.a < 1 ? over(fg, bg) : fg;
  const [a, b] = [lum(f), lum(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const has = (t) => decls[t] !== undefined;
const names = (re) => Object.keys(decls).filter((t) => re.test(t));

/** Documented usage rules — fail on purpose, not used by any component. Add a reason when adding one. */
const KNOWN_EXCEPTIONS = new Set([
  // Quaternary text: white surfaces only (4.83:1 on white)
  ...["--bg-tertiary", "--bg-secondary", "--bg-subtle"].map((b) => `--text-quaternary>${b}`),
  // Text/Brand/Tertiary: white surfaces only
  "--text-brand-tertiary>--bg-brand-secondary", "--text-brand-tertiary>--bg-brand-subtle-hover", "--text-brand-tertiary>--bg-brand-subtle",
  // Status text on hover / pressed / focus tints: use 800 or darker text there
  ...["success", "warning", "error"].flatMap((s) => ["hover", "pressed", "focus"].flatMap((st) => names(new RegExp(`^--text-status-${s}`)).map((t) => `${t}>--bg-status-${s}-${st}`))),
  // Warning 500 reaches 3:1 on white only (3.19:1); on Background/Secondary it is 2.82:1
  "--icon-status-warning>--bg-secondary", "--border-status-warning>--bg-secondary",
]);

const neutral = ["--bg-primary", "--bg-canvas", "--bg-subtle", "--bg-secondary", "--bg-tertiary"];
const groups = [
  ["Neutral text", names(/^--text-(primary|secondary|tertiary|muted|placeholder|quaternary)/).filter((t) => !t.endsWith("subtle")), neutral, 4.5],
  ["Brand text", names(/^--text-brand-/), ["--bg-primary", "--bg-canvas", "--bg-brand-subtle", "--bg-brand-secondary", "--bg-brand-subtle-hover"], 4.5],
  ...["success", "warning", "error", "info"].map((s) => [`${s} status text`, names(new RegExp(`^--text-status-${s}`)), ["--bg-primary", "--bg-canvas", ...names(new RegExp(`^--bg-status-${s}-(subtle|hover|pressed|focus)$`))], 4.5]),
  ["On-brand text", ["--text-on-brand-primary"], ["--bg-brand-primary", "--bg-brand-hover", "--bg-brand-active"], 4.5],
  ["Inverse text", ["--text-inverse-primary"], ["--bg-inverse-primary", "--bg-inverse-secondary"], 4.5],
  ...["success", "warning", "error", "info"].map((s) => [`on-status-${s} content`, names(new RegExp(`^--(text|icon)-on-status-${s}$`)), names(new RegExp(`^--bg-status-${s}-solid(-hover|-pressed)?$`)), 4.5]),
  ["Icons", names(/^--icon-(primary|secondary|tertiary|quaternary|placeholder|brand|status)/).filter((t) => !/hover|pressed/.test(t)), ["--bg-primary", "--bg-canvas", "--bg-secondary"], 3],
  ["Control borders and focus rings", ["--border-primary", "--border-interactive-hover", "--border-brand-primary", "--border-control", "--border-status-error", "--border-status-success", "--border-status-warning", "--focus-ring-border-primary", "--focus-ring-border-error"].filter(has), ["--bg-primary", "--bg-canvas", "--bg-secondary"], 3],
  ["Chart colours", names(/^--chart-/), ["--bg-primary"], 3],
];

let total = 0, known = 0;
const failures = [];
for (const [label, fgs, bgs, need] of groups) {
  for (const f of fgs) for (const b of bgs) {
    if (!has(f) || !has(b)) continue;
    const r = ratio(f, b);
    if (r === null) continue;
    total++;
    if (r >= need) continue;
    if (KNOWN_EXCEPTIONS.has(`${f}>${b}`)) { known++; continue; }
    failures.push({ label, f, b, r, need });
  }
}
console.log(`Checked ${total} intended pairs: ${total - known - failures.length} pass, ${known} documented exceptions, ${failures.length} new failures.`);
for (const x of failures.sort((a, b) => a.r - b.r)) console.log(`  FAIL ${x.r.toFixed(2)}:1 (need ${x.need})  ${x.f}  on  ${x.b}   [${x.label}]`);
process.exit(failures.length ? 1 : 0);
