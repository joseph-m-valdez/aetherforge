package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"

	"github.com/jmvaldez/aetherforge/internal/mav"
	"github.com/jmvaldez/aetherforge/internal/store"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg := mav.NewConfig()

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
