#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# Figure out where we are currently
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly CURRENT_DIR

# Run semantic-api push image script
"${CURRENT_DIR}/../aoe-semantic-apis/deploy-scripts/02-push-image.sh"

# Run streaming app push image script
"${CURRENT_DIR}/../aoe-streaming-app/deploy-scripts/02-push-image.sh"

# Run web backend push image script
"${CURRENT_DIR}/../aoe-web-backend/deploy-scripts/02-push-image.sh"

# Run data analytics push image script
"${CURRENT_DIR}/../aoe-data-analytics/deploy-scripts/02-push-image.sh"

# Run data analytics push image script
"${CURRENT_DIR}/../aoe-data-services/deploy-scripts/02-push-image.sh"