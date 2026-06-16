package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/jmvaldez/aetherforge/internal/api"
	"github.com/jmvaldez/aetherforge/internal/store"
	"github.com/jmvaldez/aetherforge/internal/transport/ws"
)

func startBroadcaster(ctx context.Context, st *store.Store, hub *ws.Hub) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			now := time.Now()
			fleet := api.NewFleetSnapshot(st.Snapshot(), now)

			fleetToJSON, err := json.Marshal(fleet)
			if err != nil {
				log.Println(err)
				continue
			}
			hub.Broadcast(fleetToJSON)
		}
	}
}
