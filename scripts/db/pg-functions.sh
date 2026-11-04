#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../common-functions.sh"

function assert_psqlrc {
  export PSQLRC="${repo}/scripts/db/psqlrc"
  if [ ! -f "$PSQLRC" ]; then echo "File $PSQLRC not found"; exit 1; fi
}

function initialize_pg_credentials {
  require_command aws
  assert_env_var_is_set "ENV"

  SECRET_NAME="/auroradbs/web-backend/master-user-password"

  pg_secrets_json=$(aws secretsmanager get-secret-value --secret-id "${SECRET_NAME}" --query "SecretString" --output text)
  USERNAME=$(echo "$pg_secrets_json" | jq -r ".username")
  PGPASSWORD=$(echo "$pg_secrets_json" | jq -r ".password")

  export USERNAME
  export PGPASSWORD
}

