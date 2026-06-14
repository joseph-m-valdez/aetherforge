import { type ReactNode } from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { Button } from './Button'
import { cn } from '../lib/cn'

export interface ConfirmDialogProps {
  /** The control that opens the dialog (rendered via Radix asChild). */
  trigger: ReactNode
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  /** Intent of the confirm button; use "crit" for destructive actions. */
  intent?: 'default' | 'crit'
}

// Confirmation gate for irreversible/destructive actions (e.g. Emergency Stop).
// AlertDialog traps focus, defaults focus to Cancel, and is dismissible by Esc,
// which both prevents a fat-finger tap and meets the WAI-ARIA alertdialog spec.
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  intent = 'default',
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root>
      <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <AlertDialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-border bg-panel p-5 shadow-2xl shadow-black/50',
            'focus:outline-none',
          )}
        >
          <AlertDialogPrimitive.Title className="text-base font-semibold uppercase tracking-wide text-text-bright">
            {title}
          </AlertDialogPrimitive.Title>
          {description ? (
            <AlertDialogPrimitive.Description className="mt-2 text-sm text-text">
              {description}
            </AlertDialogPrimitive.Description>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button intent="ghost">{cancelLabel}</Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button intent={intent} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
