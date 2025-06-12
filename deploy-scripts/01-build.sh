#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

# Run cdk buildscript
"$repo/aoe-infra/01-build.sh"

# Run data analytics buildscript
"$repo/aoe-data-analytics/deploy-scripts/01-build.sh"

# Run semantic-api buildscript
"$repo/aoe-semantic-apis/deploy-scripts/01-build.sh"

# Run streaming app buildscript
"$repo/aoe-streaming-app/deploy-scripts/01-build.sh"

# Run web backend buildscript
"$repo/aoe-web-backend/deploy-scripts/01-build.sh"

# Run data analytics buildscript
"$repo/aoe-data-analytics/deploy-scripts/01-build.sh"

# Run web frontend buildscript
"$repo/aoe-web-frontend/deploy-scripts/01-build.sh"

# Run data services buildscript
"$repo/aoe-data-services/deploy-scripts/01-build.sh"
