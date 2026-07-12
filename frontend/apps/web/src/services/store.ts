import { atom } from 'jotai';
import { connect } from './socket';
import { fleetConfigAtom } from '../fleet/config';
import type { Fleet, Vehicle } from '../fleet/types';
import { type CommandEnvelope, type ConnectionStatus, type FleetSnapshot, type WireVehicle } from './types';

// The atom graph, top to bottom:
//   connectionAtom (owns the socket)
//     → fleetAtom / fleetStatusAtom   (slices of the connection)
//       → vehiclesByIdAtom            (live vehicles keyed by system id)
//         → fleetViewAtom             (config + live merged into Fleet[])
// Only fleetViewAtom and fleetStatusAtom are public — the hooks read those.

type Conn = {
	snapshot: FleetSnapshot | null;
	status: ConnectionStatus;
	send: ((env: CommandEnvelope) => void) | null;
};

const connectionAtom = atom<Conn>({ snapshot: null, status: 'connecting', send: null });
connectionAtom.onMount = (set) => {
	const { send, disconnect } = connect(
		(snap) => set((c) => ({ ...c, snapshot: snap })),
		(status) => set((c) => ({ ...c, status: status })),
	);
	set((c) => ({ ...c, send: send }));
	return disconnect;
};

const fleetAtom = atom((get) => get(connectionAtom).snapshot);
export const fleetStatusAtom = atom((get) => get(connectionAtom).status);
export const sendEnvelopeAtom = atom((get) => get(connectionAtom).send);

const vehiclesByIdAtom = atom<Map<number, WireVehicle>>((get) => {
	const fleet = get(fleetAtom);
	const fleetMap = new Map<number, WireVehicle>();

	if (fleet === null) return fleetMap;

	for (const vehicle of fleet.vehicles) {
		fleetMap.set(vehicle.id, vehicle);
	}
	return fleetMap;
});

export const fleetViewAtom = atom<Fleet[]>((get) => {
	const configs = get(fleetConfigAtom);
	const liveById = get(vehiclesByIdAtom);
	const assigned = new Set<number>();

	function toVehicle(live: WireVehicle): Vehicle {
		const vehicle: Vehicle = {
			id: String(live.id),
			callsign: 'synth',
			armed: live.armed,
			flightMode: live.flightMode,
			link: { connected: live.connected },
			telemetry: { position: live.position },
		};
		return vehicle;
	}

	const fleets: Fleet[] = configs.map((cfg) => {
		const vehicles: Vehicle[] = [];
		for (const id of cfg.vehicleIds) {
			const live = liveById.get(id);
			if (!live) continue;
			assigned.add(id);
			vehicles.push(toVehicle(live));
		}
		return { id: cfg.id, name: cfg.name, color: cfg.color, vehicles };
	});

	// unassigned = live vehicles in no fleet
	const loose = [...liveById.values()].filter((v) => !assigned.has(v.id)).map(toVehicle);
	if (loose.length) fleets.push({ id: 'unassigned', name: 'Unassigned', color: '#8a8f98', vehicles: loose });

	return fleets;
});
