#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

# shellcheck source=./deploy-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/deploy-functions.sh"

function main {
    echo "$repo"
    cd "$repo"
    use_correct_node_version

    runLint "aoe-semantic-apis"
    runLint "aoe-web-frontend"
    runLint "aoe-web-backend"
    runLint "aoe-streaming-app"
    runLint "aoe-infra"
}

function runLint {
    local repository=$1
    start_gh_actions_group "$repository"
    pushd "$repository"
    npm_ci_if_package_lock_has_changed
    npm run lint
    popd
    end_gh_actions_group
}

main "$@"
