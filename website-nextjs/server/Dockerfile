# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./

# Use ci for reproducible installs; omit dev deps for production
RUN npm ci --omit=dev

# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
# Backend is plain ESM — no build step needed, just copy source + prod deps
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 express

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (excluding everything in .dockerignore)
COPY --chown=express:nodejs . .

USER express

EXPOSE 4000

ENV PORT=4000

CMD ["node", "server.js"]