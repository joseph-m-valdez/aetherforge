package mav

import (
	"context"
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

func (n *Node) sendCommand(sysID uint8, cmd common.MAV_CMD, params ...float32) error {
	if len(params) > 7 {
		return fmt.Errorf("sendCommand: %d params, COMMAND_LONG holds max 7", len(params))
	}
	msg := &common.MessageCommandLong{
		TargetSystem:    sysID,
		TargetComponent: 1,
		Command:         cmd,
	}

	// params[0] -> Param1, params[1] -> Param2, etc...
	fields := []*float32{&msg.Param1, &msg.Param2, &msg.Param3, &msg.Param4, &msg.Param5, &msg.Param6, &msg.Param7}
	for i, p := range params {
		*fields[i] = p
	}
	return n.node.WriteMessageAll(msg)
}

func (n *Node) Arm(sysID uint8) error {
	return n.sendCommand(sysID, common.MAV_CMD_COMPONENT_ARM_DISARM, float32(common.MAV_BOOL_TRUE))
}

func (n *Node) Disarm(sysID uint8) error {
	return n.sendCommand(sysID, common.MAV_CMD_COMPONENT_ARM_DISARM, float32(common.MAV_BOOL_FALSE))
}

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
