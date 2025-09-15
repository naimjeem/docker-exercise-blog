# Use Node.js 18 Alpine
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Create app user (non-root)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies efficiently
RUN npm install --only=production && npm cache clean --force

# Copy application code
COPY . .

# Change ownership to nodeuser
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
