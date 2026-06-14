import { type ReactNode } from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '../lib/cn'

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: SegmentOption<T>[]
  /** Required: every group of controls needs an accessible name. */
  'aria-label': string
  className?: string
}

// Single-select segmented control built on Radix ToggleGroup, so arrow-key
// roving focus, aria-pressed state, and keyboard activation come for free.
// Defaults to one equal-width row; pass `className` (e.g. "grid-cols-2") to
// reflow into a grid.
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      // Radix emits '' when the active item is toggled off. This control is
      // mandatory-single, so ignore the empty value and keep the selection.
      onValueChange={(next) => {
        if (next) onValueChange(next as T)
      }}
      className={cn('grid auto-cols-fr grid-flow-col gap-1', className)}
      aria-label={aria['aria-label']}
    >
      {options.map((option) => (
        <ToggleGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            'min-h-11 rounded-md border border-border bg-btn px-2 text-sm text-text',
            'transition-colors hover:bg-hover',
            'data-[state=on]:border-accent data-[state=on]:bg-accent/15 data-[state=on]:text-accent',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
            'disabled:pointer-events-none disabled:opacity-45',
          )}
        >
          {option.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  )
}
