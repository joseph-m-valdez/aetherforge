import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const meta = {
  title: 'Primitives/Select',
  component: Select,
  tags: ['autodocs'],
  args: { value: 'RTL', onValueChange: () => {}, options: [] },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const FLIGHT_MODES = [
  'GUIDED',
  'AUTO',
  'RTL',
  'LOITER',
  'LAND',
  'STABILIZE',
  'MANUAL',
].map((m) => ({ value: m, label: m }))

export const FlightMode: Story = {
  render: () => {
    const [value, setValue] = useState('RTL')
    return (
      <div className="w-64">
        <Select
          aria-label="Flight mode"
          value={value}
          onValueChange={setValue}
          options={FLIGHT_MODES}
        />
      </div>
    )
  },
}
