#!/bin/bash
set -e

echo "🚀 Deploying Dermayu Web & Backend..."

# Pull latest changes
git fetch origin main
git reset --hard origin/main
git pull origin main

# Build Docker images
echo "📦 Building Docker images..."
docker compose build

# Run Prisma schema migration
echo "🔄 Running database schema migration..."
docker compose run --rm migrator

# Start / restart application container
echo "▶️ Starting application..."
docker compose up -d --remove-orphans app

# Clean up dangling images to save disk space
docker image prune -f

echo "✅ Deployment finished successfully!"
