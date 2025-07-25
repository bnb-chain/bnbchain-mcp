# Build stage using Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package.json and lock file
COPY package.json bun.lockb ./

# Install all dependencies (needed for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build project
RUN bun run build

# Install production dependencies only in a separate directory
RUN mkdir -p /app/prod-deps && cd /app/prod-deps && \
    cp /app/package.json . && cp /app/bun.lockb . && \
    bun install --frozen-lockfile --production

# Runtime stage using Node.js
FROM node:20-alpine AS runtime

WORKDIR /app

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package.json for metadata
COPY package.json ./

# Copy built artifacts and production node_modules from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prod-deps/node_modules ./node_modules

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (for SSE mode)
EXPOSE 3000

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Default command - start in SSE mode (can be overridden with docker run)
CMD ["node", "dist/index.js", "--sse"] 