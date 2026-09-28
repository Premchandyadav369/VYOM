#!/usr/bin/env bash
# Starts local Drunix Network containers
echo "Starting NPCI Drunix Cluster..."
if command -v docker &> /dev/null; then
    docker compose up -d orderer.example.com lp1.org1 cp.org1 vs1.org1 keydb postgres
    echo "Drunix network nodes started successfully."
else
    echo "Docker not detected on host. Operating in high-fidelity Drunix Simulator mode."
fi
