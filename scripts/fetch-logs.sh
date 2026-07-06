#!/usr/bin/env bash
# Fetch a single day of CloudWatch web-backend logs for an environment.
# Invoke via an env-specific symlink, NOT directly:
#   ./scripts/fetch-logs-qa.sh 2026-07-03
#   ./scripts/fetch-logs-prod.sh 2026-07-03 '"must be owner"'
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

LOG_GROUP="/service/web-backend"
TZ_OFFSET="+0300"   # Helsinki summer time; matches log timestamps

function initialize {
  require_docker
  parse_env_from_script_name "fetch-logs"
  require_aws_session_for_env "${ENV}"
}

function fetch_logs {
  local day="${1:?Usage: fetch-logs-<env>.sh YYYY-MM-DD [filter-pattern]}"
  local filter="${2:-}"
  local start next end out
  start=$(date -j -f "%Y-%m-%d %H:%M:%S %z" "$day 00:00:00 $TZ_OFFSET" +%s)000
  next=$(date -j -v+1d -f "%Y-%m-%d" "$day" +%Y-%m-%d)
  end=$(date -j -f "%Y-%m-%d %H:%M:%S %z" "$next 00:00:00 $TZ_OFFSET" +%s)000
  out="web-backend-${ENV}-${day}.log"

  local -a filter_args=()
  [[ -n "$filter" ]] && filter_args=(--filter-pattern "$filter")

  echo "Fetching $LOG_GROUP for $day on ${ENV} (${TZ_OFFSET})${filter:+ filter=$filter} -> $out"
  # JSON + jq so each line has a readable Helsinki timestamp, not raw epoch-millis.
  aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --start-time "$start" --end-time "$end" \
    ${filter_args[@]+"${filter_args[@]}"} \
    --output json \
  | TZ=Europe/Helsinki jq -r '.events[]
      | "\((.timestamp/1000|floor)|localtime|strftime("%Y-%m-%d %H:%M:%S"))\t\(.message)"' \
  > "$out"

  echo "Done: $(wc -l < "$out") lines in $out"
}

function main {
  initialize
  fetch_logs "$@"
}

main "$@"
