package main

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type Heartbeat struct {
	Type         uint8
	Autopilot    uint8
	BaseMode     uint8
	CustomMode   uint32
	SystemStatus uint8
}

func main() {
	// Create a context that is canceled when SIGINT or SIGTERM is received
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop() // Ensure the signal listener is stopped when main exits
	// GCS listen port and vehicle port
	local := flag.Int("local", 14550, "local listen port (PX4 remote_port)")
	vehPort := flag.Int("veh-port", 14540, "vehicle udp_port (from 'mavlink status')")
	host := flag.String("veh-host", "127.0.0.1", "vehicle host")
	flag.Parse()
	laddr := &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: *local}
	conn, err := net.ListenUDP("udp", laddr)
	if err != nil {
		log.Fatalf("bind %v: %v", laddr, err)
	}
	defer conn.Close()
	raddr := &net.UDPAddr{IP: net.ParseIP(*host), Port: *vehPort}
	fmt.Printf("listening on %s; announcing to %s…\n", laddr.String(), raddr.String())
	// === ANNOUNCE ONCE ===
	// TODO: Send a GCS heartbeat
	if _, err := conn.WriteToUDP([]byte{0x01}, raddr); err != nil {
		log.Fatalf("announce failed: %v", err)
	}
	// Channel to notify main that the read loop is done
	done := make(chan struct{})
	// Run the UDP read loop in a goroutine
	go func() {
		defer close(done)
		buf := make([]byte, 2048)
		for {
			_ = conn.SetReadDeadline(time.Now().Add(3 * time.Second))
			n, from, err := conn.ReadFromUDP(buf)
			if err != nil {
				if ne, ok := err.(net.Error); ok && ne.Timeout() {
					// on read timeout, check if context is done (signal received)
					select {
					case <-ctx.Done():
						return
					default:
						continue
					}
				}
				log.Printf("read: %v", err)
				select {
				case <-ctx.Done():
					return
				default:
					continue
				}
			}
			if heartbeat, err := parseMAVLinkPacket(buf, n); err == nil {
				hbJSON, _ := json.MarshalIndent(heartbeat, "", " ")
				armed := (heartbeat.BaseMode & 0x80) != 0
				fmt.Printf("Armed: %v\n", armed)
				fmt.Printf("recv HEARTBEAT from %-21s:\n%s\n", from.String(), string(hbJSON))
			}
		}
	}()
	// Wait for signal cancellation (Ctrl-C or SIGTERM)
	<-ctx.Done()
	fmt.Println("\nShutting down gracefully...")
	// Close UDP here to unblock read
	conn.Close()
	// Wait for goroutine to finish cleanly
	<-done
	fmt.Println("bye")
}

func parseMAVLinkPacket(buf []byte, n int) (*Heartbeat, error) {
	// Ensure buffer is at least long enough for MAVLink v2 header (10 bytes)
	if n < 10 || buf[0] != 0xFD {
		return nil, fmt.Errorf("not a valid MAVLink v2 packet")
	}
	// Extract header fields
	payloadLen := int(buf[1])
	msgID := uint32(buf[7]) | uint32(buf[8])<<8 | uint32(buf[9])<<16

	if msgID != 0 || payloadLen != 9 {
		return nil, fmt.Errorf("not a HEARTBEAT message")
	}

	// Ensure buffer has enough data for header (10) + payload (9) + checksum (2)
	if n < 10+9+2 {
		return nil, fmt.Errorf("packet too short")
	}
	// Extract payload (bytes 10 to 18)
	payload := buf[10 : 10+9]
	heartbeat := &Heartbeat{
		Type:         payload[4],
		Autopilot:    payload[5],
		BaseMode:     payload[6],
		CustomMode:   binary.LittleEndian.Uint32(payload[0:4]),
		SystemStatus: payload[7],
	}
	// TODO: Verify checksum (bytes 19-20)
	return heartbeat, nil
}
