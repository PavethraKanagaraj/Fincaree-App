# Tooltip

Source: `figma/components.json`

Contextual information shown on hover. Supports arrow positioning, supporting text, and keyboard shortcuts. Values shown are fully resolved hex.

---

## Tokens

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Tooltip/Background` | `#25282D` | `#FFFFFF` |
| `Tooltip/Text/Title` | `#FFFFFF` | `#FFFFFF` |
| `Tooltip/Text/Supporting` | `#8ECBBA` | `#C4E5DC` |
| `Tooltip/Kbd/Background` | `#30333A` | `#E9EAEC` |
| `Tooltip/Kbd/Border` | `#FFFFFF` | `#25282D` |

---

## Component Sets

### Tooltip
18 variants covering all arrow positions.

| Property | Options |
|---|---|
| **Supporting text** | True (title + description), False (title only) |
| **Arrow** | None, Bottom center, Bottom left, Bottom right, Top center, Top left, Top right, Left, Right |

### Tooltip Keyboard Shortcut
Standalone tooltip showing a label + keyboard shortcut badge (e.g. `⌘K`, `⌘S`).

### Help icon
28 variants — a `?` icon with attached tooltip. Useful for inline field documentation.

| Property | Options |
|---|---|
| **Open** | True, False |
| **Supporting text** | True, False |
| **Tooltip** | Top no arrow, Top arrow, Top left, Top right, Bottom, Left, Right |

---

## Arrow position guide

| Arrow value | Tooltip appears | Arrow points |
|---|---|---|
| `Bottom center` | Above trigger, centered | ↓ Down, center |
| `Bottom left` | Above trigger, right-aligned | ↓ Down, left |
| `Bottom right` | Above trigger, left-aligned | ↓ Down, right |
| `Top center` | Below trigger, centered | ↑ Up, center |
| `Top left` | Below trigger, right-aligned | ↑ Up, left (x=12px) |
| `Top right` | Below trigger, left-aligned | ↑ Up, right (x=12px) |
| `Left` | Right of trigger | ← Left |
| `Right` | Left of trigger | → Right |
| `None` | Above trigger | No arrow |

---

## Usage

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```
