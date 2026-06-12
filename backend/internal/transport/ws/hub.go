package ws

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/coder/websocket"
)

type Hub struct {
	clients    map[*websocket.Conn]bool
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	broadcast  chan []byte
}

func New() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		register:   make(chan *websocket.Conn, 16),
		unregister: make(chan *websocket.Conn, 16),
		broadcast:  make(chan []byte, 16),
	}
}

func (h *Hub) Broadcast(msg []byte) {
	h.broadcast <- msg
}

func (h *Hub) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			for c := range h.clients {
				c.CloseNow()
			}
			return
		case conn := <-h.register:
			h.clients[conn] = true
			log.Println("Client registered")
		case conn := <-h.unregister:
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.CloseNow()
			}
		case msg := <-h.broadcast:
			for c := range h.clients {
				writeCtx, cancel := context.WithTimeout(
					context.Background(), 5*time.Second,
				)
				err := c.Write(writeCtx, websocket.MessageText, msg)
				cancel()
				if err != nil {
					delete(h.clients, c)
					c.CloseNow()
				}
			}
		}
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, nil)
	if err != nil {
		log.Printf("%v", err)
		return
	}
	defer conn.CloseNow()

	h.register <- conn

	for {
		_, _, err = conn.Read(r.Context())
		if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
			h.unregister <- conn
			return
		}
		if err != nil {
			log.Printf("failed to echo with %v: %v", r.RemoteAddr, err)
			h.unregister <- conn
			return
		}
	}
}
