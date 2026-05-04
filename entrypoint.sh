#!/bin/sh
# This file is used as a CMD in production docker image and should contain all commends needed to run on app startup,
# for example running typeorm migrations.

set -eu

ENV_FILE=".env.ssm"
SCRIPT_PATH="./dist/scripts/export-ssm-secrets.js"

if [ -f "$SCRIPT_PATH" ]; then
  echo 'Loading secrets from SSM Parameter Store'
  node "$SCRIPT_PATH" "$ENV_FILE"
  if [ -s "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
  fi
fi

yarn run migration:up

pm2-runtime dist/main.js --no-deamon -f -i max
