import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook's default manager theme follows the OS light/dark preference.
// `create()` needs an explicit base, so pick it the same way to keep that.
const base =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

// Fincaree lockup (mark + wordmark) in the colour that suits the sidebar:
// dark text on the light theme, white text on the dark theme.
const lockup =
  base === 'dark' ? 'brand/logo-lockup-on-dark.png' : 'brand/logo-lockup-on-light.png';

// With `brandImage` set, Storybook shows only the image and uses the title as
// alt text. To show the lockup *and* "Design System", the title is given as
// HTML (a supported form of `brandTitle`) and `brandImage` is left unset. The
// logos live in public/brand, served via `staticDirs`; the relative path keeps
// them working when the built Storybook is hosted under a sub-path.
const brandTitle = `
  <span style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:4px;white-space:nowrap;font-weight:600;font-size:12px;line-height:16px;letter-spacing:0.02em;">
    <img src="${lockup}" alt="Fincaree" width="102" height="24" style="display:block;" />
    Design System
  </span>`;

addons.setConfig({
  theme: create({
    base,
    brandTitle,
    // No product URL is configured in the project, so the logo keeps
    // Storybook's default link back to the Storybook home, in the same tab.
    brandTarget: '_self',
    // Fincaree brand (--color-brand-500) for selection and focus accents.
    colorSecondary: '#2f7d6b',
  }),
});
