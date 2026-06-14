import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfirmDialog } from './AlertDialog'
import { Button } from './Button'

const meta = {
  title: 'Primitives/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const EmergencyStop: Story = {
  args: {
    title: 'Emergency Stop',
    description: 'This cuts motors on all selected vehicles immediately. They will fall.',
    confirmLabel: 'Cut Motors',
    intent: 'crit',
    onConfirm: () => alert('Emergency stop issued'),
    trigger: (
      <Button intent="estop" className="w-full">
        Emergency Stop
      </Button>
    ),
  },
}
