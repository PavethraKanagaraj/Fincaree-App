# Avatar

Source: `figma/components.json`

Circular image representing a user. Supports image, placeholder silhouette, and text initials. Values shown are fully resolved hex.

---

## Base

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Avatar/Background/Default` | `#E9EAEC` | `#40444D` |
| `Avatar/Border/Default` | `#D1D3D8` | `#40444D` |
| `Avatar/Image/Border` | `#00000014` (8%) | `#00000014` (8%) |
| `Avatar/Text/Initials` | `#6B7280` | `#D1D3D8` |
| `Avatar/Badge/Background` | `#FFFFFF` | `#25282D` |

## Interactive (Clickable Avatar)

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Avatar/Interactive/Background` | `#E9EAEC` | `#40444D` |
| `Avatar/Interactive/Border` | `#D1D3D8` | `#40444D` |
| `Avatar/Interactive/Silhouette` | `#606773` | `#606773` |
| `Avatar/Interactive/Overlay/Hover` | `#00000014` (8%) | `#00000014` (8%) |
| `Avatar/Interactive/Overlay/Active` | `#00000033` (20%) | `#00000033` (20%) |
| `Avatar/Interactive/Focus/Ring` | `#2F7D6B` | `#5AAF99` |

## Add Button

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Avatar/AddButton/Background/Default` | `#FFFFFF` | `#25282D` |
| `Avatar/AddButton/Background/Hover` | `#F0F1F2` | `#30333A` |
| `Avatar/AddButton/Background/Disabled` | `#F0F1F2` | `#505660` |
| `Avatar/AddButton/Border/Default` | `#D1D3D8` | `#40444D` |
| `Avatar/AddButton/Border/Disabled` | `#D1D3D8` | `#40444D` |
| `Avatar/AddButton/Icon/Hover` | `#40444D` | `#E9EAEC` |
| `Avatar/AddButton/Icon/Disabled` | `#6B7280` | `#505660` |
| `Avatar/AddButton/Focus/Ring` | `#2F7D6B` | `#5AAF99` |
| `Avatar/AddButton/Focus/Background` | `#FFFFFF` | `#25282D` |

---

## Component Sets

### Avatar (Main)
| Property | Options |
|---|---|
| **Size** | xs (24px), sm (32px), md (40px), lg (48px), xl (56px), 2xl (64px) |
| **Placeholder** | True (silhouette), False (image/text) |
| **Text** | True (initials), False |
| **Status icon** | False, Online indicator, Company, Verified |

### Avatar (Interactive)
| Property | Options |
|---|---|
| **Size** | sm (32px), md (40px), lg (48px) |
| **State** | Default, Hover, Active, Focus |

### _Avatar online indicator
| Property | Options |
|---|---|
| **Size** | xs, sm, md, lg, xl, 2xl |
| **Status** | Online `#388E3C`, Offline `#6B7280`, Away `#D97706`, Busy `#DC2626` |

### Avatar group
| Property | Options |
|---|---|
| **Size** | xs, sm, md |
| **More users** | Boolean (shows +N count) |
| **Add more button** | Boolean |
