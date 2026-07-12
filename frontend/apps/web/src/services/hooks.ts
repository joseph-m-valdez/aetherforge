import { useAtomValue } from 'jotai';
import { fleetStatusAtom, fleetViewAtom, sendEnvelopeAtom } from './store';
import type { Command } from '../fleet/types';
import { type CommandEnvelope } from './types';

// Public API for live fleet data. Components use these; jotai stays behind the
// seam, so the store can be swapped without touching any consumer.

export function useFleetView() {
	return useAtomValue(fleetViewAtom);
}

export function useFleetStatus() {
	return useAtomValue(fleetStatusAtom);
}

export function useIssueCommand() {
	const send = useAtomValue(sendEnvelopeAtom);
	function issueCommand(cmd: Command) {
		if (!send) {
			console.warn('no connection established, send() unavailable');
			return;
		}
		for (const id of cmd.targetIds) {
			const commandEnvelope: CommandEnvelope = {
				type: 'command',
				command: {
					kind: cmd.kind,
					targetId: Number(id),
				}
			};

			send(commandEnvelope);
		}
	}
	return issueCommand;
}
