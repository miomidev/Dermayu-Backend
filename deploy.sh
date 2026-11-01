#!/bin/bash
set -e

echo "Deploying Dermayu Web & Backend..."

# Pull latest changes
git fetch origin main
git reset --hard origin/main
git pull origin main

# Rebuild and restart docker containers
docker compose down
docker compose build

# Run Prisma schema push using migrator service
docker compose run --rm migrator

# Run initial seed if needed
# docker compose run --rm seeder

# Start the application
docker compose up -d

echo "Deployment finished successfully!"
