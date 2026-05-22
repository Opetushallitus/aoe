#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

CDK_COMMAND="deploy"
[[ "${1:-}" == "--diff" ]] && CDK_COMMAND="diff"
if [[ "${1:-}" == "--destroy" ]]; then
  CDK_COMMAND="destroy"
  STACK="${2:-}"
  [[ -n "$STACK" ]] || { echo "Usage: --destroy <StackName>"; exit 1; }
fi

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

  case "$CDK_COMMAND" in
    destroy)
      read -r -p "Destroy $STACK in $ENV? [y/N] " confirm
      [[ "$confirm" =~ ^[yY]$ ]] || { echo "Aborted."; exit 1; }
      ./cdk.sh destroy "$STACK" "$@"
      ;;
    *)
      if [[ "$ENV" != "utility" ]]; then
        ./cdk.sh "$CDK_COMMAND" AOEDocumentDB --exclusively --require-approval never "$@"
        ./cdk.sh "$CDK_COMMAND" AOEMskKafka --exclusively --require-approval never "$@"
        ./cdk.sh "$CDK_COMMAND" DataAnalyticsEcsService --exclusively --require-approval never "$@"
        ./cdk.sh "$CDK_COMMAND" SecurityGroupStack --exclusively --require-approval never "$@"
        ./cdk.sh "$CDK_COMMAND" KmsStack --exclusively --require-approval never "$@"
        ./cdk.sh "$CDK_COMMAND" SecretManagerStack --exclusively --require-approval never "$@"
      fi
      ./cdk.sh "$CDK_COMMAND" --all --require-approval never --concurrency 10 "$@"
      ;;
  esac
  popd
}

function diff {
  pushd "$repo"/aoe-infra
  ./cdk.sh diff
  popd
}

main
