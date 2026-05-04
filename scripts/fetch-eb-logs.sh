#!/bin/bash
# Fetch Elastic Beanstalk logs and extract on Mac.
# Usage: ./scripts/fetch-eb-logs.sh [environment-name] [region]
set -e
ENV_NAME="${1:-evolusea-backend-development}"
REGION="${2:-ap-southeast-7}"

echo "Requesting logs for $ENV_NAME..."
aws elasticbeanstalk request-environment-info \
  --environment-name "$ENV_NAME" \
  --info-type tail \
  --region "$REGION" >/dev/null

echo "Waiting 90s for logs to be ready..."
sleep 90

echo "Retrieving log URL..."
URL=$(aws elasticbeanstalk retrieve-environment-info \
  --environment-name "$ENV_NAME" \
  --info-type tail \
  --region "$REGION" \
  --query 'EnvironmentInfo[0].Message' --output text 2>/dev/null || true)

if [[ -z "$URL" || "$URL" == "None" ]]; then
  echo "No log URL. Try again in a minute or use AWS Console: Elastic Beanstalk → $ENV_NAME → Logs → Request Logs."
  exit 1
fi

OUT_DIR="eb-logs-$$"
mkdir -p "$OUT_DIR"
ZIP="$OUT_DIR/eb-logs.zip"

echo "Downloading from S3..."
curl -sSL -o "$ZIP" "$URL"

if ! file "$ZIP" | grep -q "Zip\|archive"; then
  echo "Download failed or not a zip. File type: $(file "$ZIP")"
  head -c 500 "$ZIP" | cat -v
  exit 1
fi

echo "Extracting with Python (Mac-friendly)..."
python3 -c "
import zipfile, sys
with zipfile.ZipFile('$ZIP', 'r') as z:
    z.extractall('$OUT_DIR')
"
echo "Logs in $OUT_DIR/"
if [[ -f "$OUT_DIR/eb-engine.log" ]]; then
  echo "--- eb-engine.log (last 150 lines) ---"
  tail -150 "$OUT_DIR/eb-engine.log"
fi
