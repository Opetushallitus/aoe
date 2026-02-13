#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../scripts/common-functions.sh"
#
# shellcheck source=./deploy-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-functions.sh"

trap clean EXIT

compose="docker compose -p aoe_ci -f docker-compose.ci-playwright.yml"

TRUST_STORE_PASSWORD=ci-super-secret

readonly compose

function clean {
  $compose down
}

function run_playwright_tests {
  $compose up --abort-on-container-exit --exit-code-from test-runner
}

function main {
  echo "$repo"
  cd "$repo"
  use_correct_node_version
  require_command "docker"
  $compose --profile test build

  run_playwright_tests
}

main "$@"
