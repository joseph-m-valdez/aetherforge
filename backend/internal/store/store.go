package store

import (
	"maps"
	"sync"

	"github.com/jmvaldez/aetherforge/internal/telemetry"
)

type Store struct {
	rwmu         sync.RWMutex
	vehicles map[uint8]telemetry.VehicleState
}

func New() *Store {
	vstate := make(map[uint8]telemetry.VehicleState)
	store := &Store{
		vehicles: vstate,
	}
	return store
}

func (s *Store) Update(sysID uint8, state telemetry.VehicleState) {
	s.rwmu.Lock()
	defer s.rwmu.Unlock()
	s.vehicles[sysID] = state
}

func (s *Store) Snapshot() map[uint8]telemetry.VehicleState {
	s.rwmu.RLock()
	defer s.rwmu.RUnlock()
	copiedVehicleState := make(map[uint8]telemetry.VehicleState)
	maps.Copy(copiedVehicleState, s.vehicles)
	return copiedVehicleState
}
