import { atom } from 'jotai';
import { connect } from './socket';
import { type FleetSnapshot } from './types';

export const fleetAtom = atom<FleetSnapshot | null>(null);
fleetAtom.onMount = (set) => connect(set);

