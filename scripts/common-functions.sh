#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# allow sourcing this file multiple times from different scripts
if [ -n "${COMMON_FUNCTIONS_SOURCED:-}" ]; then
  return
fi
readonly COMMON_FUNCTIONS_SOURCED="true"
readonly aws_cli_version="2.22.13"

# this BASH_SOURCE trick is to allow sourcing this file from zsh
set +o nounset
current_file=${BASH_SOURCE[0]:-$0}
set -o nounset

revision="${GITHUB_SHA:-$(git rev-parse HEAD)}"
readonly revision

repo="$( cd "$( dirname "$current_file" )" && cd .. && pwd )"
readonly repo

NODE_VERSION="$(cat "$repo/.nvmrc")" && readonly NODE_VERSION

local_compose="docker compose -f $repo/docker-compose.local-dev.yml"
readonly local_compose

local_up_cmd="$local_compose up --build --no-log-prefix"
readonly local_up_cmd

function docker_run_with_aws_env {
  docker run \
    --env AWS_PROFILE \
    --env AWS_REGION \
    --env AWS_DEFAULT_REGION \
    --env AWS_ACCESS_KEY_ID \
    --env AWS_SECRET_ACCESS_KEY \
    --env AWS_SESSION_TOKEN \
    --env BROWSER=/usr/bin/echo \
    --volume "$HOME/.aws:/root/.aws" \
    "$@"
}

function aws {
  docker_run_with_aws_env \
    --rm -i "amazon/aws-cli:$aws_cli_version" "$@"
}

function require_aws_session_for_env {
    local PROFILE="aoe-${1}"
    info "Verifying that AWS session has not expired"

    aws sts get-caller-identity --profile="${PROFILE}" 1>/dev/null || {
      info "Session is expired for profile ${PROFILE}"
      aws --profile "${PROFILE}" sso login --sso-session oph-federation --use-device-code | while read -r line; do echo $line; if echo $line | grep user_code; then open $line; fi; done
    }
    export AWS_PROFILE="${PROFILE}"
    export AWS_REGION="eu-west-1"
    info "Using AWS profile $AWS_PROFILE"
}

function use_correct_node_version {
  export NVM_DIR="${NVM_DIR:-$HOME/.cache/nvm}"
  set +o errexit
  source "$repo/scripts/nvm.sh"
  set -o errexit
  nvm use "$NODE_VERSION" || nvm install -b "$NODE_VERSION"
}

function npm_ci_if_package_lock_has_changed {
  info "Checking if npm ci needs to be run"
  require_command shasum
  local -r checksum_file=".package-lock.json.checksum"

  function run_npm_ci {
    npm ci
    shasum package-lock.json > "$checksum_file"
  }

  if [ ! -f "$checksum_file" ]; then
    echo "new package-lock.json; running npm ci"
    run_npm_ci
  elif ! shasum --check "$checksum_file"; then
    info "package-lock.json seems to have changed, running npm ci"
    run_npm_ci
  else
    info "package-lock.json doesn't seem to have changed, skipping npm ci"
  fi
}

function require_command {
  if ! command -v "$1" > /dev/null; then
    fatal "I require $1 but it's not installed. Aborting."
  fi
}

function require_docker {
  require_command docker
  docker ps > /dev/null 2>&1 || fatal "Running 'docker ps' failed. Is docker daemon running? Aborting."
}

function require_docker_compose {
  docker compose > /dev/null || fatal "docker compose missing"
}

function parse_env_from_script_name {
  local BASE_FILENAME="$1"
  FILE_NAME=$(basename "$0")
  if echo "${FILE_NAME}" | grep -E -q "$BASE_FILENAME-.([^-]+)\.sh"; then
    ENV=$(echo "${FILE_NAME}" | sed -E -e "s|$BASE_FILENAME-([^-]+)\.sh|\1|g")
    export ENV
    echo "Targeting environment [${ENV}]"
  else
    echo >&2 "Don't call this script directly"
    exit 1
  fi
}

CURRENT_GROUP=""
GROUP_START_TIME=0
function start_gh_actions_group {
  local group_title="$1"
  GROUP_START_TIME=$(date +%s)
  CURRENT_GROUP="$group_title"

  if [ "${GITHUB_ACTIONS:-}" == "true" ]; then
    echo "::group::$group_title"
  fi
}

function end_gh_actions_group {
  if [ "${GITHUB_ACTIONS:-}" == "true" ]; then
    echo "::endgroup::"
  fi
  END_TIME=$(date +%s)
  info "$CURRENT_GROUP took $(( END_TIME - GROUP_START_TIME )) seconds"
}

function running_on_gh_actions {
  [ "${GITHUB_ACTIONS:-}" == "true" ]
}

function info {
  log "INFO" "$1"
}

function fatal {
  log "ERROR" "$1"
  exit 1
}

function log {
  local -r level="$1"
  local -r message="$2"
  local -r timestamp=$(date +"%Y-%m-%d %H:%M:%S")

  >&2 echo -e "${timestamp} ${level} ${message}"
}

function get_secret {
  local name="$1"
  aws secretsmanager get-secret-value --secret-id "$name" --query "SecretString" --output text
}


function wait_for_container_to_be_healthy {
  require_command docker
  local -r container_name="$1"

  info "Waiting for docker container $container_name to be healthy"
  until [ "$(docker inspect -f "{{.State.Health.Status}}" "$container_name" 2>/dev/null || echo "not-running")" == "healthy" ]; do

    sleep 2;
  done;
}
