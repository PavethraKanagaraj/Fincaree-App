# 02 — Component Rules

Rules for sourcing, building, and completing components in the Fincaree design system.

---

## Components in the Design System

**In Figma:** Button · Input · Checkbox · Radio · Switch · Tabs · Avatar · Tooltip

**In `7.Components` (399 tokens):** Button · Switch · Tabs · Avatar · Tooltip · Checkbox · Input · Radio sub-tokens

---

## 1. Component Source Hierarchy

Always check in this exact order. Never skip a step.

```
1. Fincaree Design System (Figma)
            ↓  not found?
2. shadcn/ui  (base-nova style)
            ↓  not in shadcn either?
3. Stop — inform the user
```

**If found in Fincaree:** use the existing Figma component. Apply Fincaree tokens. Done.

**If found in shadcn/ui:** build it in Figma following the shadcn/ui base-nova spec. Apply Fincaree design tokens to every property. Then add it to the design system.

**If found in neither:** stop and tell the user —
> "`[ComponentName]` doesn't exist in the Fincaree design system or shadcn/ui. Options: A) build from scratch, B) use [alternative], C) skip for now."

Never silently pull from Mantine, Headless UI, Radix, or any other source without explicit approval.

---

## 2. A Component Is "Done" When Every Property Is Variable-Bound

Every visible property on every variant × state must be bound to a `7.Components` token.

| Property | Required |
|---|---|
| Background fill | If present |
| Border / stroke color | If present |
| Text / label color | If present |
| Icon color | If present — must use `Icon/*` token from `1.Semantic color modes`, never a primitive or hardcoded value |
| Icon size | If icon is present — apply `Icon/Size/*` token from `8.Icons` |
| Icon stroke weight | If icon is present — apply `Icon/Weight/*` token from `8.Icons` |
| Placeholder color | Inputs |
| Helper text / status text | Validated fields |
| Focus Ring — Border AND Halo | All focusable elements |
| Shadow / elevation color | If present |
| Hover / active overlay | Interactive elements |
| All Disabled states | Across every property above |

- Zero hardcoded fills, strokes, or effect colors on any shipped component.
- Effect geometry (X, Y offset, blur, spread) may be hardcoded — Figma does not support variable binding for these values.
- Apply the shared effect style (`Shadow/Light/*`, `Shadow/Focus Ring/*`) rather than inline effects where possible.

---

## 3. Building a Component from shadcn/ui

1. **Fetch the actual source** — use the official shadcn/ui docs URL. Never rely on memory.
2. **Read the real states** from `data-[state=*]` attributes and component props only.
3. **No Focus Figma variant** — focus is handled via CSS `focus-visible:*` at runtime. Do not add a Focus state in Figma unless the component explicitly exposes `data-[state=focus]`.
4. **Map every visual property** to the correct Fincaree Semantic token.
5. **Create component tokens** in `7.Components` aliasing to `1.Semantic color modes`. Never alias directly to primitives.
6. **Build the Figma component set** with valid `Property=Value` variant names.
7. **Run a zero-hardcoded audit** — confirm every fill, stroke, and effect color is bound before marking done.
8. **Update** `figma/components.json` and `docs/Components/[Name].md`.

---

## 4. Component Token Naming

```
ComponentName/Element/Property/State
```

Examples:
```
Button/Brand/Primary/Background/Default
Switch/Track/Background/Checked/Hover
Tabs/Trigger/Text/Active
Avatar/Interactive/Overlay/Hover
Tooltip/Background
Input/Border/Error
```

- Tokens in `7.Components` alias to `1.Semantic color modes` — never directly to `x_Primitives`.
- Never hardcode any value in a component token.

---

## 5. Focus Ring

Every focusable component must have a two-layer focus ring:

| Layer | Spread | Color |
|---|---|---|
| Inner (Border) | 2px | `Background/Default/Primary` (white) |
| Outer (Halo) | 4px | `Focus Ring/Halo/Brand` or `/Error` or `/Success` or `/Warning` |

- Bind by geometry — inner spread = Border, outer spread = Halo. Never by array index.
- Do not add Focus as a Figma variant unless the spec explicitly requires it.

---

## 6. Variant Naming

- Format: `Property=Value, Property=Value`
- Common properties: `Size`, `State`, `Style`, `Type`, `Pressed`, `Placeholder`
- Common state values: `Default` · `Hover` · `Active` · `Disabled`
- Never ship variants with names starting with `=` or missing the `Property=` prefix.

---

## 7. After Completing a Component

- [ ] Zero external library variable bindings
- [ ] Zero hardcoded color values (fills, strokes, effect colors)
- [ ] All tokens in `7.Components` aliasing to `1.Semantic color modes`
- [ ] Icons use `Icon/*` semantic color token — not a primitive, not hardcoded
- [ ] Icon size bound to `Icon/Size/*` from `8.Icons`
- [ ] Icon stroke weight bound to `Icon/Weight/*` from `8.Icons`
- [ ] All Figma variant names valid
- [ ] Component description set in Figma
- [ ] `figma/components.json` updated
- [ ] `docs/Components/[Name].md` written or updated
