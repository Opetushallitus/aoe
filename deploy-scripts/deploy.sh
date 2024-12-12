#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

ACTION=$1

function main {
  start_gh_actions_group "Setup"
  parse_env_from_script_name "..-deploy"
  use_correct_node_version
  end_gh_actions_group

  if [[ "$ACTION" == "diff" ]]; then
    start_gh_actions_group "Diff $ENV"
    diff
    end_gh_actions_group
  elif [[ "$ACTION" == "deploy" ]]; then
    start_gh_actions_group "Deploy $ENV"
    deploy
    end_gh_actions_group
  fi
}

function deploy {
  pushd "$repo"/aoe-infra/infra
  "./cdk.sh" deploy --all
  popd
}

function diff {
  pushd "$repo"/aoe-infra/infra
  "./cdk.sh" diff
  popd
}

main
