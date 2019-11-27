#!/bin/bash
DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR/../"

IMAGE="demo-aoe-frontend"
docker build -t $IMAGE -f docker/Dockerfile .
