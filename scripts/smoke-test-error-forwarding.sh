#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=./common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function main {
  ENV="${1:-${ENV:-dev}}"
  export ENV

  case "$ENV" in
    dev|qa|prod) ;;
    *) fatal "ENV must be one of dev, qa or prod" ;;
  esac

  require_aws_session_for_env "$ENV"

  local smoke_id
  smoke_id="error-forwarding-smoke-$(date +%s)"

  local log_group_name
  log_group_name="${LOG_GROUP_NAME:-/service/web-backend}"

  info "Putting CloudWatch Logs error event into ${log_group_name}"
  # put_error_log_event "$log_group_name" "$smoke_id"

  info "Triggering deployed web-backend error alarm for PagerDuty"
  trigger_web_backend_error_alarm "$smoke_id"

  info "Smoke test events sent. Slack should receive the Lambda-formatted error; PagerDuty should receive the web-backend error alarm notification."
}

function put_error_log_event {
  local log_group_name="$1"
  local smoke_id="$2"
  local created_at
  created_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  local timestamp_ms
  timestamp_ms="$(date +%s)000"

  local log_stream_name
  log_stream_name="${LOG_STREAM_NAME:-error-forwarding-smoke-${smoke_id}}"

  aws logs create-log-stream \
    --log-group-name "$log_group_name" \
    --log-stream-name "$log_stream_name"

  local log_message
  log_message="$(cat <<EOF
{
  "level": "error",
  "message": "Smoke test ${smoke_id}: CloudWatch Logs to Lambda to Slack",
  "method": "GET",
  "url": "/smoke-test/error-forwarding",
  "requestId": "${smoke_id}",
  "stack": "Error: Smoke test ${smoke_id}\\n    at smoke-test-error-forwarding.sh (${created_at})"
}
EOF
)"

  local log_events
  log_events="$(jq -n \
    --argjson timestamp "$timestamp_ms" \
    --arg message "$log_message" \
    '[{timestamp: $timestamp, message: $message}]')"

  aws logs put-log-events \
    --log-group-name "$log_group_name" \
    --log-stream-name "$log_stream_name" \
    --log-events "$log_events"
}

function trigger_web_backend_error_alarm {
  local smoke_id="$1"
  local alarm_name
  alarm_name="${ALARM_NAME:-$(get_web_backend_error_alarm_name)}"

  if [ "$alarm_name" == "None" ] || [ -z "$alarm_name" ]; then
    fatal "Could not find web-backend ErrorCount alarm for ${ENV}"
  fi

  info "Using CloudWatch alarm ${alarm_name}"

  aws cloudwatch set-alarm-state \
    --alarm-name "$alarm_name" \
    --state-value INSUFFICIENT_DATA \
    --state-reason "Preparing smoke test ${smoke_id}"

  sleep 1

  aws cloudwatch set-alarm-state \
    --alarm-name "$alarm_name" \
    --state-value ALARM \
    --state-reason "Smoke test ${smoke_id}: synthetic web-backend error alarm state change."
}

function get_web_backend_error_alarm_name {
  aws cloudwatch describe-alarms-for-metric \
    --namespace "AOE/WebBackend/${ENV}" \
    --metric-name "ErrorCount" \
    --query "MetricAlarms[0].AlarmName" \
    --output text
}

main "$@"
