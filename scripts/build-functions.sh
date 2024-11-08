#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

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
  local tag_name

  local image_tag="$github_registry${service}:${revision}"

  local tags_to_push=()

  start_gh_actions_group "Building service $service with tag $image_tag"

  if ! running_on_gh_actions; then
    tag_name="${service}:latest"
  else
    tag_name="$image_tag"
  fi

  eval "${compose_tag}='${tag_name}'"
  export "${compose_tag}"
  docker compose build "$service"
  tags_to_push+=("$image_tag")

  end_gh_actions_group

  if [ -n "${GITHUB_REF_NAME:-}" ]; then
    # Github refs often have slashes, which are not allowed in tag names
    # https://github.com/opencontainers/distribution-spec/blob/main/spec.md#pulling-manifests
    readonly clean_ref_name="${GITHUB_REF_NAME//[!a-zA-Z0-9._-]/-}"
    readonly ref_tag="$github_registry${service}:$clean_ref_name"
    info "Tagging as $ref_tag"
    docker tag "$image_tag" "$ref_tag"
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