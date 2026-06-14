import { useState } from 'react'
import { ChevronDown, ChevronRight, Crosshair } from 'lucide-react'
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  StatusDot,
  Tooltip,
  cn,
} from '@aetherforge/ui'
import type { Fleet, Vehicle } from '../fleet/types'

interface Props {
  fleets: Fleet[]
  selectedIds: Set<string>
  onToggleVehicle: (id: string) => void
  onSelectFleet: (fleet: Fleet, select: boolean) => void
  onFocusFleet: (fleet: Fleet) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  className?: string
}

export default function FleetManager({
  fleets,
  selectedIds,
  onToggleVehicle,
  onSelectFleet,
  onFocusFleet,
  onSelectAll,
  onDeselectAll,
  className,
}: Props) {
  const vehicles = fleets.flatMap((f) => f.vehicles)
  const connected = vehicles.filter((v) => v.link.connected).length

  return (
    <aside className={cn('flex h-full flex-col gap-3.5 p-3.5', className)}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold uppercase tracking-wide text-text-bright">
          Fleet
        </h2>
        <span className="text-sm text-text-dim">{connected} connected</span>
      </div>

      <div className="flex gap-1.5">
        <Button size="sm" className="flex-1" onClick={onSelectAll}>
          Select All
        </Button>
        <Button size="sm" className="flex-1" onClick={onDeselectAll}>
          Deselect All
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {fleets.map((fleet) => (
          <FleetGroup
            key={fleet.id}
            fleet={fleet}
            selectedIds={selectedIds}
            onToggleVehicle={onToggleVehicle}
            onSelectFleet={onSelectFleet}
            onFocusFleet={onFocusFleet}
          />
        ))}
      </div>
    </aside>
  )
}

function FleetGroup({
  fleet,
  selectedIds,
  onToggleVehicle,
  onSelectFleet,
  onFocusFleet,
}: {
  fleet: Fleet
  selectedIds: Set<string>
  onToggleVehicle: (id: string) => void
  onSelectFleet: (fleet: Fleet, select: boolean) => void
  onFocusFleet: (fleet: Fleet) => void
}) {
  const [open, setOpen] = useState(true)
  const selectedInFleet = fleet.vehicles.filter((v) => selectedIds.has(v.id)).length
  const allSelected = selectedInFleet === fleet.vehicles.length

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-border"
    >
      <div
        className="flex items-center gap-2 border-l-[3px] bg-panel-2 py-1.5 pr-2 pl-2"
        style={{ borderLeftColor: fleet.color }}
      >
        <CollapsibleTrigger asChild>
          <Button
            intent="ghost"
            size="icon-sm"
            aria-label={open ? `Collapse ${fleet.name}` : `Expand ${fleet.name}`}
          >
            {open ? (
              <ChevronDown className="size-4" aria-hidden />
            ) : (
              <ChevronRight className="size-4" aria-hidden />
            )}
          </Button>
        </CollapsibleTrigger>

        <span
          className="text-sm font-bold uppercase tracking-hud"
          style={{ color: fleet.color }}
        >
          {fleet.name}
        </span>
        <span className="text-sm text-text-dim">
          {selectedInFleet}/{fleet.vehicles.length}
        </span>

        <Tooltip content={`Snap map to ${fleet.name}`}>
          <Button
            intent="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label={`Snap map to ${fleet.name}`}
            onClick={() => onFocusFleet(fleet)}
          >
            <Crosshair className="size-4" aria-hidden />
          </Button>
        </Tooltip>

        <Button intent="ghost" size="sm" onClick={() => onSelectFleet(fleet, !allSelected)}>
          {allSelected ? 'Deselect' : 'Select'}
        </Button>
      </div>

      <CollapsibleContent asChild>
        <ul className="m-0 list-none p-0">
          {fleet.vehicles.map((v) => (
            <VehicleRow
              key={v.id}
              vehicle={v}
              selected={selectedIds.has(v.id)}
              onToggle={() => onToggleVehicle(v.id)}
            />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function VehicleRow({
  vehicle,
  selected,
  onToggle,
}: {
  vehicle: Vehicle
  selected: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const t = vehicle.telemetry

  return (
    <li
      className={cn(
        'border-t border-border',
        selected && 'bg-accent/10 shadow-[inset_2px_0_0_var(--color-accent)]',
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 pr-1 pl-2">
          <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            className="flex min-h-11 flex-1 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <StatusDot status={vehicle.status} />
            <span className="text-base font-semibold text-text-bright">{vehicle.callsign}</span>
            <Badge>{vehicle.flightMode}</Badge>
            <span
              className={cn(
                'ml-auto font-mono text-sm font-semibold',
                batteryClass(vehicle.battery),
              )}
            >
              {vehicle.battery < 0 ? '—' : `${vehicle.battery}%`}
            </span>
          </button>

          <CollapsibleTrigger asChild>
            <Button
              intent="ghost"
              size="icon-sm"
              aria-label={open ? `Hide ${vehicle.callsign} telemetry` : `Show ${vehicle.callsign} telemetry`}
            >
              {open ? (
                <ChevronDown className="size-4" aria-hidden />
              ) : (
                <ChevronRight className="size-4" aria-hidden />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent asChild>
          <dl className="m-0 grid grid-cols-3 gap-x-2.5 gap-y-1.5 bg-panel-2 px-3 pt-2 pb-3 pl-6">
            <Field k="GS" v={`${t.groundSpeed.toFixed(1)} m/s`} />
            <Field k="AS" v={`${t.airSpeed.toFixed(1)} m/s`} />
            <Field k="VS" v={`${signed(t.verticalSpeed)} m/s`} />
            <Field k="ALT" v={`${t.altitudeRel.toFixed(1)} m`} />
            <Field k="HDG" v={`${Math.round(t.heading)}°`} />
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-micro tracking-hud text-text-dim">{k}</dt>
      <dd className="m-0 font-mono text-sm text-text-bright">{v}</dd>
    </div>
  )
}

function signed(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}`
}

function batteryClass(pct: number): string {
  if (pct < 0) return 'text-text-dim'
  if (pct <= 20) return 'text-crit'
  if (pct <= 40) return 'text-armed'
  return 'text-ok'
}
