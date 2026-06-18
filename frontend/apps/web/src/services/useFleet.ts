import { atom, useAtomValue } from 'jotai';
import { fleetAtom } from './store';
import type { WireVehicle } from '../fleet/types';

export const vehiclesByIdAtom = atom<Map<number, WireVehicle>>((get) => {
	const fleet = get(fleetAtom);
	const fleetMap = new Map<number, WireVehicle>();

	if (fleet === null) return fleetMap;

	for (const vehicle of fleet.vehicles) {
		fleetMap.set(vehicle.id, vehicle);
	}
	return fleetMap
});

export function useFleet() {
	const fleet = useAtomValue(vehiclesByIdAtom);

	return fleet;

}
