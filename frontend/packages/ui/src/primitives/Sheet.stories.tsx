import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sheet } from './Sheet'
import { Button } from './Button'

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet,
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const LeftPanel: Story = {
  args: {
    title: 'Command Interface',
    side: 'left',
    trigger: <Button intent="ghost">Open Command</Button>,
    children: (
      <div className="space-y-2 p-4 text-sm text-text">
        <p>Panel contents go here.</p>
        <p className="text-text-dim">On tablets the side panels become sheets.</p>
      </div>
    ),
  },
}

export const RightPanel: Story = {
  args: {
    ...LeftPanel.args,
    title: 'Fleet Manager',
    side: 'right',
    trigger: <Button intent="ghost">Open Fleet</Button>,
  },
}
