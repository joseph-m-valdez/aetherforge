# AetherForge

MAVLink v2 telemetry platform for tracking and managing drone fleets.

## Prerequisites

- Go 1.24+
- Docker & Docker Compose

## Project Structure

```
backend/              Go backend (mavsniff CLI, telemetry processing)
docker/               Docker Compose for PX4 SITL simulation
frontend/             pnpm workspace for the web side
  apps/web/           Dashboard app (React, Vite, Cesium map)
  packages/ui/        Design tokens + accessible primitives, documented in Storybook
docs/                 (planned) Documentation
```

The web side is a pnpm workspace. Install once from `frontend/` with `pnpm install`.
Run the app with `pnpm dev` and the component library with `pnpm storybook`, both
from the `frontend/` directory.

## Quick Start

### 1. Build the PX4 SITL image (one-time)

Compiles a headless PX4 standard VTOL simulation using SIH (no Gazebo/GPU required):

```bash
docker compose -f docker/docker-compose.yml build
```

This takes ~10 minutes. The image is cached by Docker so you only need to do this once.

### 2. Start PX4 SITL

```bash
docker compose -f docker/docker-compose.yml up
```

### 3. Run the MAVLink sniffer

In a separate terminal:

```bash
go run ./backend/cmd/mavsniff/
```

Listens on `0.0.0.0:14550` and prints parsed MAVLink telemetry (heartbeats, GPS positions) as JSON.

#### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--local` | `14550` | Local UDP listen port |
| `--veh-port` | `14540` | Vehicle MAVLink port |
| `--veh-host` | `127.0.0.1` | Vehicle host address |
| `--bind` | `0.0.0.0` | Local bind address |

### 4. Stop

```bash
docker compose -f docker/docker-compose.yml down
```

## Maps (dev only)

The dashboard renders a Cesium globe. Right now it pulls map tiles from
OpenStreetMap's public tile server. This is for local development only. OSM's
tile usage policy does not cover production or app traffic, so do not ship it
as it stands.

For production, switch the tile source to a keyed provider such as MapTiler,
Stadia Maps, or Thunderforest. The only change needed is the `TILE_URL`
constant in `frontend/apps/web/src/components/CesiumMap.tsx`. Serving tiles
offline is a separate piece of work we have put off for later.
