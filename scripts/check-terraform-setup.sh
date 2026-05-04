#!/bin/bash
# Check Terraform setup and verify required HCP workspaces exist.
# Run from repo root: ./scripts/check-terraform-setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENVS_DIR="$REPO_ROOT/terraform/environments"

echo "🔍 Checking Terraform setup..."
echo ""

# Check Terraform version
TF_114="$HOME/.config/tfenv/versions/1.14.3/terraform"
if [[ -x "$TF_114" ]]; then
  TF_BIN="$TF_114"
  echo "✅ Terraform 1.14.3 found"
else
  echo "❌ Terraform 1.14.3 not found. Install with: /opt/homebrew/opt/tfenv/bin/tfenv install 1.14.3"
  exit 1
fi

# Check if TF_WORKSPACE is set (conflicts with cloud block)
if [[ -n "$TF_WORKSPACE" ]]; then
  echo "⚠️  TF_WORKSPACE is set to '$TF_WORKSPACE' - this conflicts with the cloud block"
  echo "   Run: unset TF_WORKSPACE"
else
  echo "✅ TF_WORKSPACE is not set"
fi

# Check current workspace from main.tf
CURRENT_WS=$(grep -A 3 'workspaces {' "$ENVS_DIR/main.tf" | grep 'name =' | sed 's/.*name = "\(.*\)".*/\1/')
echo "📋 Current workspace (from main.tf): $CURRENT_WS"
echo ""

# Check env_name variable default
ENV_NAME=$(grep -A 2 'variable "env_name"' "$ENVS_DIR/variables.tf" | grep default | sed 's/.*default.*= "\(.*\)".*/\1/')
echo "📋 Environment name (default): $ENV_NAME"
echo ""

# Required remote state workspaces
echo "📋 Required remote state workspaces (must exist in HCP org 'evolusea'):"
echo "   1. evolusea-backend-shared-infrastructure"
echo "      → Must output: eb_application_name"
echo ""
echo "   2. evolusea-backend-shared-${ENV_NAME}"
echo "      → Must output: vpc_id, vpc_cidr_block, igw_id"
echo ""

# Try to check if workspaces exist (requires terraform login)
echo "🔐 Checking HCP authentication..."
cd "$ENVS_DIR"
if $TF_BIN version &>/dev/null; then
  echo "✅ Terraform can run"
  echo ""
  echo "📝 Next steps:"
  echo "   1. Ensure these workspaces exist in HCP (org: evolusea):"
  echo "      - evolusea-backend-shared-infrastructure"
  echo "      - evolusea-backend-shared-${ENV_NAME}"
  echo ""
  echo "   2. Run the shared Terraform code in those workspaces so they have state"
  echo ""
  echo "   3. In each shared workspace → Settings → General → Remote state sharing"
  echo "      → Share state with: $CURRENT_WS"
  echo ""
  echo "   4. Then run: ./scripts/tf.sh plan"
else
  echo "❌ Terraform authentication issue. Run: terraform login"
fi
