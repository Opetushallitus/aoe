#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=./common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

# shellcheck source=../deploy-scripts/deploy-functions.sh
source "$repo/deploy-scripts/deploy-functions.sh"

# allow sourcing this file multiple times from different scripts
if [ -n "${BUILD_FUNCTIONS_SOURCED:-}" ]; then
  return
fi
readonly BUILD_FUNCTIONS_SOURCED="true"

function buildService {
  cd "$repo"

  require_command docker

  local service=$1
  local compose_tag=$2
  local tag_value

  local img_tag="$github_registry${service}:${revision}"

  local tags_to_push=()

  start_gh_actions_group "Building service $service with tag $img_tag"

  if ! running_on_gh_actions; then
    tag_value="${service}:latest"
  else
    tag_value="$img_tag"
  fi

  eval "${compose_tag}='${tag_value}'"
  export "${compose_tag}"
  docker compose build "$service"
  tags_to_push+=("$img_tag")

  end_gh_actions_group

  if [ -n "${GITHUB_REF_NAME:-}" ]; then
    # Github refs often have slashes, which are not allowed in tag names
    # https://github.com/opencontainers/distribution-spec/blob/main/spec.md#pulling-manifests
    readonly clean_ref_name="${GITHUB_REF_NAME//[!a-zA-Z0-9._-]/-}"
    readonly ref_tag="$github_registry${service}:$clean_ref_name"
    info "Tagging as $ref_tag"
    docker tag "$img_tag" "$ref_tag"
    tags_to_push+=("$ref_tag")
  fi

  if running_on_gh_actions; then
    start_gh_actions_group "Pushing tags"
    for tag in "${tags_to_push[@]}"
    do
      info "docker push $tag"
      docker push "$tag"
    done
    end_gh_actions_group
  else
    info "Not pushing tags when running locally"
  fi

}
