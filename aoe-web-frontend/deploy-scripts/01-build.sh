#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/common-functions.sh"

# shellcheck source=./deploy-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../deploy-scripts/deploy-functions.sh"
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/build-functions.sh"

function main {
  local aoe_service_name="aoe-web-frontend"
  local service_image_tag="AOE_WEB_FRONTEND_TAG"

  cd "$repo"

  FRONTEND_ENVIRONMENT=dev buildService "$aoe_service_name-dev" "$service_image_tag"
  FRONTEND_ENVIRONMENT=qa buildService "$aoe_service_name-qa" "$service_image_tag"
  FRONTEND_ENVIRONMENT=prod buildService "$aoe_service_name-prod" "$service_image_tag"
}

main


