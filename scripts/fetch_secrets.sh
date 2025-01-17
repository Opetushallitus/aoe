#!/bin/bash
set -euo pipefail

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

require_dev_aws_session

echo "Fetching secret from AWS Secrets Manager..."
aws s3 cp s3://aoe-local-dev/semantic-api/.env "$(dirname "$0")/../aoe-semantic-apis/.env" --profile aoe-dev
aws s3 cp s3://aoe-local-dev/data-services/.env "$(dirname "$0")/../aoe-data-services/.env" --profile aoe-dev
aws s3 cp s3://aoe-local-dev/data-analytics/.env "$(dirname "$0")/../aoe-data-analytics/.env" --profile aoe-dev
aws s3 cp s3://aoe-local-dev/web-backend/.env "$(dirname "$0")/../aoe-web-backend/.env" --profile aoe-dev
aws s3 cp s3://aoe-local-dev/streaming-app/.env "$(dirname "$0")/../aoe-streaming-app/.env" --profile aoe-dev
