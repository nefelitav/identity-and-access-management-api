# ── Stage 1: Install dependencies ────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/prisma/package.json ./packages/prisma/package.json
COPY packages/prisma/prisma/schema.prisma ./packages/prisma/prisma/schema.prisma
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
RUN yarn --frozen-lockfile --production=false

# ── Stage 2: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client & compile TypeScript
RUN yarn workspace @repo/prisma prisma generate --schema=./prisma/schema.prisma
RUN yarn workspace @repo/prisma build
RUN yarn workspace @repo/api build

# ── Stage 3: Test (CI only – use: docker build --target test) ─
FROM builder AS test
ENV NODE_ENV=test
CMD ["yarn", "test"]

# ── Stage 4: Production image ────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for the HEALTHCHECK directive
RUN apk add --no-cache curl

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser  --system --uid 1001 appuser

# Copy only what's needed to run
COPY --from=builder /app/dist              ./dist
COPY --from=builder /app/node_modules      ./node_modules
COPY --from=builder /app/package.json      ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages          ./packages

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "-r", "module-alias/register", "./dist/apps/api/server.js"]
