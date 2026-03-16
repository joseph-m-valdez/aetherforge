# AetherForge

MAVLink v2 telemetry platform for tracking and managing drone fleets.

## Prerequisites

- Go 1.24+
- Docker & Docker Compose

## Project Structure

```
backend/          Go backend (mavsniff CLI, telemetry processing)
docker/           Docker Compose for PX4 SITL simulation
frontend/         (planned) Web dashboard
docs/             (planned) Documentation
```

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
