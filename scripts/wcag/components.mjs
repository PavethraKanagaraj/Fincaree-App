/**
 * WCAG text-contrast check on the rendered Fincaree components.
 *
 *   npm run storybook            # in another terminal (default http://localhost:6006)
 *   npm run wcag:components      # or: STORYBOOK_URL=http://localhost:6006 node scripts/wcag/components.mjs
 *
 * Opens every `fincaree-*` story in headless Chromium and, for every interactive element, measures
 * the contrast of each text node in four states: rest, hover, pressed (mouse down) and keyboard focus.
 * Text must reach 4.5:1 (3:1 for large text). Disabled controls are skipped — WCAG 1.4.3 exempts them.
 * Exits 1 if any state fails. Playwright comes with @vitest/browser-playwright.
 */
import { chromium } from "playwright";

const BASE = process.env.STORYBOOK_URL ?? "http://localhost:6006";
const SELECTOR = "button, a[href], input, textarea, [role=tab], [role=combobox], [role=switch], [role=checkbox], [role=radio], [role=menuitem], .fc-tag, .fc-chip, .fc-badge";

// Runs in the page: contrast of every text-bearing node inside an element, against the surface behind it.
const measure = `
const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const blend = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
const surface = (n) => { let acc = { r: 255, g: 255, b: 255, a: 1 }; const st = []; for (let p = n; p; p = p.parentElement) { const c = parse(getComputedStyle(p).backgroundColor); if (c && c.a > 0) st.push(c); } for (const c of st.reverse()) acc = blend(c, acc); return acc; };
window.__measure = (el) => {
  const out = [];
  for (const n of [el, ...el.querySelectorAll('*')]) {
    const own = [...n.childNodes].filter((c) => c.nodeType === 3 && c.textContent.trim()).map((c) => c.textContent.trim()).join(' ');
    if (!own) continue;
    const cs = getComputedStyle(n);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (n.closest('[disabled],[aria-disabled="true"],[data-disabled]')) continue;
    const bg = surface(n), fg = blend(parse(cs.color), bg), a = lum(fg), b = lum(bg);
    const size = parseFloat(cs.fontSize), w = parseInt(cs.fontWeight), large = size >= 24 || (size >= 18.66 && w >= 700);
    out.push({ text: own.slice(0, 22), ratio: +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2), need: large ? 3 : 4.5, fg: cs.color, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')' });
  }
  return out;
};`;

const index = await (await fetch(`${BASE}/index.json`).catch(() => { throw new Error(`Storybook is not running at ${BASE}`); })).json();
const stories = Object.values(index.entries).filter((e) => e.type === "story" && e.id.startsWith("fincaree-"));
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const failures = new Map();
let measured = 0;

for (const story of stories) {
  await page.goto(`${BASE}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: "load", timeout: 20000 });
  await page.waitForSelector("#storybook-root > *", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(350);
  await page.addScriptTag({ content: measure });
  const count = await page.locator(SELECTOR).count();
  for (let i = 0; i < count; i++) {
    const el = page.locator(SELECTOR).nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    if (await el.evaluate((e) => e.disabled || e.getAttribute("aria-disabled") === "true" || e.hasAttribute("data-disabled")).catch(() => false)) continue;
    const cls = (await el.evaluate((e) => e.className).catch(() => "")).toString().split(/\s+/).filter((c) => c.startsWith("fc-")).slice(0, 3).join(".");
    const record = async (state) => {
      for (const m of await el.evaluate((e) => window.__measure(e)).catch(() => [])) {
        measured++;
        if (m.ratio >= m.need) continue;
        const key = [cls, state, m.fg, m.bg].join("|");
        if (!failures.has(key)) failures.set(key, { cls, state, story: story.id, ...m });
      }
    };
    await record("rest");
    await el.hover({ timeout: 1200 }).catch(() => {}); await page.waitForTimeout(150); await record("hover");
    await page.mouse.down(); await page.waitForTimeout(150); await record("pressed");
    await page.mouse.move(0, 0); await page.mouse.up(); await page.waitForTimeout(60);
    await page.keyboard.press("Shift"); await el.focus({ timeout: 1200 }).catch(() => {}); await page.waitForTimeout(120); await record("focus");
    await el.evaluate((e) => e.blur && e.blur()).catch(() => {});
  }
}
await browser.close();

console.log(`Measured ${measured} text nodes across ${stories.length} stories (rest, hover, pressed, focus).`);
for (const f of failures.values()) console.log(`  FAIL ${f.ratio}:1 (need ${f.need})  ${f.cls} [${f.state}]  ${f.fg} on ${f.bg}  "${f.text}"  — ${f.story}`);
console.log(failures.size ? `${failures.size} failing combination(s).` : "No failures.");
process.exit(failures.size ? 1 : 0);
