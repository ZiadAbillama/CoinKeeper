#!/bin/bash

# Jenkins Setup Script for CoinKeeper
# This script automates Jenkins setup and initialization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}CoinKeeper Jenkins Setup Script${NC}"
echo -e "${GREEN}================================================${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Create jenkins directory if it doesn't exist
echo -e "\n${YELLOW}Setting up directories...${NC}"
if [ ! -d "jenkins" ]; then
    mkdir -p jenkins
    echo -e "${GREEN}✓ Created jenkins directory${NC}"
else
    echo -e "${GREEN}✓ Jenkins directory exists${NC}"
fi

# Check if docker-compose.yml exists
if [ ! -f "jenkins/docker-compose.yml" ]; then
    echo -e "${RED}✗ jenkins/docker-compose.yml not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose file found${NC}"

# Create environment file
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
if [ ! -f "jenkins/.env" ]; then
    cp jenkins/.env.example jenkins/.env 2>/dev/null || echo "Warning: .env.example not found"
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}Please edit jenkins/.env with your credentials${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Build Jenkins image
echo -e "\n${YELLOW}Building Jenkins Docker image...${NC}"
cd jenkins
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Jenkins image built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Jenkins image${NC}"
    exit 1
fi

# Start Jenkins
echo -e "\n${YELLOW}Starting Jenkins containers...${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Jenkins started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start Jenkins${NC}"
    exit 1
fi

# Wait for Jenkins to be ready
echo -e "\n${YELLOW}Waiting for Jenkins to be ready...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose logs jenkins | grep -q "Jenkins is fully up and running"; then
        echo -e "${GREEN}✓ Jenkins is ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "\n${YELLOW}Warning: Jenkins may still be initializing${NC}"
fi

# Get initial password
echo -e "\n${YELLOW}Retrieving initial admin password...${NC}"
INITIAL_PASSWORD=$(docker-compose logs jenkins 2>/dev/null | grep -oP '(?<=initialAdminPassword]\s:\s)\w+' | head -1)

if [ -z "$INITIAL_PASSWORD" ]; then
    echo -e "${YELLOW}Could not retrieve initial password automatically${NC}"
    echo -e "${YELLOW}Run: docker-compose -f jenkins/docker-compose.yml logs jenkins | grep initialAdminPassword${NC}"
else
    echo -e "${GREEN}✓ Initial Admin Password: ${INITIAL_PASSWORD}${NC}"
fi

# Display next steps
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Open Jenkins: ${GREEN}http://localhost:8080/jenkins${NC}"
echo -e "2. Login with username 'admin' and the password above"
echo -e "3. Complete the Jenkins setup wizard"
echo -e "4. Configure credentials in: Manage Jenkins → Manage Credentials"
echo -e "5. Create new Pipeline jobs pointing to:"
echo -e "   - Main pipeline: Jenkinsfile"
echo -e "   - Service pipeline: Jenkinsfile.services"
echo -e "6. Set up GitHub webhook (optional): http://your-jenkins-url:8080/github-webhook/"
echo -e "\n${YELLOW}Useful Commands:${NC}"
echo -e "Stop Jenkins:     ${GREEN}cd jenkins && docker-compose down${NC}"
echo -e "View logs:        ${GREEN}cd jenkins && docker-compose logs -f jenkins${NC}"
echo -e "Restart Jenkins:  ${GREEN}cd jenkins && docker-compose restart${NC}"
echo -e "Remove data:      ${GREEN}cd jenkins && docker-compose down -v${NC}"
echo -e "\n${YELLOW}Documentation:${NC}"
echo -e "Setup Guide: ${GREEN}jenkins/SETUP_GUIDE.md${NC}"
echo -e "Jenkinsfile: ${GREEN}Jenkinsfile${NC}\n"

cd ..
