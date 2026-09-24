#!/usr/bin/env bash
# Fetch ALB access logs from S3 for an environment. Times are UTC, as in the ALB log keys.
# Invoke via an env-specific symlink, NOT directly:
#   ./scripts/fetch-alb-logs-prod.sh 2026-09-24        # whole day
#   ./scripts/fetch-alb-logs-prod.sh 2026-09-24 09     # only 09:00-09:59 UTC
# Writes alb-<env>-<day>[-<hour>].log and a -5xx.log subset of it.
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function initialize {
  require_docker
  require_command gunzip
  parse_env_from_script_name "fetch-alb-logs"
  require_aws_session_for_env "${ENV}"
}

function fetch_alb_logs {
  local -r day="${1:?Usage: fetch-alb-logs-<env>.sh YYYY-MM-DD [HH]}"
  local -r hour="${2:-}"
  local account out tmp
  account=$(aws sts get-caller-identity --query Account --output text | tr -d '\r')
  out="alb-${ENV}-${day}${hour:+-$hour}.log"
  tmp=$(mktemp -d)
  # shellcheck disable=SC2064 # expand now: tmp is local and gone by the time EXIT fires
  trap "rm -rf '${tmp}'" EXIT

  local -r prefix="s3://aoe-alb-logs-${ENV}/AWSLogs/${account}/elasticloadbalancing/eu-west-1/${day//-//}/"
  info "Downloading ${prefix}${hour:+ hour ${hour} UTC} -> ${out}"
  # Not the aws function: the container needs the download dir mounted.
  docker_run_with_aws_env --rm --volume "${tmp}:/out" "amazon/aws-cli:${aws_cli_version}" \
    s3 cp --recursive --only-show-errors \
    --exclude "*" --include "*_${day//-/}T${hour}*.log.gz" \
    "${prefix}" /out

  # ALB log lines start with their ISO timestamp, so a plain sort orders them.
  find "${tmp}" -name "*.log.gz" -exec gunzip -c {} + | sort -k2,2 > "${out}"
  # Field 9 is elb_status_code; a target_status_code (field 10) of "-" means the ALB itself answered.
  awk '$9 ~ /^5/' "${out}" > "${out%.log}-5xx.log"

  info "Done: $(wc -l < "${out}") lines in ${out}, $(wc -l < "${out%.log}-5xx.log") 5xx in ${out%.log}-5xx.log"
}

function main {
  initialize
  fetch_alb_logs "$@"
}

main "$@"
