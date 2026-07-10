#!/bin/bash

# Exit on error
set -e

echo "========================================="
echo "      Docker Disk Cleanup Script         "
echo "========================================="
echo ""

echo "--- Current Disk Usage ---"
df -h /
echo ""

echo "--- 1. Removing Dangling (Untagged) Images ---"
docker image prune -f
echo ""

echo "--- 2. Removing Stopped Containers ---"
docker container prune -f
echo ""

echo "--- 3. Removing Unused Networks ---"
docker network prune -f
echo ""

echo "--- 4. Cleaning BuildKit Build Cache ---"
# Note: This will remove all build cache. The next build might take slightly longer,
# but it will reclaim all the storage accumulated during your previous builds.
docker builder prune -a -f
echo ""

echo "--- 5. Cleaned Disk Usage ---"
df -h /
echo ""
echo "Docker disk cleanup completed successfully!"
echo "========================================="
