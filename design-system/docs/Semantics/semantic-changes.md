# Pill tabs hover — 17 Oct 2026

The Tabs pill trigger's hover fill (`Background/Default/Secondary`, Grey 50) sat almost on top of
the Grey 100 track, so the hover barely showed. It now uses `Overlay/Medium` (Black 12% in light,
White 8% in dark), which reads clearly on the track in both modes and stays distinct from the
white Active tab. Text still darkens to `Text/Default/Primary` on hover.

Changed in `figma/components.json` (`Tabs/Trigger/Background/Hover`) and `app/globals.css`
(`--tabs-trigger-bg-hover`, a hand-written token, not produced by `npm run tokens`).
Figma: `7.Components` variable `Tabs/Trigger/Background/Hover` repointed to `Overlay/Medium`.

**Line tabs:** hover only darkened the text (Grey 700 → 900), which is hard to see. Hover now also
draws a 2px neutral underline (`Border/Interactive/Hover`, token `--tabs-indicator-hover`) in the same
spot as the green active indicator; the active tab shows only its green line. New variable
`Tabs/Line/Indicator/Hover` in `7.Components` (and `figma/components.json`).
**Not yet updated in Figma:** the Tabs component's Line / Hover variant doesn't draw the underline yet.

---

# Secondary button hover — 17 Oct 2026

The Brand/Secondary button's hover was too subtle: the fill went from white to Canvas
(Grey 25) and the border did not change. Updated in `figma/components.json`
(`Button/Brand/Secondary`, both modes) and regenerated into `app/globals.css` with `npm run tokens`.

| Token | From | To |
|---|---|---|
| `Background/Hover` | `Background/Default/Canvas` | `Background/Default/Secondary` |
| `Border/Hover` | `Border/Default/Secondary` | `Border/Interactive/Hover` |
| `Text/Hover` | `Text/Default/Tertiary Hover` | `Text/Default/Primary` |

**Not yet updated in Figma:** set the same three variables in `7.Components` (Button / Brand / Secondary / Hover).
Destructive Secondary is unchanged.

---

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


# Control border and placeholder contrast; unused greys removed — 17 Oct 2026

Found by a WCAG 2.1 AA pass over the light-mode semantic tokens (text and icon tokens against every
background, plus control boundaries). Applied in Figma (`Design System Master File`), JSON, CSS and Storybook.

| Token | Before (light) | After (light) | Why |
|---|---|---|---|
| `Border/Default/Control` (new semantic token) | — | **Grey 285** (both modes) — 3.76:1 on white, 3.32:1 on `Background/Secondary` | WCAG 1.4.11: a control's boundary needs 3:1. One shared token for the resting border of form controls |
| `Input/Border/Default` (`--input-border-rest`) | Figma: `Border/Default/Primary` (Grey 900). Code: `Border/Default/Secondary` — **1.50:1** | `Border/Default/Control` | Figma and code now agree. Rest → hover (Grey 400) → filled (Grey 900) darkens monotonically |
| `Select/Border/Default` (`--select-border`) | Figma: `Border/Default/Primary`. Code: `Border/Default/Secondary` — **1.50:1** | `Border/Default/Control` | Same fix as Input; the first audit missed Select |
| `Text/Default/Placeholder Subtle` | Grey 300 — **4.39:1** on `Background/Default/Subtle` | **Grey 400** — 5.18:1 | WCAG 1.4.3: text needs 4.5:1. Now equals `Text/Default/Placeholder` in light mode; dark mode unchanged |
| `Colors/Primary/Grey/225` | `#bbbfc5` | removed | No variable, component or code reference |
| `Colors/Primary/Grey/750` | `#38404a` | removed | Retired when the dark canvas moved to Grey 950; no reference remains |

Figma documentation: the Grey 225 and 750 swatches were removed from the Primitive Colors page and the
stale `{Colors.Primary.Grey.750}` notes on `Background/Default/Canvas` now read `{Colors.Primary.Grey.950}`.

Left as is: `Border/Default/Secondary` and `Border/Default/Tertiary` (1.50:1, 1.20:1) are decorative dividers, which
WCAG 1.4.11 does not cover; `Select/Menu/Border` is a popover edge with a shadow. `Text/Default/Disabled` and the disabled
borders are exempt as disabled-control styling. Dark mode was not re-audited.

Known and not changed: the swatch rectangles on the Figma colour documentation page are plain white fills
(not bound to the primitives) in every frame, so the swatches look empty. That predates this change.

# Contrast fixes from the three-level WCAG audit — 17 Oct 2026

A WCAG 2.1 AA pass at three levels: primitive ladders, intended token pairings, and rendered components
(130 Storybook stories, every interactive element, in rest, hover, pressed and focus; 1,670 text measurements).
Applied in Figma (`Design System Master File`), JSON, CSS and Storybook.

**The only failure in rendered components** was the destructive secondary button when pressed: Error 700 text on
the Error 200 fill, 2.66:1. The other findings are tokens no component uses yet, fixed so they are safe to use.

| Token | Before | After | Why |
|---|---|---|---|
| `Button/Destructive/Secondary/Background/Pressed` | `Background/Status/Error Pressed` (Error 200) | `Background/Status/Error Hover` (Error 100) | Lighter pressed fill; hover stays Error 50, so white → 50 → 100 still reads as a press |
| `Button/Destructive/Secondary/Text/Pressed` (**new**; `--btn-dest-secondary-text-pressed`) | — (text stayed `Text/Status/Error`, Error 600) | `Text/Status/Error Strong` (Error 700) | Pressed was 2.66:1. Error 600 on the Error 100 fill would still be only 3.43:1; Error 700 gives 4.94:1 |
| `Background/Status/Success Solid` (+ Hover, Pressed) | 500 / 600 / 700 | **600 / 700 / 800** (both modes) | White content on Success 500 was 4.12:1; now 4.84:1 |
| `Background/Status/Info Solid` (+ Hover, Pressed) | 500 / 600 / 700 | **600 / 700 / 800** (both modes) | White content on Info 500 was 4.32:1; now 5.41:1 |
| `Background/Status/Warning Solid Hover` / `Pressed` | Warning 600 / 700 | **Warning 400 / 300** (both modes) | Warning keeps dark content (4.64:1 at rest). On 600 and 700 it was 3.89:1 and 2.57:1; on 400 and 300 it is 5.89:1 and 6.91:1. Hover and pressed are now lighter than rest |
| `Chart/Series 02` (light) | Blue 500 — 2.76:1 | Blue 600 — 4.00:1 | Graphical objects need 3:1 on white |
| `Chart/Series 04` (light) | Green 500 — 2.17:1 | Green 600 — 3.21:1 | Same |
| `Chart/Warning 2` · `Info 2` · `Positive 2` (light) | Warning 300 · Info 300 · Success 300 (2.1–2.5:1) | Warning 600 · Info 400 · Success 600 | A lighter companion tone cannot reach 3:1 and stay lighter, so these now step to the nearest passing tone |
| `Icon/Brand/Tertiary` (light) | Brand 100 — 1.35:1 | Brand 400 — 3.4:1 | An icon needs 3:1 |

**Usage rules, not value changes** (the tokens are correct on the surfaces they were made for):
- `Text/Default/Quaternary` and `Text/Default/Placeholder Subtle` reach 4.5:1 on white only; do not place them on grey surfaces (4.0–4.4:1).
- `Text/Brand/Tertiary` reaches 4.5:1 on white only (4.38:1 on `Background/Brand/Subtle`). Nothing uses it; `Text/Brand/Tertiary Hover` is used for link hover on white and passes.
- Status text on `Background/Status/* Pressed` and `* Focus` fills (Error 200, Warning 200, Success 200) falls to 2.6–3.9:1. Use 800 or darker text there, or a lighter fill.

**Checked and not a failure:** a "Copy" label at 4.27:1 in the Input matrix story is inside a disabled field; disabled controls are exempt from WCAG 1.4.3.

# Primitive cleanup — 17 Oct 2026

Checked against Figma first: every token below had no aliases and no bound layers, except the two merged greys,
which were re-pointed before they were deleted. Applied in Figma, JSON, CSS and Storybook.

| Change | Detail |
|---|---|
| `Grey/30` merged into `Grey/50` | ΔE 1.2 apart (indistinguishable). `Background/Default/Subtle` (light) now `Grey/50`, so Subtle and Secondary are the same value in light mode |
| `Grey/600` merged into `Grey/500` | ΔE 2.3 apart. Re-pointed: `Text/Default/Muted`, `Icon/Default/Tertiary`, `Sidebar/Icon` (light); `Foreground/Default/Disabled`, `Chart/Neutral 2` (dark). Three direct code references (meeting desk, leads pipeline, report queue board) now use Grey 500 |
| `Grey/925` **kept** | It is the dark-mode surface between the canvas (950) and cards (900). Merging it would recreate the problem fixed on 26 Sep (board columns vanishing) |
| Ungrouped `Colors/Secondary/25–800` removed | A second purple ramp (#f2ebfd to #341864) sitting loose beside the grouped `Secondary/Purple`. Nothing referenced it |
| Duplicate `Overlay/Black 16%` removed from the JSON | Figma only ever had `Overlay/Black/Black 16%`; the CSS variable is unchanged |
| `Blue/500` `#0ba5ec` → `#0595dc` | It was identical to `Blue/400`. Now a real step between Blue 400 and Blue 600. Nothing referenced Blue 500, so nothing visible changes |
| `Yellow` **kept** | Unused today but kept by decision |

Figma documentation page: the Grey 30 and Grey 600 swatches were removed and the nine alias notes that named them now read Grey 50 and Grey 500
(with their hex values). The rest of that page was already out of date and is unchanged.
