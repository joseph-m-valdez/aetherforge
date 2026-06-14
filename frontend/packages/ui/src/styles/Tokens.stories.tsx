import type { Meta, StoryObj } from '@storybook/react-vite'

// A living reference for the design tokens defined in theme.css. These are not a
// component; they document the source-of-truth values so designers and devs can
// see the palette and type scale at a glance.
const meta: Meta = {
  title: 'Foundations/Design Tokens',
  parameters: { a11y: { test: 'off' } },
}

export default meta
type Story = StoryObj

const COLORS = [
  ['bg', '--color-bg'],
  ['panel', '--color-panel'],
  ['panel-2', '--color-panel-2'],
  ['border', '--color-border'],
  ['hover', '--color-hover'],
  ['btn', '--color-btn'],
  ['text', '--color-text'],
  ['text-bright', '--color-text-bright'],
  ['text-dim', '--color-text-dim'],
  ['accent', '--color-accent'],
  ['ok', '--color-ok'],
  ['armed', '--color-armed'],
  ['crit', '--color-crit'],
] as const

const TEXT_SIZES = ['micro', 'mini', 'xs', 'sm', 'base', 'md'] as const

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {COLORS.map(([name, varName]) => (
        <div key={name} className="flex items-center gap-3">
          <span
            className="size-10 rounded-md border border-border"
            style={{ background: `var(${varName})` }}
          />
          <span className="flex flex-col">
            <span className="font-mono text-sm text-text-bright">{name}</span>
            <span className="font-mono text-xs text-text-dim">{varName}</span>
          </span>
        </div>
      ))}
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {TEXT_SIZES.map((size) => (
        <div key={size} className="flex items-baseline gap-4">
          <span className="w-16 font-mono text-xs text-text-dim">text-{size}</span>
          <span className={`text-${size} text-text-bright`}>
            Fleet Command HUD 0123456789
          </span>
        </div>
      ))}
      <div className="mt-4 flex flex-col gap-2">
        <span className="font-mono text-base text-text-bright">font-mono readout</span>
        <span className="font-sans text-base text-text-bright">font-sans interface</span>
      </div>
    </div>
  ),
}

export const Radii: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['sm', 'md', 'lg'] as const).map((r) => (
        <div key={r} className="flex flex-col items-center gap-2">
          <span className={`size-16 rounded-${r} border border-border bg-panel`} />
          <span className="font-mono text-xs text-text-dim">rounded-{r}</span>
        </div>
      ))}
    </div>
  ),
}
