#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

readonly compose="docker compose -f docker-compose.local-dev.yml"
function main {
  require_docker
  local container_name
  container_name="$($compose ps --quiet postgres)"

  docker exec -it  "$container_name" psql postgres://aoeuser:aoepassword@localhost/aoe
}

main "$@"
