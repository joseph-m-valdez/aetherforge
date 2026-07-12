import { cva } from 'class-variance-authority'
import { cn } from '../lib/cn'

export type StatusTone = 'nominal' | 'warning' | 'critical' | 'offline'

const dot = cva('inline-block size-2 shrink-0 rounded-full', {
  variants: {
    status: {
      nominal: 'bg-ok',
      warning: 'bg-armed',
      critical: 'bg-crit',
      offline: 'bg-text-dim',
    } satisfies Record<StatusTone, string>,
  },
  defaultVariants: { status: 'nominal' },
})

const DEFAULT_LABEL: Record<StatusTone, string> = {
  nominal: 'Nominal',
  warning: 'Warning',
  critical: 'Critical',
  offline: 'Offline',
}

export interface StatusDotProps {
  status?: StatusTone
  /** Override the announced text; defaults to the capitalized status. */
  label?: string
  className?: string
}

// A colored health dot that is not color-only: it carries an accessible label
// (role=img + title) so screen-reader and color-blind users get the status too.
export function StatusDot({ status = 'nominal', label, className }: StatusDotProps) {
  const text = label ?? DEFAULT_LABEL[status]
  return (
    <span className={cn(dot({ status }), className)} role="img" aria-label={text} title={text} />
  )
}
