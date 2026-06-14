import type { Fleet, Vehicle } from './types'
import { INITIAL_VIEW } from './config'

// Placeholder fleet data clustered around the SITL home; ~0.001 deg ≈ 100 m.
function vehicle(
  base: Pick<Vehicle, 'id' | 'callsign'> & Partial<Omit<Vehicle, 'telemetry'>>,
  dLat: number,
  dLon: number,
  heading = 264,
): Vehicle {
  return {
    vclass: 'VTOL',
    armed: true,
    flightMode: 'AUTO.MISSION',
    status: 'nominal',
    battery: 53,
    link: { connected: true },
    telemetry: {
      groundSpeed: 22.1,
      airSpeed: 21.8,
      verticalSpeed: 0.3,
      altitudeRel: 148.1,
      heading,
      position: {
        lat: INITIAL_VIEW.lat + dLat,
        lon: INITIAL_VIEW.lon + dLon,
        altMSL: INITIAL_VIEW.altMSL + 150,
      },
    },
    ...base,
  }
}

export const fleets: Fleet[] = [
  {
    id: 'vanguard',
    name: 'Vanguard',
    color: '#27d3e0',
    vehicles: [
      vehicle({ id: 'wraith', callsign: 'Wraith' }, 0.0003, -0.0002, 28),
      vehicle({ id: 'nomad', callsign: 'Nomad', battery: 61 }, -0.0002, 0.0003, 51),
      vehicle({ id: 'onyx', callsign: 'Onyx', battery: 48, status: 'warning' }, 0.0005, 0.0004, 12),
      vehicle({ id: 'saber', callsign: 'Saber' }, -0.0004, -0.0003, 95),
    ],
  },
  {
    id: 'reaper',
    name: 'Reaper',
    color: '#f5a623',
    vehicles: [
      vehicle({ id: 'viper', callsign: 'Viper', vclass: 'FIXED_WING' }, -0.0005, 0.0125, 188),
      vehicle({ id: 'talon', callsign: 'Talon', vclass: 'FIXED_WING', battery: 57 }, -0.0001, 0.013, 201),
      vehicle({ id: 'havoc', callsign: 'Havoc', vclass: 'FIXED_WING', battery: 71 }, -0.0008, 0.0123, 176),
      vehicle(
        { id: 'razor', callsign: 'Razor', vclass: 'FIXED_WING', battery: 14, status: 'critical' },
        -0.0003,
        0.0135,
        212,
      ),
    ],
  },
  {
    id: 'spectre',
    name: 'Spectre',
    color: '#a06bff',
    vehicles: [
      vehicle({ id: 'phantom', callsign: 'Phantom', flightMode: 'AUTO.RTL', battery: 53 }, 0.0125, -0.0006, 96),
      vehicle(
        { id: 'banshee', callsign: 'Banshee', flightMode: 'AUTO.RTL', battery: 22, status: 'warning' },
        0.013,
        -0.0001,
        102,
      ),
      vehicle({ id: 'cipher', callsign: 'Cipher', flightMode: 'AUTO.LOITER' }, 0.0122, -0.001, 88),
      vehicle(
        {
          id: 'fury',
          callsign: 'Fury',
          flightMode: 'MANUAL',
          armed: false,
          status: 'offline',
          battery: -1,
          link: { connected: false },
        },
        0.0135,
        0.0004,
        270,
      ),
    ],
  },
]

export const allVehicles: Vehicle[] = fleets.flatMap((f) => f.vehicles)
