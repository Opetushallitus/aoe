#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../scripts/common-functions.sh"
#
# shellcheck source=./deploy-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-functions.sh"

trap clean EXIT

compose="docker compose -p aoe_ci -f docker-compose.ci-playwright.yml"

readonly compose

function clean {
  $compose down
}

function start_services {
  $compose --profile aoe up --build -d
}

function run_playwright_tests {
  $compose --profile test up --build
}

function main {
  echo "$repo"
  cd "$repo"
  use_correct_node_version
  require_command "docker"
  docker build -t playwright-image -f Dockerfile.playwright-test-runner .
  $compose build
  start_services

  run_playwright_tests
  clean
}

main "$@"
