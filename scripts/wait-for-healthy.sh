#!/bin/bash

set -euo pipefail

usage() {
  echo "Usage: $0 <image-tag> [service-name] [timeout-seconds] [compose-file ...]"
  exit 1
}

IMAGE_TAG="${1:-}"
[ -z "$IMAGE_TAG" ] && usage
shift || true

SERVICE_NAME="${1:-final}"
if [ $# -gt 0 ]; then
  SERVICE_NAME="$1"
  shift
fi

TIMEOUT="${1:-120}"
if [ $# -gt 0 ]; then
  TIMEOUT="$1"
  shift
fi

COMPOSE_ARGS=()
if [ $# -gt 0 ]; then
  for file in "$@"; do
    COMPOSE_ARGS+=("-f" "$file")
  done
else
  COMPOSE_ARGS+=("-f" "compose.yml")
fi

if [ -n "$SERVICE_NAME" ]; then
  docker compose "${COMPOSE_ARGS[@]}" logs -f "$SERVICE_NAME" &
  LOG_PID=$!
  trap 'kill "$LOG_PID" 2>/dev/null || true' EXIT
fi

while true; do
  if docker ps --filter "ancestor=$IMAGE_TAG" --filter "health=healthy" --format '{{.ID}}' | grep -q .; then
    echo "Container based on $IMAGE_TAG is healthy"
    break
  fi

  if [ "$SECONDS" -ge "$TIMEOUT" ]; then
    echo "Timed out waiting for container to be healthy after ${SECONDS}s"
    exit 1
  fi

  echo "Waiting for container to be healthy... (${SECONDS}s elapsed)"
  sleep 10
done

if [ -n "${LOG_PID:-}" ]; then
  kill "$LOG_PID" 2>/dev/null || true
  trap - EXIT
  wait "$LOG_PID" 2>/dev/null || true
fi
