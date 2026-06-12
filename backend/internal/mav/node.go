package mav

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/bluenviron/gomavlib/v3"
	"github.com/bluenviron/gomavlib/v3/pkg/dialects/common"
	"github.com/jmvaldez/aetherforge/internal/store"
	"github.com/jmvaldez/aetherforge/internal/telemetry"
)

type Node struct {
	node *gomavlib.Node
}

func New(cfg Config) (*Node, error) {
	n := &gomavlib.Node{
		Endpoints: []gomavlib.EndpointConf{
			gomavlib.EndpointUDPServer{Address: cfg.ListenAddr},
		},
		Dialect:        common.Dialect,
		OutVersion:     gomavlib.V2,
		OutSystemID:    cfg.OutSystemID,
		OutComponentID: 1,
	}

	if err := n.Initialize(); err != nil {
		return nil, fmt.Errorf("gomavlib init: %w", err)
	}

	return &Node{node: n}, nil
}

func (n *Node) events() <-chan gomavlib.Event { return n.node.Events() }

func (n *Node) Close() { n.node.Close() }

func (n *Node) Run(ctx context.Context, st *store.Store) error {
	errCh := make(chan error, 1)
	done := make(chan struct{})
	go func() {
		defer close(done)

		for event := range n.events() {
			switch event := event.(type) {
			case *gomavlib.EventFrame:
				sysID := event.Frame.GetSystemID()
				compID := event.Frame.GetComponentID()
				newState := telemetry.Apply(st.Get(sysID), sysID, compID, event.Frame.GetMessage(), time.Now())
				st.Update(sysID, newState)
			case *gomavlib.EventChannelOpen:
				log.Printf("channel opened: %v\n", event.Channel)
			case *gomavlib.EventChannelClose:
				log.Printf("channel closed: %v\n", event.Channel)
			case *gomavlib.EventParseError:
				log.Printf("parse error: %v\n", event.Error)
			default:
				// unknown event type - ignoring
			}
		}
		if ctx.Err() == nil {
			errCh <- fmt.Errorf("event loop exited unexpectedly")
		} else {
			errCh <- nil
		}
	}()

	var err error

	select {
	// Wait for Signal cancellation Ctrl-C or SIGTERM
	case <-ctx.Done():
		log.Println("\nShutting down gracefully...")
		err = nil
	case err = <-errCh:
	}

	n.Close()
	<-done
	return err
}
