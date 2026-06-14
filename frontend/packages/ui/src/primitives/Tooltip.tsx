import { type ReactNode } from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '../lib/cn'

// Wrap the app once so tooltips share open/close timing.
export const TooltipProvider = TooltipPrimitive.Provider

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

// Hover/focus tooltip. NOTE: tooltips do not fire on touch, so any control that
// relies on one (e.g. an icon-only button) must ALSO carry an aria-label. Treat
// the tooltip as progressive enhancement for pointer + keyboard users.
export function Tooltip({ content, children, side = 'bottom', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 rounded-md border border-border bg-panel px-2 py-1 text-xs text-text-bright shadow-lg shadow-black/40',
            'select-none',
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-border" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
