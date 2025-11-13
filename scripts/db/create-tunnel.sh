#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/common-functions.sh"

function main {
  SSH_TUNNEL_PORT=40077

  function start_db_tunnel {
    docker-compose -f "${repo}/scripts/db/docker-compose.yml" up --build || {
      docker-compose -f "${repo}/scripts/db/docker-compose.yml" logs && exit 1
    }
  }

  function stop_db_tunnel {
    docker-compose -f "${repo}/scripts/db/docker-compose.yml" down
  }

  ENV="qa"
  require_aws_session_for_env "$ENV"
  echo "Creating tunnel to DB on env [${ENV}]"
  echo "Use port ${SSH_TUNNEL_PORT} on host machine for tunnel access"

  start_db_tunnel
  trap stop_db_tunnel EXIT
}

main "$@"
