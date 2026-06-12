package main

import (
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/jmvaldez/aetherforge/internal/mav"
	"github.com/jmvaldez/aetherforge/internal/store"
	"github.com/jmvaldez/aetherforge/internal/transport/ws"
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
	hub := ws.New()
	errCh := make(chan error, 1)

	go func() { errCh <- node.Run(ctx, st) }()
	go hub.Run(ctx)
	go startBroadcaster(ctx, st, hub)

	mux := &http.ServeMux{}
	mux.Handle("/ws", hub)

	srv := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		shutdownContext, cancel := context.WithTimeout(context.Background(), time.Second*5)
		defer cancel()
		srv.Shutdown(shutdownContext)
	case err := <-errCh:
		log.Printf("fatal error: %v", err)
	}
}
