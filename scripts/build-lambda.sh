#!/bin/bash
#
# Build script for Koumpa Lambda functions
# Usage: ./build-lambda.sh <lambda-name>
# Example: ./build-lambda.sh generate-app
#

set -e

LAMBDA_NAME=$1

if [ -z "$LAMBDA_NAME" ]; then
  echo "Usage: ./build-lambda.sh <lambda-name>"
  echo "Example: ./build-lambda.sh generate-app"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LAMBDA_DIR="$PROJECT_ROOT/src/lambdas/$LAMBDA_NAME"
SHARED_DIR="$PROJECT_ROOT/src/lambdas/shared"
BUILD_DIR="$LAMBDA_DIR/build"
OUTPUT_ZIP="$LAMBDA_DIR/function.zip"

echo "🔨 Building Lambda: $LAMBDA_NAME"

# Check if Lambda directory exists
if [ ! -d "$LAMBDA_DIR" ]; then
  echo "❌ Error: Lambda directory not found: $LAMBDA_DIR"
  exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf "$BUILD_DIR"
rm -f "$OUTPUT_ZIP"
mkdir -p "$BUILD_DIR"

# Copy Lambda-specific code
echo "📦 Copying Lambda code..."
cp "$LAMBDA_DIR"/*.js "$BUILD_DIR/" 2>/dev/null || true
cp "$LAMBDA_DIR"/package.json "$BUILD_DIR/" 2>/dev/null || true

# Copy shared code
echo "📦 Copying shared code..."
mkdir -p "$BUILD_DIR/shared"
cp -r "$SHARED_DIR"/* "$BUILD_DIR/shared/"

# Install production dependencies for shared code
if [ -f "$SHARED_DIR/package.json" ]; then
  echo "📥 Installing shared dependencies..."
  cd "$SHARED_DIR"
  npm install --production --silent
  cp -r node_modules "$BUILD_DIR/"
  cd -
fi

# Install Lambda-specific dependencies
if [ -f "$BUILD_DIR/package.json" ]; then
  echo "📥 Installing Lambda dependencies..."
  cd "$BUILD_DIR"
  npm install --production --silent
  cd -
fi

# Create ZIP archive
echo "📦 Creating ZIP archive..."
cd "$BUILD_DIR"
zip -r -q "$OUTPUT_ZIP" .
cd -

# Get ZIP size
ZIP_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)

echo "✅ Build complete!"
echo "📦 Package: $OUTPUT_ZIP"
echo "📊 Size: $ZIP_SIZE"

# Cleanup build directory
rm -rf "$BUILD_DIR"

echo "🎉 Lambda $LAMBDA_NAME is ready for deployment!"
