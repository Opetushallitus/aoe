#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../scripts/common-functions.sh"
#
# shellcheck source=./deploy-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-functions.sh"

trap clean EXIT

compose="docker compose -p aoe_ci -f docker-compose.ci-playwright.yml"

export TRUST_STORE_PASSWORD=ci-super-secret

readonly compose

function clean {
  $compose down
}

function run_playwright_tests {
  $compose up --abort-on-container-exit --quiet-pull --exit-code-from test-runner
}

function main {
  echo "$repo"
  cd "$repo"
  use_correct_node_version
  require_command "docker"

  if running_on_gh_actions; then
    export AOE_WEB_BACKEND_TAG="${github_registry}aoe-web-backend:${revision}"
    export AOE_DATA_SERVICES_TAG="${github_registry}aoe-data-services:${revision}"
    export AOE_WEB_FRONTEND_TAG="${github_registry}aoe-web-frontend:${revision}"
    export AOE_STREAMING_APP_TAG="${github_registry}aoe-streaming-app:${revision}"
    export AOE_SEMANTIC_APIS_TAG="${github_registry}aoe-semantic-apis:${revision}"
    export AOE_DATA_ANALYTICS_TAG="${github_registry}aoe-data-analytics:${revision}"
  fi

  run_playwright_tests
}

main "$@"
