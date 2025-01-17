#!/bin/bash

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

main() {
    use_correct_node_version
    npm_ci_if_package_lock_has_changed
    npx cdk --context environment="$ENV" --context UTILITY_ACCOUNT_ID="$UTILITY_ACCOUNT_ID" "$@"
}

main "$@"
