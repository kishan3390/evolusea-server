#!/bin/bash
# Run Terraform 1.14.x from terraform/environments (required by HCP workspace).
# Always use this script from repo root:  ./scripts/tf.sh init

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENVS_DIR="$REPO_ROOT/terraform/environments"

# TF_WORKSPACE conflicts with the cloud block and causes "workspaces not supported"
unset TF_WORKSPACE

# 1) Use tfenv-installed 1.14.3 binary (full path — avoids PATH picking up 1.5.7)
TF_114="$HOME/.config/tfenv/versions/1.14.3/terraform"
if [[ -x "$TF_114" ]]; then
  cd "$ENVS_DIR"
  exec "$TF_114" "$@"
fi

# 2) Install 1.14.3 via tfenv then use it (if tfenv exists but version not installed)
export PATH="/opt/homebrew/opt/tfenv/bin:/usr/local/bin:$PATH"
if command -v tfenv &>/dev/null; then
  cd "$ENVS_DIR"
  /opt/homebrew/opt/tfenv/bin/tfenv install 1.14.3 2>/dev/null || true
  if [[ -x "$HOME/.config/tfenv/versions/1.14.3/terraform" ]]; then
    exec "$HOME/.config/tfenv/versions/1.14.3/terraform" "$@"
  fi
fi

echo "Terraform 1.14.x is required. Install it with:" >&2
echo "  /opt/homebrew/opt/tfenv/bin/tfenv install 1.14.3" >&2
echo "Then run from repo root:  ./scripts/tf.sh init" >&2
exit 1
