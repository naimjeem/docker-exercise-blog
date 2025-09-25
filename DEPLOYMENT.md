# Deployment Guide

This document explains the deployment process for the Blog Platform using the CI/CD pipeline.

## Deployment Overview

The deployment pipeline automatically deploys the application when code is pushed to the `main` branch. The deployment is designed to work with Windows self-hosted runners.

## Deployment Process

### 1. Trigger Conditions

Deployment is triggered when:
- Code is pushed to the `main` branch
- All previous pipeline jobs pass successfully:
  - Code Quality & Security (SAST)
  - Unit & Integration Testing
  - Build & Containerization
  - Performance Testing
  - Security Scanning
  - Smoke Tests

### 2. Deployment Steps

#### Step 1: Environment Setup
- Verifies Windows environment
- Checks available disk space
- Confirms Node.js and npm versions

#### Step 2: Deployment Package Creation
- Creates a `deployment` directory
- Copies application files:
  - `backend/` - Backend API
  - `frontend/` - React frontend
  - `docker-compose.yml` - Service orchestration
  - `.env.example` - Environment template
- Creates deployment scripts:
  - `deploy.bat` - Windows batch script
  - `deploy.ps1` - PowerShell script

#### Step 3: Backup Current Deployment
- Creates timestamped backup of existing production
- Ensures rollback capability

#### Step 4: Application Deployment
- Stops existing services
- Pulls latest Docker images
- Starts new services
- Performs health checks
- Verifies deployment

#### Step 5: Post-Deployment Verification
- Checks port availability (3000, 5000)
- Verifies deployment files exist
- Confirms Docker availability
- Validates deployment success

#### Step 6: Deployment Notification
- Provides deployment summary
- Includes repository, branch, commit info
- Records deployment time and actor

## Deployment Scripts

### Windows Batch Script (`deploy.bat`)
```batch
@echo off
echo Starting Docker Compose deployment...

REM Check Docker availability
docker --version
docker-compose --version

REM Stop existing services
echo Stopping existing services...
docker-compose down

REM Start services with build
echo Starting services with docker-compose up...
docker-compose up -d --build

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 30 /nobreak

REM Health check
echo Performing health checks...
curl -f http://localhost:5000/health
curl -f http://localhost:3000

REM Show running containers
echo Running containers:
docker-compose ps

echo Deployment completed successfully!
```

### PowerShell Script (`deploy.ps1`)
```powershell
Write-Host "Starting PowerShell Docker Compose deployment..."
Write-Host "Checking Docker availability..."
docker --version
docker-compose --version
Write-Host "Stopping existing services..."
docker-compose down
Write-Host "Starting services with docker-compose up..."
docker-compose up -d --build
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 30
Write-Host "Performing health checks..."
try { Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing } catch { Write-Host "Backend health check failed" }
try { Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing } catch { Write-Host "Frontend health check failed" }
Write-Host "Showing running containers..."
docker-compose ps
Write-Host "Deployment completed successfully!"
```

## Docker Requirements

### Prerequisites
- **Docker Desktop**: Must be installed and running
- **Docker Compose**: Included with Docker Desktop
- **WSL2**: Required for Docker Desktop on Windows
- **Sufficient Resources**: At least 4GB RAM allocated to Docker

### Docker Configuration
```bash
# Check Docker installation
docker --version
docker-compose --version

# Verify Docker is running
docker info

# Check available resources
docker system df
```

### Container Architecture
The deployment uses the following containers:
- **Backend**: Node.js API server (port 5000)
- **Frontend**: React application (port 3000)
- **Database**: PostgreSQL (port 5432)
- **Nginx**: Reverse proxy (port 80)

## Manual Deployment

If you need to deploy manually:

### Option 1: Using Batch Script
```cmd
cd deployment
deploy.bat
```

### Option 2: Using PowerShell
```powershell
cd deployment
.\deploy.ps1
```

### Option 3: Direct Docker Compose
```cmd
docker-compose down
docker-compose up -d --build
```

## Health Checks

The deployment includes comprehensive health checks:

### Backend Health Check
- **URL**: `http://localhost:5000/health`
- **Expected Response**: `{"status": "OK", "timestamp": "...", "service": "blog-backend"}`

### Frontend Health Check
- **URL**: `http://localhost:3000`
- **Expected Response**: React application loads successfully

## Rollback Procedure

If deployment fails or issues are discovered:

1. **Automatic Rollback**: The pipeline creates backups before deployment
2. **Manual Rollback**: 
   ```cmd
   # Stop current services
   docker-compose down
   
   # Restore from backup
   move backup_YYYYMMDD_HHMMSS production
   
   # Start previous version
   cd production
   docker-compose up -d
   ```

## Environment Variables

Ensure the following environment variables are set:

```env
# Database Configuration
DB_NAME=blogdb
DB_USER=bloguser
DB_PASSWORD=your_secure_password
DB_HOST=database
DB_PORT=5432

# Application Configuration
NODE_ENV=production
PORT=5000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
```

## Monitoring

After deployment, monitor:

1. **Application Logs**:
   ```cmd
   docker-compose logs -f
   ```

2. **Service Status**:
   ```cmd
   docker-compose ps
   ```

3. **Resource Usage**:
   ```cmd
   docker stats
   ```

## Troubleshooting

### Common Issues

1. **Docker Not Available**:
   ```cmd
   # Check if Docker is running
   docker info
   
   # Start Docker Desktop if not running
   # Check Windows services: services.msc
   # Look for "Docker Desktop Service"
   ```

2. **WSL2 Issues**:
   ```cmd
   # Check WSL2 status
   wsl --status
   
   # Update WSL2 if needed
   wsl --update
   ```

3. **Port Already in Use**:
   ```cmd
   # Check port usage
   netstat -an | findstr ":3000"
   netstat -an | findstr ":5000"
   
   # Stop conflicting services
   docker-compose down
   ```

4. **Container Build Failures**:
   ```cmd
   # Check Docker logs
   docker-compose logs
   
   # Rebuild without cache
   docker-compose build --no-cache
   
   # Check Docker resources
   docker system df
   ```

5. **Health Check Failures**:
   ```cmd
   # Check service logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Check container status
   docker-compose ps
   
   # Verify database connectivity
   docker-compose exec database psql -U bloguser -d blogdb
   ```

6. **Deployment Script Issues**:
   ```cmd
   # Check script permissions
   dir deployment\deploy.bat
   
   # Check PowerShell execution policy
   Get-ExecutionPolicy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

7. **Memory Issues**:
   ```cmd
   # Check Docker memory usage
   docker stats
   
   # Clean up unused resources
   docker system prune -a
   ```

### Log Locations

- **Pipeline Logs**: GitHub Actions tab
- **Application Logs**: `docker-compose logs`
- **System Logs**: Windows Event Viewer

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Docker Images**: Use security-scanned images
3. **Network**: Ensure proper firewall configuration
4. **Access Control**: Limit deployment permissions
5. **Monitoring**: Set up alerts for deployment failures

## Performance Optimization

1. **Resource Allocation**: Adjust Docker resource limits
2. **Caching**: Enable Docker layer caching
3. **Database**: Optimize PostgreSQL configuration
4. **Frontend**: Enable production optimizations

## Support

For deployment issues:

1. Check GitHub Actions logs
2. Review this documentation
3. Check Docker and system logs
4. Contact the development team

## Future Enhancements

Planned improvements:

1. **Blue-Green Deployment**: Zero-downtime deployments
2. **Kubernetes Support**: Container orchestration
3. **Monitoring Integration**: Prometheus/Grafana
4. **Automated Testing**: Post-deployment validation
5. **Rollback Automation**: Automatic failure detection
