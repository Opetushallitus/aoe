#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

function main {
  use_correct_node_version

  npm_ci_if_package_lock_has_changed

  npm run prettier-check
  npx --no playwright install --with-deps chromium
  npx --no playwright test "$@"
}

main "$@"
