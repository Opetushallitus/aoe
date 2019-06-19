#!/bin/bash
DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR/../"

IMAGE="aoe-backend"
docker build -t $IMAGE -f docker/Dockerfile .
