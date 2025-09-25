# Multi-stage build for security and optimization
# Stage 1: Build React app
FROM node:18-alpine AS build

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with security flags
RUN npm install --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the app with optimizations
RUN npm run build && \
    rm -rf node_modules && \
    rm -rf src && \
    rm -rf public

# Stage 2: Serve with Nginx (security hardened)
FROM nginx:1.25-alpine

# Install security updates and remove unnecessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Remove default nginx files and create secure directories
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/conf.d

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set secure permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# Remove unnecessary files
RUN find /usr/share/nginx/html -name "*.map" -delete && \
    find /usr/share/nginx/html -name "*.txt" -delete

# Switch to non-root user
USER nginx-user

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Expose port 80
EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
