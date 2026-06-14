import type { Meta, StoryObj } from '@storybook/react-vite'
import { Crosshair } from 'lucide-react'
import { Tooltip, TooltipProvider } from './Tooltip'
import { Button } from './Button'

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Snap map to fleet', children: null },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={150}>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const IconButton: Story = {
  render: () => (
    // The trigger carries an aria-label because tooltips do not fire on touch.
    <Tooltip content="Snap map to fleet">
      <Button size="icon" aria-label="Snap map to fleet">
        <Crosshair className="size-4" aria-hidden />
      </Button>
    </Tooltip>
  ),
}
