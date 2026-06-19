import type { ConnectionStatus, FleetSnapshot } from "./types";


export type SnapshotCallback = (snap: FleetSnapshot) => void;
export type StatusCallback = (status: ConnectionStatus) => void;

function createMessageHandler(onSnapshot: SnapshotCallback) {
	return (event: MessageEvent) => {
		try {
			const data = JSON.parse(event.data);
			if (data.type != "fleet_snapshot") return;
			onSnapshot(data);
		} catch (error) {
			console.error("Failed to parse websocket msg:", error);
		}
	};
}

export function connect(onSnapshot: SnapshotCallback, onStatus: StatusCallback): () => void {
	let attempt = 0;
	let closed = false;
	const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	let ws: WebSocket;
	async function openWs() {
		if (closed) { return; }
		ws = new WebSocket('ws://localhost:8080/ws');

		ws.onopen = () => {
			attempt = 0;
			onStatus('up');
			ws.onmessage = createMessageHandler(onSnapshot);
		};

		ws.onclose = async () => {
			const maxDelay = 30_000;
			const baseDelay = 1_000;
			const maxRetries = 5;

			if (closed) { return; }

			if (attempt >= maxRetries) {
				onStatus('failed');
				closed = true;
				return;
			}

			// 1. Exponential Backoff: baseDelay * 2^attempt
			const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));

			// 2. Full Jitter: Random value between 0 and the exponential delay
			const jitterDelay = Math.random() * exponentialDelay;
			ws.onerror = () => {
				console.log("An error occurred, but JavaScript cannot read the reason.");
			};
			onStatus('reconnecting');
			await wait(jitterDelay);
			attempt++;
			openWs();
		};
	};

	openWs();

	return () => {
		ws.onmessage = null;
		if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
			closed = true;
			ws.close(1000);
		}
	};
};
