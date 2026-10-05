#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../scripts/common-functions.sh"

function main {
  use_correct_node_version
  pushd "$repo/aoe-web-backend"
  npm_ci_if_package_lock_has_changed
  npm test
  popd
}

main "$@"
