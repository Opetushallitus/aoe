#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=./common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function main {
  # wait_for_container_to_be_healthy aoe-oidc-server
  # wait_for_container_to_be_healthy aoe-postgres
  # wait_for_container_to_be_healthy kafka
  # wait_for_container_to_be_healthy kafka2
  # wait_for_container_to_be_healthy redis
  # wait_for_container_to_be_healthy opensearch
  $local_up_cmd aoe-web-backend
}

main "$@"
