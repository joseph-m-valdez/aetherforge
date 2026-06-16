package api

import (
	"time"

	"github.com/jmvaldez/aetherforge/internal/telemetry"
)

type MessageType string

const (
	MsgFleetSnapshot MessageType = "fleet_snapshot"
)

type FleetSnapshot struct {
	Type     MessageType `json:"type"`
	Vehicles []Vehicle   `json:"vehicles"`
}

func NewFleetSnapshot(states map[uint8]telemetry.VehicleState, now time.Time) FleetSnapshot {
	vehicles := make([]Vehicle, 0, len(states))
	for _, val := range states {
		vehicle := FromState(val, now)
		vehicles = append(vehicles, vehicle)
	}
	return FleetSnapshot{
		Type:     MsgFleetSnapshot,
		Vehicles: vehicles,
	}
}
