#!/bin/bash

# Docker Blog Platform Startup Script

echo "🐳 Starting Docker Blog Platform..."
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. You can modify it if needed."
fi

# Build and start services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check database
if docker-compose exec -T database pg_isready -U bloguser -d blogdb > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
fi

# Check backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check nginx
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx reverse proxy is healthy"
else
    echo "❌ Nginx health check failed"
fi

echo ""
echo "🎉 Docker Blog Platform is ready!"
echo "=================================="
echo "🌐 Main Application: http://localhost"
echo "🎨 Frontend Direct: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🧹 To clean up: docker-compose down -v"

