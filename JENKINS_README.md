# Jenkins CI/CD Implementation for CoinKeeper

## Overview

This Jenkins implementation provides complete CI/CD automation for your CoinKeeper microservices project. It automates building, testing, containerizing, and deploying your services across multiple environments.

### Key Features

✅ **Automated Builds** - Build frontend and all microservices  
✅ **Parallel Execution** - Build multiple services simultaneously  
✅ **Docker Integration** - Automatic Docker image creation  
✅ **Registry Push** - Push images to Docker Hub or private registry  
✅ **Kubernetes Deployment** - Deploy to K8s clusters automatically  
✅ **Multi-Environment** - Support for dev, staging, and production  
✅ **Testing** - Integrated unit testing framework  
✅ **Version Control** - Git/GitHub integration with webhook support  
✅ **Configuration as Code** - Jenkins configuration in version control  
✅ **Credentials Management** - Secure credential storage  

## Project Structure

```
jenkins/
├── Dockerfile                          # Jenkins container image
├── docker-compose.yml                  # Docker Compose for local setup
├── casc.yaml                          # Jenkins Configuration as Code
├── plugins.txt                        # Jenkins plugins to install
├── configuration.groovy               # Additional Jenkins configuration
├── SETUP_GUIDE.md                     # Detailed setup instructions
├── kubernetes-deployment.yaml         # Kubernetes manifests for Jenkins
├── services-deployment-template.yaml  # Service deployment templates
├── .env.example                       # Environment variables example
├── setup.sh                           # Linux/Mac setup script
├── setup.bat                          # Windows setup script
└── init.groovy.d/                     # Initialization scripts
    ├── 01-setup-credentials.groovy
    ├── 02-configure-github.groovy
    └── 03-configure-pipeline.groovy

Jenkinsfile                            # Main pipeline for complete builds
Jenkinsfile.services                   # Pipeline for individual service builds
```

## Quick Start (Docker Compose)

### 1. **Navigate to project root**
```bash
cd c:\CoinKeeper
```

### 2. **Run setup script**

**Windows (PowerShell):**
```powershell
cd jenkins
.\setup.bat
```

**Linux/Mac:**
```bash
cd jenkins
chmod +x setup.sh
./setup.sh
```

### 3. **Manual startup (if setup script doesn't work)**

```bash
cd jenkins
docker-compose up -d
```

### 4. **Access Jenkins**
- URL: `http://localhost:8080/jenkins`
- Initial password: Check logs with `docker-compose logs jenkins | grep initialAdminPassword`

## Configuration

### Step 1: Initial Setup
1. Complete Jenkins setup wizard
2. Install suggested plugins
3. Create first admin user (or skip if already configured)

### Step 2: Add Credentials

Go to **Manage Jenkins** → **Manage Credentials** → **System** → **Global credentials**

Add these credentials:

| ID | Type | Value |
|---|---|---|
| `docker-credentials` | Username/Password | Docker Hub credentials |
| `docker-registry-url` | Secret text | docker.io/yourusername |
| `github-credentials` | GitHub token | Your GitHub PAT |
| `kubeconfig` | Secret file | Your kubeconfig file |

### Step 3: Create Pipeline Jobs

**Main Pipeline Job:**
1. New Item → Pipeline
2. Name: `CoinKeeper`
3. Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: `https://github.com/ZiadAbillama/CoinKeeper.git`
6. Script Path: `Jenkinsfile`
7. Save

**Service Pipeline Job:**
1. New Item → Pipeline
2. Name: `CoinKeeper-Service`
3. Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: `https://github.com/ZiadAbillama/CoinKeeper.git`
6. Script Path: `Jenkinsfile.services`
7. Save

### Step 4: Configure GitHub Webhook (Optional)

For automatic builds on push:

1. GitHub Repository → Settings → Webhooks
2. Add webhook
3. Payload URL: `http://your-jenkins-url:8080/github-webhook/`
4. Content type: `application/json`
5. Events: `Push events` and `Pull requests`
6. Active: ✓

## Pipeline Details

### Jenkinsfile (Main Pipeline)

**Stages:**
1. **Checkout** - Clone repository
2. **Build Frontend** - npm install and build React app
3. **Build Services** - Install dependencies for all services (parallel)
4. **Unit Tests** - Run tests for all components
5. **SonarQube Analysis** - Code quality analysis (optional)
6. **Build Docker Images** - Create Docker images for all services
7. **Push Docker Images** - Push to Docker registry
8. **Deploy to Kubernetes** - Apply manifests and deploy
9. **Smoke Tests** - Basic health checks

**Parameters:**
- `ENVIRONMENT` - dev, staging, or production
- `RUN_TESTS` - Enable/disable testing
- `PUSH_IMAGES` - Enable/disable pushing to registry

### Jenkinsfile.services (Service Pipeline)

Build and deploy individual services independently.

**Parameters:**
- `SERVICE` - Select specific service
- `ENVIRONMENT` - Target environment

## Environment Setup

### Docker Registry Configuration

Update credentials for your registry:

**Docker Hub:**
```
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=yourusername
DOCKER_PASSWORD=your-token
```

**Private Registry:**
```
DOCKER_REGISTRY=registry.example.com
DOCKER_USERNAME=username
DOCKER_PASSWORD=password
```

### Kubernetes Configuration

1. Get kubeconfig from your cluster
2. Add as credentials in Jenkins (type: Secret file)
3. Credential ID: `kubeconfig`

## Building and Deploying

### Option 1: Full Pipeline

```bash
# Manual trigger through Jenkins UI
# Or configure GitHub webhook for automatic builds
```

### Option 2: Individual Service

```bash
# Build auth-service to dev environment
# Use Jenkinsfile.services with parameters
```

### Option 3: CLI Trigger (if Jenkins CLI is configured)

```bash
java -jar jenkins-cli.jar -s http://localhost:8080/jenkins \
  build CoinKeeper \
  -p ENVIRONMENT=dev \
  -p RUN_TESTS=true \
  -p PUSH_IMAGES=true
```

## Monitoring Builds

### View Build Logs
1. Jenkins Dashboard → Job → Build Number
2. Click "Console Output"

### Monitor Services
```bash
# Check Kubernetes deployments
kubectl get deployments -n coinkeeper
kubectl get pods -n coinkeeper
kubectl logs -f deployment/auth-service -n coinkeeper
```

### View Jenkins Logs
```bash
docker-compose -f jenkins/docker-compose.yml logs -f jenkins
```

## Scaling for Production

### Add Build Agents

For distributed builds, add Jenkins agents:

```bash
docker run -d \
  -e JENKINS_URL=http://jenkins:8080/jenkins \
  -e JENKINS_AGENT_NAME=agent-1 \
  -e JENKINS_SECRET=your-secret \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/agent:latest
```

### High Availability

Deploy Jenkins to Kubernetes for HA:

```bash
kubectl apply -f jenkins/kubernetes-deployment.yaml
```

## Troubleshooting

### Jenkins Won't Start

```bash
# Check logs
docker-compose logs jenkins

# Ensure port 8080 is free
netstat -an | grep 8080

# Remove and restart
docker-compose down
docker-compose up -d
```

### Build Fails - Docker Issues

```bash
# Verify Docker daemon
docker ps

# Check Docker socket permissions
ls -la /var/run/docker.sock

# Restart Docker
systemctl restart docker
```

### Kubernetes Deployment Fails

```bash
# Verify kubeconfig
kubectl cluster-info

# Check namespace
kubectl get namespaces | grep coinkeeper

# View deployment logs
kubectl describe deployment auth-service -n coinkeeper
```

### Docker Image Push Fails

```bash
# Verify credentials
docker login docker.io

# Check image name format
docker images | grep coinkeeper

# Manual push test
docker push docker.io/yourusername/coinkeeper-auth-service:latest
```

## Security Best Practices

### 1. Change Initial Password
- Login with initial password
- Change in User Profile → Configure

### 2. Enable Security Realm
- Configure GitHub OAuth or LDAP for enterprise

### 3. Use Credentials Binding
```groovy
withCredentials([
    usernamePassword(credentialsId: 'docker-creds', 
                     usernameVariable: 'DOCKER_USER', 
                     passwordVariable: 'DOCKER_PASS')
]) {
    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
}
```

### 4. Restrict Job Permissions
- Use Project-based Matrix Authorization
- Limit who can create/modify jobs

### 5. Encrypt Credentials
- Jenkins automatically encrypts stored credentials
- Rotate API tokens regularly

### 6. Network Security
- Use firewall to restrict Jenkins access
- Run behind reverse proxy (nginx)
- Enable SSL/TLS for production

## Advanced Configuration

### SonarQube Integration

1. Install SonarQube
2. Jenkins: Manage Jenkins → Configure System → SonarQube servers
3. Add SonarQube server details
4. Update Jenkinsfile with SonarQube analysis step

### Slack Notifications

1. Create Slack app and webhook
2. Add webhook URL as Jenkins credential
3. Update post section in Jenkinsfile

### Email Notifications

1. Configure SMTP in Jenkins
2. Update notificationRecipients in Jenkinsfile

## Maintenance

### Backup Jenkins Data

```bash
# Backup Jenkins home directory
docker-compose exec jenkins tar czf backup.tar.gz /var/jenkins_home

# Extract backup
docker-compose cp backup.tar.gz .
```

### Update Jenkins

```bash
# Update plugins
cd jenkins
docker-compose pull
docker-compose build --no-cache
docker-compose up -d
```

### Clean Up

```bash
# Remove old builds
docker-compose exec jenkins java -jar /usr/share/jenkins/jenkins.war \
  -Djenkins.model.Jenkins.slaveAgentPort=50000 \
  -Dhudson.tasks.MailSender.SEND_TO_UNKNOWN_USERS=false

# Prune Docker images
docker image prune -a -f
```

## Support & Resources

- **Jenkins Documentation**: https://www.jenkins.io/
- **Jenkins Kubernetes Plugin**: https://plugins.jenkins.io/kubernetes/
- **Docker Documentation**: https://docs.docker.com/
- **Kubernetes Docs**: https://kubernetes.io/docs/
- **CoinKeeper Repo**: https://github.com/ZiadAbillama/CoinKeeper

## Commands Reference

```bash
# Start Jenkins
docker-compose -f jenkins/docker-compose.yml up -d

# Stop Jenkins
docker-compose -f jenkins/docker-compose.yml down

# View logs
docker-compose -f jenkins/docker-compose.yml logs -f

# Restart Jenkins
docker-compose -f jenkins/docker-compose.yml restart

# Shell into Jenkins
docker-compose -f jenkins/docker-compose.yml exec jenkins bash

# Remove everything (including data)
docker-compose -f jenkins/docker-compose.yml down -v
```

## What's Next?

1. ✅ Update credentials with real values
2. ✅ Configure GitHub webhook
3. ✅ Create Pipeline jobs
4. ✅ Run first build
5. ✅ Monitor and optimize
6. ✅ Set up notifications
7. ✅ Configure high availability (production)

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Maintained by**: CoinKeeper CI/CD Team
