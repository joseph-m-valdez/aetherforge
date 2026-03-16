package mav

import (
	"fmt"

	"github.com/bluenviron/gomavlib/v3"
	"github.com/bluenviron/gomavlib/v3/pkg/dialects/common"
)

type Node struct {
	node *gomavlib.Node
}

func New(cfg Config) (*Node, error) {
	n := &gomavlib.Node{
		Endpoints: []gomavlib.EndpointConf{
			gomavlib.EndpointUDPServer{Address: cfg.ListenAddr},
		},
		Dialect:	common.Dialect,
		OutVersion: gomavlib.V2,
		OutSystemID: cfg.OutSystemID,
		OutComponentID: 1,
	}

	if err := n.Initialize(); err != nil {
		return nil, fmt.Errorf("gomavlib init: %w", err)
	}

	return &Node{node: n}, nil
}

func (n *Node) Close() { n.node.Close() }

func (n *Node) Events() <-chan gomavlib.Event { return n.node.Events() }
