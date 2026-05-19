#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

function initialize_docdb_credentials {
  require_command aws
  assert_env_var_is_set "ENV"

  SECRET_NAME="/service/data-analytics/DOCDB_PASS"

  docdb_secret=$(aws secretsmanager get-secret-value \
    --secret-id "${SECRET_NAME}" \
    --query "SecretString" --output text)

  DOCDB_USERNAME="aoeOwner"
  DOCDB_PASSWORD=$(echo "$docdb_secret" | jq -r ".secretkey")

  export DOCDB_USERNAME
  export DOCDB_PASSWORD
}

function ensure_docdb_ca_bundle {
  local ca_file="${repo}/scripts/db/global-bundle.pem"
  if [ ! -f "$ca_file" ]; then
    info "Downloading Amazon DocumentDB CA bundle..."
    curl -sS "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem" -o "$ca_file"
  fi
}
