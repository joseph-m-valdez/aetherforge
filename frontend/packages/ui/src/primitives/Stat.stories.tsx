import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stat } from './Stat'

const meta = {
  title: 'Primitives/Stat',
  component: Stat,
  tags: ['autodocs'],
  args: { label: 'SEL', children: '4', tone: 'accent' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['default', 'ok', 'armed', 'crit', 'accent'],
    },
  },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const NavReadouts: Story = {
  render: () => (
    <div className="flex gap-6">
      <Stat label="LINK" tone="ok">
        11/12
      </Stat>
      <Stat label="ARMED" tone="armed">
        8
      </Stat>
      <Stat label="SEL" tone="accent">
        4
      </Stat>
      <Stat label="UTC">12:04:51</Stat>
    </div>
  ),
}
