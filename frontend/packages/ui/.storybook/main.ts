import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Storybook runs its own Vite. Add the Tailwind v4 plugin so the same tokens
  // and utilities the app uses are generated here too.
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite')
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] })
  },
}

export default config
