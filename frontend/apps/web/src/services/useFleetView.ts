import { atom, useAtomValue } from "jotai";
import { fleetConfigAtom } from "../fleet/config";
import type { Fleet, Vehicle } from "../fleet/types";
import type { WireVehicle } from "./types";
import { vehiclesByIdAtom } from "./useFleet";

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
			telemetry: { position: live.position }
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

export const useFleetView = () => {
	const fleets = useAtomValue(fleetViewAtom);
	return fleets;
};
