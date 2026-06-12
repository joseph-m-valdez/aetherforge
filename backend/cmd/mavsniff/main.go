package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os/signal"
	"syscall"

	"github.com/jmvaldez/aetherforge/internal/mav"
	"github.com/jmvaldez/aetherforge/internal/store"
)

func main() {
	// Parse flags
	local := flag.Int("local", 14550, "local listen port (PX4 remote_port)")
	bind := flag.String("bind", "0.0.0.0", "local bind address")
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg := mav.NewConfig()
	cfg.ListenAddr = fmt.Sprintf("%s:%d", *bind, *local)

	node, err := mav.New(cfg)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	st := store.New()

	err = node.Run(ctx, st)
	if err != nil {
		log.Fatalf("err: %v", err)
	}
}
