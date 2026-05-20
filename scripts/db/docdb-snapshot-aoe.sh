#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

function initialize {
  require_command docker
  parse_env_from_script_name "docdb-snapshot-aoe"
  require_aws_session_for_env "${ENV}"
}

function create_snapshot {
  local snapshot_id="${1:-aoe-docdb-analytics-${ENV}-$(date +%Y%m%d-%H%M%S)}"

  info "Looking up DocumentDB cluster ID from CloudFormation stack AOEDocumentDB on ${ENV}"

  local cluster_id
  cluster_id=$(aws cloudformation describe-stack-resources \
    --stack-name AOEDocumentDB \
    --query "StackResources[?ResourceType=='AWS::DocDB::DBCluster'].PhysicalResourceId" \
    --output text)

  if [ "${1:-}" = "" ]; then
    info "Creating snapshot '${snapshot_id}' for cluster '${cluster_id}'"
    aws docdb create-db-cluster-snapshot \
      --db-cluster-identifier "${cluster_id}" \
      --db-cluster-snapshot-identifier "${snapshot_id}"
  else
    info "Waiting for existing snapshot '${snapshot_id}'"
  fi

  info "Waiting for snapshot to become available (this may take several minutes)..."

  while true; do
    local status
    status=$(aws docdb describe-db-cluster-snapshots \
      --db-cluster-snapshot-identifier "${snapshot_id}" \
      --query "DBClusterSnapshots[0].Status" \
      --output text)
    info "Snapshot status: ${status}"
    if [ "${status}" = "available" ]; then
      break
    fi
    sleep 30
  done

  info "Snapshot complete: ${snapshot_id}"
}

function main {
  initialize
  create_snapshot "${1:-}"
}

main "$@"
