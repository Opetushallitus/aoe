#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/scripts/common-functions.sh"


AOE_WEB_BACKEND_ENV="$(dirname "$0")/aoe-web-backend/.env"
AOE_STREAMING_APP_ENV="$(dirname "$0")/aoe-streaming-app/.env"
AOE_DATA_ANALYTICS_ENV="$(dirname "$0")/aoe-data-analytics/.env"
AOE_SEMANTIC_APIS_ENV="$(dirname "$0")/aoe-semantic-apis/.env"
AOE_DATA_SERVICES_ENV="$(dirname "$0")/aoe-data-services/.env"

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
     exit 1  # Exit with a non-zero status to indicate failure
   else
     echo "All required environment files exist."
   fi
}


check_env_files

export REVISION=${revision}
compose="docker compose -f ./docker-compose.yml"
compose="$compose -f ./docker-compose.local-dev.yml"

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
  tmux select-pane -t 0.5 -T elasticsearch
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

$compose create --build -- aoe-web-frontend aoe-web-backend aoe-data-analytics aoe-semantic-apis aoe-data-services aoe-streaming-app aoe-oidc-server localstack redis mongo postgres zookeeper kafka kafka2 elasticsearch nginx

session="aoe"

tmux kill-session -t $session || true
tmux start-server
tmux new-session -d -s $session -c "$repo" -x "$(tput cols)" -y "$(tput lines)"

readonly up_cmd="$compose up --no-log-prefix --build"
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
tmux send-keys "$up_cmd mongo" C-m

# Pane 3: PostgreSQL
tmux select-pane -t 3
tmux send-keys "$up_cmd postgres" C-m

# Pane 4: oidc
tmux select-pane -t 4
tmux send-keys "$up_cmd aoe-oidc-server" C-m

# Pane 5: elasticsearch
tmux select-pane -t 5
tmux send-keys "$up_cmd elasticsearch" C-m

rename_infra_panes_to_match_the_script_they_run

tmux new-window -t $session:1 -n 'infra2'
tmux select-window -t 1
tmux select-pane -t 1.0
tmux split-window -h -p 50

tmux select-pane -t 1.0
tmux send-keys "$up_cmd zookeeper" C-m
tmux split-window -v

tmux select-pane -t 1.2
tmux send-keys "$up_cmd kafka" C-m
tmux split-window -v

wait_for_container_to_be_healthy "kafka"

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

tmux select-pane -t 2.0
tmux send-keys "$up_cmd aoe-web-backend" C-m

wait_for_container_to_be_healthy "aoe-web-backend"

tmux select-pane -t 2.1
tmux send-keys "$up_cmd aoe-data-services" C-m

tmux select-pane -t 2.2
tmux send-keys "$up_cmd aoe-streaming-app" C-m

tmux select-pane -t 2.3
tmux send-keys "$up_cmd aoe-data-analytics" C-m

tmux select-pane -t 2.4
tmux send-keys "$up_cmd aoe-semantic-apis" C-m

tmux select-pane -t 2.5
tmux send-keys "$up_cmd aoe-web-frontend" C-m

tmux select-window -t 1
tmux select-pane -t 1.1
tmux send-keys "$up_cmd nginx" C-m

rename_services_panes_to_match_the_script_they_run_window_3
tmux select-window -t 2
tmux select-pane -t 2.0
tmux attach-session -t $session