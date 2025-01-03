#!/bin/bash
set -euo pipefail

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"

require_dev_aws_session

STREAMING_ENV="$(dirname "$0")/../aoe-streaming-app/.env"
SEMANTIC_ENV="$(dirname "$0")/../aoe-semantic-apis/.env"
WEB_BACKEND_ENV="$(dirname "$0")/../aoe-web-backend/.env"
DATA_ANALYTICS_ENV="$(dirname "$0")/../aoe-data-analytics/.env"
DATA_SERVICES_ENV="$(dirname "$0")/../aoe-data-services/.env"

upload_env_to_s3() {
    local ENV=$1
    local S3_BUCKET_FOLDER=$2

    if [[ -f "$ENV" ]]; then
        aws s3 cp "$ENV" "s3://aoe-local-dev/$S3_BUCKET_FOLDER/.env" --profile aoe-dev
        echo "Copied $ENV to S3"
    else
        echo "Error: Missing $ENV file."
        exit 1
    fi
}

echo "Checking and copying .env files to S3."
upload_env_to_s3 "$STREAMING_ENV" "streaming-app"
upload_env_to_s3 "$SEMANTIC_ENV" "semantic-api"
upload_env_to_s3 "$WEB_BACKEND_ENV" "web-backend"
upload_env_to_s3 "$DATA_ANALYTICS_ENV" "data-analytics"
upload_env_to_s3 "$DATA_SERVICES_ENV" "data-services"


