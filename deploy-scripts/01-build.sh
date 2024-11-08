#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Figure out where we are currently
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly CURRENT_DIR

# Run semantic-api buildscript
"${CURRENT_DIR}/../aoe-semantic-apis/deploy-scripts/01-build.sh"

# Run streaming app buildscript
"${CURRENT_DIR}/../aoe-streaming-app/deploy-scripts/01-build.sh"