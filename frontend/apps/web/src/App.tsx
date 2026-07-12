import { useState } from 'react'
import { Sheet, TooltipProvider } from '@aetherforge/ui'
import CesiumMap from './components/CesiumMap'
import type { FocusTarget } from './components/CesiumMap'
import NavBar from './components/NavBar'
import CommandInterface from './components/CommandInterface'
import FleetManager from './components/FleetManager'
import { useMediaQuery } from './lib/useMediaQuery'
import type { Fleet } from './fleet/types'
import { useFleetView } from './services/hooks'

function App() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const fleets = useFleetView()

  // Fresh object per request so re-focusing the same fleet still triggers a fly.
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null)

  const [mobilePanel, setMobilePanel] = useState<'command' | 'fleet' | null>(null)

  const isLarge = useMediaQuery('(min-width: 1024px)')

  function focusFleet(fleet: Fleet) {
    const n = fleet.vehicles.length
    if (n === 0) return
    const lat = fleet.vehicles.reduce((s, v) => s + v.telemetry.position.lat, 0) / n
    const lon = fleet.vehicles.reduce((s, v) => s + v.telemetry.position.lon, 0) / n
    setFocusTarget({ lat, lon })
    setMobilePanel(null)
  }

  function toggleVehicle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectFleet(fleet: Fleet, select: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const v of fleet.vehicles) {
        if (select) next.add(v.id)
        else next.delete(v.id)
      }
      return next
    })
  }

  const selectAll = () => setSelected(new Set(fleets.flatMap((f) => f.vehicles).map((v) => v.id)))
  const deselectAll = () => setSelected(new Set())

  const selectedIds = [...selected]

  const commandPanel = <CommandInterface selectedIds={selectedIds} />
  const fleetPanel = (
    <FleetManager
      fleets={fleets}
      selectedIds={selected}
      onToggleVehicle={toggleVehicle}
      onSelectFleet={selectFleet}
      onFocusFleet={focusFleet}
      onSelectAll={selectAll}
      onDeselectAll={deselectAll}
    />
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-dvh flex-col bg-bg text-text">
        <NavBar
          fleets={fleets}
          selectedCount={selected.size}
          isLarge={isLarge}
          onOpenCommand={() => setMobilePanel('command')}
          onOpenFleet={() => setMobilePanel('fleet')}
        />

        <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_1fr_320px]">
          {isLarge && (
            <CommandInterface
              selectedIds={selectedIds}
              className="overflow-y-auto border-r border-border bg-panel"
            />
          )}

          <main className="relative min-w-0">
            <CesiumMap
              fleets={fleets}
              selectedIds={selected}
              onSelectVehicle={toggleVehicle}
              focusTarget={focusTarget}
            />
          </main>

          {isLarge && (
            <FleetManager
              fleets={fleets}
              selectedIds={selected}
              onToggleVehicle={toggleVehicle}
              onSelectFleet={selectFleet}
              onFocusFleet={focusFleet}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              className="overflow-y-auto border-l border-border bg-panel"
            />
          )}
        </div>

        {!isLarge && (
          <>
            <Sheet
              side="left"
              title="Command Interface"
              showHeader={false}
              open={mobilePanel === 'command'}
              onOpenChange={(o) => setMobilePanel(o ? 'command' : null)}
            >
              {commandPanel}
            </Sheet>
            <Sheet
              side="right"
              title="Fleet Manager"
              showHeader={false}
              open={mobilePanel === 'fleet'}
              onOpenChange={(o) => setMobilePanel(o ? 'fleet' : null)}
            >
              {fleetPanel}
            </Sheet>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

export default App
