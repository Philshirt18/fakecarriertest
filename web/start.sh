#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci --production=false

echo "Building Next.js app..."
npm run build

echo "Starting Next.js server..."
npm start
