// @aetherforge/ui — design tokens live in ./styles/theme.css; these are the
// accessible, touch-first primitives the app composes. Import the stylesheet
// once at the app entry: `import '@aetherforge/ui/styles/globals.css'`.

export { cn } from './lib/cn'

export { Button, buttonVariants, type ButtonProps } from './primitives/Button'
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentOption,
} from './primitives/ToggleGroup'
export { Select, type SelectProps, type SelectOption } from './primitives/Select'
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './primitives/Collapsible'
export { NumberField, type NumberFieldProps } from './primitives/NumberField'
export { Badge, type BadgeProps } from './primitives/Badge'
export { StatusDot, type StatusDotProps, type StatusTone } from './primitives/StatusDot'
export { Stat, type StatProps } from './primitives/Stat'
export { Tooltip, TooltipProvider, type TooltipProps } from './primitives/Tooltip'
export {
  Menubar,
  type MenubarProps,
  type MenubarMenuSpec,
  type MenubarItemSpec,
} from './primitives/Menubar'
export { ConfirmDialog, type ConfirmDialogProps } from './primitives/AlertDialog'
export { Sheet, type SheetProps } from './primitives/Sheet'
