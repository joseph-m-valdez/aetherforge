package telemetry

import (
	"time"

	"github.com/bluenviron/gomavlib/v3/pkg/dialects/common"
)

func Apply(state VehicleState, sysID, compID uint8, msg any, now time.Time) VehicleState {
	state.SystemID = sysID
	state.ComponentID = compID
	state.LastUpdate = now

	switch m := msg.(type) {
	case *common.MessageHeartbeat:
		state.Type = uint8(m.Type)
		state.Autopilot = uint8(m.Autopilot)
		state.BaseMode = uint8(m.BaseMode)
		state.CustomMode = m.CustomMode
		state.SystemStatus = uint8(m.SystemStatus)
		state.Armed = (uint8(m.BaseMode) & 0x80) != 0 // MAV_MODE_FLAG_SAFETY_ARMED bit

	case *common.MessageGlobalPositionInt:
		// lat/lon are int32 degrees * 1e7
		state.Lat = float64(m.Lat) / 1e7
		state.Lon = float64(m.Lon) / 1e7
		// alt is mm (MSL)
		state.AltM = float64(m.Alt) / 1000.0
	}

	return state
}
