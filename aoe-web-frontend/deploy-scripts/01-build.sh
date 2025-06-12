#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/common-functions.sh"

# shellcheck source=../../scripts/build-functions.sh
source "$repo/scripts/build-functions.sh"

function main {
  local aoe_service_name="aoe-web-frontend"
  local service_image_tag="AOE_WEB_FRONTEND_TAG"

  cd "$repo"

  buildService "$aoe_service_name" "$service_image_tag"
}

main
