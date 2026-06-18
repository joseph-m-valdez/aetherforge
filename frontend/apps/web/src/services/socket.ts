import type { FleetSnapshot } from "./types";

export function connect(onSnapshot: (snap: FleetSnapshot) => void): () => void {
	const ws = new WebSocket('ws://localhost:8080/ws');
	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.type != "fleet_snapshot") return;
		onSnapshot(data);
	};
	return () => {
		ws.onmessage = null;
		if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
			ws.close(1000);
		}
	};
};
