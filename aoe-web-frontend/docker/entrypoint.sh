#!/usr/bin/env bash

if [[ -z "${ENV}" ]]; then
  echo "missing ENV environment variable"
  exit 1
fi

echo "Current environment: $ENV"

JSON_FMT=$(printf '{"env":"%s"}\n' "$ENV")

mkdir -p /usr/share/nginx/html/assets/config/

echo "$JSON_FMT" > /usr/share/nginx/html/assets/config/config.json

/usr/bin/openresty -g 'daemon off;'
