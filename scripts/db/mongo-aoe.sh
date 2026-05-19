#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

# shellcheck source=scripts/db/create-mongo-tunnel.sh
source "$repo/scripts/db/create-mongo-tunnel.sh"
# shellcheck source=scripts/db/mongo-functions.sh
source "$repo/scripts/db/mongo-functions.sh"

function initialize {
  require_command docker
  parse_env_from_script_name "mongo-aoe"
  require_aws_session_for_env "${ENV}"
  initialize_docdb_credentials
  ensure_docdb_ca_bundle
}

function connect_mongo {
  info "Connecting to DocumentDB 'aoe' on ${ENV}"
  docker run --rm -it \
    --network "${MONGO_TUNNEL_NETWORK}" \
    --volume "${repo}/scripts/db/global-bundle.pem:/certs/global-bundle.pem:ro" \
    mongo:4.4 \
    mongo \
      --host mongo-tunnel \
      --port 27017 \
      --username "${DOCDB_USERNAME}" \
      --password "${DOCDB_PASSWORD}" \
      --authenticationMechanism SCRAM-SHA-1 \
      --tls \
      --tlsCAFile /certs/global-bundle.pem \
      --tlsAllowInvalidHostnames
}

function main {
  initialize
  create_mongo_tunnel
  connect_mongo
}

main "$@"
