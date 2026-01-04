#!/bin/bash
#
# Build Lambda Layer for shared dependencies
# Usage: ./build-layer.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED_DIR="$SCRIPT_DIR/../src/lambdas/shared"
LAYERS_DIR="$SCRIPT_DIR/../src/lambdas/layers"
BUILD_DIR="$LAYERS_DIR/build"

echo "🔧 Building Lambda dependencies layer..."

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/nodejs"

# Copy package.json to build directory
cp "$SHARED_DIR/package.json" "$BUILD_DIR/nodejs/"

# Install production dependencies
cd "$BUILD_DIR/nodejs"
npm install --production --no-package-lock

# Create ZIP file
cd "$BUILD_DIR"
zip -r "$LAYERS_DIR/dependencies.zip" nodejs

# Clean up
rm -rf "$BUILD_DIR"

# Show result
ZIP_SIZE=$(du -h "$LAYERS_DIR/dependencies.zip" | cut -f1)
echo "✅ Layer built: $LAYERS_DIR/dependencies.zip ($ZIP_SIZE)"
