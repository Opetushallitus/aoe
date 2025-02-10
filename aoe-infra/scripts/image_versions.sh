#!/bin/bash
set -o errexit -o nounset -o pipefail

# Figure out where we are currently
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly CURRENT_DIR

image_versions() {
  local ENV_NAME
  ENV_NAME="$(basename -- "$1")"
  echo "Environment: $ENV_NAME"
  echo "---"
  echo "Data analytics:   $(jq -r '.services .data_analytics .image_tag' "$1")"
  echo "Data services:    $(jq -r '.services .data_services .image_tag' "$1")"
  echo "Semantic APIs:    $(jq -r '.services .semantic_apis .image_tag' "$1")"
  echo "Streaming:        $(jq -r '.services .streaming .image_tag' "$1")"
  echo "Web backend:      $(jq -r '.services .web_backend .image_tag' "$1")"
  echo "Web frontend:     $(jq -r '.services .web_frontend .image_tag' "$1")"
  echo ""
}

image_versions "${CURRENT_DIR}/../environments/dev.json"
image_versions "${CURRENT_DIR}/../environments/qa.json"
image_versions "${CURRENT_DIR}/../environments/prod.json"
