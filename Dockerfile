# Multi-stage Dockerfile for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN yarn workspace @repo/prisma prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN yarn workspace @repo/prisma build
RUN yarn workspace @repo/api build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/jest.config.ts ./jest.config.ts
COPY --from=builder /app/babel.config.ts ./babel.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY --from=builder /app/.env.dev ./.env.dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

WORKDIR /app
CMD ["node", "-r", "module-alias/register", "./dist/apps/api/server.js"]
