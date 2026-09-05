#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "================================================="
echo "   Nagpur Prime Property - VPS Deploy & Clean   "
echo "================================================="
echo ""

# 1. Safely extract Docker Hub credentials from .env.production if present
if [ -f .env.production ]; then
  DOCKERHUB_USER=$(grep -E '^DOCKERHUB_USERNAME=' .env.production | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
  DOCKERHUB_TOKEN=$(grep -E '^DOCKERHUB_TOKEN=' .env.production | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
fi

DOCKERHUB_USER=${DOCKERHUB_USER:-nagpurprimeproperty}

echo "--- Step 1: Pulling latest git changes ---"
git fetch origin main
git reset --hard origin/main

echo ""
echo "--- Step 2: Logging in to Docker Hub ---"
if [ -n "$DOCKERHUB_TOKEN" ]; then
  echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
fi

echo ""
echo "--- Step 3: Pulling updated Docker images from Docker Hub ---"
DOCKERHUB_USERNAME=$DOCKERHUB_USER docker compose -p npp-prod --env-file .env.production -f docker-compose.prod.yml pull

echo ""
echo "--- Step 4: Starting updated containers ---"
DOCKERHUB_USERNAME=$DOCKERHUB_USER docker compose -p npp-prod --env-file .env.production -f docker-compose.prod.yml up -d --remove-orphans

echo ""
echo "--- Step 5: Cleaning up old Docker images, build caches & host build files ---"
docker image prune -a -f
docker builder prune -a -f

# Clean up host-level temporary build artifacts to free space
rm -rf website-nextjs/.next admin-panel-ui/.next

echo ""
echo "================================================="
echo "   ✅ Deployment & Cleanup Finished! Status:    "
echo "================================================="
docker compose -p npp-prod --env-file .env.production -f docker-compose.prod.yml ps
