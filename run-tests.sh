#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/scripts/common-functions.sh"

function run_unit_tests {
  pushd "$repo/aoe-semantic-apis"
  npm_ci_if_package_lock_has_changed
  npm test
  popd
}

function main {
  use_correct_node_version

  run_unit_tests

  pushd $repo/playwright
  npm_ci_if_package_lock_has_changed
  npx --no playwright install --with-deps chromium
  npx --no playwright test "$@"
  popd
}

main "$@"
