import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const value = cva('font-mono text-md font-semibold', {
  variants: {
    tone: {
      default: 'text-text-bright',
      ok: 'text-ok',
      armed: 'text-armed',
      crit: 'text-crit',
      accent: 'text-accent',
    },
  },
  defaultVariants: { tone: 'default' },
})

export interface StatProps extends VariantProps<typeof value> {
  label: string
  children: ReactNode
  className?: string
}

// Nav/HUD readout: a small dim label stacked over a mono value (LINK, ARMED,
// SEL, UTC). Tone colors the value to match its meaning.
export function Stat({ label, children, tone, className }: StatProps) {
  return (
    <span className={cn('flex flex-col leading-tight', className)}>
      <span className="text-micro uppercase tracking-hud text-text-dim">{label}</span>
      <span className={value({ tone })}>{children}</span>
    </span>
  )
}
