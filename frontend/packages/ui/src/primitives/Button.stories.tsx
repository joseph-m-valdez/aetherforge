import type { Meta, StoryObj } from '@storybook/react-vite'
import { Crosshair } from 'lucide-react'
import { Button } from './Button'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Deploy', intent: 'default', size: 'md' },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: ['default', 'ok', 'warn', 'crit', 'estop', 'ghost'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'icon', 'icon-sm'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Intents: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button intent="default">Default</Button>
      <Button intent="ok">Arm</Button>
      <Button intent="warn">Pause</Button>
      <Button intent="crit">Stop</Button>
      <Button intent="estop">Emergency Stop</Button>
      <Button intent="ghost">Ghost</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="icon" aria-label="Locate">
        <Crosshair className="size-4" aria-hidden />
      </Button>
      <Button size="icon-sm" aria-label="Locate">
        <Crosshair className="size-4" aria-hidden />
      </Button>
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true } }
