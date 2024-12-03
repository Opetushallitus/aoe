#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/common-functions.sh"

function main {
  local aoe_service_name="aoe-web-frontend"
  local service_image_tag="AOE_WEB_FRONTEND_TAG"

  cd "$repo/aoe-web-frontend"

  npm install
  npm run build-prod
}

main


