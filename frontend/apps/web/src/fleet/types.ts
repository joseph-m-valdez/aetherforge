// PX4 flight modes, as decoded from HEARTBEAT.custom_mode (main+sub mode).
export type FlightMode =
  | 'MANUAL'
  | 'ALTCTL'
  | 'POSCTL'
  | 'AUTO.READY'
  | 'AUTO.TAKEOFF'
  | 'AUTO.LOITER'
  | 'AUTO.MISSION'
  | 'AUTO.RTL'
  | 'AUTO.LAND'
  | 'ACRO'
  | 'OFFBOARD'
  | 'STABILIZED'
  | 'UNKNOWN';

export type VehicleStatus = 'nominal' | 'warning' | 'critical' | 'offline'

export type VehicleClass = 'VTOL' | 'QUAD' | 'FIXED_WING'

export interface GeoPosition {
  lat: number
  lon: number
  altMSL: number // meters above mean sea level
}

export interface Telemetry {
  groundSpeed: number // m/s
  airSpeed: number // m/s
  verticalSpeed: number // m/s, positive is climbing
  altitudeRel: number // meters above takeoff/home
  heading: number // degrees, 0-359, true north
  position: GeoPosition
}

export interface Link {
  connected: boolean // heartbeat seen within timeout
}

export interface Vehicle {
  id: string
  callsign: string
  vclass: VehicleClass
  armed: boolean
  flightMode: FlightMode
  status: VehicleStatus
  battery: number // percent, 0-100; -1 when unknown (SYS_STATUS battery_remaining)
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

export type CommandKind =
  | 'ARM'
  | 'DISARM'
  | 'SET_MODE'
  | 'START_MISSION'
  | 'PAUSE_MISSION'
  | 'STOP_MISSION'
  | 'CLEAR_MISSION'
  | 'RTL'
  | 'TAKEOFF'
  | 'LAND'
  | 'EMERGENCY_STOP'

export interface Command {
  kind: CommandKind
  targetIds: string[]
  params?: Record<string, number | string>
}
