#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

function main {
    pushd "$repo"
    use_correct_node_version

    runPrettier "aoe-semantic-apis"
    runPrettier "aoe-web-frontend"
    runPrettier "aoe-web-backend"
    runPrettier "aoe-streaming-app"
    runPrettier "aoe-infra"
    popd
}

function runPrettier {
    local repository=$1
    start_gh_actions_group "prettfy $repository"
    pushd "$repository"
    npm_ci_if_package_lock_has_changed
    npx prettier -w ./
    popd
    end_gh_actions_group
}

main "$@"
