#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=./common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function main {
  wait_for_container_to_be_healthy aoe-web-backend

  $up_cmd aoe-data-services
}

main "$@"
