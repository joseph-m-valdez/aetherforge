import { useId } from 'react'
import { Label } from 'radix-ui'
import { Minus, Plus } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../lib/cn'

export interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  disabled?: boolean
  id?: string
  className?: string
}

// Labeled numeric input with explicit stepper buttons. Native number spinners
// are too small to hit on a tablet, so we flank the input with >=36px buttons.
// The input font is 16px (text-md) so iOS does not zoom the viewport on focus.
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  disabled,
  id,
  className,
}: NumberFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  const clamp = (n: number) => {
    if (min != null && n < min) return min
    if (max != null && n > max) return max
    return n
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Label.Root htmlFor={inputId} className="text-xs text-text-dim">
        {label}
        {unit ? <span className="text-text-dim"> ({unit})</span> : null}
      </Label.Root>
      <div className="flex items-stretch gap-1">
        <Button
          intent="default"
          size="icon-sm"
          aria-label={`Decrease ${label}`}
          disabled={disabled || (min != null && value <= min)}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus className="size-4" aria-hidden />
        </Button>
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          value={Number.isNaN(value) ? '' : value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className={cn(
            'min-h-9 w-full rounded-md border border-border bg-bg px-2 text-center font-mono text-md text-text-bright',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
            'disabled:opacity-45',
            // Hide the native spinners; the stepper buttons replace them.
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          )}
        />
        <Button
          intent="default"
          size="icon-sm"
          aria-label={`Increase ${label}`}
          disabled={disabled || (max != null && value >= max)}
          onClick={() => onChange(clamp(value + step))}
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
