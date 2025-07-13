#!/bin/bash

# Vercel Build Script for Bakery Dashboard
echo "🚀 Starting Vercel build process..."

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    exit 0
else
    echo "❌ Build failed!"
    exit 1
fi 