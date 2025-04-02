#!/usr/bin/env sh

nohup npx tsc -w &
nohup npx tsc-alias -w &
nohup npm run watch-start
