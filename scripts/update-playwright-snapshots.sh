#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=../scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

# Generates missing Linux screenshot baselines with the CI Playwright stack. Existing baselines are not touched.
# Usage: scripts/update-playwright-snapshots.sh [playwright args, e.g. tests/h5p.spec.ts]

function main {
  require_docker
  use_correct_node_version
  # The CI stack reuses the local stack's container names and ports.
  if [ -n "$(docker ps --quiet --filter label=com.docker.compose.project=aoe-local)" ]; then
    fatal "Local stack is running; stop it first: docker compose -p aoe-local down"
  fi
  override="$(mktemp)"
  readonly override
  compose="docker compose -p aoe_ci -f ${repo}/docker-compose.ci-playwright.yml -f ${override}"
  readonly compose
  trap cleanup EXIT

  write_override
  build_frontend
  info "Generating missing screenshot baselines"
  ${compose} run --rm --build --volume "${repo}/playwright/tests:/tests" test-runner -- --update-snapshots=missing "$@"
}

function write_override {
  # Fresh database so local dev data is not used.
  cat > "${override}" <<EOF
services:
  aoe-postgres:
    volumes: !override
      - ${repo}/docker/init-scripts/aoe-init.sql:/docker-entrypoint-initdb.d/1-init.sql
      - ${repo}/docker/init-scripts/aoe-user.sql:/docker-entrypoint-initdb.d/2-init.sql
    tmpfs:
      - /var/lib/postgresql/data
EOF
}

function cleanup {
  ${compose} down
  rm -f "${override}"
  git -C "${repo}" status --short -- 'playwright/tests/*-snapshots/*-linux.png'
}

main "$@"
