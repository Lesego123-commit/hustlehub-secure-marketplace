# Dockerfile — HustleHub+ Backend Container
# Multi-stage build for Node.js Express API with security best practices.
#
# Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/
# Node.js Docker best practices: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
# OWASP Docker Security: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
# Alpine Linux for minimal image size: https://hub.docker.com/_/node

FROM node:20-alpine AS base

WORKDIR /app

# Copy package files first for better layer caching
# Ref: https://docs.docker.com/build/cache/
COPY package*.json ./

RUN npm ci --only=production

# Copy application source
COPY . .

# Remove dev files not needed in production
RUN rm -rf .env.example generate-certs.js

# Create non-root user for security
# Ref: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html#rule-2-set-a-user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create necessary directories with proper ownership
RUN mkdir -p logs data certs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Health check
# Ref: https://docs.docker.com/reference/dockerfile/#healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
