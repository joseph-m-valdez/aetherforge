package main

import (
	"flag"
	"fmt"
	"log"
	"net"
)

func main() {
	// GCS listen port and vehicle port
	local := flag.Int("local", 14550, "local listen port (PX4 remote_port)")
	vehPort := flag.Int("veh-port", 14540, "vehicle udp_port (from 'mavlink status')")
	host := flag.String("veh-host", "127.0.0.1", "vehicle host")
	flag.Parse()

	laddr := &net.UDPAddr{IP: net.ParseIP("0.0.0.0"), Port: *local}
	conn, err := net.ListenUDP("udp", laddr)
	if err != nil {
		log.Fatalf("bind %v: %v", laddr, err)
	}
	defer conn.Close()

	raddr := &net.UDPAddr{IP: net.ParseIP(*host), Port: *vehPort}
	fmt.Printf("listening on %s; announcing to %s…\n", laddr.String(), raddr.String())

	// === ANNOUNCE ONCE ===
	// Any small payload works just to register our (IP,port).
	if _, err := conn.WriteToUDP([]byte{0x01}, raddr); err != nil {
		log.Fatalf("announce failed: %v", err)
	}

	// === READ LOOP ===
	buf := make([]byte, 2048)
	for {
		n, from, err := conn.ReadFromUDP(buf)
		if err != nil {
			log.Printf("read: %v", err)
			continue
		}
		fmt.Printf("recv %4dB from %-21s  hex: % x\n", n, from.String(), buf[:min(n, 32)])
	}
}

func min(a, b int) int { if a < b { return a }; return b }

