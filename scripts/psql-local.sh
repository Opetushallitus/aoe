#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function main {
  require_docker
  local container_name
  container_name="$($local_compose ps --quiet aoe-postgres)"

  docker exec -it  "$container_name" psql postgres://aoeuser:aoepassword@localhost/aoe "$@"
}

main "$@"
