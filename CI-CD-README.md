# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline implemented for the Blog Platform using GitHub Actions.

## Pipeline Overview

The CI/CD pipeline follows a 6-step process as requested and runs on **self-hosted runners** for better performance and control:

1. **Code Quality & Security (SAST)**
2. **Unit & Integration Testing** (90% coverage threshold)
3. **Build & Containerization**
4. **Performance Testing**
5. **Security Scanning (Container)**
6. **Smoke Tests**

## Pipeline Jobs

### 1. Code Quality & Security (SAST)

**Purpose**: Ensure code quality and identify security vulnerabilities in source code.

**Tools Used**:
- **ESLint**: JavaScript/React linting
- **Prettier**: Code formatting
- **CodeQL**: GitHub's semantic code analysis engine
- **npm audit**: Dependency vulnerability scanning

**Configuration**:
- Backend: ESLint with Standard config
- Frontend: ESLint with React config + Prettier
- CodeQL analyzes JavaScript code for security issues
- npm audit checks for known vulnerabilities

**Success Criteria**:
- No ESLint errors
- Code passes Prettier formatting checks
- No high/critical security vulnerabilities
- CodeQL analysis passes

### 2. Unit & Integration Testing

**Purpose**: Ensure code functionality with comprehensive test coverage.

**Coverage Requirements**: 90% threshold for:
- Branches
- Functions
- Lines
- Statements

**Test Structure**:
- **Backend Tests**:
  - Unit tests: `backend/__tests__/unit/`
  - Integration tests: `backend/__tests__/integration/`
  - Uses Jest + Supertest
  - PostgreSQL test database
- **Frontend Tests**:
  - Component tests: `frontend/src/__tests__/`
  - Uses React Testing Library + Jest
  - Mocked API calls

**Test Commands**:
```bash
# Backend
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # All tests with coverage

# Frontend
npm run test:ci          # CI-optimized tests
npm run test:coverage    # Tests with coverage
```

**Success Criteria**:
- All tests pass
- Coverage meets 90% threshold
- Integration tests verify database connectivity
- API endpoints tested end-to-end

### 3. Build & Containerization

**Purpose**: Build and push Docker images to Docker Hub registry.

**Registry**: Docker Hub (`docker.io`)

**Image Naming**:
- Backend: `{username}/blog-platform-backend:{tag}`
- Frontend: `{username}/blog-platform-frontend:{tag}`

**Tags Generated**:
- `latest` (main branch only)
- `main-{commit-sha}` (main branch commits)
- `develop-{commit-sha}` (develop branch commits)
- `{YYYYMMDD-HHmmss}` (timestamp)
- `pr-{number}` (pull requests)

**Security Features**:
- Multi-stage builds
- Non-root users
- Security updates applied
- Minimal attack surface
- Signal handling with dumb-init

**Success Criteria**:
- Images build successfully
- Images pushed to registry
- Multi-platform support (linux/amd64, linux/arm64)
- Build cache optimization

### 4. Performance Testing

**Purpose**: Validate application performance under load.

**Tool**: k6 (load testing framework)

**Test Configuration**:
- **Stages**: Gradual ramp-up and ramp-down
- **Target Load**: Up to 20 concurrent users
- **Duration**: ~16 minutes total
- **Thresholds**:
  - 95% of requests < 500ms
  - Error rate < 10%

**Test Scenarios**:
- Health endpoint performance
- API endpoint load testing
- Database query performance
- Concurrent user simulation

**Success Criteria**:
- Response times meet thresholds
- Error rate below 10%
- System remains stable under load
- Performance metrics recorded

### 5. Security Scanning (Container)

**Purpose**: Scan Docker images for security vulnerabilities.

**Tool**: Trivy (container vulnerability scanner)

**Scan Targets**:
- Backend Docker image
- Frontend Docker image

**Output**: SARIF format for GitHub Security tab

**Success Criteria**:
- No critical vulnerabilities
- Scan results uploaded to GitHub Security
- Images pass security requirements

### 6. Smoke Tests

**Purpose**: Verify basic functionality after deployment.

**Tools**:
- **curl**: Basic endpoint testing
- **Newman**: Postman collection runner
- **Docker Compose**: Service orchestration

**Test Coverage**:
- Database connectivity
- Backend health endpoint
- API endpoints (GET, POST)
- Frontend accessibility
- Nginx proxy functionality

**Success Criteria**:
- All services start successfully
- Health checks pass
- API endpoints respond correctly
- Frontend loads properly

## Setup Instructions

### 1. Self-Hosted Runner Setup

**Prerequisites for Self-Hosted Runners:**

1. **Hardware Requirements:**
   - Minimum 4 CPU cores
   - 8GB RAM (16GB recommended)
   - 50GB+ free disk space
   - Docker and Docker Compose installed
   - Node.js 18+ installed
   - PostgreSQL client tools

2. **Software Requirements:**
   ```bash
   # Install required tools
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose nodejs npm postgresql-client
   
   # Install k6 for performance testing
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   
   # Install Newman for Postman tests
   sudo npm install -g newman
   ```

3. **Security Considerations:**
   - Run runners in isolated network
   - Use dedicated service accounts
   - Enable firewall rules
   - Regular security updates
   - Monitor runner activity

4. **Runner Registration:**
   ```bash
   # Download and configure runner
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   
   # Configure runner (get token from GitHub repo settings)
   ./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
   
   # Install as service
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

### 2. Docker Hub Configuration

Follow the instructions in `DOCKER_SETUP.md` to configure Docker Hub secrets:

1. Create Docker Hub access token
2. Add secrets to GitHub repository:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

### 3. Environment Variables

The pipeline uses these environment variables:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ github.repository_owner }}/blog-platform
```

### 4. Required Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `DOCKERHUB_USERNAME` | Docker Hub username | Yes |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Yes |

## Self-Hosted Runner Benefits

### Advantages of Self-Hosted Runners:

1. **Performance:**
   - Faster job execution (no queue time)
   - Better resource utilization
   - Persistent Docker layer caching
   - Custom hardware optimization

2. **Cost Efficiency:**
   - No GitHub Actions minutes consumed
   - Use existing infrastructure
   - Better control over resource allocation

3. **Security:**
   - Complete control over environment
   - Custom security policies
   - Isolated network access
   - Custom tooling and configurations

4. **Flexibility:**
   - Custom software pre-installed
   - Persistent data between runs
   - Custom environment variables
   - Integration with internal systems

### Important Considerations:

1. **Security Risks:**
   - Runners have access to repository secrets
   - Potential for malicious code execution
   - Need proper isolation and monitoring

2. **Maintenance:**
   - Regular updates required
   - Hardware maintenance
   - Software dependency management
   - Backup and disaster recovery

3. **Scalability:**
   - Limited concurrent job capacity
   - Need multiple runners for high load
   - Resource planning required

## Pipeline Triggers

The pipeline runs on:

- **Push to main/develop branches**
- **Pull requests to main branch**
- **Manual trigger** (workflow_dispatch)

## Deployment

### Automatic Deployment

Deployment occurs automatically when:
- All previous jobs pass
- Push to main branch
- Environment protection rules satisfied

### Manual Deployment

To deploy manually:
1. Go to Actions tab
2. Select "CI/CD Pipeline"
3. Click "Run workflow"
4. Select branch and run

## Monitoring and Alerts

### GitHub Actions

- Pipeline status visible in repository
- Email notifications on failure
- Status checks for pull requests

### Security Monitoring

- CodeQL results in Security tab
- Trivy scan results in Security tab
- Dependency alerts for vulnerabilities

### Performance Monitoring

- k6 results stored as artifacts
- Performance trends tracked
- Threshold violations reported

## Troubleshooting

### Common Issues

1. **Docker Hub Authentication**
   - Verify secrets are correctly set
   - Check token permissions
   - Ensure username is correct

2. **Test Failures**
   - Check test database connectivity
   - Verify environment variables
   - Review test logs for specific errors

3. **Build Failures**
   - Check Dockerfile syntax
   - Verify base image availability
   - Review build logs for errors

4. **Performance Test Failures**
   - Check service availability
   - Verify load test configuration
   - Review performance thresholds

### Debug Commands

```bash
# Run tests locally
cd backend && npm test
cd frontend && npm test

# Run linting
cd backend && npm run lint
cd frontend && npm run lint

# Build images locally
docker build -t blog-backend ./backend
docker build -t blog-frontend ./frontend

# Run performance tests
k6 run performance-tests/api-load-test.js
```

## Best Practices

### Code Quality

- Write tests for new features
- Maintain 90% coverage
- Follow ESLint rules
- Use Prettier formatting

### Security

- Keep dependencies updated
- Review security scan results
- Use non-root containers
- Apply security patches

### Performance

- Monitor response times
- Optimize database queries
- Use caching strategies
- Load test regularly

### Deployment

- Test in staging first
- Use blue-green deployments
- Monitor after deployment
- Have rollback procedures

## Pipeline Metrics

### Success Criteria

- **Code Quality**: 100% pass rate
- **Test Coverage**: ≥90%
- **Performance**: 95% requests < 500ms
- **Security**: No critical vulnerabilities
- **Smoke Tests**: 100% pass rate

### Monitoring

- Pipeline execution time
- Test coverage trends
- Performance metrics
- Security vulnerability count
- Deployment frequency

## Support

For issues with the CI/CD pipeline:

1. Check GitHub Actions logs
2. Review this documentation
3. Check Docker Hub setup
4. Verify secrets configuration
5. Contact the development team

## Updates

This pipeline is regularly updated to:
- Include new security tools
- Improve performance testing
- Add new quality checks
- Update dependencies
- Enhance monitoring
