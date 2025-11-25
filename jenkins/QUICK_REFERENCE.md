# Jenkins Quick Reference & Commands

## 🚀 Quick Start Commands

### Windows (PowerShell)
```powershell
# Setup and start Jenkins
cd C:\CoinKeeper\jenkins
.\setup.bat

# Or manually:
docker-compose up -d
```

### macOS/Linux
```bash
# Setup and start Jenkins
cd CoinKeeper/jenkins
chmod +x setup.sh
./setup.sh

# Or manually:
docker-compose up -d
```

### Access Jenkins
```
URL: http://localhost:8080/jenkins
```

## 📊 Essential Commands

### Docker Compose Operations
```bash
# Start Jenkins
docker-compose -f jenkins/docker-compose.yml up -d

# Stop Jenkins
docker-compose -f jenkins/docker-compose.yml down

# View logs
docker-compose -f jenkins/docker-compose.yml logs -f jenkins

# View logs of specific container
docker-compose -f jenkins/docker-compose.yml logs -f

# Restart Jenkins
docker-compose -f jenkins/docker-compose.yml restart jenkins

# Shell into Jenkins container
docker-compose -f jenkins/docker-compose.yml exec jenkins bash

# Remove all data (warning: destructive)
docker-compose -f jenkins/docker-compose.yml down -v

# Rebuild image
docker-compose -f jenkins/docker-compose.yml build --no-cache
```

### Docker Direct Commands
```bash
# View running containers
docker ps | grep jenkins

# View all containers
docker ps -a

# View container logs
docker logs -f coinkeeper-jenkins

# Stop container
docker stop coinkeeper-jenkins

# Start container
docker start coinkeeper-jenkins

# Remove container
docker rm coinkeeper-jenkins

# View container details
docker inspect coinkeeper-jenkins

# Get container IP
docker inspect --format='{{.NetworkSettings.IPAddress}}' coinkeeper-jenkins
```

### Initial Password Retrieval
```bash
# Docker Compose
docker-compose -f jenkins/docker-compose.yml logs jenkins | grep initialAdminPassword

# Docker direct
docker logs coinkeeper-jenkins | grep initialAdminPassword

# Inside container
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 🔐 Credentials Setup

### Adding Docker Registry Credentials
```groovy
// In Jenkins Credentials Store
Type: Username and password
Scope: Global
ID: docker-credentials
Username: your-docker-username
Password: your-docker-token
Description: Docker Registry Credentials
```

### Adding GitHub Token
```groovy
Type: GitHub App or Secret text
Scope: Global
ID: github-credentials
Secret: your-github-personal-access-token
Description: GitHub Credentials
```

### Adding Kubeconfig
```groovy
Type: Secret file
Scope: Global
ID: kubeconfig
File: /path/to/your/kubeconfig
Description: Kubernetes Configuration
```

## 🔨 Jenkins Pipeline Commands

### Trigger Build from Command Line
```bash
# If Jenkins CLI is installed
java -jar jenkins-cli.jar -s http://localhost:8080/jenkins \
  build CoinKeeper \
  -p ENVIRONMENT=dev \
  -p RUN_TESTS=true \
  -p PUSH_IMAGES=true

# Using curl
curl -X POST http://localhost:8080/jenkins/job/CoinKeeper/build \
  -u admin:password \
  -H "Jenkins-Crumb: crumb-value"
```

### View Build Logs
```bash
# Last build
curl http://localhost:8080/jenkins/job/CoinKeeper/lastBuild/consoleText

# Specific build
curl http://localhost:8080/jenkins/job/CoinKeeper/5/consoleText

# Follow logs (requires Jenkins CLI)
java -jar jenkins-cli.jar -s http://localhost:8080/jenkins \
  build -s -v CoinKeeper
```

## 🐳 Docker Commands

### Build Docker Images Manually
```bash
# Build frontend
docker build -t coinkeeper-frontend:dev ./frontend

# Build services
docker build -t coinkeeper-auth-service:dev ./services/auth-service
docker build -t coinkeeper-expenses-service:dev ./services/expenses-service
docker build -t coinkeeper-budgets-service:dev ./services/budgets-service
docker build -t coinkeeper-analytics-service:dev ./services/analytics-service
```

### Push Images to Registry
```bash
# Login
docker login docker.io

# Tag images
docker tag coinkeeper-frontend:dev docker.io/yourusername/coinkeeper-frontend:dev
docker tag coinkeeper-auth-service:dev docker.io/yourusername/coinkeeper-auth-service:dev

# Push
docker push docker.io/yourusername/coinkeeper-frontend:dev
docker push docker.io/yourusername/coinkeeper-auth-service:dev

# Logout
docker logout docker.io
```

### Run Services Locally
```bash
# Run frontend
docker run -p 3000:3000 coinkeeper-frontend:dev

# Run auth service
docker run -p 5000:5000 coinkeeper-auth-service:dev

# Run with environment variables
docker run -e NODE_ENV=development -p 5000:5000 coinkeeper-auth-service:dev
```

## ☸️ Kubernetes Commands

### Check Deployments
```bash
# List all deployments
kubectl get deployments -n coinkeeper

# Get deployment details
kubectl describe deployment auth-service -n coinkeeper

# Get pod status
kubectl get pods -n coinkeeper

# Watch pods
kubectl get pods -n coinkeeper -w
```

### View Logs
```bash
# Pod logs
kubectl logs -f pod/auth-service-xyz -n coinkeeper

# Deployment logs (all pods)
kubectl logs -f deployment/auth-service -n coinkeeper

# Previous pod logs (if crashed)
kubectl logs pod/auth-service-xyz --previous -n coinkeeper

# All containers in a pod
kubectl logs pod/auth-service-xyz --all-containers -n coinkeeper
```

### Apply Manifests
```bash
# Apply all manifests
kubectl apply -f k8s/

# Apply specific file
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/auth.yaml

# Update deployment
kubectl set image deployment/auth-service \
  auth-service=docker.io/yourusername/coinkeeper-auth-service:latest \
  -n coinkeeper

# Rollout status
kubectl rollout status deployment/auth-service -n coinkeeper
```

### Debugging
```bash
# Describe pod
kubectl describe pod/auth-service-xyz -n coinkeeper

# Port forward
kubectl port-forward pod/auth-service-xyz 5000:5000 -n coinkeeper

# Execute command in pod
kubectl exec -it pod/auth-service-xyz bash -n coinkeeper

# Check events
kubectl get events -n coinkeeper

# Check resource usage
kubectl top nodes
kubectl top pods -n coinkeeper
```

## 🔍 Troubleshooting Commands

### Check Jenkins Health
```bash
# Health check endpoint
curl http://localhost:8080/jenkins/login

# Jenkins system log
# Via UI: Manage Jenkins → System Log

# Check disk space
docker exec coinkeeper-jenkins df -h

# Check memory
docker stats coinkeeper-jenkins
```

### Debug Build Issues
```bash
# Check workspace
docker exec coinkeeper-jenkins ls -la /var/jenkins_home/workspace

# Check plugins
docker exec coinkeeper-jenkins curl localhost:8080/pluginManager/api/json

# View Jenkins config
docker exec coinkeeper-jenkins cat /var/jenkins_home/config.xml
```

### Docker Registry Issues
```bash
# Test Docker login
docker login docker.io -u yourusername -p yourtoken

# Check credentials
cat ~/.docker/config.json

# Test image push
docker push docker.io/yourusername/test:latest

# List images
docker images | grep coinkeeper
```

### Kubernetes Connectivity
```bash
# Test kubeconfig
kubectl cluster-info

# Check context
kubectl config current-context

# List clusters
kubectl config get-clusters

# Test connectivity
kubectl get nodes

# Check ServiceAccount
kubectl get serviceaccount -n jenkins
```

## 📝 Log Locations

### Inside Jenkins Container
```
/var/jenkins_home/logs/               - Jenkins logs
/var/jenkins_home/jobs/*/builds/*/    - Build logs
/var/jenkins_home/plugins/            - Plugin logs
```

### Docker Compose
```
docker-compose logs -f                - All services logs
docker-compose logs -f jenkins        - Jenkins only
docker-compose logs -f postgres       - Database logs
```

### System Logs
```bash
docker logs coinkeeper-jenkins
docker logs coinkeeper-postgres
```

## 🧹 Cleanup Commands

### Remove Old Builds
```bash
# In Jenkins Groovy script:
// Keep only last 20 builds
Build.all.each { job ->
  job.builds.sort { it.number }.reverse().drop(20).each { it.delete() }
}
```

### Clean Docker Resources
```bash
# Remove unused images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Remove all Jenkins containers (careful!)
docker rm -f $(docker ps -a | grep jenkins | awk '{print $1}')
```

### Clean Jenkins Workspace
```bash
# Via UI: Job → Workspace → Delete Workspace
# Via CLI: 
docker exec coinkeeper-jenkins rm -rf /var/jenkins_home/workspace/*
```

## 📊 Monitoring Commands

### Real-time Monitoring
```bash
# Watch Docker resource usage
docker stats coinkeeper-jenkins

# Watch Kubernetes pods
kubectl get pods -n coinkeeper -w

# Watch deployments
kubectl get deployments -n coinkeeper -w
```

### Performance Analysis
```bash
# Build time history
# Via Jenkins UI: Job → Build Time Trend

# Check Jenkins uptime
docker inspect coinkeeper-jenkins | grep StartedAt

# System info
docker system df
```

## 🔄 Backup & Restore

### Backup Jenkins Data
```bash
# Create backup
docker exec coinkeeper-jenkins tar czf /backup/jenkins-backup.tar.gz /var/jenkins_home

# Copy from container
docker cp coinkeeper-jenkins:/backup/jenkins-backup.tar.gz ./jenkins-backup.tar.gz

# Or use volume:
docker run --rm -v jenkins_data:/data -v $(pwd):/backup \
  busybox tar czf /backup/jenkins-backup.tar.gz -C /data .
```

### Restore Jenkins Data
```bash
# Restore from backup
docker run --rm -v jenkins_data:/data -v $(pwd):/backup \
  busybox tar xzf /backup/jenkins-backup.tar.gz -C /data
```

## 🆘 Emergency Commands

### Reset Jenkins to Clean State
```bash
# WARNING: This removes all data!
docker-compose down -v
docker-compose up -d
```

### Force Restart
```bash
# Hard stop and restart
docker kill coinkeeper-jenkins
docker rm coinkeeper-jenkins
docker-compose up -d
```

### Recover Lost Data
```bash
# If Jenkins won't start
docker-compose down
docker volume ls                    # Find volume name
docker run --rm -v jenkins_data:/data busybox ls -la /data

# Backup data first before trying fixes
docker run --rm -v jenkins_data:/data -v $(pwd):/backup \
  busybox tar czf /backup/jenkins-backup.tar.gz /data
```

## 📞 Help Resources

### Get Help
```bash
# Jenkins help
docker exec coinkeeper-jenkins java -jar /usr/share/jenkins/jenkins.war -h

# Docker help
docker --help
docker-compose --help

# Kubernetes help
kubectl --help
kubectl get --help
```

### Check Versions
```bash
# Jenkins version
curl -s http://localhost:8080/jenkins/api/json | grep version

# Docker version
docker --version

# Docker Compose version
docker-compose --version

# Kubernetes version
kubectl version

# Node.js version (inside container)
docker exec coinkeeper-jenkins node --version
npm --version
```

## 🔗 Useful URLs

```
Jenkins:              http://localhost:8080/jenkins
Jenkins Queue:        http://localhost:8080/jenkins/queue
Jenkins Metrics:      http://localhost:8080/jenkins/metrics
Jenkins API:          http://localhost:8080/jenkins/api
Jenkins Groovy:       http://localhost:8080/jenkins/scriptText
```

---

**Last Updated**: November 2025  
**Version**: 1.0
