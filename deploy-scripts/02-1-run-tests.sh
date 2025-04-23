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
  $compose --profile aoe down
}

function start_services {

  if running_on_gh_actions; then
    AOE_WEB_BACKEND_TAG="${github_registry}aoe-web-backend:${revision}"
    AOE_DATA_SERVICES_TAG="${github_registry}aoe-data-services:${revision}"
    AOE_WEB_FRONTEND_TAG="${github_registry}aoe-web-frontend-ci:${revision}"
    AOE_STREAMING_APP_TAG="${github_registry}aoe-streaming-app:${revision}"
    AOE_SEMANTIC_APIS_TAG="${github_registry}aoe-semantic-apis:${revision}"
    AOE_DATA_ANALYTICS_TAG="${github_registry}aoe-data-analytics:${revision}"
  fi
  $compose --profile aoe up --no-build -d
}

function run_playwright_tests {
  $compose --profile test up --no-build --force-recreate
}

function main {
  echo "$repo"
  cd "$repo"
  use_correct_node_version
  require_command "docker"
  docker build -t playwright-image -f Dockerfile.playwright-test-runner .
  start_services

  run_playwright_tests
  clean
}

main "$@"
