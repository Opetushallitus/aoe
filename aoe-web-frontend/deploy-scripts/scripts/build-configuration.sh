#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../../scripts/common-functions.sh"

# shellcheck source=./deploy-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../../deploy-scripts/deploy-functions.sh"
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../../scripts/build-functions.sh"

function main {
  local aoe_service_name="aoe-web-frontend"
  local service_image_tag="AOE_WEB_FRONTEND_TAG"

  configuration=${1:-none}
  case $configuration in
  "dev" | "qa" | "prod" | "ci")
    echo "Building for configuration ${configuration}"
    ;;
  *)
    echo "Configuration parameter is not correct (got configuration=$configuration)"
    exit 1
    ;;
  esac

  cd "$repo"

  buildService "$aoe_service_name-${configuration}" "$service_image_tag"
}

main "$1"


