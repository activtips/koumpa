#!/bin/bash
#
# Build all Koumpa Lambda functions
# Usage: ./build-all-lambdas.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDAS_DIR="$SCRIPT_DIR/../src/lambdas"

echo "🚀 Building all Lambda functions..."
echo ""

# Find all Lambda directories (exclude shared and layers)
LAMBDA_NAMES=$(ls -d "$LAMBDAS_DIR"/*/ | grep -v -E "(shared|layers)" | xargs -n 1 basename)

SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_LAMBDAS=()

for LAMBDA_NAME in $LAMBDA_NAMES; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Building: $LAMBDA_NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if "$SCRIPT_DIR/build-lambda.sh" "$LAMBDA_NAME"; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "✅ $LAMBDA_NAME built successfully"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILED_LAMBDAS+=("$LAMBDA_NAME")
    echo "❌ $LAMBDA_NAME build failed"
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Build Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"

if [ $FAIL_COUNT -gt 0 ]; then
  echo ""
  echo "Failed Lambdas:"
  for LAMBDA in "${FAILED_LAMBDAS[@]}"; do
    echo "  - $LAMBDA"
  done
  exit 1
fi

echo ""
echo "🎉 All Lambdas built successfully!"
