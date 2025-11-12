package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"
)

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
			fmt.Printf("recv %4dB from %-21s  hex: % x\n", n, from.String(), buf[:min(n, 32)])
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
