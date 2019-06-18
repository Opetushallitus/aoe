#!/bin/bash
DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR"

sudo supervisorctl stop aoe 2>/dev/null
sudo supervisorctl stop redis 2>/dev/null
sudo supervisorctl start redis
npm run build && npm start
