# ---- Build stage: compile PX4 SITL from source ----
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV FIRMWARE_DIR=/opt/px4

# Minimal build dependencies for PX4 SITL (no Gazebo, no GUI)
RUN apt-get update && apt-get install -y --no-install-recommends \
    astyle \
    build-essential \
    ca-certificates \
    cmake \
    g++ \
    git \
    ninja-build \
    python3 \
    python3-pip \
    python3-setuptools \
    && rm -rf /var/lib/apt/lists/*

# Python build deps (subset of PX4 requirements.txt needed for cmake/code generation)
RUN pip3 install --no-cache-dir \
    empy==3.3.4 \
    jinja2 \
    jsonschema \
    kconfiglib \
    packaging \
    pyros-genmsg \
    pyyaml \
    future

# Clone PX4 and build the SITL binary
ARG PX4_VERSION=main
RUN git clone --depth 1 --branch ${PX4_VERSION} --recurse-submodules --shallow-submodules \
    https://github.com/PX4/PX4-Autopilot.git ${FIRMWARE_DIR}

RUN cmake -GNinja -DCONFIG=px4_sitl_default \
    -B${FIRMWARE_DIR}/build -S${FIRMWARE_DIR} \
    && cmake --build ${FIRMWARE_DIR}/build -j$(nproc)

# ---- Runtime stage: just the compiled binary + minimal deps ----
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV FIRMWARE_DIR=/opt/px4

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

# Copy the full build output (binary + init scripts + config)
COPY --from=builder ${FIRMWARE_DIR}/build ${FIRMWARE_DIR}/build

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
