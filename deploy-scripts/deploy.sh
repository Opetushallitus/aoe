#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

CDK_COMMAND="deploy"
[[ "${1:-}" == "--diff" ]] && CDK_COMMAND="diff"

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

  if [[ "$ENV" != "utility" ]]; then
    PAGERDUTY_EVENT_URL=$( get_secret "/pagerduty/event_url")
    export PAGERDUTY_EVENT_URL
  fi

  # AOE-97: Empty DocumentDB before source stacks remove their exports.
  # Remove after DocumentDB migration is complete in all envs.
  ./cdk.sh "$CDK_COMMAND" SecretManagerStack --exclusively --require-approval never "$@"
  ./cdk.sh "$CDK_COMMAND" AOEDocumentDB --exclusively --require-approval never "$@"
  ./cdk.sh "$CDK_COMMAND" SecurityGroupStack --exclusively --require-approval never "$@"
  ./cdk.sh "$CDK_COMMAND" KmsStack --exclusively --require-approval never "$@"

  ./cdk.sh "$CDK_COMMAND" --all --require-approval never --concurrency 10 "$@"
  popd
}

function diff {
  pushd "$repo"/aoe-infra
  ./cdk.sh diff
  popd
}

main
