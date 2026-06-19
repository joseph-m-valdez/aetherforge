type MessageType = "fleet_snapshot";

type Position = {
	lat: number;
	lon: number;
	altMSL: number;

};

export const FLIGHT_MODES = {
	Manual: "MANUAL",
	AltitudeControl: "ALTCTL",
	PositionControl: "POSCTL",
	AutoReady: "AUTO.READY",
	AutoTakeoff: "AUTO.TAKEOFF",
	AutoLoiter: "AUTO.LOITER",
	AutoMission: "AUTO.MISSION",
	AutoRtl: "AUTO.RTL",
	AutoLand: "AUTO.LAND",
	Acrobat: "ACRO",
	Offboard: "OFFBOARD",
	Stabilized: "STABILIZED",
	Unknown: "UNKNOWN",
} as const;

export type FlightMode = typeof FLIGHT_MODES[keyof typeof FLIGHT_MODES];

export type WireVehicle = {
	id: number;
	armed: boolean;
	flightMode: FlightMode;
	position: Position;
	connected: boolean;
};

export type ConnectionStatus = 'connecting' | 'up' | 'reconnecting' | 'failed';

export type FleetSnapshot = {
	type: MessageType,
	vehicles: WireVehicle[];
};
