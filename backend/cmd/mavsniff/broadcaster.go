package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

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
			fleet := st.Snapshot()

			fleetToJSON, err := json.Marshal(fleet)
			if err != nil {
				fmt.Println(err)
				return
			}
			hub.Broadcast(fleetToJSON)
		}
	}
}
