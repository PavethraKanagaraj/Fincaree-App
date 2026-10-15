# Tabs

Source: `figma/components.json`

Layered content sections displayed one at a time. Supports Pill and Line styles. Values shown are fully resolved hex.

---

## TabsList

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Tabs/List/Background` | `#E9EAEC` | `#40444D` |
| `Tabs/List/Border/Default` | `#25282D` | `#505660` |

## TabsTrigger / Text

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Tabs/Trigger/Text/Default` | `#40444D` | `#E9EAEC` |
| `Tabs/Trigger/Text/Hover` | `#25282D` | `#FBFBFB` |
| `Tabs/Trigger/Text/Active` | `#25282D` | `#FBFBFB` |
| `Tabs/Trigger/Text/Disabled` | `#6B7280` | `#6B7280` |

## TabsTrigger / Background

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Tabs/Trigger/Background/Default` | `#E9EAEC` | `#40444D` |
| `Tabs/Trigger/Background/Hover` | `#F0F1F2` | `#30333A` |
| `Tabs/Trigger/Background/Active` | `#FFFFFF` | `#25282D` |

## Line Variant / Indicator

| Token | Light Mode | Dark Mode |
|---|---|---|
| `Tabs/Line/Indicator/Active` | `#2F7D6B` | `#3D9480` |
| `Tabs/Line/Indicator/Default` | `#25282D` | `#505660` |

---

## Component Sets

### TabsTrigger
| Property | Options |
|---|---|
| **Style** | Pill, Line |
| **State** | Default, Hover, Active, Disabled |
| **HasIcon** | True, False |

### TabsList
| Property | Options |
|---|---|
| **Style** | Pill, Line |
| **Orientation** | Horizontal, Vertical |

### Tabs (Composite)
| Property | Options |
|---|---|
| **Style** | Pill, Line |
| **Orientation** | Horizontal, Vertical |

---

## Usage

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="password">Password content</TabsContent>
</Tabs>
```
