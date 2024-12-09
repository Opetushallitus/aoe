#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Figure out where we are currently
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly CURRENT_DIR


# Run data analytics buildscript
"${CURRENT_DIR}/../aoe-data-analytics/deploy-scripts/01-build.sh"

# Run semantic-api buildscript
"${CURRENT_DIR}/../aoe-semantic-apis/deploy-scripts/01-build.sh"

# Run streaming app buildscript
"${CURRENT_DIR}/../aoe-streaming-app/deploy-scripts/01-build.sh"

# Run web backend buildscript
"${CURRENT_DIR}/../aoe-web-backend/deploy-scripts/01-build.sh"

# Run data analytics buildscript
"${CURRENT_DIR}/../aoe-data-analytics/deploy-scripts/01-build.sh"

# Run web frontend buildscript
"${CURRENT_DIR}/../aoe-web-frontend/deploy-scripts/01-build.sh"

# Run data services buildscript
"${CURRENT_DIR}/../aoe-data-services/deploy-scripts/01-build.sh"
