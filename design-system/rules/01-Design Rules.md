# 01 — Design Rules

Rules for how the Fincaree design system is structured and maintained in Figma.

---

## Design System State

| Item | Detail |
|---|---|
| Figma file | `E3iIKwdE2far5TdrPYla2z` — Design System Master File |
| Collections | 8 |
| Variables | 834+ |
| Text styles | 28 (all 5 properties variable-bound) |
| Effect styles | 21 (all color properties variable-bound) |
| Grid styles | 4 — Grid/MD, Grid/LG, Grid/XL, Grid/2XL |
| Font | Geist |

---

## Collections

| # | Name | Tokens | Modes | Purpose |
|---|---|---|---|---|
| 1 | `x_Primitives` | 202 | Single | Raw hex — brand, grey, status, overlays |
| 2 | `1.Semantic color modes` | 141 | Light Mode, Dark Mode | Semantic aliases for all UI colors |
| 3 | `2.Radius` | 11 | Single | `None` (0) → `Full` (9999px) |
| 4 | `3.Spacing` | 17 | Single | `Spacing/0` (0) → `Spacing/1200` (96px) |
| 5 | `4.Screen widths` | 7 | Single | `Screen/XS` (320px) → `Screen/3XL` (1600px) |
| 6 | `5.Typography` | 45 | Single | Font size, line height, letter spacing, weight, family, style |
| 7 | `6.Z Index` | 7 | Single | `Base` (0) → `Tooltip` (600) |
| 8 | `7.Components` | 399 | Light Mode, Dark Mode | Component-specific color aliases |
| 9 | `8.Icons` | 9 | Light, Dark | Icon size (px) and stroke weight — no color, color lives in `1.Semantic color modes` |

---

## Color Architecture

```
x_Primitives  →  1.Semantic color modes  →  7.Components
                        ↑
                   Icon/* color tokens (sourced from here directly — no component alias needed)
```

- Raw hex lives only in `x_Primitives`. Anything raw elsewhere is a bug.
- `1.Semantic color modes` owns all Light/Dark switching — primitives are always mode-agnostic.
- `7.Components` aliases to Semantic — never directly to Primitives.
- `8.Icons` owns only size (px) and stroke weight. **Icon color is never in `8.Icons`** — always source from `Icon/*` tokens in `1.Semantic color modes`.

---

## Spacing Scale

| Token | Value | Use |
|---|---|---|
| `Spacing/0` | 0px | No spacing |
| `Spacing/25` | 2px | Hairline / tight adjustment |
| `Spacing/50` | 4px | Icon / text micro gap |
| `Spacing/75` | 6px | Small internal adjustment |
| `Spacing/100` | 8px | Compact gaps |
| `Spacing/150` | 12px | Small component gaps |
| `Spacing/200` | 16px | Standard padding / gap |
| `Spacing/250` | 20px | Comfortable component spacing |
| `Spacing/300` | 24px | Card padding / section gap |
| `Spacing/400` | 32px | Component-to-component |
| `Spacing/500` | 40px | Larger section spacing |
| `Spacing/600` | 48px | Page-level spacing |
| `Spacing/700` | 56px | Large separation |
| `Spacing/800` | 64px | Major section spacing |
| `Spacing/900` | 72px | Large layout spacing |
| `Spacing/1000` | 80px | Very large separation |
| `Spacing/1200` | 96px | Page / hero-level spacing |

---

## Breakpoints

| Token | px | Purpose |
|---|---|---|
| `Screen/XS` | 320 | Small mobile |
| `Screen/SM` | 640 | Large mobile / small tablet |
| `Screen/MD` | 768 | Tablet |
| `Screen/LG` | 1024 | Small desktop |
| `Screen/XL` | 1280 | **Main desktop — design here first** |
| `Screen/2XL` | 1440 | Large desktop |
| `Screen/3XL` | 1600 | Wide desktop |

---

## Grids (4 styles)

| Style | Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|---|
| `Grid/MD` | 768px | 8 | 24px | 24px |
| `Grid/LG` | 1024px | 12 | 24px | 32px |
| `Grid/XL` | 1280px | 12 | 32px | 64px |
| `Grid/2XL` | 1440px | 12 | 32px | 80px |

> Grid styles cannot be set programmatically via the MCP plugin API. Create them manually through the Figma Styles panel.

---

## Text Styles (28 styles)

All 5 properties are bound to `5.Typography` variables on every style.

| Bound property | Variable group |
|---|---|
| `fontSize` | `Font Size/100` → `Font Size/1700` |
| `lineHeight` | `Line Height/100` → `Line Height/1500` |
| `letterSpacing` | `Letter Spacing/100` (−2px) → `Letter Spacing/700` (+1px) |
| `fontFamily` | `Font Family/Base` = Geist |
| `fontStyle` | `Font Style/Bold` · `Font Style/Semi Bold` · `Font Style/Medium` · `Font Style/Regular` |

Style groups: **Display** (XL, LG) · **Heading** (H1–H6, Bold/SemiBold) · **Body** (LG–XS, Medium/Regular) · **Caption** (MD, SM) · **Label** (LG–SM, SemiBold/Medium)

---

## Effect Styles (21 styles)

| Group | Styles | Color bound to |
|---|---|---|
| Shadow/Light | XS · SM · MD · LG · XL · 2XL | `Black 8%` → `Black 24%` |
| Shadow/Dark | XS · SM · MD · LG · XL · 2XL | `Black 20%` → `Black 75%` |
| Shadow/Glass | Light · Dark | `Black 6%` · `Black 16%` |
| Shadow/Blur | XS · SM | `Black 5%` · `Black 8%` |
| Shadow/Focus Ring | Brand · Success · Error · Error High · Warning | `Focus Ring/Halo/*` + `Colors/Base/white` |

Effect color must always be bound to a variable. X/Y/blur/spread are hardcoded — Figma does not support variable binding for geometry values.

---

## Naming Rules

- Format: `Group/Subgroup/Token` — Title Case
- States: `Default` · `Hover` · `Active` · `Disabled` · `Focus` · `Error` · `Success` · `Warning` · `Loading`
- Never use placeholder names (`Color`, `Frame 42`, `Style 1`)
- Never duplicate a token or style name

---

## Required States Per Interactive Component

Minimum: **Default · Hover · Active · Disabled**
Add `Focus` for all focusable elements.
Add `Error` / `Success` / `Warning` where validation exists.
Add `Loading` for async actions.

---

## Accessibility

- Text on background: **4.5:1** contrast (WCAG AA)
- Icons and control borders: **3:1** — always verify `Icon/*` semantic token meets contrast against its background
- Focus rings: always two-layer — white inner (2px) + colored halo (4px)
- Use `Text/Status/*` tokens for status text. `Foreground/Status/*` is for icons only.

---

## File Structure

```
design-system/
├── figma/            ← JSON exports — re-export from Figma when anything changes
│   ├── index.json
│   ├── primitives.json
│   ├── semantic-colors.json
│   ├── components.json
│   ├── text-styles.json
│   ├── shadows.json
│   ├── grids.json
│   ├── radius.json
│   ├── spacing.json
│   ├── typography.json
│   ├── screen-widths.json
│   ├── z-index.json
│   └── icons.json       ← Icon/Size/* and Icon/Weight/* tokens
├── docs/
│   ├── Foundations/  ← Primitives · Radius · Spacing · Typography · Text Styles
│   │                     Shadows · Grid · Screen Widths · Z Index · Icons
│   ├── Semantics/    ← semantic-colors.md
│   └── Components/   ← Button · Input · Checkbox · Radio · Switch · Tabs · Avatar · Tooltip
└── rules/            ← This file and siblings
```
