# Docker Hub Setup for CI/CD Pipeline

This document explains how to set up Docker Hub integration for the GitHub Actions CI/CD pipeline.

## Prerequisites

1. A Docker Hub account
2. Access to your GitHub repository settings

## Setting up Docker Hub Secrets

### Step 1: Create Docker Hub Access Token

1. Log in to [Docker Hub](https://hub.docker.com)
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Give it a name (e.g., "GitHub Actions CI/CD")
5. Set permissions to "Read, Write, Delete"
6. Copy the generated token (you won't see it again!)

### Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add these two secrets:

   **Secret 1:**
   - Name: `DOCKERHUB_USERNAME`
   - Value: Your Docker Hub username

   **Secret 2:**
   - Name: `DOCKERHUB_TOKEN`
   - Value: The access token you created in Step 1

## Image Naming Convention

The pipeline will create images with the following naming convention:

- **Backend**: `{your-dockerhub-username}/blog-platform-backend:{tag}`
- **Frontend**: `{your-dockerhub-username}/blog-platform-frontend:{tag}`

### Tags Generated

The pipeline automatically generates multiple tags for each image:

- `latest` (only for main branch)
- `main-{commit-sha}` (for main branch commits)
- `develop-{commit-sha}` (for develop branch commits)
- `{YYYYMMDD-HHmmss}` (timestamp-based tag)
- `pr-{number}` (for pull requests)

## Example Images

After running the pipeline, you'll see images like:

```
yourusername/blog-platform-backend:latest
yourusername/blog-platform-backend:main-abc1234
yourusername/blog-platform-frontend:latest
yourusername/blog-platform-frontend:main-abc1234
```

## Pulling Images

To pull the images locally:

```bash
# Pull latest backend
docker pull yourusername/blog-platform-backend:latest

# Pull latest frontend
docker pull yourusername/blog-platform-frontend:latest

# Pull specific commit
docker pull yourusername/blog-platform-backend:main-abc1234
```

## Using Images in Production

Update your `docker-compose.yml` to use the published images:

```yaml
services:
  backend:
    image: yourusername/blog-platform-backend:latest
    # ... rest of configuration

  frontend:
    image: yourusername/blog-platform-frontend:latest
    # ... rest of configuration
```

## Troubleshooting

### Authentication Issues

If you see authentication errors:

1. Verify your `DOCKERHUB_USERNAME` secret matches your Docker Hub username exactly
2. Ensure your `DOCKERHUB_TOKEN` is valid and has the correct permissions
3. Check that the token hasn't expired

### Permission Issues

If you see permission denied errors:

1. Ensure your Docker Hub account has the necessary permissions
2. Verify the access token has "Read, Write, Delete" permissions
3. Check that your Docker Hub account isn't suspended

### Image Not Found

If images aren't being pushed:

1. Check the GitHub Actions logs for build errors
2. Verify the image names don't contain invalid characters
3. Ensure the Docker Hub repository exists (it will be created automatically)

## Security Best Practices

1. **Use Access Tokens**: Never use your Docker Hub password in CI/CD
2. **Rotate Tokens**: Regularly rotate your access tokens
3. **Limit Permissions**: Only grant necessary permissions to tokens
4. **Monitor Usage**: Regularly check your Docker Hub activity logs
5. **Private Repositories**: Consider using private repositories for sensitive applications

## Cost Considerations

- Docker Hub free tier allows unlimited public repositories
- Private repositories have usage limits on the free tier
- Consider upgrading to a paid plan for production use with private repositories
