#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

# Run cdk buildscript
"$repo/aoe-infra/01-build.sh"

# Run web backend buildscript
"$repo/aoe-web-backend/deploy-scripts/01-build.sh"

# Run restore validator buildscript
"$repo/aoe-infra/restore-validator/deploy-scripts/01-build.sh"
