#!/bin/bash

# Exit on error
set -e

echo "================================================="
echo "   Nagpur Prime Property - Deep Disk Cleanup    "
echo "================================================="
echo ""

echo "--- 1. Current Disk Usage ---"
df -h /
echo ""

echo "--- 2. Cleaning Unused Docker Images & Containers ---"
docker system prune -a -f --volumes=false
echo ""

echo "--- 3. Cleaning Docker Build Cache ---"
docker builder prune -a -f
echo ""

echo "--- 4. Cleaning Host Build Artifacts & Caches ---"
# Remove build output folders on host (since Docker builds inside containers)
rm -rf website-nextjs/.next
rm -rf admin-panel-ui/.next
rm -rf website-nextjs/out
rm -rf admin-panel-ui/out
rm -rf website-nextjs/.cache
rm -rf admin-panel-ui/.cache

# Remove log files and npm debug logs
find . -name "*.log" -type f -delete
find . -name "npm-debug.log*" -type f -delete
find . -name "yarn-debug.log*" -type f -delete
find . -name "pnpm-debug.log*" -type f -delete

echo ""
echo "--- 5. Cleaned Disk Usage ---"
df -h /
echo ""
echo "================================================="
echo "   ✅ Deep Cleanup Completed Successfully!       "
echo "================================================="
