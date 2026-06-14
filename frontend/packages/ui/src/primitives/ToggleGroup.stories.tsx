import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedControl } from './ToggleGroup'

const meta = {
  title: 'Primitives/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Command mode',
    value: 'OPERATION',
    onValueChange: () => {},
    options: [{ value: 'OPERATION', label: 'Operation' }],
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

const MODES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'OPERATION', label: 'Operation' },
  { value: 'FORMATION', label: 'Formation' },
  { value: 'SWARM', label: 'Swarm' },
] as const

export const Row: Story = {
  render: () => {
    const [mode, setMode] = useState<(typeof MODES)[number]['value']>('OPERATION')
    return (
      <div className="w-[28rem]">
        <SegmentedControl
          aria-label="Command mode"
          value={mode}
          onValueChange={setMode}
          options={MODES.map((m) => ({ ...m }))}
        />
        <p className="mt-3 text-sm text-text-dim">Selected: {mode}</p>
      </div>
    )
  },
}

export const TwoByTwo: Story = {
  render: () => {
    const [mode, setMode] = useState<(typeof MODES)[number]['value']>('OPERATION')
    return (
      <div className="w-72">
        <SegmentedControl
          aria-label="Command mode"
          className="grid-flow-row grid-cols-2"
          value={mode}
          onValueChange={setMode}
          options={MODES.map((m) => ({ ...m }))}
        />
      </div>
    )
  },
}
