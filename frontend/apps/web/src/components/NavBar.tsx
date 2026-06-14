import { useEffect, useState } from 'react'
import { Diamond, PanelLeft, PanelRight } from 'lucide-react'
import { Button, Menubar, Stat, type MenubarMenuSpec } from '@aetherforge/ui'
import type { Fleet } from '../fleet/types'

const MENUS: MenubarMenuSpec[] = [
  { label: 'Mission', items: [{ label: 'New Mission' }, { label: 'Open Mission' }, { label: 'Save Plan' }] },
  { label: 'Fleet Config', items: [{ label: 'Add Vehicle' }, { label: 'Calibrate' }, { label: 'Failsafes' }] },
  { label: 'Telemetry', items: [{ label: 'Live Feed' }, { label: 'Replay' }, { label: 'Export' }] },
  { label: 'Logging', items: [{ label: 'Event Log' }, { label: 'Download Logs' }] },
  { label: 'Settings', items: [{ label: 'Preferences' }, { label: 'Map Source' }, { label: 'About' }] },
]

interface Props {
  fleets: Fleet[]
  selectedCount: number
  isLarge: boolean // >=lg: docked columns; below: panel toggle buttons
  onOpenCommand: () => void
  onOpenFleet: () => void
}

export default function NavBar({
  fleets,
  selectedCount,
  isLarge,
  onOpenCommand,
  onOpenFleet,
}: Props) {
  const vehicles = fleets.flatMap((f) => f.vehicles)
  const connected = vehicles.filter((v) => v.link.connected).length
  const armed = vehicles.filter((v) => v.armed).length

  const [clock, setClock] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const utc = clock.toISOString().slice(11, 19)

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border bg-panel px-4">
      <div className="flex items-baseline gap-2 font-bold tracking-brand text-text-bright">
        <Diamond className="size-3.5 translate-y-0.5 fill-accent text-accent" aria-hidden />
        <span>AETHERFORGE</span>
        <span className="hidden text-mini tracking-brand text-text-dim sm:inline">
          FLEET COMMAND
        </span>
      </div>

      {isLarge ? (
        <Menubar menus={MENUS} className="ml-2" />
      ) : (
        <div className="flex gap-1">
          <Button intent="ghost" size="sm" onClick={onOpenCommand}>
            <PanelLeft className="size-4" aria-hidden />
            Command
          </Button>
          <Button intent="ghost" size="sm" onClick={onOpenFleet}>
            Fleet
            <PanelRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-5">
        <Stat label="LINK" tone="ok">
          {connected}/{vehicles.length}
        </Stat>
        <Stat label="ARMED" tone="armed" className="hidden sm:flex">
          {armed}
        </Stat>
        <Stat label="SEL" tone="accent">
          {selectedCount}
        </Stat>
        <Stat label="UTC" className="hidden md:flex">
          {utc}
        </Stat>
      </div>
    </header>
  )
}
