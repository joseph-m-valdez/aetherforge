import { Menubar as MenubarPrimitive } from 'radix-ui'
import { cn } from '../lib/cn'

export interface MenubarItemSpec {
  label: string
  onSelect?: () => void
  disabled?: boolean
}

export interface MenubarMenuSpec {
  label: string
  items: MenubarItemSpec[]
}

export interface MenubarProps {
  menus: MenubarMenuSpec[]
  className?: string
}

// Top-level application menus built on Radix Menubar: roving focus across the
// bar, arrow-key navigation within a menu, type-ahead, and Esc to close, all of
// which bare <button>s would not give us.
export function Menubar({ menus, className }: MenubarProps) {
  return (
    <MenubarPrimitive.Root className={cn('flex gap-1', className)}>
      {menus.map((menu) => (
        <MenubarPrimitive.Menu key={menu.label}>
          <MenubarPrimitive.Trigger
            className={cn(
              'min-h-9 rounded-md px-2.5 text-base text-text',
              'transition-colors hover:bg-hover hover:text-text-bright',
              'data-[state=open]:bg-hover data-[state=open]:text-text-bright',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
            )}
          >
            {menu.label}
          </MenubarPrimitive.Trigger>
          <MenubarPrimitive.Portal>
            <MenubarPrimitive.Content
              align="start"
              sideOffset={6}
              className={cn(
                'z-50 min-w-44 rounded-md border border-border bg-panel p-1 shadow-lg shadow-black/40',
              )}
            >
              {menu.items.map((item) => (
                <MenubarPrimitive.Item
                  key={item.label}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  className={cn(
                    'flex min-h-10 cursor-pointer select-none items-center rounded-sm px-2 text-base text-text outline-none',
                    'data-[highlighted]:bg-hover data-[highlighted]:text-text-bright',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
                  )}
                >
                  {item.label}
                </MenubarPrimitive.Item>
              ))}
            </MenubarPrimitive.Content>
          </MenubarPrimitive.Portal>
        </MenubarPrimitive.Menu>
      ))}
    </MenubarPrimitive.Root>
  )
}
