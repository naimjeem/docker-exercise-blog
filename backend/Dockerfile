# Multi-stage build for security and optimization
FROM node:18-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache wget dumb-init && \
    rm -rf /var/cache/apk/*

# Create app user (non-root) with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with security flags
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Remove unnecessary files and set secure permissions
RUN find /app -type f -name "*.md" -delete && \
    find /app -type f -name "*.txt" -delete && \
    find /app -type d -name "test*" -exec rm -rf {} + 2>/dev/null || true && \
    find /app -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true && \
    chmod -R 755 /app && \
    chmod 644 /app/package*.json

# Switch to non-root user
USER nodeuser

# Add health check with security considerations
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider --user-agent="health-check" \
  http://localhost:5000/health || exit 1

# Expose port 5000
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
