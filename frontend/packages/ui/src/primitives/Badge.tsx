import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const badge = cva(
  'inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-mini uppercase tracking-hud',
  {
    variants: {
      tone: {
        default: 'border-border text-text-dim',
        accent: 'border-accent/40 text-accent',
        ok: 'border-ok/40 text-ok',
        warn: 'border-armed/40 text-armed',
        crit: 'border-crit/45 text-crit',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

// Small monospace pill for flight modes, counts, and status labels.
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...props} />
}
