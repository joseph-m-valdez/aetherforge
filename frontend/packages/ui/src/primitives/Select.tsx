import { Select as SelectPrimitive } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
  className?: string
}

// Accessible select built on Radix Select: full keyboard support and typeahead,
// a styled popover (native menus can't be themed), and >=44px rows that are
// comfortable to tap with a finger or Pencil.
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled,
  id,
  className,
  ...aria
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={aria['aria-label']}
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-bg px-3 text-base text-text-bright',
          'transition-colors hover:border-accent',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          'disabled:pointer-events-none disabled:opacity-45',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-text-dim" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            'z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width)',
            'overflow-hidden rounded-md border border-border bg-panel shadow-lg shadow-black/40',
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'relative flex min-h-11 cursor-pointer select-none items-center rounded-sm py-2 pr-8 pl-3 text-base text-text outline-none',
                  'data-[highlighted]:bg-hover data-[highlighted]:text-text-bright',
                  'data-[state=checked]:text-accent',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check className="size-4" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
