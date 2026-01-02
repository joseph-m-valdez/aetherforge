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
			n, _, err := conn.ReadFromUDP(buf)
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
			if f, ok := parseFrame(buf, n); ok {
				if hb, ok := tryHeartbeat(f); ok {
					armed := (hb.BaseMode & 0x80) != 0
					b, _ := json.MarshalIndent(map[string]any{
						"msg":  "HEARTBEAT",
						"type": hb.Type, "autopilot": hb.Autopilot,
						"base_mode": hb.BaseMode, "armed": armed,
						"custom_mode": hb.CustomMode, "system_status": hb.SystemStatus,
					}, "", " ")
					fmt.Println(string(b))
					// continue
				} else if lat, lon, alt, ok := tryGlobalPosition(f); ok {
					b, _ := json.MarshalIndent(map[string]any{
						"msg": "GLOBAL_POSITION_INT",
						"lat": lat, "lon": lon, "alt_m": alt,
					}, "", " ")
					fmt.Println(string(b))
					// continue
				}
				// else: ignore other msgIDs
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

type frame struct {
	Len     int
	SysID   uint8
	CompID  uint8
	MsgID   uint32
	Payload []byte
}

const (
	headerLen = 10
	crcLen    = 2
)

func parseFrame(buf []byte, n int) (frame, bool) {
	if n < headerLen+crcLen {
		// too short to be v2 header+crc
		return frame{}, false
	}

	if buf[0] != 0xFD {
		// not MAVLink V2
		return frame{}, false
	}

	pl := int(buf[1])
	total := headerLen + pl + crcLen

	if n < total {
		// incomplete frame in this datagram
		return frame{}, false
	}

	f := frame{
		Len:     pl,
		SysID:   buf[5],
		CompID:  buf[6],
		MsgID:   uint32(buf[7]) | uint32(buf[8])<<8 | uint32(buf[9])<<16,
		Payload: buf[10 : 10+pl],
	}
	return f, true
}

func tryHeartbeat(f frame) (Heartbeat, bool) {
	if f.MsgID != 0 && len(f.Payload) != 9 {
		return Heartbeat{}, false
	}
	p := f.Payload
	hb := Heartbeat{
		Type:         p[4],
		Autopilot:    p[5],
		BaseMode:     p[6],
		CustomMode:   binary.LittleEndian.Uint32(p[0:4]),
		SystemStatus: p[7],
	}
	return hb, true
}

func tryGlobalPosition(f frame) (latitude, longitude, altitude float64, ok bool) {
	if f.MsgID != 33 || len(f.Payload) < 28 {
		return 0, 0, 0, false
	}
	p := f.Payload

	latInt := int32(binary.LittleEndian.Uint32(p[4:8]))
	lonInt := int32(binary.LittleEndian.Uint32(p[8:12]))
	altMM := int32(binary.LittleEndian.Uint32(p[12:16]))

	lat := float64(latInt) / 1e7
	lon := float64(lonInt) / 1e7
	alt := float64(altMM) / 1000.0

	return lat, lon, alt, true
}
