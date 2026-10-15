# Semantic colour cleanup — 25 Sep 2026

Changes applied to `figma/semantic-colors.json` and `figma/components.json` so the
export, `app/globals.css` and Storybook agree.

**Applied in Figma on 25 Sep 2026** (`1.Semantic color modes`, file `E3iIKwdE2far5TdrPYla2z`):
all 182 variables verified identical to the export in both modes. Duplicates were
resolved by keeping the variable that `7.Components` already referenced and repointing
the rest (9 button focus-ring variables), so no component or layer lost a binding —
checked across all 24 pages before any deletion.

**Not yet updated:** the "Semantic Colors Documentation" frame on the Color page. Its
swatches, hex values and references are static text/fills (not bound to variables),
so it still shows the pre-cleanup values and names until it is regenerated.

Backups of the previous export are in `figma/backups/*.pre-cleanup-2026-09-25.json`.

CSS names now follow one rule, implemented in `scripts/generate-tokens.mjs`: the Figma path, minus `Default`, kebab-cased
(`Background/Status/Error Subtle` → `--bg-status-error-subtle`). Run `npm run tokens` after any export.

## Renamed (21)

| From | To | Why |
|---|---|---|
| `Border/Focus Ring/Primary` | `Focus Ring/Border/Primary` | Focus ring tokens live in one collection group |
| `Border/Focus Ring/Error` | `Focus Ring/Border/Error` | Focus ring tokens live in one collection group |
| `Border/Focus Ring/Inverse/Primary` | `Focus Ring/Border/Inverse Primary` | Focus ring tokens live in one collection group |
| `Border/Focus Ring/Inverse/Secondary` | `Focus Ring/Border/Inverse Secondary` | Focus ring tokens live in one collection group |
| `Foreground/On/Brand` | `Foreground/On Brand/Primary` | Match Text/On Brand/Primary and Icon/On Brand/Primary |
| `Foreground/On/Inverse` | `Foreground/Inverse/Primary` | Match Text/Inverse/Primary |
| `Background/Status/Error/Focus` | `Background/Status/Error Focus` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/Error/Hover` | `Background/Status/Error Hover` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/Success/Hover` | `Background/Status/Success Hover` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/Success/Pressed` | `Background/Status/Success Pressed` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/Warning/Focus` | `Background/Status/Warning Focus` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/Warning/Hover` | `Background/Status/Warning Hover` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/info/Info Focus` | `Background/Status/Info Focus` | One flat naming pattern: Status/{Status} {Variant} |
| `Background/Status/info/Info Hover` | `Background/Status/Info Hover` | One flat naming pattern: Status/{Status} {Variant} |
| `Overlay/medium` | `Overlay/Medium` | Title Case like every other token |
| `Overlay/strong` | `Overlay/Strong` | Title Case like every other token |
| `Overlay/scrim` | `Overlay/Scrim` | Title Case like every other token |
| `Overlay/inverse` | `Overlay/Inverse` | Title Case like every other token |
| `Chart/Series 7` | `Chart/Series 07` | Zero-pad like Series 01–06 so they sort in order |
| `Chart/Series 8` | `Chart/Series 08` | Zero-pad like Series 01–06 so they sort in order |
| `Chart/Series 9` | `Chart/Series 09` | Zero-pad like Series 01–06 so they sort in order |

## Value changes (28)

| Token | Light | Dark | Why |
|---|---|---|---|
| `Text/Default/Secondary Hover` | Brand 800 → **Grey 900** | — | Light hover jumped to brand green (Brand 800); every other neutral hover darkens within grey |
| `Text/Default/Quaternary` | — | Grey 200 → **Grey 250** | Dark value equalled Tertiary (Grey 200), collapsing the hierarchy |
| `Text/Default/Placeholder` | — | Grey 200 → **Grey 250** | Dark placeholder equalled body Tertiary (Grey 200), so typed text and hint looked identical |
| `Text/Default/Placeholder Subtle` | — | Grey 250 → **Grey 265** | Keeps Subtle one step dimmer than Placeholder after the Placeholder fix |
| `Text/Brand/Secondary` | Brand 700 → **Brand 600** | — | Light value equalled Brand Primary (Brand 700); now one step lighter |
| `Text/Brand/Tertiary` | Brand 400 → **Brand 500** | — | Brand 400 on white is 3.9:1 and fails AA for text; Brand 500 is 5.0:1 |
| `Text/Status/Error Strong` | — | Error 200 → **Error 100** | Dark value equalled plain Error (Error 200); Strong must be higher-emphasis |
| `Border/Brand/Subtle` | Brand 500 → **Brand 200** | Brand 400 → **Brand 800** | Was identical to Border/Brand/Primary in both modes; Subtle is now actually subtle |
| `Foreground/Default/Quaternary` | — | #ffffff → **Grey 700** | Dark value was raw #ffffff (unaliased and the brightest possible) for the dimmest foreground |
| `Background/Status/Info Subtle` | — | Info 800 → **Info 900** | Dark value (Info 800) equalled Info Hover; other statuses use 900 for Subtle |
| `Background/Status/Error Pressed` | Error 100 → **Error 200** | Error 800 → **Error 700** | Was identical to Error Hover; Pressed is one step deeper, as Success Pressed already is |
| `Background/Interactive/Hover` | — | Brand 25 → **Grey 800** | Dark value was Brand 25 (near-white), a white flash on a dark surface; code already used Grey 800 |
| `Icon/Status/Success` | — | white → **Success 400** | Dark value was pure white; Error and Warning icons use their 400 step in dark |
| `Icon/Inverse/Primary` | — | white → **Grey 900** | Inverse must flip in dark, like Text/Inverse/Primary |
| `Overlay/Inverse` | Black Black 12% → **White White 12%** | — | Inverse overlay is the opposite of the surface: white on light-mode dark surfaces, black in dark mode |
| `Focus Ring/Halo/Success` | #a3cba5 → **#a3cba566** | #60a563 → **#c1dcc366** | Other halos are 40% alpha; this one was an opaque fill |
| `Focus Ring/Halo/Warning` | #eec08c → **#eec08c66** | #e19238 → **#f3d5b266** | Other halos are 40% alpha; this one was an opaque fill |
| `Chart/Series 10` | Green 500 → **Green 700** | Green 400 → **Green 300** | Duplicated a Series 01–06 colour exactly; second cycle uses the 700/300 shade |
| `Chart/Series 11` | Orange 500 → **Orange 700** | Orange 400 → **Orange 300** | Duplicated a Series 01–06 colour exactly; second cycle uses the 700/300 shade |
| `Chart/Series 12` | Rose 500 → **Rose 700** | Rose 400 → **Rose 300** | Duplicated a Series 01–06 colour exactly; second cycle uses the 700/300 shade |
| `Chart/Series 07` | Brand 500 → **Brand 700** | Brand 400 → **Brand 300** | Duplicated a Series 01–06 colour exactly; second cycle uses the 700/300 shade |
| `Chart/Series 08` | Blue 500 → **Blue 700** | Blue 400 → **Blue 300** | Duplicated a Series 01–06 colour exactly; second cycle uses the 700/300 shade |
| `Chart/Series 09` | Purple 500 → **Purple 700** | Purple 400 → **Purple 300** | Duplicated a Series 01–06 colour exactly; second cycle uses the 700/300 shade |
| `Chart/Info 2` | Info 500 → **Info 300** | Info 400 → **Info 600** | Was identical to its base colour; now the lighter companion shade |
| `Chart/Negative 2` | Error 500 → **Error 300** | Error 400 → **Error 600** | Was identical to its base colour; now the lighter companion shade |
| `Chart/Neutral 2` | Grey 500 → **Grey 300** | Grey 400 → **Grey 600** | Was identical to its base colour; now the lighter companion shade |
| `Chart/Positive 2` | Success 500 → **Success 300** | Success 400 → **Success 600** | Was identical to its base colour; now the lighter companion shade |
| `Chart/Warning 2` | Warning 500 → **Warning 300** | Warning 400 → **Warning 600** | Was identical to its base colour; now the lighter companion shade |

## Added (10)

Completes the Status × Variant matrix (Subtle, Hover, Pressed, Focus, Solid, Solid Hover, Solid Pressed) for Error, Warning, Success and Info.

| Token | Light | Dark |
|---|---|---|
| `Background/Status/Warning Pressed` | Warning 200 | Warning 700 |
| `Background/Status/Warning Solid` | Warning 500 | Warning 500 |
| `Background/Status/Warning Solid Hover` | Warning 600 | Warning 600 |
| `Background/Status/Warning Solid Pressed` | Warning 700 | Warning 700 |
| `Background/Status/Success Focus` | Success 200 | Success 700 |
| `Background/Status/Success Solid Hover` | Success 600 | Success 600 |
| `Background/Status/Success Solid Pressed` | Success 700 | Success 700 |
| `Background/Status/Info Pressed` | Info 200 | Info 700 |
| `Background/Status/Info Solid Hover` | Info 600 | Info 600 |
| `Background/Status/Info Solid Pressed` | Info 700 | Info 700 |

## Removed (8)

| Token | Why |
|---|---|
| `Focus Ring/Border/Primary` | Was an alias of Border/Focus Ring/Primary; replaced by the moved token |
| `Focus Ring/Border/Error` | Was an alias of Border/Focus Ring/Error; replaced by the moved token |
| `Background/Status/Error/Subtle` | Duplicate of Background/Status/Error Subtle |
| `Background/Status/Success/Subtle` | Duplicate of Background/Status/Success Subtle |
| `Background/Status/Warning/Subtle` | Duplicate of Background/Status/Warning Subtle |
| `Background/Status/info/Info Subtle` | Duplicate of Background/Status/Info Subtle |
| `Data Visualization/new` | Placeholder token (#ffffff in both modes), not used anywhere |
| `Sidebar/Series 01` | A chart series inside Sidebar; duplicates Chart/Series 01 |

## Code renames

Old CSS variables were renamed across the codebase (149 references, 45 files):

| Old | New |
|---|---|
| `--icon-brand` | `--icon-brand-primary` |
| `--icon-brand-alt` | `--icon-brand-secondary` |
| `--icon-on-brand` | `--icon-on-brand-primary` |
| `--icon-success` | `--icon-status-success` |
| `--icon-warning` | `--icon-status-warning` |
| `--icon-error` | `--icon-status-error` |
| `--border-focus-primary` | `--focus-ring-border-primary` |
| `--border-focus-error` | `--focus-ring-border-error` |
| `--focus-halo-brand` | `--focus-ring-halo-primary` |
| `--focus-halo-error` | `--focus-ring-halo-error` |
| `--fg-on-brand` | `--fg-on-brand-primary` |

## Not changed — flagged for review

- `Text/Default/Quaternary` light is 4.3:1 on `Background/Secondary`; keep it off tinted surfaces.
- `Text/Brand/Tertiary` light is 4.35:1 on `Background/Secondary` (was 3.9:1).
- In dark mode `Background/Default/Canvas` (Grey 750) is lighter than `Background/Default/Primary` (Grey 900), so cards sit darker than the page; `Text/Brand/Primary` and `Text/Status/Success` fall to ~4:1 directly on the canvas.
- `Colors/Secondary/Blue` 400 and 500 are the same hex in `x_Primitives`.

---

# Dark canvas contrast fix — 26 Sep 2026

Found by the axe audit of the Button stories: brand link text (`Text/Brand/Primary`, brand-300)
was 4.01:1 on the dark page canvas, below WCAG AA 4.5:1. The dark canvas (grey-750) was *lighter*
than the cards on it (grey-900), inverting normal elevation. Applied in JSON, CSS, Storybook and Figma.

| Token | Dark before | Dark after | Why |
|---|---|---|---|
| `Colors/Primary/Grey/925` (new primitive) | — | `#202227` | The dark ramp had no step between canvas (950) and card (900) for board columns |
| `Background/Default/Canvas` | Grey 750 | **Grey 950** | Page sits darker than cards; brand text on canvas 4.01 → 6.45:1, success text passes too |
| `Background/Default/Subtle` | Grey 950 | **Grey 925** | Would otherwise equal the new canvas and board columns would vanish; keeps canvas → column → card |

# On Brand text tokens retired — 26 Sep 2026

Found by the Storybook accessibility panel on Foundations → Semantic Colors → Text. On their intended
ground, `Background/Brand/Primary` (brand-500 `#2F7D6B`), these text tokens could not meet WCAG AA
4.5:1 — no tinted colour can on brand-500; only white does. None were used by any component or page.
Removed from JSON, CSS, Storybook and Figma. Text on a brand fill uses `Text/On Brand/Primary` (white).

| Token | Light (on brand-500) | Dark (on brand-500) |
|---|---|---|
| `Text/On Brand/Secondary` | Brand 100 — 3.65:1 | Brand 50 — 4.38:1 |
| `Text/On Brand/Muted` | Brand 200 — 2.67:1 | Brand 100 — 3.65:1 |
| `Text/On Brand/Decorative` | Brand 300 — 1.88:1 | Brand 300 — 1.88:1 |

