#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "================================================="
echo "   Nagpur Prime Property - VPS Deploy & Clean   "
echo "================================================="
echo ""

# 1. Load environment variables if .env.production exists
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

DOCKERHUB_USER=${DOCKERHUB_USERNAME:-nagpurprime}

echo "--- Step 1: Pulling latest git changes ---"
git pull origin main

echo ""
echo "--- Step 2: Logging in to Docker Hub ---"
if [ -n "$DOCKERHUB_TOKEN" ]; then
  echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
fi

echo ""
echo "--- Step 3: Pulling updated Docker images from Docker Hub ---"
DOCKERHUB_USERNAME=$DOCKERHUB_USER docker compose -f docker-compose.prod.yml pull

echo ""
echo "--- Step 4: Starting updated containers ---"
DOCKERHUB_USERNAME=$DOCKERHUB_USER docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo ""
echo "--- Step 5: Cleaning up old Docker images, build caches & host build files ---"
docker image prune -a -f
docker builder prune -a -f

# Clean up host-level build artifacts (.next, logs) to free maximum space
rm -rf website-nextjs/.next admin-panel-ui/.next
find . -name "*.log" -type f -delete

echo ""
echo "================================================="
echo "   ✅ Deployment & Cleanup Finished! Status:    "
echo "================================================="
docker compose -f docker-compose.prod.yml ps
