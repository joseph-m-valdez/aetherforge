package telemetry

import "time"

type VehicleState struct {
	// Identity
	SystemID    uint8 `json:"system_id"`
	ComponentID uint8 `json:"component_id"`

	// Heartbeat
	Autopilot    uint8  `json:"autopilot"`
	Type         uint8  `json:"type"`
	BaseMode     uint8  `json:"base_mode"`
	CustomMode   uint32 `json:"custom_mode"`
	SystemStatus uint8  `json:"system_status"`
	Armed        bool   `json:"armed"`

	// Position
	Lat  float64 `json:"lat"`
	Lon  float64 `json:"lon"`
	AltM float64 `json:"alt_m"`

	LastUpdate time.Time `json:"last_update"`
}
