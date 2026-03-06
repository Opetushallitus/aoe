#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function main {
    pushd "$repo"
    use_correct_node_version
    npm_ci_if_package_lock_has_changed
    npm run fix-lint
    popd
}

main "$@"
