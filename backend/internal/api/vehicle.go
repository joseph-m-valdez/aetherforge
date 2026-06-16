package api

import (
	"time"

	"github.com/jmvaldez/aetherforge/internal/telemetry"
)

type Position struct {
	Lat    float64 `json:"lat"`
	Lon    float64 `json:"lon"`
	AltMSL float64 `json:"altMSL"`
}

type Vehicle struct {
	ID         uint8    `json:"id"`
	Armed      bool     `json:"armed"`
	FlightMode string   `json:"flightMode"`
	Position   Position `json:"position"`
	Connected  bool     `json:"connected"`
}

const heartbeatTimeout = 3 * time.Second

func FromState(s telemetry.VehicleState, now time.Time) Vehicle {
	connected := now.Sub(s.LastUpdate) <= heartbeatTimeout
	return Vehicle{
		ID:         s.SystemID,
		Armed:      s.Armed,
		FlightMode: decodeFlightMode(s.CustomMode),
		Position: Position{
			Lat:    s.Lat,
			Lon:    s.Lon,
			AltMSL: s.AltM,
		},
		Connected: connected,
	}
}

const (
	px4MainManual     = 1
	px4MainAltctl     = 2
	px4MainPosctl     = 3
	px4MainAuto       = 4
	px4MainAcro       = 5
	px4MainOffboard   = 6
	px4MainStabilized = 7
)

const (
	px4SubAutoReady   = 1
	px4SubAutoTakeoff = 2
	px4SubAutoLoiter  = 3
	px4SubAutoMission = 4
	px4SubAutoRtl     = 5
	px4SubAutoLand    = 6
)

func decodeFlightMode(customMode uint32) string {
	mainMode := uint8(customMode >> 16)
	subMode := uint8(customMode >> 24)
	switch mainMode {
	case px4MainManual:
		return "MANUAL"
	case px4MainAltctl:
		return "ALTCTL"
	case px4MainPosctl:
		return "POSCTL"
	case px4MainAuto:
		switch subMode {
		case px4SubAutoReady:
			return "AUTO.READY"
		case px4SubAutoTakeoff:
			return "AUTO.TAKEOFF"
		case px4SubAutoLoiter:
			return "AUTO.LOITER"
		case px4SubAutoMission:
			return "AUTO.MISSION"
		case px4SubAutoRtl:
			return "AUTO.RTL"
		case px4SubAutoLand:
			return "AUTO.LAND"
		default:
			return "UNKNOWN"
		}
	case px4MainAcro:
		return "ACRO"
	case px4MainOffboard:
		return "OFFBOARD"
	case px4MainStabilized:
		return "STABILIZED"
	default:
		return "UNKNOWN"
	}
}
