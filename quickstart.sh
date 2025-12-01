#!/bin/bash

# FakeCarrier Quick Start Script

set -e

echo "╔════════════════════════════════════════╗"
echo "║     FakeCarrier Quick Start            ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and set a secure ADMIN_TOKEN before deploying to production!"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Start services
echo "Starting FakeCarrier services..."
echo "This may take a few minutes on first run..."
echo ""

docker compose up --build -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║     FakeCarrier is now running!        ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Access the application:"
    echo "  • Web UI:    http://localhost:3000"
    echo "  • Admin UI:  http://localhost:3000/admin"
    echo "  • API:       http://localhost:8000"
    echo "  • API Docs:  http://localhost:8000/docs"
    echo ""
    echo "To view logs:"
    echo "  docker compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker compose down"
    echo ""
    echo "To run API tests:"
    echo "  ./test_api.sh"
    echo ""
else
    echo ""
    echo "❌ Services failed to start. Check logs with:"
    echo "  docker compose logs"
    exit 1
fi
