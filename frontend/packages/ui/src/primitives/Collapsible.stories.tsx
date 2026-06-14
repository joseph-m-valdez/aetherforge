import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible'
import { Button } from './Button'

const meta = {
  title: 'Primitives/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const FleetGroup: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-72 rounded-lg border border-border">
      <CollapsibleTrigger asChild>
        <Button intent="ghost" className="w-full justify-between rounded-b-none">
          <span className="font-semibold uppercase tracking-hud text-accent">Vanguard</span>
          <ChevronDown className="size-4" aria-hidden />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border p-3 text-sm text-text">
        Wraith · Nomad · Onyx · Saber
      </CollapsibleContent>
    </Collapsible>
  ),
}
