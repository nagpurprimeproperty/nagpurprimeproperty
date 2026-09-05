#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "================================================="
echo "   Nagpur Prime Property - DEV Deploy & Clean    "
echo "================================================="
echo ""

# 1. Safely extract Docker Hub credentials from .env.development if present
if [ -f .env.development ]; then
  DOCKERHUB_USER=$(grep -E '^DOCKERHUB_USERNAME=' .env.development | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
  DOCKERHUB_TOKEN=$(grep -E '^DOCKERHUB_TOKEN=' .env.development | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
fi

DOCKERHUB_USER=${DOCKERHUB_USER:-nagpurprimeproperty}

echo "--- Step 1: Pulling latest development git branch ---"
git fetch origin development
git reset --hard origin/development

echo ""
echo "--- Step 2: Logging in to Docker Hub ---"
if [ -n "$DOCKERHUB_TOKEN" ]; then
  echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
fi

echo ""
echo "--- Step 3: Pulling updated Dev Docker images from Docker Hub ---"
DOCKERHUB_USERNAME=$DOCKERHUB_USER docker compose -p npp-dev --env-file .env.development -f docker-compose.dev.yml pull

echo ""
echo "--- Step 4: Starting updated Dev containers ---"
DOCKERHUB_USERNAME=$DOCKERHUB_USER docker compose -p npp-dev --env-file .env.development -f docker-compose.dev.yml up -d --remove-orphans

echo ""
echo "--- Step 5: Cleaning up old Docker images & build caches ---"
docker image prune -a -f
docker builder prune -a -f

echo ""
echo "================================================="
echo "   ✅ DEV Deployment Finished! Container Status: "
echo "================================================="
docker compose -p npp-dev --env-file .env.development -f docker-compose.dev.yml ps
