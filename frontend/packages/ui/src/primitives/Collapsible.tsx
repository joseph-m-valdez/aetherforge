import { Collapsible as CollapsiblePrimitive } from 'radix-ui'

// Thin re-export of Radix Collapsible. It already gives us aria-expanded on the
// trigger, keyboard toggling, and a content region wired to the trigger; there
// is nothing to restyle at the primitive level, so callers compose Trigger and
// Content with their own classes (usually via Button asChild for the trigger).
export const Collapsible = CollapsiblePrimitive.Root
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger
export const CollapsibleContent = CollapsiblePrimitive.Content
