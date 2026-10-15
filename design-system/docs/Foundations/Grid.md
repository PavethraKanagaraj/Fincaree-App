# Grid

Source: `figma/grids.json`

4 column grid styles — Fincaree B2B SaaS, desktop-primary.

---

| Style | Breakpoint | Columns | Gutter | Margin | Purpose |
|---|---:|---:|---:|---:|---|
| `Grid/MD` | 768px | 8 | 24px | 24px | Tablet |
| `Grid/LG` | 1024px | 12 | 24px | 32px | Small desktop |
| `Grid/XL` | 1280px | 12 | 32px | 64px | Main desktop — design here first |
| `Grid/2XL` | 1440px | 12 | 32px | 80px | Large desktop |

---

## Notes

- Design at **Grid/XL** (1280px) — primary target for Fincaree dashboards
- Inner canvas at XL = 1280 − (64×2) = **1152px**
- Inner canvas at 2XL = 1440 − (80×2) = **1280px**
- Tied to `Screen/MD`, `Screen/LG`, `Screen/XL`, `Screen/2XL` variables
