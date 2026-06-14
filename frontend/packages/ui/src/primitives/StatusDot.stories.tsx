import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusDot } from './StatusDot'

const meta = {
  title: 'Primitives/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  args: { status: 'nominal' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['nominal', 'warning', 'critical', 'offline'],
    },
  },
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-text">
      {(['nominal', 'warning', 'critical', 'offline'] as const).map((s) => (
        <span key={s} className="flex items-center gap-2 text-sm">
          <StatusDot status={s} /> {s}
        </span>
      ))}
    </div>
  ),
}
