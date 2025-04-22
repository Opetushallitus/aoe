#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

push_command="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/scripts/push-image.sh"

function main {
  ${push_command} dev
  ${push_command} qa
  ${push_command} prod
  ${push_command} ci
}

main
