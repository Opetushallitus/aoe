#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/scripts/common-functions.sh"

trap clean EXIT

readonly RESULTS_DIR="$repo/playwright/playwright-results"
compose="docker compose -f ./docker-compose.yml"
compose="$compose -f ./docker-compose.local-dev.yml"
compose="$compose -f ./docker-compose-playwright.yml"

function clean {
  $compose down
}

function main {
  require_command docker
  require_docker_compose

  mkdir -p "$RESULTS_DIR"

  start_gh_actions_group "Pull and build images required for playwright tests"
  $compose create --build -- playwright aoe-web-frontend aoe-web-backend aoe-data-analytics aoe-semantic-apis aoe-data-services aoe-streaming-app aoe-oidc-server localstack redis mongo postgres zookeeper kafka kafka2 elasticsearch nginx
  end_gh_actions_group

  start_gh_actions_group "Start services"
  $compose up --no-build --wait aoe-web-frontend aoe-semantic-apis aoe-streaming-app aoe-data-analytics
  end_gh_actions_group

  wait_for_container_to_be_healthy "aoe-web-backend"
  wait_for_container_to_be_healthy "aoe-semantic-apis"

  $compose up --no-build --wait nginx

  $compose run --rm playwright

  "$@"

  end_gh_actions_group

  clean
}

main "$@"
