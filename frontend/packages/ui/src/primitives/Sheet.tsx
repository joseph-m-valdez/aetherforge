import { type ReactNode } from 'react'
import { Dialog as DialogPrimitive, VisuallyHidden } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

export interface SheetProps {
  title: string
  children: ReactNode
  /** Side the panel slides in from. */
  side?: 'left' | 'right'
  /** Optional control that opens the sheet (Radix asChild). Omit when driving
   *  `open`/`onOpenChange` from outside. */
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Render the title visibly in a header bar; otherwise it stays SR-only. */
  showHeader?: boolean
  className?: string
}

// Side slide-over built on Radix Dialog (focus trap, scroll lock, Esc to close).
// On tablets the Command and Fleet panels become Sheets so the map can go
// full-bleed. A title is always provided for the dialog's accessible name.
export function Sheet({
  title,
  children,
  side = 'left',
  trigger,
  open,
  onOpenChange,
  showHeader = true,
  className,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 z-50 flex w-[min(88vw,22rem)] flex-col border-border bg-panel shadow-2xl shadow-black/50 focus:outline-none',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
            className,
          )}
        >
          {showHeader ? (
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <DialogPrimitive.Title className="text-base font-semibold uppercase tracking-wide text-text-bright">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close panel"
                className="inline-flex size-9 items-center justify-center rounded-md text-text-dim hover:bg-hover hover:text-text-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <X className="size-4" aria-hidden />
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              {/* No header bar, but the dialog still needs an accessible name
                  and an always-available close control for touch users. */}
              <VisuallyHidden.Root asChild>
                <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
              </VisuallyHidden.Root>
              <DialogPrimitive.Close
                aria-label="Close panel"
                className="absolute right-2 top-2 z-10 inline-flex size-9 items-center justify-center rounded-md text-text-dim hover:bg-hover hover:text-text-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <X className="size-4" aria-hidden />
              </DialogPrimitive.Close>
            </>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
