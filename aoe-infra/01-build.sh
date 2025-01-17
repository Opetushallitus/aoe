#!/bin/bash
set -o errexit -o nounset -o pipefail

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

main() {
    cd "$repo/aoe-infra"

    start_gh_actions_group "Build aoe-infra CDK"

    use_correct_node_version
    npm_ci_if_package_lock_has_changed
    npm run build

    end_gh_actions_group
}

main
