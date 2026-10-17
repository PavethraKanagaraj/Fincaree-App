import type { Preview, Decorator } from '@storybook/nextjs-vite';

// Import the app's global CSS — this loads ALL Fincaree design tokens,
// Tailwind 4, shadcn overrides, spacing, radius, shadows, and component tokens.
import '../app/globals.css';
import './fonts.css';

/**
 * Theme decorator — wraps every story in a container that sets `data-theme`
 * and the Geist font variable, matching how app/layout.tsx renders.
 */
const withFincareeTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';
  // Set on <html>, as app/layout.tsx does. Component tokens are declared on
  // :root as var(--semantic-*); custom properties resolve where they are
  // declared, so a data-theme on an inner wrapper would leave them light.
  document.documentElement.dataset.theme = theme;
  return (
    <div
      style={{
        fontFamily: 'var(--font-geist-sans, "Geist", system-ui, sans-serif)',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        padding: '1rem',
        minHeight: '100%',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withFincareeTheme],

  globalTypes: {
    theme: {
      description: 'Fincaree color mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: 'light',
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
      config: {
        rules: [
          // Base UI popups (Select, Menu) add invisible focus guards —
          // aria-hidden + tabindex=0 by design, to keep Tab inside the open
          // popup. A rule's selector REPLACES axe's default, so this keeps the
          // default ([aria-hidden="true"]) and only removes the guards.
          { id: 'aria-hidden-focus', selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])' },
          // axe can't confirm a Select/Menu trigger's aria-controls while
          // aria-haspopup is set; verified: it points at the open listbox/menu.
          { id: 'aria-valid-attr-value', selector: '*:not(.fc-select-trigger, .fc-dropdown-trigger)' },
        ],
      },
    },
    layout: 'centered',
  },
};

export default preview;