#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# allow sourcing this file multiple times from different scripts
if [ -n "${DEPLOY_FUNCTIONS_SOURCED:-}" ]; then
  return
fi
readonly DEPLOY_FUNCTIONS_SOURCED="true"

# shellcheck source=./common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../scripts/common-functions.sh"

readonly github_registry="ghcr.io/opetushallitus/"

readonly deploy_dist_dir="$repo/deploy-scripts/dist/"
mkdir -p "$deploy_dist_dir"

function image_exists_locally {
  local tag="$1"
  docker image inspect "$tag" &> /dev/null
}

function require_built_image {
  local tag="$1"
  if image_exists_locally "${tag}"; then
    info "${tag} already exists locally"
  else
    info "Pulling ${tag} because it does not exist locally"
    docker pull "${tag}"
  fi
}

function upload_image_to_ecr {
  local github_image_tag="$1"
  local ecr_image_tag="$2"

  start_gh_actions_group "Uploading image to util account"

  require_built_image "$github_image_tag"
  docker tag "${github_image_tag}" "${ecr_image_tag}"
  docker push "${ecr_image_tag}"

  end_gh_actions_group
}


function get_ecr_login_credentials() {
  if [[ "${CI:-}" = "true" ]]; then
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$REGISTRY"
  fi
}
