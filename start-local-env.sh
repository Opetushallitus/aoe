#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# shellcheck source=./scripts/common-functions.sh
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/scripts/common-functions.sh"


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


$local_compose create --build

function stop() {
  $local_compose down --remove-orphans || true
}
trap stop EXIT

function init {
  require_command tmux
  require_docker
}

function rename_infra_panes_to_match_the_script_they_run {
  tmux select-pane -t 0.0 -T redis
  tmux select-pane -t 0.1 -T localstack
  tmux select-pane -t 0.2 -T postgres
  tmux select-pane -t 0.3 -T keycloak
  tmux select-pane -t 0.4 -T opensearch
  tmux select-pane -t 0.5 -T nginx
}

function rename_services_panes_to_match_the_script_they_run_window_2 {
  tmux select-pane -t 1.0 -T aoe-web-frontend
  tmux select-pane -t 1.1 -T aoe-streaming-app
  tmux select-pane -t 1.2 -T aoe-web-backend
}

init

session="aoe"

tmux kill-session -t $session || true
tmux start-server
tmux new-session -d -s $session -c "$repo" -x "$(tput cols)" -y "$(tput lines)"

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
tmux send-keys "$local_up_cmd redis" C-m

# Pane 1: Localstack
tmux select-pane -t 1
tmux send-keys "$local_up_cmd localstack" C-m

# Pane 2: PostgreSQL
tmux select-pane -t 2
tmux send-keys "$local_up_cmd aoe-postgres" C-m

# Pane 3: keycloak
tmux select-pane -t 3
tmux send-keys "$local_up_cmd aoe-oidc-server" C-m

# Pane 4: opensearch
tmux select-pane -t 4
tmux send-keys "$local_up_cmd opensearch" C-m

# Pane 5: nginx (started last since it depends on backend and frontend)

rename_infra_panes_to_match_the_script_they_run

tmux new-window -t $session:1 -n 'services'
tmux select-window -t 1
tmux select-pane -t 1.0
tmux split-window -h -p 50

tmux select-pane -t 1.0
tmux split-window -v   # Pane 2

tmux select-pane -t 1.0
tmux send-keys "$repo/scripts/run-web-frontend.sh" C-m

tmux select-pane -t 1.1
tmux send-keys "$repo/scripts/run-streaming-app.sh" C-m

tmux select-pane -t 1.2
tmux send-keys "$repo/scripts/run-web-backend.sh" C-m

tmux select-window -t 0
tmux select-pane -t 0.5
tmux send-keys "$repo/scripts/run-nginx.sh" C-m

rename_services_panes_to_match_the_script_they_run_window_2
tmux select-window -t 1
tmux select-pane -t 1.0
tmux attach-session -t $session
