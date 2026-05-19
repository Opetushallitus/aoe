#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

function create_mongo_tunnel {
  assert_env_var_is_set "ENV"
  assert_env_var_is_set "DOCDB_USERNAME"
  assert_env_var_is_set "DOCDB_PASSWORD"

  export MONGO_TUNNEL_NETWORK=mongo-tunnel

  function start_mongo_tunnel {
    docker-compose -f "${repo}/scripts/db/docker-compose-mongo.yml" up --build --detach --wait || {
      docker-compose -f "${repo}/scripts/db/docker-compose-mongo.yml" logs && exit 1
    }
    docker compose -f "${repo}/scripts/db/docker-compose-mongo.yml" logs
  }

  function stop_mongo_tunnel {
    echo "Stopping tunnel..."
    docker-compose -f "${repo}/scripts/db/docker-compose-mongo.yml" down
  }

  require_aws_session_for_env "$ENV"
  info "Creating tunnel to DocumentDB on env [${ENV}]"

  start_mongo_tunnel
  trap stop_mongo_tunnel EXIT
}
