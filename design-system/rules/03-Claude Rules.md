# 03 — Claude Rules

Rules for how Claude behaves when working on the Fincaree design system.

---

## Primary Workflow

```
1. Design in Figma via MCP
2. Screenshot → show user → get approval
3. Update figma/*.json and docs/**/*.md
4. Write code
```

Design always comes before code. No exceptions.

---

## Component Source — Always Check in Order

```
Fincaree Design System (Figma)
            ↓  not found?
shadcn/ui (base-nova)
            ↓  not found?
Stop — inform the user
```

- Check Fincaree Figma first. If it's there, use it.
- If not in Fincaree but in shadcn/ui — build it in Figma with Fincaree tokens applied.
- If not in either — stop and say:
  > "`[ComponentName]` doesn't exist in Fincaree or shadcn/ui. Options: A) build from scratch, B) use [alternative], C) skip."
- Never silently use Mantine, Radix, or any other library.

---

## Design System Reference

| Item | Value |
|---|---|
| Figma file key | `E3iIKwdE2far5TdrPYla2z` |
| JSON exports | `design-system/figma/` |
| Documentation | `design-system/docs/` |
| Rules | `design-system/rules/` |

**Collections and token counts:**

| Collection | Tokens | Notes |
|---|---|---|
| `x_Primitives` | 202 | Raw hex, single mode |
| `1.Semantic color modes` | 141 | Light + Dark mode |
| `2.Radius` | 11 | `None` → `Full` |
| `3.Spacing` | 17 | `Spacing/0` → `Spacing/1200` |
| `4.Screen widths` | 7 | `Screen/XS` → `Screen/3XL` |
| `5.Typography` | 45 | Includes `Font Style/*` STRING variables |
| `6.Z Index` | 7 | `Base` → `Tooltip` |
| `7.Components` | 399 | Light + Dark mode |
| `8.Icons` | 9 | Size (px) + stroke weight — no color |

**Styles:** 28 text · 21 effect · 4 grid

**Components in Figma:** Button · Input · Checkbox · Radio · Switch · Tabs · Avatar · Tooltip

---

## Token Names to Know

**Spacing** — `Spacing/0` (0) · `Spacing/25` (2px) · `Spacing/50` (4px) · `Spacing/75` (6px) · `Spacing/100` (8px) · `Spacing/150` (12px) · `Spacing/200` (16px) · `Spacing/250` (20px) · `Spacing/300` (24px) · `Spacing/400` (32px) · `Spacing/500` (40px) · `Spacing/600` (48px) · `Spacing/700` (56px) · `Spacing/800` (64px) · `Spacing/900` (72px) · `Spacing/1000` (80px) · `Spacing/1200` (96px)

**Breakpoints** — `Screen/XS` (320) · `Screen/SM` (640) · `Screen/MD` (768) · `Screen/LG` (1024) · `Screen/XL` (1280) · `Screen/2XL` (1440) · `Screen/3XL` (1600)

**Design at `Screen/XL` (1280px)** — primary Fincaree dashboard target.

**Radius** — `None` (0) · `XS` (2) · `SM` (4) · `MD` (6) · `LG` (8) · `XL` (12) · `2XL` (14) · `3XL` (16) · `4XL` (24) · `5XL` (32) · `Full` (9999)

**Z Index** — `Base` (0) · `Sticky` (100) · `Dropdown` (200) · `Popover` (300) · `Modal` (400) · `Toast` (500) · `Tooltip` (600)

**Font style strings** — `Regular` · `Medium` · `Semi Bold` (space required) · `Bold`

**Icon sizes (`8.Icons`)** — `Icon/Size/XS` (12px) · `Icon/Size/SM` (16px) · `Icon/Size/MD` (20px) · `Icon/Size/LG` (24px) · `Icon/Size/XL` (32px) · `Icon/Size/2XL` (40px)

**Icon weights (`8.Icons`)** — `Icon/Weight/Regular` (1.5px) · `Icon/Weight/Bold` (2px) · `Icon/Weight/Strong` (2.5px)

**Icon colors (`1.Semantic color modes`)** — `Icon/Default/Primary` · `Icon/Default/Secondary` · `Icon/Default/Tertiary` · `Icon/Default/Disabled` · `Icon/Brand/Primary` · `Icon/Brand/Secondary` · `Icon/Status/Success` · `Icon/Status/Warning` · `Icon/Status/Error` · `Icon/Status/Info` · `Icon/On Brand/Primary` · `Icon/Inverse/Primary`

---

## Token Rules

- Every token name comes from a fresh Figma query or the current JSON export — never from memory.
- Confirm a token is **bound** before claiming work is done. Existing ≠ bound.
- Resolve alias chains to final hex when reporting values.
- Never hardcode hex, rgba, or pixel values in Figma. Every color traces through a variable.
- Effect geometry (X/Y offset, blur, spread) is hardcoded — Figma does not support variable binding for these. This is expected and correct.

## Icon Rules (Code)

- **Library:** always use `lucide-react`. No other icon library.
- **Size:** map `Icon/Size/*` token value to the `size` prop.
- **Weight:** map `Icon/Weight/*` token value to the `strokeWidth` prop.
- **Color:** apply an `Icon/*` semantic token via CSS `color` or Tailwind class. Never hardcode a color value.
- **Default:** `size={20}` (`Icon/Size/MD`) · `strokeWidth={1.5}` (`Icon/Weight/Regular`).
- **Strong weight (2.5px):** only at `XL` (32px) or `2XL` (40px) sizes.

```tsx
import { AlertCircle, ChevronRight } from 'lucide-react'

// Default
<ChevronRight size={20} strokeWidth={1.5} />

// Brand icon
<ChevronRight size={16} strokeWidth={1.5} className="text-brand-500 dark:text-brand-400" />

// Status
<AlertCircle size={20} strokeWidth={2} className="text-error-500 dark:text-error-400" />
```

| Figma token | React prop / CSS |
| --- | --- |
| `Icon/Size/*` | `size={value}` |
| `Icon/Weight/*` | `strokeWidth={value}` |
| `Icon/Default/Primary` | `text-grey-900 dark:text-grey-25` |
| `Icon/Brand/Primary` | `text-brand-500 dark:text-brand-400` |
| `Icon/Status/Error` | `text-error-500 dark:text-error-400` |
| `Icon/Status/Success` | `text-success-500 dark:text-success-400` |
| `Icon/Status/Warning` | `text-warning-500 dark:text-warning-400` |

---

## When Using shadcn/ui

- Fetch the actual source from the official docs URL — never from memory.
- Read states from `data-[state=*]` attributes and props only.
- Do not add a Focus Figma variant unless the component explicitly exposes `data-[state=focus]`. Focus is CSS (`focus-visible:*`), not a design state.
- Replace all external library variable bindings with Fincaree semantic tokens.
- Replace font references with `Font Family/Base` (Geist).

---

## Keeping Files in Sync

After any change in Figma — update both the JSON and the MD.

| Changed in Figma | Update JSON | Update MD |
|---|---|---|
| Color variables | `semantic-colors.json` / `components.json` | `docs/Semantics/` / `docs/Components/` |
| Spacing | `spacing.json` | `docs/Foundations/Spacing.md` |
| Screen widths | `screen-widths.json` | `docs/Foundations/Screen Widths.md` |
| Text styles | `text-styles.json` | `docs/Foundations/Text Styles.md` |
| Shadow styles | `shadows.json` | `docs/Foundations/Shadows.md` |
| Grid styles | `grids.json` | `docs/Foundations/Grid.md` |
| Primitives | `primitives.json` | `docs/Foundations/Primitives.md` |
| Icons | `icons.json` | `docs/Foundations/icons.md` |

Never hand-edit token values in JSON — they must come from a Figma re-export.

---

## Before Any Batch Operation

- Sample 2–3 representative nodes first to verify actual structure.
- If any item has unexpected structure — stop and report, do not force.
- State the scope before executing. Report: applied / skipped / errored.

---

## Ambiguity = Stop

- When two interpretations exist — ask, don't guess.
- Do exactly what was asked. Surface other issues but ask before fixing them.
- Never touch pages, collections, or components not mentioned in the current task.

---

## Audits Must Be Evidence-Based

- Every count comes from a live Figma query — not memory or estimation.
- After any fix, run a zero-remaining audit and report the result.
- Clearly distinguish: "token exists" · "token is bound" · "token resolves correctly".
