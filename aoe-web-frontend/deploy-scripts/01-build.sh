#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

build_command="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts/build-configuration.sh"

function main {
  ${build_command} dev
  ${build_command} qa
  ${build_command} prod
  ${build_command} ci
}

main
