#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../scripts/common-functions.sh"

# shellcheck source=./deploy-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../../deploy-scripts/deploy-functions.sh"

function main() {
  setup

  local aoe_service_name="aoe-semantic-apis"
  local github_image_tag="$github_registry${aoe_service_name}:${IMAGE_TAG}"

  local ecr_registry="${REGISTRY}/$aoe_service_name"
  local ecr_image_tag="${ecr_registry}:${IMAGE_TAG}"
  upload_image_to_ecr "$github_image_tag" "$ecr_image_tag"
}

function setup() {
  cd "${repo}"
  require_command docker
  require_docker_compose
  configure_aws_credentials
  get_ecr_login_credentials
}


main "$@"
