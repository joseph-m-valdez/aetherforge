import type { Meta, StoryObj } from '@storybook/react-vite'
import { Menubar } from './Menubar'

const meta = {
  title: 'Primitives/Menubar',
  component: Menubar,
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>

export default meta
type Story = StoryObj<typeof meta>

export const AppMenus: Story = {
  args: {
    menus: [
      {
        label: 'Mission',
        items: [{ label: 'New Mission' }, { label: 'Open Mission' }, { label: 'Save Plan' }],
      },
      {
        label: 'Fleet Config',
        items: [{ label: 'Add Vehicle' }, { label: 'Calibrate' }, { label: 'Failsafes' }],
      },
      {
        label: 'Telemetry',
        items: [{ label: 'Live Feed' }, { label: 'Replay' }, { label: 'Export', disabled: true }],
      },
    ],
  },
}
