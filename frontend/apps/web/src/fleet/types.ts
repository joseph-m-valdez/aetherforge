import { type FlightMode, type WireVehicle } from '../services/types.ts'
// re-exporting Flightmode here so we dont leak the service layer into every consumer
export type { FlightMode, WireVehicle }

export type VehicleStatus = 'nominal' | 'warning' | 'critical' | 'offline'

export type VehicleClass = 'VTOL' | 'QUAD' | 'FIXED_WING'

export interface GeoPosition {
  lat: number
  lon: number
  altMSL: number // meters above mean sea level
}

export interface Telemetry {
  groundSpeed?: number // m/s
  airSpeed?: number // m/s
  verticalSpeed?: number // m/s, positive is climbing
  altitudeRel?: number // meters above takeoff/home
  heading?: number // degrees, 0-359, true north
  position: GeoPosition
}

export interface Link {
  connected: boolean // heartbeat seen within timeout
}

export interface Vehicle {
  id: string
  callsign: string
  vclass?: VehicleClass
  armed: boolean
  flightMode: FlightMode
  status?: VehicleStatus
  battery?: number // percent, 0-100; -1 when unknown (SYS_STATUS battery_remaining)
  telemetry: Telemetry
  link: Link
}

export interface Fleet {
  id: string
  name: string
  color: string
  vehicles: Vehicle[]
}

export type CommandMode = 'PLANNING' | 'OPERATION' | 'FORMATION' | 'SWARM'

export type CommandKind = 'ARM' | 'DISARM'

export interface Command {
  kind: CommandKind
  targetIds: string[]
  params?: Record<string, number | string>
}
