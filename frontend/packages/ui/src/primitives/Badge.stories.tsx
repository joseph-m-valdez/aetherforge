import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'GUIDED', tone: 'default' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['default', 'accent', 'ok', 'warn', 'crit'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>GUIDED</Badge>
      <Badge tone="accent">AUTO</Badge>
      <Badge tone="ok">ARMED</Badge>
      <Badge tone="warn">RTL</Badge>
      <Badge tone="crit">LAND</Badge>
    </div>
  ),
}
