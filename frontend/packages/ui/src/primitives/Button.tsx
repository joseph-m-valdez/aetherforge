import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

// The one button in the system. Intents map to the HUD status palette; sizes
// keep touch targets honest (md/icon are >=44px, the iOS/Pencil minimum).
const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md border font-sans font-medium ' +
    'select-none whitespace-nowrap transition-colors ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      intent: {
        default: 'border-border bg-btn text-text-bright hover:border-accent hover:bg-hover',
        ok: 'border-ok/45 bg-transparent text-ok hover:bg-ok/15',
        warn: 'border-armed/45 bg-transparent text-armed hover:bg-armed/15',
        crit: 'border-crit/50 bg-transparent text-crit hover:bg-crit/15',
        estop:
          'border-crit/50 bg-crit/15 font-bold uppercase tracking-wide text-crit hover:bg-crit/25',
        ghost: 'border-transparent bg-transparent text-text hover:bg-hover hover:text-text-bright',
      },
      size: {
        sm: 'min-h-9 px-2.5 text-xs',
        md: 'min-h-11 px-3.5 text-base',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: { intent: 'default', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  // Render the child element instead of a <button> (e.g. wrap a link or a
  // Radix trigger) while keeping the button styling. Backed by Radix Slot.
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(button({ intent, size }), className)}
        // Default to type="button" so a button in a <form> never submits by
        // accident. Slot has no type attribute, so only set it on real buttons.
        type={asChild ? undefined : (type ?? 'button')}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { button as buttonVariants }
