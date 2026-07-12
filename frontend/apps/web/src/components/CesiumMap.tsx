import { useEffect, useRef, useState } from 'react'
import {
  Viewer,
  UrlTemplateImageryProvider,
  ImageryLayer,
  Cartesian2,
  Cartesian3,
  Color,
  ConstantPositionProperty,
  ConstantProperty,
  Entity,
  HorizontalOrigin,
  VerticalOrigin,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { INITIAL_VIEW, VIEW_HEIGHT_M } from '../fleet/config'
import type { Fleet, Vehicle, VehicleStatus } from '../fleet/types'

// Dev-only: OSM's public tiles are not allowed for production/app traffic.
// Before shipping, swap for a keyed provider (MapTiler, Stadia, Thunderforest).
// https://operations.osmfoundation.org/policies/tiles/
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

// Pass a new object reference to trigger a fly; null leaves the camera put.
export interface FocusTarget {
  lat: number
  lon: number
}

const ARROW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
  '<path d="M16 2 L27 29 L16 22 L5 29 Z" fill="white"/></svg>'
const ARROW_IMAGE = `data:image/svg+xml,${encodeURIComponent(ARROW_SVG)}`

const STATUS_COLOR: Record<VehicleStatus, Color> = {
  nominal: Color.fromCssColorString('#3ad29f'),
  warning: Color.fromCssColorString('#f5a623'),
  critical: Color.fromCssColorString('#ff5066'),
  offline: Color.fromCssColorString('#5f6e7e'),
}

const LABEL_DIM = Color.fromCssColorString('#aeb9c7')

interface Props {
  fleets: Fleet[]
  selectedIds: Set<string>
  onSelectVehicle: (id: string) => void
  focusTarget: FocusTarget | null
}

export default function CesiumMap({ fleets, selectedIds, onSelectVehicle, focusTarget }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const entitiesRef = useRef<Map<string, Entity>>(new Map())
  const [error, setError] = useState<string | null>(null)

  // Ref so the click handler (wired once) never reads a stale callback.
  const onSelectRef = useRef(onSelectVehicle)
  useEffect(() => {
    onSelectRef.current = onSelectVehicle
  }, [onSelectVehicle])

  useEffect(() => {
    if (!containerRef.current) return
    const entities = entitiesRef.current

    let viewer: Viewer | undefined
    try {
      viewer = new Viewer(containerRef.current, {
        baseLayer: ImageryLayer.fromProviderAsync(
          Promise.resolve(
            new UrlTemplateImageryProvider({
              url: TILE_URL,
              maximumLevel: 19,
              credit: '© OpenStreetMap contributors',
            }),
          ),
          {},
        ),
        // Accept software-rendered WebGL, else Firefox/LibreWolf fail init when
        // they can only offer a context with a major performance caveat.
        contextOptions: {
          webgl: { failIfMajorPerformanceCaveat: false },
        },
        baseLayerPicker: false, // would otherwise require an ion token
        geocoder: false,
        timeline: false,
        animation: false,
        sceneModePicker: true,
        navigationHelpButton: false,
        homeButton: true,
        fullscreenButton: false,
        selectionIndicator: false,
        infoBox: false,
      })
    } catch (e) {
      // Only runs on a hard init failure (e.g. WebGL disabled), not per render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(e instanceof Error ? e.message : String(e))
      return
    }

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(INITIAL_VIEW.lon, INITIAL_VIEW.lat, VIEW_HEIGHT_M),
    })

    const clickHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    clickHandler.setInputAction((movement: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position)
      if (defined(picked) && picked.id instanceof Entity) {
        const id = picked.id.id
        if (entitiesRef.current.has(id)) onSelectRef.current(id)
      }
    }, ScreenSpaceEventType.LEFT_CLICK)

    viewerRef.current = viewer
    return () => {
      clickHandler.destroy()
      viewer?.destroy()
      viewerRef.current = null
      // Entities die with the viewer; drop the stale refs so a remount (e.g.
      // StrictMode) rebuilds markers against the fresh viewer.
      entities.clear()
    }
  }, [])

  // Reconcile markers with the fleet roster and selection. Entities are only
  // added/removed when vehicles appear or leave, and otherwise mutated in place
  // (styleEntity), so live telemetry ticks don't tear down and rebuild the whole
  // scene (which would also drop selection styling).
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    const entities = entitiesRef.current

    const live = new Set<string>()
    for (const fleet of fleets) {
      const fleetColor = Color.fromCssColorString(fleet.color)
      for (const v of fleet.vehicles) {
        live.add(v.id)
        let entity = entities.get(v.id)
        if (!entity) {
          entity = viewer.entities.add(makeMarker(v, fleetColor))
          entities.set(v.id, entity)
        }
        styleEntity(entity, v, fleetColor, selectedIds.has(v.id))
      }
    }

    for (const [id, entity] of entities) {
      if (!live.has(id)) {
        viewer.entities.remove(entity)
        entities.delete(id)
      }
    }
  }, [fleets, selectedIds])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !focusTarget) return
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(focusTarget.lon, focusTarget.lat, VIEW_HEIGHT_M),
      duration: 1.5,
    })
  }, [focusTarget])

  if (error) {
    return (
      <div className="max-w-[520px] p-6 text-text">
        <h3 className="text-base font-semibold text-text-bright">
          Map unavailable, WebGL could not start
        </h3>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-2 text-sm">
          This browser is blocking WebGL. In LibreWolf/Firefox open{' '}
          <code className="font-mono text-accent">about:config</code> and set{' '}
          <code className="font-mono text-accent">webgl.disabled</code> to{' '}
          <code className="font-mono text-accent">false</code>,{' '}
          <code className="font-mono text-accent">webgl.forceEnabled</code> to{' '}
          <code className="font-mono text-accent">true</code>, and turn off{' '}
          <code className="font-mono text-accent">privacy.resistFingerprinting</code> (or allow
          WebGL for this site), then reload.
        </p>
      </div>
    )
  }

  return <div ref={containerRef} className="size-full" />
}

// Static marker skeleton. The per-vehicle dynamic bits (position, heading,
// color, selection) are applied by styleEntity, so creation and updates share
// one code path.
function makeMarker(v: Vehicle, fleetColor: Color) {
  const p = v.telemetry.position
  return {
    id: v.id,
    position: Cartesian3.fromDegrees(p.lon, p.lat, p.altMSL),
    billboard: {
      image: ARROW_IMAGE,
      width: 30,
      height: 30,
      color: fleetColor,
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // keep on top of map
    },
    label: {
      text: v.callsign,
      font: '600 12px ui-monospace, monospace',
      backgroundPadding: new Cartesian2(6, 3),
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      pixelOffset: new Cartesian2(0, -20),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  }
}

// Mutates an existing marker to match the vehicle's current telemetry and
// selection state. Selected markers grow and get a solid callsign chip.
function styleEntity(entity: Entity, v: Vehicle, fleetColor: Color, selected: boolean) {
  const offline = v.status === 'offline'
  const tint = offline ? STATUS_COLOR.offline : fleetColor
  const p = v.telemetry.position

  entity.position = new ConstantPositionProperty(Cartesian3.fromDegrees(p.lon, p.lat, p.altMSL))
  if (entity.billboard) {
    entity.billboard.rotation = new ConstantProperty(
      CesiumMath.toRadians(-(v.telemetry.heading ?? 0)),
    )
    entity.billboard.color = new ConstantProperty(tint.withAlpha(offline ? 0.45 : 1))
    entity.billboard.scale = new ConstantProperty(selected ? 1.25 : 0.85)
  }
  if (entity.label) {
    entity.label.text = new ConstantProperty(v.callsign)
    entity.label.showBackground = new ConstantProperty(selected)
    entity.label.fillColor = new ConstantProperty(selected ? Color.WHITE : LABEL_DIM)
    entity.label.backgroundColor = new ConstantProperty(
      // note to self - we could probably derive the status color from
      // other properties like link + battery
      STATUS_COLOR[v.status ?? 'nominal'].withAlpha(0.85),
    )
  }
}
