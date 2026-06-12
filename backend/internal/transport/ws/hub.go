package ws

import "github.com/coder/websocket"

type Hub struct {
	clients             map[*websocket.Conn]bool
	chRegistrations     chan *websocket.Conn
	chUnregistrations   chan *websocket.Conn
	chBroadcastMessages chan []byte
}

func New() *Hub {
	return &Hub{
		clients:             make(map[*websocket.Conn]bool),
		chRegistrations:     make(chan *websocket.Conn, 16),
		chUnregistrations:   make(chan *websocket.Conn, 16),
		chBroadcastMessages: make(chan []byte, 16),
	}
}
