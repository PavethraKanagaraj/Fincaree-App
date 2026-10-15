# Icons

**Source:** `8.Icons` — Figma variable collection
**Library:** `lucide-react`
**Token file:** `design-system/figma/icons.json`

---

## Size

Size tokens control the `width` and `height` of an icon. All values are identical across Light and Dark modes.

| Token | Value | Use |
| --- | ---: | --- |
| `Icon/Size/XS` | 12px | Very compact UI, badges |
| `Icon/Size/SM` | 16px | Dense UI, table actions |
| `Icon/Size/MD` | 20px | Default UI icon |
| `Icon/Size/LG` | 24px | Buttons, navigation |
| `Icon/Size/XL` | 32px | Feature / empty-state icons |
| `Icon/Size/2XL` | 40px | Large illustrations, prominent states |

**Default:** `Icon/Size/MD` (20px)

---

## Weight

Weight tokens control the stroke width of Lucide icons.

| Token | Value | Use |
| --- | ---: | --- |
| `Icon/Weight/Regular` | 1.5px | Default — most UI contexts |
| `Icon/Weight/Bold` | 2px | Emphasis, active states |
| `Icon/Weight/Strong` | 2.5px | High-contrast, large sizes only |

**Default:** `Icon/Weight/Regular` (1.5px)

---

## Color

Icon colors are sourced from `1.Semantic color modes` — not from the `8.Icons` collection. Always apply a semantic token; never hardcode a hex value.

| Token | Light Mode | Dark Mode | Use |
| --- | --- | --- | --- |
| `Icon/Default/Primary` | Grey/900 | Grey/25 | Primary content icons |
| `Icon/Default/Secondary` | Grey/700 | Grey/100 | Supporting / secondary icons |
| `Icon/Default/Tertiary` | Grey/600 | Grey/200 | Subtle / decorative icons |
| `Icon/Default/Quaternary` | Grey/500 | Grey/300 | Placeholder icons |
| `Icon/Default/Placeholder` | Grey/400 | Grey/400 | Empty input icons |
| `Icon/Default/Disabled` | Grey/300 | Grey/500 | Disabled state |
| `Icon/Brand/Primary` | Brand/500 | Brand/400 | Brand-coloured icons |
| `Icon/Brand/Secondary` | Brand/600 | Brand/300 | Secondary brand icons |
| `Icon/Brand/Tertiary` | Brand/100 | Brand/700 | Subtle brand icons |
| `Icon/On Brand/Primary` | white | white | Icons on brand-coloured backgrounds |
| `Icon/Inverse/Primary` | white | white | Icons on dark/inverse backgrounds |
| `Icon/Status/Success` | Success/500 | Success/400 | Success state |
| `Icon/Status/Warning` | Warning/500 | Warning/400 | Warning state |
| `Icon/Status/Error` | Error/500 | Error/400 | Error state |
| `Icon/Status/Info` | Info/500 | Info/400 | Info state |

---

## Usage

### React (lucide-react)

```tsx
import { AlertCircle, ChevronRight, Settings } from 'lucide-react'

// Default
<Settings size={20} strokeWidth={1.5} />

// Brand icon in a button
<ChevronRight size={16} strokeWidth={1.5} />

// Status icon
<AlertCircle size={20} strokeWidth={2} />
```

Map tokens to props:

| Figma token | React prop |
| --- | --- |
| `Icon/Size/*` | `size={value}` |
| `Icon/Weight/*` | `strokeWidth={value}` |
| `Icon/*/Color` | CSS `color` via className |

### Tailwind color classes

```tsx
// Default primary
<Settings className="text-grey-900 dark:text-grey-25" size={20} strokeWidth={1.5} />

// Brand
<ChevronRight className="text-brand-500 dark:text-brand-400" size={16} strokeWidth={1.5} />

// Error
<AlertCircle className="text-error-500 dark:text-error-400" size={20} strokeWidth={2} />
```

---

## Rules

- Always use a semantic `Icon/*` color token — never a primitive hex value.
- Default size is **MD (20px)**, default weight is **Regular (1.5px)**.
- Use **Strong (2.5px)** weight only at XL or 2XL sizes.
- Icon color must meet WCAG AA contrast against its background.
- Lucide icons are `outline` style (stroke-based) — do not mix with filled icon sets.
