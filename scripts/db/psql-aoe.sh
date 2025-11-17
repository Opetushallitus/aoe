#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

# shellcheck source=scripts/db/create-tunnel.sh
source "$repo/scripts/db/create-tunnel.sh"
# shellcheck source=scripts/db/pg-functions.sh
source "$repo/scripts/db/pg-functions.sh"

function initialize {
  require_command psql
  assert_psqlrc
  parse_env_from_script_name "psql-aoe"
  require_aws_session_for_env ${ENV}
  initialize_pg_credentials
}

function connect_psql {
  echo "Connecting to DB 'aoe' on ${ENV}"
  echo $USERNAME
  echo $PGPASSWORD
  psql -h 127.0.0.1 -p "${SSH_TUNNEL_PORT}" -U "${USERNAME}" -d "aoe"
}

function main {
  initialize
  create_tunnel
  connect_psql
}

main "$@"

