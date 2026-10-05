#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

CDK_COMMAND="deploy"
[[ "${1:-}" == "--diff" ]] && CDK_COMMAND="diff"
[[ "${1:-}" == "--diagnose" ]] && CDK_COMMAND="diagnose"
if [[ "${1:-}" == "--destroy" ]]; then
  CDK_COMMAND="destroy"
  STACK="${2:-}"
  [[ -n "$STACK" ]] || { echo "Usage: --destroy <StackName>"; exit 1; }
fi
if [[ "${1:-}" == "--direct" ]]; then
  CDK_COMMAND="direct"
  STACK="${2:-}"
  [[ -n "$STACK" ]] || { echo "Usage: --direct <StackName>"; exit 1; }
fi

function main {
  start_gh_actions_group "Setup"
  parse_env_from_script_name "..-deploy"
  use_correct_node_version
  end_gh_actions_group

  if [[ "$ENV" != "utility" && "$CDK_COMMAND" != "destroy" && "$CDK_COMMAND" != "diagnose" ]]; then
    build_frontend
  fi

  start_gh_actions_group "Deploy $ENV"
  if ! running_on_gh_actions; then
    require_aws_session_for_env "$ENV"
    deploy --profile "aoe-$ENV"
  else
    deploy
  fi
  end_gh_actions_group

}

function build_frontend {
  start_gh_actions_group "Build frontend"
  pushd "$repo"/aoe-web-frontend
  npm_ci_if_package_lock_has_changed
  npm run build
  popd
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
      running_on_gh_actions && { echo "Destroy is not allowed in CI."; exit 1; }
      read -r -p "Destroy $STACK in $ENV? [y/N] " confirm
      [[ "$confirm" =~ ^[yY]$ ]] || { echo "Aborted."; exit 1; }
      ./cdk.sh destroy "$STACK" --exclusively "$@"
      ;;
    diff)
      ./cdk.sh diff "$@"
      ;;
    diagnose)
      ./cdk.sh diagnose --unstable=diagnose "$@"
      ;;
    direct)
      running_on_gh_actions && { echo "Direct deploy is not allowed in CI."; exit 1; }
      ./cdk.sh deploy "$STACK" --require-approval never --method=direct "$@"
      ;;
    deploy)
      ./cdk.sh deploy --all --require-approval never --concurrency 10 "$@"
      ;;
    *)
      echo "Unknown command"
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
