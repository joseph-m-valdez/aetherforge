import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberField } from './NumberField'

const meta = {
  title: 'Primitives/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  args: { label: 'Takeoff Alt', value: 10, onChange: () => {} },
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

export const TakeoffAltitude: Story = {
  render: () => {
    const [alt, setAlt] = useState(10)
    return (
      <div className="w-56">
        <NumberField
          label="Takeoff Alt"
          unit="m"
          min={0}
          max={400}
          step={5}
          value={alt}
          onChange={setAlt}
        />
      </div>
    )
  },
}
