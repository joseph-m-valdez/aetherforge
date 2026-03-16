#!/usr/bin/env bash
# PX4 SIH SITL entrypoint - patches MAVLink to target the Docker host,
# then launches the pre-built PX4 binary.
set -euo pipefail

FIRMWARE_DIR=/opt/px4
MAVRC=${FIRMWARE_DIR}/build/etc/init.d-posix/px4-rc.mavlink

# --- Resolve the host IP ------------------------------------------------
# Docker Desktop (macOS/Windows/Linux VM): use host.docker.internal
# Docker Engine (native Linux): use the default gateway
if getent ahostsv4 host.docker.internal &>/dev/null; then
    HOST_IP=$(getent ahostsv4 host.docker.internal | head -1 | awk '{print $1}')
    echo "Docker Desktop detected — targeting host at ${HOST_IP}"
else
    HOST_IP=$(ip route | awk '/default/ {print $3}')
    echo "Docker Engine detected — targeting gateway at ${HOST_IP}"
fi

# --- Patch MAVLink to send telemetry to the host ------------------------
# Append "-t <IP>" to the GCS and offboard mavlink start commands so PX4
# pushes data out of the container instead of broadcasting inside it.
sed -i "s/mavlink start -x -u \$udp_gcs_port_local -r 4000000/& -t ${HOST_IP}/" "${MAVRC}"
sed -i "s/mavlink start -x -u \$udp_offboard_port_local -r 4000000/& -t ${HOST_IP}/" "${MAVRC}"

# --- Launch PX4 ----------------------------------------------------------
cd "${FIRMWARE_DIR}/build"
exec ./bin/px4 -d
