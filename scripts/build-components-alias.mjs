/**
 * Builds stories/foundations/components-alias.generated.json — for every
 * color token in design-system/figma/components.json (the "7.Components"
 * collection), which existing CSS variable (if any) already produces that
 * exact color in both Light and Dark mode.
 *
 * Component tokens have no single naming rule the way semantic tokens do
 * (Figma says "Badge/Neutral/Background", code says "--badge-gray-bg"), so
 * names can't be derived — they're matched by resolved color value instead,
 * scoped to each component's own CSS prefix, and disambiguated by keyword
 * overlap when more than one variable produces the same color.
 *
 * This is a structural match: it says "some button-hover variable already
 * equals brand-600". Whether it currently equals brand-600 is re-checked
 * live by the Storybook story (Components/*), so drift after a CSS edit is
 * still caught without re-running this script. Re-run this only when tokens
 * are added, renamed, or their CSS variable is renamed — `npm run tokens:components`.
 */
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const primitives = JSON.parse(fs.readFileSync(join(root, "design-system/figma/primitives.json"), "utf8"));
const semantics = JSON.parse(fs.readFileSync(join(root, "design-system/figma/semantic-colors.json"), "utf8"));
const components = JSON.parse(fs.readFileSync(join(root, "design-system/figma/components.json"), "utf8"));

/* ---- flatten components.json into [{ name, light, dark }] ---- */

function flatten(node, path = []) {
  return Object.entries(node).flatMap(([k, v]) => {
    if (k.startsWith("$")) return [];
    const p = [...path, k];
    if (v && typeof v === "object" && "$value" in v) return [{ name: p.join("/"), light: v.$value["Light Mode"], dark: v.$value["Dark Mode"] }];
    return v && typeof v === "object" ? flatten(v, p) : [];
  });
}
const tokens = flatten(components);

/* ---- resolve a Figma ref (primitive or semantic alias) to a hex ---- */

const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

function resolveFigma(ref, mode, depth = 0) {
  if (depth > 10 || typeof ref !== "string") return null;
  const m = /^\{(.+)\}$/.exec(ref);
  if (!m) return ref.toLowerCase();
  const path = m[1];
  if (path.startsWith("Colors.")) {
    const node = get(primitives.Colors, path.slice(7));
    return node?.$value ? resolveFigma(node.$value, mode, depth + 1) : null;
  }
  const node = get(semantics, path);
  return node?.$value ? resolveFigma(node.$value[mode], mode, depth + 1) : null;
}

/* ---- resolve every CSS variable in globals.css to a hex, per mode ---- */

const css = fs.readFileSync(join(root, "app/globals.css"), "utf8");

function extractBlock(text, startMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return "";
  const braceStart = text.indexOf("{", s) + 1;
  let depth = 1, i = braceStart;
  while (depth > 0 && i < text.length) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth--;
    i++;
  }
  return text.slice(braceStart, i - 1);
}
const parseDecls = (block) => Object.fromEntries([...block.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const lightDecls = parseDecls(extractBlock(css, ":root {"));
const darkDecls = { ...lightDecls, ...parseDecls(extractBlock(css, '[data-theme="dark"] {')) };

function resolveCss(value, decls, depth = 0) {
  if (depth > 15 || value == null) return null;
  const m = /^var\(--([a-zA-Z0-9-]+)\)$/.exec(value.trim());
  if (m) return decls[m[1]] !== undefined ? resolveCss(decls[m[1]], decls, depth + 1) : null;
  if (/^#[0-9a-fA-F]{3,8}$/.test(value.trim())) return value.trim().toLowerCase();
  return null;
}
const lightHex = Object.fromEntries(Object.keys(lightDecls).map((n) => [n, resolveCss(lightDecls[n], lightDecls)]));
const darkHex = Object.fromEntries(Object.keys(darkDecls).map((n) => [n, resolveCss(darkDecls[n], darkDecls)]));

/* ---- component top-level name -> CSS variable prefixes to search ---- */

const PREFIXES = {
  Button: ["btn-"],
  Input: ["input-"],
  Checkbox: ["checkbox-"],
  Radio: ["radio-"],
  Badge: ["badge-"],
  Select: ["select-", "fc-select-"],
  Tag: ["tag-"],
  Chip: ["chip-"],
  "Button Group": ["btn-group-"],
  Card: ["card-"],
  Switch: ["switch-"],
  Tabs: ["tabs-"],
  Avatar: ["avatar-"],
};

// Common abbreviations CSS variable names use that Figma's own words don't,
// so a real match (e.g. "Background" vs "bg") isn't missed as a false gap.
const SYNONYMS = { background: ["bg"], foreground: ["fg"], button: ["btn"], neutral: ["gray", "grey"], label: ["text"], indicator: ["dot"], selected: ["current"] };
const expand = (w) => [w, ...(SYNONYMS[w] ?? []), ...Object.entries(SYNONYMS).filter(([, abbrs]) => abbrs.includes(w)).map(([full]) => full)];
const kebabWords = (s) => new Set(s.toLowerCase().replace(/[()]/g, "").split(/[\s/]+/).filter(Boolean).flatMap(expand));

function scoreByKeywords(names, leafWords) {
  const scored = names.map((n) => {
    const words = kebabWords(n.replace(/-/g, " "));
    let score = 0;
    for (const w of leafWords) if ([...words].some((cw) => cw.includes(w) || w.includes(cw))) score++;
    return [n, score];
  });
  scored.sort((a, b) => b[1] - a[1]);
  return scored;
}

const results = tokens.map(({ name, light, dark }) => {
  const top = name.split("/")[0];
  const prefixes = PREFIXES[top] || [];
  const wantL = resolveFigma(light, "Light Mode");
  const wantD = resolveFigma(dark, "Dark Mode");
  const leafWords = kebabWords(name.split("/").slice(1).join(" "));
  // Dimensions ("44px") and compound values ("0 1px 2px #000...") aren't
  // colors — excluding them keeps a shared word like "sm"/"md" from matching
  // a height variable to a color token that happens to share that word.
  const looksLikeColor = (n) => !/^\d/.test((lightDecls[n] ?? "").trim());
  const inScope = Object.keys(lightHex).filter((n) => prefixes.some((p) => n.startsWith(p)) && looksLikeColor(n));

  const candidates = inScope.filter((n) => lightHex[n] === wantL && (darkHex[n] ?? lightHex[n]) === wantD);
  let cssVar = null;
  if (candidates.length === 1) cssVar = candidates[0];
  else if (candidates.length > 1) cssVar = scoreByKeywords(candidates, leafWords)[0][0];

  // No variable currently RESOLVES to the right color. Before calling the
  // token unrepresented, check whether some variable's NAME clearly claims
  // to represent it anyway — that is a variable that exists but is wrong,
  // not one that's missing. Require the candidate to contain the leaf's most
  // specific term (its last path segment, e.g. "Halo" vs "Border") so two
  // different concepts under the same parent (Focus Ring/Border/Primary vs
  // Focus Ring/Halo/Primary) never borrow each other's variable — plus at
  // least one more shared keyword, so a bare state word isn't enough.
  let wrongValueVar = null;
  const leafParts = name.split("/");
  const specific = kebabWords(leafParts[leafParts.length - 2] ?? "");
  if (!cssVar && inScope.length && leafWords.size >= 2 && specific.size) {
    const nameHasSpecific = (n) => {
      const words = kebabWords(n.replace(/-/g, " "));
      return [...specific].some((s) => [...words].some((w) => w.includes(s) || s.includes(w)));
    };
    const scoped = inScope.filter(nameHasSpecific);
    const [topName, topScore] = scoreByKeywords(scoped, leafWords)[0] ?? [];
    if (topName && topScore >= 2) wrongValueVar = topName;
  }

  return { top, name: name.split("/").slice(1).join(" / "), light, dark, cssVar, wrongValueVar };
});

const outPath = join(root, "stories/foundations/components-alias.generated.json");
fs.writeFileSync(outPath, JSON.stringify(results));

const matched = results.filter((r) => r.cssVar).length;
console.log(`✅  ${matched}/${results.length} component tokens matched to an existing CSS variable.`);
console.log(`    Wrote ${outPath.replace(root + "/", "")}`);
const byTop = {};
for (const r of results) (byTop[r.top] ??= { matched: 0, total: 0 }), (byTop[r.top].total++, r.cssVar && byTop[r.top].matched++);
for (const [top, { matched, total }] of Object.entries(byTop)) console.log(`    ${top.padEnd(14)} ${matched}/${total}`);
