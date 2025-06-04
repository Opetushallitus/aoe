#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/scripts/common-functions.sh"

FETCH_SECRETS_SCRIPT="$repo"/scripts/fetch_secrets.sh
RUN_PSQL_LOCAL_SCRIPT="$repo"/scripts/psql-local.sh

AOE_WEB_BACKEND_ENV="$repo"/aoe-web-backend/.env
AOE_STREAMING_APP_ENV="$repo"/aoe-streaming-app/.env
AOE_DATA_ANALYTICS_ENV="$repo"/aoe-data-analytics/.env
AOE_SEMANTIC_APIS_ENV="$repo"/aoe-semantic-apis/.env
AOE_DATA_SERVICES_ENV="$repo"/aoe-data-services/.env

generate_cert() {
  CERT_NAME="nginx-selfsigned"
  CERT_DIR="$(dirname "$0")/docker/dev"
  KEY_FILE="${CERT_DIR}/${CERT_NAME}.key"
  CSR_FILE="${CERT_DIR}/${CERT_NAME}.csr"
  CERT_FILE="${CERT_DIR}/${CERT_NAME}.crt"
  CONFIG_FILE="$(dirname "$0")/docker/nginx/san.cnf"
  DAYS_VALID=365

  if [ -f "$CERT_FILE" ]; then
        echo "Certificate already exists at $CERT_FILE. Skipping creation."
        return 0
  fi

  # Generate OpenSSL configuration file with SAN
  echo "OpenSSL configuration file created at ${CONFIG_FILE}"

  # Generate private key
  echo "Generating private key..."
  mkdir -p docker/dev
  openssl genrsa -out "${KEY_FILE}" 2048

  # Generate CSR with SAN
  echo "Generating CSR with SAN..."
  openssl req -new -key "${KEY_FILE}" -out "${CSR_FILE}" -config "${CONFIG_FILE}"

  # Generate self-signed certificate with SAN
  echo "Generating self-signed certificate with SAN..."
  openssl x509 -req -in "${CSR_FILE}" -signkey "${KEY_FILE}" -out "${CERT_FILE}" -days "${DAYS_VALID}" -extensions req_ext -extfile "${CONFIG_FILE}"

  echo "Certificate and key generated:"
  echo "Private Key: ${KEY_FILE}"
  echo "Certificate Signing Request: ${CSR_FILE}"
  echo "Certificate: ${CERT_FILE}"
}

generate_cert

check_env_files() {
   missing_files=()
   # Check each variable and add to missing_files if the file is missing
   for env_var in AOE_WEB_BACKEND_ENV AOE_STREAMING_APP_ENV AOE_DATA_ANALYTICS_ENV AOE_SEMANTIC_APIS_ENV AOE_DATA_SERVICES_ENV; do
      file_path="${!env_var}"
      if [ ! -f "$file_path" ]; then
         missing_files+=("$env_var")
      else
        echo "Found ${!env_var}"
      fi
   done

   # Print results and exit if any files are missing
   if [ ${#missing_files[@]} -ne 0 ]; then
     echo "Missing or non-existent environment files: ${missing_files[*]}"
     return 1  # Exit with a non-zero status to indicate failure
   else
     echo "All required environment files exist."
     return 0
   fi
}


if ! check_env_files; then
    echo "Secrets not found, logging in to AWS SSO.."
    require_aws_session_for_env dev

    echo "running fetch-secrets.sh..."
    bash "$FETCH_SECRETS_SCRIPT"

    if ! check_env_files; then
        echo "Failed to fetch secrets. Please check the fetch_secrets.sh script and your AWS credentials."
        exit 1
    fi
fi

export TRUST_STORE_PASSWORD=myPassword

compose="docker compose -f ./docker-compose.local-dev.yml"

readonly compose

function stop() {
  $compose down --remove-orphans || true
}
trap stop EXIT

function init {
  require_command tmux
  require_docker
}

function rename_infra_panes_to_match_the_script_they_run {
  tmux select-pane -t 0.0 -T redis
  tmux select-pane -t 0.1 -T localstack
  tmux select-pane -t 0.2 -T mongo
  tmux select-pane -t 0.3 -T postgres
  tmux select-pane -t 0.4 -T oidc
  tmux select-pane -t 0.5 -T opensearch
}

function rename_infra2_panes_to_match_the_script_they_run_window_2 {
  tmux select-pane -t 1.0 -T zookeeper
  tmux select-pane -t 1.1 -T nginx
  tmux select-pane -t 1.2 -T kafka
  tmux select-pane -t 1.3 -T kafka2
}

function rename_services_panes_to_match_the_script_they_run_window_3 {
  tmux select-pane -t 2.0 -T aoe-web-backend
  tmux select-pane -t 2.1 -T aoe-data-services
  tmux select-pane -t 2.2 -T aoe-streaming-app
  tmux select-pane -t 2.3 -T aoe-data-analytics
  tmux select-pane -t 2.4 -T aoe-semantic-apis
  tmux select-pane -t 2.5 -T aoe-web-frontend
}

init

$compose create --build

session="aoe"

tmux kill-session -t $session || true
tmux start-server
tmux new-session -d -s $session -c "$repo" -x "$(tput cols)" -y "$(tput lines)"

readonly up_cmd="$compose up --no-log-prefix"
tmux set -g pane-border-status bottom
tmux rename-window -t $session:0 'infra'
tmux select-pane -t 0

tmux split-window -h -p 50

# In the first column (Pane 0), split into 3 rows
tmux select-pane -t 0
tmux split-window -v   # Pane 2
tmux split-window -v   # Pane 3

# In the second column (Pane 1), split into 3 rows
tmux select-pane -t 1
tmux split-window -v   # Pane 4
tmux split-window -v   # Pane 5

tmux select-layout tiled

# Pane 0: Redis
tmux select-pane -t 0
tmux send-keys "$up_cmd redis" C-m

# Pane 1: Localstack
tmux select-pane -t 1
tmux send-keys "$up_cmd localstack" C-m

# Pane 2: MongoDB
tmux select-pane -t 2
tmux send-keys "$up_cmd aoe-mongodb" C-m

# Pane 3: PostgreSQL
tmux select-pane -t 3
tmux send-keys "$up_cmd aoe-postgres" C-m

# Pane 4: oidc
tmux select-pane -t 4
tmux send-keys "$up_cmd aoe-oidc-server" C-m

# Pane 5: elasticsearch
tmux select-pane -t 5
tmux send-keys "$up_cmd opensearch" C-m

rename_infra_panes_to_match_the_script_they_run

tmux new-window -t $session:1 -n 'infra2'
tmux select-window -t 1
tmux select-pane -t 1.0
tmux split-window -h -p 50

tmux select-pane -t 1.0
tmux send-keys "$up_cmd zookeeper" C-m
tmux split-window -v

wait_for_container_to_be_healthy zookeeper

tmux select-pane -t 1.2
tmux send-keys "$up_cmd kafka" C-m
tmux split-window -v

wait_for_container_to_be_healthy zookeeper

tmux select-pane -t 1.3
tmux send-keys "$up_cmd kafka2" C-m

rename_infra2_panes_to_match_the_script_they_run_window_2

tmux new-window -t $session:2 -n 'services'
tmux select-window -t 2
tmux select-pane -t 2.0
tmux split-window -h -p 50

tmux select-pane -t 2.0
tmux split-window -v   # Pane 2
tmux split-window -v   # Pane 3

tmux select-pane -t 2.3
tmux split-window -v   # Pane 4
tmux split-window -v   # Pane 5

wait_for_container_to_be_healthy aoe-oidc-server
wait_for_container_to_be_healthy aoe-postgres
wait_for_container_to_be_healthy kafka
wait_for_container_to_be_healthy kafka2
wait_for_container_to_be_healthy redis
wait_for_container_to_be_healthy opensearch

tmux select-pane -t 2.0
tmux send-keys "$up_cmd aoe-web-backend" C-m

wait_for_container_to_be_healthy aoe-web-backend

tmux select-pane -t 2.1
tmux send-keys "$up_cmd aoe-data-services" C-m

wait_for_container_to_be_healthy localstack

tmux select-pane -t 2.2
tmux send-keys "$up_cmd aoe-streaming-app" C-m

wait_for_container_to_be_healthy kafka
wait_for_container_to_be_healthy kafka2
wait_for_container_to_be_healthy aoe-mongodb
wait_for_container_to_be_healthy aoe-postgres

tmux select-pane -t 2.3
tmux send-keys "$up_cmd aoe-data-analytics" C-m

wait_for_container_to_be_healthy redis

tmux select-pane -t 2.4
tmux send-keys "$up_cmd aoe-semantic-apis" C-m

wait_for_container_to_be_healthy aoe-web-backend

tmux select-pane -t 2.5
tmux send-keys "$up_cmd aoe-web-frontend" C-m

wait_for_container_to_be_healthy aoe-web-backend
wait_for_container_to_be_healthy aoe-web-frontend

tmux select-window -t 1
tmux select-pane -t 1.1
tmux send-keys "$up_cmd nginx" C-m

rename_services_panes_to_match_the_script_they_run_window_3
tmux select-window -t 2
tmux select-pane -t 2.0
tmux attach-session -t $session
