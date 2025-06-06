#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/common-functions.sh"

# shellcheck source=./deploy-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../deploy-scripts/deploy-functions.sh"
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/build-functions.sh"


function main {
  local aoe_service_name="aoe-web-backend"
  local service_image_tag="AOE_WEB_BACKEND_TAG"

  cd "$repo"

  buildService "$aoe_service_name" "$service_image_tag"
}

main


