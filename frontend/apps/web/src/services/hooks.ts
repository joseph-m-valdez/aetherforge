import { useAtomValue } from 'jotai';
import { fleetStatusAtom, fleetViewAtom } from './store';

// Public API for live fleet data. Components use these; jotai stays behind the
// seam, so the store can be swapped without touching any consumer.

export function useFleetView() {
	return useAtomValue(fleetViewAtom);
}

export function useFleetStatus() {
	return useAtomValue(fleetStatusAtom);
}
