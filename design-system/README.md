# Fincaree B2B Design System

Source of truth for the Fincaree enterprise SaaS platform design system. All token values are exported directly from the Figma master file.

**Figma file:** `E3iIKwdE2far5TdrPYla2z` — Design System Master File

---

## Directory Structure

```
design-system/
├── figma/          ← JSON token exports (source of truth, re-export from Figma when changed)
├── docs/
│   ├── Foundations/   ← Primitives, Spacing, Radius, Typography, Shadows, Grid, etc.
│   ├── Semantics/     ← Semantic color tokens (Light + Dark mode)
│   └── Components/    ← Component-level token tables
└── rules/          ← Workflow and engineering rules for Claude and the team
```

---

## Variable Collections

| Collection | File | Modes | Tokens |
|---|---|---|---|
| `x_Primitives` | `figma/primitives.json` | Single | 202 |
| `1.Semantic color modes` | `figma/semantic-colors.json` | Light Mode, Dark Mode | 141 |
| `2.Radius` | `figma/radius.json` | Single | 11 |
| `3.Spacing` | `figma/spacing.json` | Single | 17 |
| `4.Screen widths` | `figma/screen-widths.json` | Single | 7 |
| `5.Typography` | `figma/typography.json` | Single | 45 |
| `6.Z Index` | `figma/z-index.json` | Single | 7 |
| `7.Components` | `figma/components.json` | Light Mode, Dark Mode | 399 |

---

## Styles

| Type | Count | File |
|---|---|---|
| Text styles | 28 | `figma/text-styles.json` |
| Effect styles (shadows) | 21 | `figma/shadows.json` |
| Grid styles | 4 | `figma/grids.json` |

---

## Color Architecture

```
x_Primitives  →  1.Semantic color modes  →  7.Components
```

Raw hex → semantic intent tokens (Light/Dark) → component-specific aliases. Components never reference primitives directly.

---

## Components Documented

**In Figma design system:** Button, Input, Checkbox, Radio, Switch, Tabs, Avatar, Tooltip

**Token groups in `7.Components`:** Button, Switch, Tabs, Avatar, Tooltip (+ Checkbox, Input, Radio sub-tokens)

---

## Spacing Scale

`Spacing/0` (0px) → `Spacing/25` (2px) → `Spacing/50` (4px) → `Spacing/75` (6px) → `Spacing/100` (8px) → `Spacing/150` (12px) → `Spacing/200` (16px) → `Spacing/250` (20px) → `Spacing/300` (24px) → `Spacing/400` (32px) → `Spacing/500` (40px) → `Spacing/600` (48px) → `Spacing/700` (56px) → `Spacing/800` (64px) → `Spacing/900` (72px) → `Spacing/1000` (80px) → `Spacing/1200` (96px)

---

## Breakpoints

`Screen/XS` (320px) · `Screen/SM` (640px) · `Screen/MD` (768px) · `Screen/LG` (1024px) · `Screen/XL` (1280px) · `Screen/2XL` (1440px) · `Screen/3XL` (1600px)

Design at **Screen/XL (1280px)** — primary Fincaree dashboard target.

---

## Grids

| Grid | Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|---|
| `Grid/MD` | 768px | 8 | 24px | 24px |
| `Grid/LG` | 1024px | 12 | 24px | 32px |
| `Grid/XL` | 1280px | 12 | 32px | 64px |
| `Grid/2XL` | 1440px | 12 | 32px | 80px |

---

## Updating These Docs

1. Make changes in Figma
2. Re-export the affected collection from Figma via MCP → update `figma/*.json`
3. Update the corresponding `docs/**/*.md`
4. **Never hand-edit token values** — they must come from Figma
