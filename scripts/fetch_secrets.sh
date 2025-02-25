#!/usr/bin/env bash
set -euo pipefail

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

function aws {
  docker_run_with_aws_env \
    --volume "$repo:/aws" \
    --rm -i "amazon/aws-cli:$aws_cli_version" "$@"
}

require_dev_aws_session

echo "Fetching secret from AWS Secrets Manager..."
aws s3 cp s3://aoe-local-dev/semantic-api/.env /aws/aoe-semantic-apis/.env --profile aoe-dev
aws s3 cp s3://aoe-local-dev/data-services/.env /aws/aoe-data-services/.env --profile aoe-dev
aws s3 cp s3://aoe-local-dev/data-analytics/.env /aws/aoe-data-analytics/.env --profile aoe-dev
aws s3 cp s3://aoe-local-dev/web-backend/.env /aws/aoe-web-backend/.env --profile aoe-dev
aws s3 cp s3://aoe-local-dev/streaming-app/.env /aws/aoe-streaming-app/.env --profile aoe-dev
