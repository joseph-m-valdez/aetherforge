package ws

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/coder/websocket"
)

type Client struct {
	conn    *websocket.Conn
	send    chan []byte
	dropped uint64
	lastLog time.Time
}

type Hub struct {
	clients    map[*websocket.Conn]*Client
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	broadcast  chan []byte
}

func New() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]*Client),
		register:   make(chan *websocket.Conn, 16),
		unregister: make(chan *websocket.Conn, 16),
		broadcast:  make(chan []byte, 16),
	}
}

func (h *Hub) Broadcast(msg []byte) {
	h.broadcast <- msg
}

func (h *Hub) writePump(client *Client) {
	for msg := range client.send {
		writeCtx, cancel := context.WithTimeout(
			context.Background(), 5*time.Second,
		)
		err := client.conn.Write(writeCtx, websocket.MessageText, msg)
		cancel()
		if err != nil {
			h.unregister <- client.conn
			return
		}
	}
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
			sendCh := make(chan []byte, 16)
			client := &Client{
				conn: conn,
				send: sendCh,
			}
			h.clients[conn] = client
			go h.writePump(client)
			log.Println("Client registered")
		case conn := <-h.unregister:
			if c, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				close(c.send)
				conn.CloseNow()
			}
		case msg := <-h.broadcast:
			for _, c := range h.clients {
				select {
				case c.send <- msg:
				default:
					// buffer is full, drop this frame
					c.dropped++
					if time.Since(c.lastLog) > 10*time.Second {
						c.lastLog = time.Now()
						log.Printf("client dropping frames (total %d)", c.dropped)
					}
				}
			}
		}
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{"localhost:5173"},
	})
	if err != nil {
		log.Printf("%v", err)
		return
	}
	defer conn.CloseNow()

	h.register <- conn

	for {
		_, _, err = conn.Read(r.Context())
		status := websocket.CloseStatus(err)
		if status == websocket.StatusNormalClosure || status == websocket.StatusGoingAway {
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
