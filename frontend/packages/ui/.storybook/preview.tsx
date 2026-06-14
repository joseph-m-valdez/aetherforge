import type { Preview } from '@storybook/react-vite'
import './../src/styles/globals.css'

// Tablet frames for checking touch layouts and >=44px targets.
const TABLET_VIEWPORTS = {
  ipadPortrait: {
    name: 'iPad (portrait)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet',
  },
  ipadLandscape: {
    name: 'iPad (landscape)',
    styles: { width: '1024px', height: '768px' },
    type: 'tablet',
  },
  ipadProPortrait: {
    name: 'iPad Pro (portrait)',
    styles: { width: '1024px', height: '1366px' },
    type: 'tablet',
  },
}

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    viewport: { viewports: TABLET_VIEWPORTS },
    // Keep the a11y panel visible; surface violations rather than auto-failing.
    a11y: { test: 'todo' },
  },
  // Every story renders on the HUD background with the base text color so
  // contrast matches production.
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-bg p-6 text-text">
        <Story />
      </div>
    ),
  ],
}

export default preview
