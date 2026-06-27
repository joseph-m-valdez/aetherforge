# AetherForge

A ground control station built from scratch to learn drone software from the operator 
side up. QGroundControl is powerful but exposes a lot of complexity. This is an 
exploration of what a simpler, operator-focused fleet management interface could look 
like, using real MAVLink telemetry over PX4 SITL.

<img width="600" alt="AetherForge Storybook" src="https://github.com/user-attachments/assets/66a83d5e-ca33-410d-8a79-22db3845651e" />



## What is working

- Live MAVLink v2 telemetry parsed from PX4 SITL
- Real-time vehicle positions on a Cesium 3D globe
- Per-vehicle state machine with heartbeat and GPS tracking
- Fleet management UI with vehicle selection
- Shared component library documented in Storybook

## Stack

- **Backend:** Go, gomavlib, WebSockets
- **Frontend:** React, TypeScript, Vite, CesiumJS
- **Simulation:** PX4 SITL via Docker (no Gazebo or GPU required)
- **UI:** Tailwind CSS, Storybook

## Prerequisites

- Go 1.24+
- Docker and Docker Compose
- pnpm

## Quick Start

### 1. Build the PX4 SITL image (one-time, ~10 minutes)

```bash
docker compose -f docker/docker-compose.yml build
```

### 2. Start the simulation

```bash
docker compose -f docker/docker-compose.yml up
```

### 3. Run the MAVLink backend

```bash
go run ./backend/cmd/mavsniff/
```

### 4. Start the dashboard

```bash
cd frontend && pnpm install && pnpm dev
```

## Project Structure

```
backend/       Go backend, MAVLink node, WebSocket hub
docker/        PX4 SITL Docker setup
frontend/
  apps/web/    React dashboard with Cesium map
  packages/ui/ Design tokens and component library
```

## Maps

The dashboard uses OpenStreetMap tiles for local development only.
OSM's usage policy does not cover production traffic. For production,
swap the tile source to MapTiler, Stadia Maps, or similar by updating
`TILE_URL` in `CesiumMap.tsx`.
