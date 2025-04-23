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
  $compose -e TRUST_STORE_PASSWORD=ci-super-secret --profile aoe up -d
}

function run_playwright_tests {
  $compose --profile test up
}

function require_built_images {
  if running_on_gh_actions; then
    get_ecr_login_credentials
  fi

  require_service_image "aoe-web-backend"
  require_service_image "aoe-web-frontend-ci"
  require_service_image "aoe-data-services"
  require_service_image "aoe-streaming-app"
  require_service_image "aoe-semantic-apis"
  require_service_image "aoe-data-analytics"
}

function main {
  echo "$repo"
  cd "$repo"
  use_correct_node_version
  require_command "docker"
  docker build -t playwright-image -f Dockerfile.playwright-test-runner .
  require_built_images
  start_services

  run_playwright_tests
  clean
}

function require_service_image {
  service=$1
  if running_on_gh_actions; then
    local img_tag="$github_registry${service}:${revision}"
    require_built_image "$img_tag"
  else
    local img_tag="${service}:latest"
    require_built_image "$img_tag"
  fi
}

main "$@"
