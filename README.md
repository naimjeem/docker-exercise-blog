# 🐳 Docker Blog Platform

A comprehensive multi-service blog platform built with Docker Compose that demonstrates key Docker concepts including networking, volumes, environment variables, and service orchestration.

## Architecture

This platform consists of 4 microservices:

1. **Frontend** - React blog interface (Port 3000)
2. **Backend API** - Node.js/Express API (Port 5000)
3. **Database** - PostgreSQL (Port 5432)
4. **Nginx** - Reverse proxy (Port 80)

## Features

- ✅ **Custom Docker Network** - Isolated `blog-network` for service communication
- ✅ **Volume Persistence** - PostgreSQL data persists across container restarts
- ✅ **Environment Variables** - Configurable database and application settings
- ✅ **Health Checks** - All services include health monitoring
- ✅ **Reverse Proxy** - Nginx routes requests and provides load balancing
- ✅ **Multi-stage Builds** - Optimized Docker images for production
- ✅ **Security** - Non-root users, security headers, rate limiting

## Quick Start

### Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v3.8+

### 1. Clone and Setup

```bash
git clone <repository-url>
cd blog
```

### 2. Environment Configuration

Copy the environment template and customize if needed:

```bash
cp env.example .env
```

The default configuration:
```env
DB_NAME=blogdb
DB_USER=bloguser
DB_PASSWORD=blogpass123
NODE_ENV=development
```

### 3. Start All Services

```bash
docker-compose up --build
```

This will:
- Build all custom images
- Create the custom network
- Start PostgreSQL with persistent volume
- Initialize the database with sample data
- Start the backend API
- Build and serve the React frontend
- Configure Nginx reverse proxy

### 4. Access the Application

- **Main Application**: http://localhost
- **Frontend Direct**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## API Endpoints

### Posts API
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post

### Health Check
- `GET /health` - Service health status

## Docker Concepts Demonstrated

### 1. Custom Networks
```yaml
networks:
  blog-network:
    driver: bridge
```
- Isolates services from external networks
- Enables service-to-service communication by name
- Provides DNS resolution between containers

### 2. Volume Persistence
```yaml
volumes:
  postgres_data:
    driver: local
```
- PostgreSQL data persists across container restarts
- Data survives `docker-compose down` commands
- Enables data backup and migration

### 3. Environment Variables
```yaml
environment:
  DB_NAME: ${DB_NAME}
  DB_USER: ${DB_USER}
  DB_PASSWORD: ${DB_PASSWORD}
```
- Externalized configuration
- Different settings for dev/staging/production
- Secure credential management

### 4. Service Orchestration
```yaml
depends_on:
  database:
    condition: service_healthy
```
- Service startup order management
- Health check dependencies
- Graceful service initialization

### 5. Health Checks
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
  interval: 10s
  timeout: 5s
  retries: 5
```
- Service availability monitoring
- Automatic restart on failure
- Load balancer health awareness

### 6. Multi-stage Builds
```dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS build
# ... build steps ...

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```
- Optimized production images
- Reduced attack surface
- Smaller final image size

## Development Commands

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
docker-compose logs nginx
```

### Scale Services
```bash
# Scale backend instances
docker-compose up --scale backend=3
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec database psql -U bloguser -d blogdb
```

### Rebuild Services
```bash
# Rebuild specific service
docker-compose build backend

# Rebuild all services
docker-compose build --no-cache
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Service Details

### Backend (Node.js/Express)
- **Port**: 5000
- **Health Check**: `/health`
- **Database**: PostgreSQL connection with connection pooling
- **Features**: CORS enabled, error handling, graceful shutdown

### Frontend (React)
- **Port**: 3000 (internal), 80 (via Nginx)
- **Build**: Multi-stage Docker build
- **Features**: Modern UI, responsive design, API integration

### Database (PostgreSQL)
- **Port**: 5432
- **Version**: PostgreSQL 15 Alpine
- **Persistence**: Named volume `postgres_data`
- **Initialization**: Automatic table creation and sample data

### Nginx (Reverse Proxy)
- **Port**: 80
- **Features**: Load balancing, rate limiting, security headers
- **Routing**: API requests to backend, static files to frontend

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :80
   netstat -tulpn | grep :5000
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs database
   
   # Test database connectivity
   docker-compose exec backend node -e "console.log('DB connection test')"
   ```

3. **Frontend Build Issues**
   ```bash
   # Rebuild frontend
   docker-compose build --no-cache frontend
   ```

4. **Network Issues**
   ```bash
   # Inspect network
   docker network ls
   docker network inspect blog_blog-network
   ```

### Health Check Failures

- Check service logs: `docker-compose logs <service>`
- Verify environment variables: `docker-compose config`
- Test service endpoints manually
- Ensure all dependencies are running

## Production Considerations

1. **Security**
   - Use Docker secrets for sensitive data
   - Implement proper authentication
   - Regular security updates

2. **Monitoring**
   - Add logging aggregation (ELK stack)
   - Implement metrics collection (Prometheus)
   - Set up alerting

3. **Scaling**
   - Use Docker Swarm or Kubernetes
   - Implement horizontal pod autoscaling
   - Add database read replicas

4. **Backup**
   - Regular database backups
   - Volume snapshots
   - Configuration version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker-compose up --build`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

