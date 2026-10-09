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
utility_account_id="$(jq -r '.utility.id' "$repo/aoe-infra/lib/accounts.json")"
readonly utility_account_id

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

function tag_deployed_images {
  local -r green_tag="green-${ENV}"

  local repository
  for repository in "$@"; do
    local already_tagged
    already_tagged=$(aws ecr describe-images \
      --registry-id "${utility_account_id}" \
      --repository-name "${repository}" \
      --image-ids imageTag="${revision}" \
      --query "contains(imageDetails[0].imageTags, '${green_tag}')" \
      --output text)

    if [[ "${already_tagged}" == "True" ]]; then
      info "${repository}:${revision} is already ${green_tag}"
    else
      local image
      image=$(aws ecr batch-get-image \
        --registry-id "${utility_account_id}" \
        --repository-name "${repository}" \
        --image-ids imageTag="${revision}" \
        --query 'images[0]' \
        --output json)
      local manifest
      manifest=$(jq -er '.imageManifest' <<< "${image}")
      local media_type
      media_type=$(jq -er '.imageManifestMediaType' <<< "${image}")
      aws ecr put-image \
        --registry-id "${utility_account_id}" \
        --repository-name "${repository}" \
        --image-tag "${green_tag}" \
        --image-manifest "${manifest}" \
        --image-manifest-media-type "${media_type}" > /dev/null
      info "Tagged ${repository}:${revision} as ${green_tag}"
    fi
  done
}


function get_ecr_login_credentials() {
  if [[ "${CI:-}" = "true" ]]; then
    export AWS_REGION=${AWS_REGION:-"eu-west-1"}
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text) || {
        fatal "Could not check that AWS credentials are working."
    }

    export REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$REGISTRY"
  fi
  export AWS_DEFAULT_REGION="$AWS_REGION"
  echo "Constructed registry: $REGISTRY"
}
