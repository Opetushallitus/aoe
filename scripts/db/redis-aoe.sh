#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

readonly REDIS_IMAGE="redis:6.2.24-alpine@sha256:b362b5dff9d14d961dc3352db4776aba6a8c53ca2661d7c74ad2c121f82cdaea"
readonly TUNNEL_COMPOSE_FILE="${repo}/scripts/db/docker-compose-redis.yml"

function main {
  initialize
  start_redis_tunnel
  trap stop_redis_tunnel EXIT
  wait_for_redis
  redis_cli "$@"
}

function initialize {
  require_docker
  require_docker_compose
  require_command aws
  require_command jq
  parse_env_from_script_name "redis-aoe"
  require_aws_session_for_env "${ENV}"

  REDIS_ENDPOINT=$(aws elasticache describe-serverless-caches \
    --serverless-cache-name semantic-apis \
    --query "ServerlessCaches[0].Endpoint.Address" \
    --output text)
  REDISCLI_AUTH=$(aws secretsmanager get-secret-value \
    --secret-id "/service/semantic-apis/REDIS_PASS" \
    --query "SecretString" \
    --output text | jq -r ".secretkey")
  export REDIS_ENDPOINT
  export REDISCLI_AUTH
}

function start_redis_tunnel {
  info "Creating tunnel to Redis ${REDIS_ENDPOINT} on env [${ENV}]"
  docker compose -f "${TUNNEL_COMPOSE_FILE}" up --build --detach --wait || {
    docker compose -f "${TUNNEL_COMPOSE_FILE}" logs
    fatal "Starting the Redis tunnel failed"
  }
}

function stop_redis_tunnel {
  info "Stopping tunnel..."
  docker compose -f "${TUNNEL_COMPOSE_FILE}" down
}

function wait_for_redis {
  info "Waiting for Redis to answer..."
  until redis_cli PING 2>/dev/null | grep -q PONG; do
    sleep 2
  done
}

function redis_cli {
  local -a tty_args=()
  [[ -t 0 && -t 1 ]] && tty_args=(--tty)

  docker run --rm --interactive ${tty_args[@]+"${tty_args[@]}"} \
    --network redis-tunnel \
    --env REDISCLI_AUTH \
    "${REDIS_IMAGE}" \
    redis-cli -h redis-tunnel -p 6379 --tls --sni "${REDIS_ENDPOINT}" --user app "$@"
}

main "$@"
