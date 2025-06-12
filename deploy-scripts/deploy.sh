#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

function main {
  start_gh_actions_group "Setup"
  parse_env_from_script_name "..-deploy"
  use_correct_node_version
  end_gh_actions_group

  start_gh_actions_group "Deploy $ENV"
  if ! running_on_gh_actions; then
    require_aws_session_for_env "$ENV"
    deploy --profile "aoe-$ENV"
  else 
    deploy
  fi
  end_gh_actions_group

}

function deploy {
  pushd "$repo"/aoe-infra

  PAGERDUTY_EVENT_URL=$( get_secret "/pagerduty/event_url")
  export PAGERDUTY_EVENT_URL

  ./cdk.sh deploy --all "$@" 
  popd
}

function diff {
  pushd "$repo"/aoe-infra
  ./cdk.sh diff
  popd
}

main
