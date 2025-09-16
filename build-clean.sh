#!/bin/bash

# XC=BASIC 3 Extension - Clean Build Script
# This script performs a complete clean build and packages the extension
# Usage: ./build-clean.sh [version]
# If version is provided (e.g., 3.0.1), it will update package.json before building

set -e  # Exit on any error

VERSION="$1"

# Show help if requested
if [[ "$VERSION" == "--help" || "$VERSION" == "-h" ]]; then
    echo "XC=BASIC 3 Extension - Clean Build Script"
    echo ""
    echo "Usage: $0 [version]"
    echo ""
    echo "Arguments:"
    echo "  version    Optional version number (e.g., 3.0.1) to update package.json"
    echo ""
    echo "Examples:"
    echo "  $0         # Build with current version"
    echo "  $0 3.0.1   # Update to version 3.0.1 and build"
    echo ""
    echo "Options:"
    echo "  -h, --help  Show this help message"
    exit 0
fi

echo "🧹 Starting clean build for XC=BASIC 3 Extension..."

# Function to print colored output
print_step() {
    echo -e "\n🔄 $1"
}

print_success() {
    echo -e "✅ $1"
}

print_error() {
    echo -e "❌ $1"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the extension root directory."
fi

# Update version if provided
if [ -n "$VERSION" ]; then
    print_step "Updating version to $VERSION..."

    # Validate version format (basic semver check)
    if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Please use semantic versioning (e.g., 3.0.1)"
    fi

    # Update package.json version using sed
    if command -v sed &> /dev/null; then
        # Use different sed syntax for macOS vs Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
        else
            sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
        fi
        print_success "Version updated to $VERSION in package.json"
    else
        print_error "sed command not found. Cannot update version."
    fi
else
    echo "ℹ️  No version specified. Current version will be used."
fi

# Check if @vscode/vsce is available
if ! command -v vsce &> /dev/null && ! npx vsce --version &> /dev/null 2>&1; then
    print_error "vsce not found. Please install it with: npm install -g @vscode/vsce"
fi

# Step 1: Clean previous builds
print_step "Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/
# rm -f *.vsix
rm -f tsconfig.tsbuildinfo
print_success "Cleaned build artifacts"

# Step 2: Install dependencies
print_step "Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Step 3: Build extension
print_step "Building extension..."
npm run build
print_success "Extension built successfully"

# Step 4: Verify build outputs exist
print_step "Verifying build outputs..."
if [ ! -f "dist/extension.js" ]; then
    print_error "dist/extension.js not found after build"
fi
if [ ! -f "dist/server/server.js" ]; then
    print_error "dist/server/server.js not found after build"
fi
print_success "Build outputs verified"

# Step 5: Package extension
print_step "Packaging extension to .vsix..."
if command -v vsce &> /dev/null; then
    vsce package
else
    npx vsce package
fi

# Find the created .vsix file
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n1)

if [ -n "$VSIX_FILE" ]; then
    print_success "Extension packaged successfully: $VSIX_FILE"

    # Show file size
    FILE_SIZE=$(ls -lh "$VSIX_FILE" | awk '{print $5}')
    echo "📦 Package size: $FILE_SIZE"

    # Show full path
    echo "📍 Location: $(pwd)/$VSIX_FILE"
else
    print_error "No .vsix file found after packaging"
fi

echo -e "\n🎉 Clean build completed successfully!"
echo "To install: code --install-extension $VSIX_FILE"