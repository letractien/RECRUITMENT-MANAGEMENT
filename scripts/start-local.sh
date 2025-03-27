#!/bin/bash

# Start the application with Docker Compose for local development

# Export environment variables for local development
export NODE_ENV=development

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
  echo "Docker is not installed. Please install Docker and try again."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
  echo "Docker Compose is not installed. Please install Docker Compose and try again."
  exit 1
fi

echo "🚀 Starting Recruitment Management System in development mode..."

# Build and start the containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Exit with the status of the docker-compose command
exit $? 