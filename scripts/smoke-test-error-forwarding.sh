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

  local account_id
  account_id="$(aws sts get-caller-identity --query Account --output text)"

  local topic_arn
  topic_arn="${TOPIC_ARN:-arn:aws:sns:${AWS_REGION}:${account_id}:${ENV}-cloudwatch-slack}"

  local smoke_id
  smoke_id="error-forwarding-smoke-$(date +%s)"

  local log_group_name
  log_group_name="${LOG_GROUP_NAME:-/service/web-backend}"

  info "Putting CloudWatch Logs error event into ${log_group_name}"
  put_error_log_event "$log_group_name" "$smoke_id"

  info "Triggering CloudWatch smoke alarm for PagerDuty via ${topic_arn}"
  trigger_pagerduty_alarm "$topic_arn" "$smoke_id"

  info "Smoke test events sent. Slack should receive the Lambda-formatted error; PagerDuty should receive the alarm notification."
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
  "stack": "Error: Smoke test ${smoke_id}\\n    at smoke-test-error-forwarding.sh (${created_at})\\n    authorization=Bearer smoke-test-secret\\n    email=smoke.test@example.com\\n    hetu=010170-1234"
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

function trigger_pagerduty_alarm {
  local topic_arn="$1"
  local smoke_id="$2"
  local alarm_name
  alarm_name="${ALARM_NAME:-AOE-${ENV}-error-forwarding-smoke-test}"

  aws cloudwatch put-metric-alarm \
    --alarm-name "$alarm_name" \
    --alarm-description "Smoke test alarm for AOE error forwarding to PagerDuty." \
    --namespace "AOE/SmokeTest" \
    --metric-name "ErrorForwardingSmokeTest" \
    --dimensions "Name=Environment,Value=${ENV}" \
    --statistic Sum \
    --period 60 \
    --evaluation-periods 1 \
    --threshold 1 \
    --comparison-operator GreaterThanOrEqualToThreshold \
    --treat-missing-data notBreaching \
    --actions-enabled \
    --alarm-actions "$topic_arn"

  aws cloudwatch set-alarm-state \
    --alarm-name "$alarm_name" \
    --state-value OK \
    --state-reason "Preparing smoke test ${smoke_id}"

  sleep 1

  aws cloudwatch set-alarm-state \
    --alarm-name "$alarm_name" \
    --state-value ALARM \
    --state-reason "Smoke test ${smoke_id}: synthetic CloudWatch alarm state change."
}

main "$@"
