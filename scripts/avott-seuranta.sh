#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/common-functions.sh"
# shellcheck source=scripts/db/create-tunnel.sh
source "$repo/scripts/db/create-tunnel.sh"
# shellcheck source=scripts/db/pg-functions.sh
source "$repo/scripts/db/pg-functions.sh"

readonly SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly SQL_FILE="$SCRIPT_DIR/db/avott-seuranta.sql"

function usage {
  cat <<EOF
Usage: $(basename "$0") [--env local|dev|qa|prod] [--year YYYY] [--output PATH]

Defaults:
  --env     prod
  --year    previous calendar year
  --output  <script-dir>/AVOTT-<env>-<6-char-random>.csv
EOF
}

function parse_args {
  ENV_ARG="prod"
  YEAR_ARG="$(( $(date +%Y) - 1 ))"
  OUTPUT_ARG=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --env)    ENV_ARG="$2";     shift 2 ;;
      --year)   YEAR_ARG="$2";    shift 2 ;;
      --output) OUTPUT_ARG="$2";  shift 2 ;;
      -h|--help) usage; exit 0 ;;
      *) echo >&2 "Unknown argument: $1"; usage; exit 1 ;;
    esac
  done

  if [[ ! "$YEAR_ARG" =~ ^[0-9]{4}$ ]]; then
    fatal "Invalid --year value: $YEAR_ARG (expected YYYY)"
  fi

  if [[ -z "$OUTPUT_ARG" ]]; then
    local random_suffix
    random_suffix=$(openssl rand -hex 3)
    OUTPUT_ARG="$SCRIPT_DIR/AVOTT-${ENV_ARG}-${random_suffix}.csv"
  fi
}

function flatten_and_substitute_sql {
  local flat
  flat="$(sed -e 's/--.*$//' "$SQL_FILE" | tr '\n' ' ' | sed -e 's/;[[:space:]]*$//' -e 's/[[:space:]]\+/ /g')"
  printf '%s' "${flat//:\'year\'/\'$YEAR_ARG\'}"
}

function run_sql_local {
  require_docker
  local container_name
  container_name="$($local_compose ps --quiet aoe-postgres)"
  if [[ -z "$container_name" ]]; then
    fatal "aoe-postgres container is not running. Start the local stack first."
  fi

  local sql_flat
  sql_flat="$(flatten_and_substitute_sql)"

  docker exec -i "$container_name" psql -v ON_ERROR_STOP=1 \
    "postgres://aoeuser:aoepassword@localhost/aoe" \
    -c "\copy ($sql_flat) TO STDOUT CSV HEADER" \
    > "$OUTPUT_ARG"
}

function run_sql_remote {
  require_command psql
  export PSQLRC=/dev/null
  export ENV="$ENV_ARG"
  require_aws_session_for_env "$ENV"
  initialize_pg_credentials
  create_tunnel

  local sql_flat
  sql_flat="$(flatten_and_substitute_sql)"

  PGPASSWORD="$PGPASSWORD" psql \
    --quiet \
    -v ON_ERROR_STOP=1 \
    -h 127.0.0.1 -p "$SSH_TUNNEL_PORT" \
    -U "$USERNAME" -d aoe \
    -c "\copy ($sql_flat) TO STDOUT CSV HEADER" \
    > "$OUTPUT_ARG"
}

function main {
  parse_args "$@"

  info "Env:    $ENV_ARG"
  info "Year:   $YEAR_ARG"
  info "Output: $OUTPUT_ARG"

  case "$ENV_ARG" in
    local) run_sql_local ;;
    dev|qa|prod) run_sql_remote ;;
    *) fatal "Unknown env: $ENV_ARG" ;;
  esac

  local row_count
  row_count=$(($(wc -l < "$OUTPUT_ARG") - 1))
  info "Wrote $row_count rows to $OUTPUT_ARG"
}

main "$@"
