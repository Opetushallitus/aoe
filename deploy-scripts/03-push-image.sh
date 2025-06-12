#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../scripts/common-functions.sh"

# Run semantic-api push image script
"$repo/aoe-semantic-apis/deploy-scripts/02-push-image.sh"

# Run streaming app push image script
"$repo/aoe-streaming-app/deploy-scripts/02-push-image.sh"

# Run web backend push image script
"$repo/aoe-web-backend/deploy-scripts/02-push-image.sh"

# Run web frontend push image script
"$repo/aoe-web-frontend/deploy-scripts/02-push-image.sh"

# Run data analytics push image script
"$repo/aoe-data-analytics/deploy-scripts/02-push-image.sh"

# Run data analytics push image script
"$repo/aoe-data-services/deploy-scripts/02-push-image.sh"
