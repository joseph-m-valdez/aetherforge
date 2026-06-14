import { useState, type ReactNode } from 'react'
import {
  Button,
  ConfirmDialog,
  NumberField,
  Select,
  SegmentedControl,
  cn,
} from '@aetherforge/ui'
import type { CommandKind, CommandMode, FlightMode } from '../fleet/types'

const MODES: { value: CommandMode; label: string }[] = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'OPERATION', label: 'Operation' },
  { value: 'FORMATION', label: 'Formation' },
  { value: 'SWARM', label: 'Swarm' },
]

const FLIGHT_MODES: FlightMode[] = [
  'MANUAL',
  'STABILIZED',
  'ACRO',
  'ALTCTL',
  'POSCTL',
  'OFFBOARD',
  'AUTO.MISSION',
  'AUTO.LOITER',
  'AUTO.RTL',
  'AUTO.TAKEOFF',
  'AUTO.LAND',
]

interface Props {
  selectedIds: string[]
  className?: string
}

export default function CommandInterface({ selectedIds, className }: Props) {
  const [mode, setMode] = useState<CommandMode>('OPERATION')
  const [flightMode, setFlightMode] = useState<FlightMode>('AUTO.RTL')
  const [takeoffAlt, setTakeoffAlt] = useState(10)
  const [lastAction, setLastAction] = useState('Awaiting orders')

  const count = selectedIds.length
  const hasSelection = count > 0

  function issue(kind: CommandKind, detail?: string) {
    if (!hasSelection) return
    setLastAction(
      `${kind}${detail ? ` (${detail})` : ''} sent to ${count} vehicle${count > 1 ? 's' : ''}`,
    )
  }

  return (
    <aside className={cn('flex h-full flex-col gap-3.5 p-3.5', className)}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold uppercase tracking-wide text-text-bright">
          Command
        </h2>
        <span className="text-sm text-text-dim">
          Targets: <b className="font-semibold text-accent">{count}</b> selected
        </span>
      </div>

      <SegmentedControl
        aria-label="Command mode"
        className="grid-flow-row grid-cols-2"
        value={mode}
        onValueChange={setMode}
        options={MODES}
      />

      <Section legend="Vehicle Control" disabled={!hasSelection}>
        <div className="flex gap-2">
          <Button intent="ok" className="flex-1" onClick={() => issue('ARM')}>
            Arm
          </Button>
          <Button className="flex-1" onClick={() => issue('DISARM')}>
            Disarm
          </Button>
        </div>
        <label className="flex flex-col gap-1 text-xs text-text-dim">
          <span>Flight Mode</span>
          <Select
            aria-label="Flight mode"
            value={flightMode}
            onValueChange={(v) => {
              setFlightMode(v as FlightMode)
              issue('SET_MODE', v)
            }}
            options={FLIGHT_MODES.map((fm) => ({ value: fm, label: fm }))}
          />
        </label>
      </Section>

      <Section legend="Mission Control" disabled={!hasSelection}>
        <Button intent="ok" className="w-full" onClick={() => issue('START_MISSION')}>
          Start Mission
        </Button>
        <div className="flex gap-2">
          <Button intent="warn" className="flex-1" onClick={() => issue('PAUSE_MISSION')}>
            Pause
          </Button>
          <Button intent="crit" className="flex-1" onClick={() => issue('STOP_MISSION')}>
            Stop
          </Button>
        </div>
        <Button className="w-full" onClick={() => issue('CLEAR_MISSION')}>
          Clear Mission
        </Button>
      </Section>

      <Section legend="Quick Commands" disabled={!hasSelection}>
        <Button className="w-full" onClick={() => issue('RTL')}>
          Return to Home
        </Button>
        <NumberField
          label="Takeoff Alt"
          unit="m"
          min={0}
          max={400}
          step={5}
          value={takeoffAlt}
          onChange={setTakeoffAlt}
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => issue('TAKEOFF', `${takeoffAlt}m`)}>
            Take Off
          </Button>
          <Button className="flex-1" onClick={() => issue('LAND')}>
            Land
          </Button>
        </div>
      </Section>

      <Section legend="Danger Zone" danger disabled={!hasSelection}>
        <ConfirmDialog
          title="Emergency Stop"
          description={`This cuts motors on ${count} selected vehicle${count > 1 ? 's' : ''} immediately. They will fall.`}
          confirmLabel="Cut Motors"
          cancelLabel="Cancel"
          intent="crit"
          onConfirm={() => issue('EMERGENCY_STOP')}
          trigger={
            <Button intent="estop" className="w-full">
              Emergency Stop
            </Button>
          }
        />
      </Section>

      <div className="mt-auto border-t border-border pt-2.5 font-mono text-xs text-accent">
        {lastAction}
      </div>
    </aside>
  )
}

// Native <fieldset disabled> cascades the disabled state to every control
// inside (including the Radix Select and dialog triggers).
function Section({
  legend,
  danger,
  disabled,
  children,
}: {
  legend: string
  danger?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <fieldset
      disabled={disabled}
      className={cn(
        'm-0 flex min-w-0 flex-col gap-2 rounded-lg border p-3 disabled:opacity-45',
        danger ? 'border-crit/35' : 'border-border',
      )}
    >
      <legend
        className={cn(
          'px-1.5 text-mini uppercase tracking-hud',
          danger ? 'text-crit' : 'text-text-dim',
        )}
      >
        {legend}
      </legend>
      {children}
    </fieldset>
  )
}
