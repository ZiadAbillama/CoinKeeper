# Jenkins Setup Guide for CoinKeeper

## Overview
This Jenkins setup provides complete CI/CD automation for your CoinKeeper microservices project. It includes:
- Automated building and testing of all services
- Docker image creation and registry push
- Kubernetes deployment automation
- Multi-environment support (dev, staging, production)
- Parallel service builds

## Quick Start

### Option 1: Docker Compose (Recommended for local development)

```bash
cd jenkins
docker-compose up -d
```

Access Jenkins at: `http://localhost:8080/jenkins`

### Option 2: Manual Docker Build

```bash
cd jenkins
docker build -t coinkeeper-jenkins:latest -f Dockerfile .
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name coinkeeper-jenkins \
  coinkeeper-jenkins:latest
```

### Option 3: Kubernetes Deployment

```bash
kubectl apply -f k8s/jenkins.yaml
```

## Initial Configuration

### 1. First Time Setup
1. Navigate to `http://your-jenkins-url:8080/jenkins`
2. Retrieve initial admin password:
   - Docker: `docker logs coinkeeper-jenkins | grep "initialAdminPassword"`
   - Or check Jenkins logs
3. Complete the setup wizard
4. Install suggested plugins

### 2. Configure Credentials

Add the following credentials in Jenkins (Manage Jenkins → Manage Credentials):

**Docker Registry**
- Type: Username and password
- ID: `docker-credentials`
- Username: Your Docker Hub username
- Password: Your Docker Hub token

**Docker Registry URL**
- Type: Secret text
- ID: `docker-registry-url`
- Secret: Your registry URL (e.g., `docker.io/yourname`)

**GitHub**
- Type: GitHub App or Personal Token
- ID: `github-credentials`
- Token: Your GitHub personal access token

**Kubernetes**
- Type: Secret file
- ID: `kubeconfig`
- Upload your kubeconfig file

### 3. Configure GitHub Webhook (Optional)

For automatic builds on push:

1. Go to your GitHub repository settings
2. Navigate to Webhooks
3. Add webhook with payload URL: `http://your-jenkins-url:8080/github-webhook/`
4. Content type: `application/json`
5. Select events: `Push events` and `Pull requests`

## Pipeline Files

### `Jenkinsfile`
Main pipeline for complete project builds:
- Checkout code
- Build frontend and all services
- Run tests (optional)
- Build Docker images
- Push to registry
- Deploy to Kubernetes

**Parameters:**
- `ENVIRONMENT`: dev, staging, or production
- `RUN_TESTS`: Enable/disable testing
- `PUSH_IMAGES`: Enable/disable pushing images

### `Jenkinsfile.services`
Individual service pipeline for selective builds:
- Build single service
- Run service-specific tests
- Deploy specific service

**Parameters:**
- `SERVICE`: Select service to build
- `ENVIRONMENT`: Target environment

## Usage

### Run Full Pipeline
1. Go to Jenkins dashboard
2. Create new Pipeline job
3. Point to repository with `Jenkinsfile`
4. Click "Build with Parameters"
5. Select environment and options
6. Click "Build"

### Run Single Service Pipeline
1. Create new Pipeline job
2. Point to repository with `Jenkinsfile.services`
3. Select specific service
4. Choose environment
5. Build

## Configuration Files

### `jenkins/casc.yaml`
Jenkins Configuration as Code (JCasC) - defines Jenkins system settings, security, and tools.

### `jenkins/plugins.txt`
List of Jenkins plugins to install automatically.

### `jenkins/Dockerfile`
Docker image definition with pre-installed plugins and configurations.

### `jenkins/docker-compose.yml`
Docker Compose file for easy local development and testing.

### `jenkins/init.groovy.d/`
Initialization scripts that run when Jenkins starts:
- `01-setup-credentials.groovy` - Create default credentials
- `02-configure-github.groovy` - GitHub integration
- `03-configure-pipeline.groovy` - Pipeline settings

## Environment Variables

Configure these in Jenkins for each environment:

```
DOCKER_REGISTRY=docker.io/yourname
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-token
KUBECONFIG=/path/to/kubeconfig
ENVIRONMENT=dev|staging|production
```

## Scaling and Performance

### Optimize for Multiple Services
- Current setup builds all services in parallel
- Each service has independent Docker image
- Services deployed independently to Kubernetes

### Add Build Agents
For distributed builds:

```bash
# Create agent in Jenkins UI or use:
docker run -d \
  -e JENKINS_URL=http://jenkins:8080/jenkins \
  -e JENKINS_AGENT_NAME=agent-1 \
  -e JENKINS_SECRET=your-secret \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/agent:latest
```

## Monitoring and Logs

### View Jenkins Logs
```bash
docker logs -f coinkeeper-jenkins
```

### Access Build Logs
- Jenkins UI → Job → Build → Console Output
- Or: `http://your-jenkins-url:8080/jenkins/job/CoinKeeper/lastBuild/consoleText`

## Troubleshooting

### Docker Build Fails
- Ensure Docker daemon is running
- Check Dockerfile syntax
- Verify Docker registry credentials

### Kubernetes Deploy Fails
- Verify kubeconfig is valid and accessible
- Check cluster connectivity: `kubectl cluster-info`
- Review manifests in `k8s/` directory

### Plugin Installation Issues
- Restart Jenkins: `docker restart coinkeeper-jenkins`
- Check plugin compatibility with Jenkins version
- Review Jenkins system logs

## Security Considerations

1. **Change Initial Password**: Update after first login
2. **Enable CSRF Protection**: Already configured in JCasC
3. **Use Credentials Binding**: Store secrets in Jenkins credentials store
4. **Network Security**: 
   - Use firewall to restrict Jenkins access
   - Enable SSL/TLS for production
5. **Regular Updates**: Keep Jenkins and plugins updated

## Next Steps

1. **Update Credentials**: Replace placeholder values with actual credentials
2. **Configure GitHub**: Set up webhooks for CI/CD triggers
3. **Test Pipeline**: Run full build to verify configuration
4. **Set Up Notifications**: Configure email/Slack alerts
5. **Monitor Performance**: Track build times and success rates

## Support and Resources

- Jenkins Documentation: https://www.jenkins.io/doc/
- Jenkins Kubernetes Plugin: https://plugins.jenkins.io/kubernetes/
- Docker Documentation: https://docs.docker.com/
- Kubernetes Documentation: https://kubernetes.io/docs/

## Quick Commands

```bash
# Start Jenkins
docker-compose -f jenkins/docker-compose.yml up -d

# Stop Jenkins
docker-compose -f jenkins/docker-compose.yml down

# View Jenkins logs
docker-compose -f jenkins/docker-compose.yml logs -f jenkins

# Rebuild Jenkins image
docker-compose -f jenkins/docker-compose.yml build --no-cache jenkins

# Access Jenkins
open http://localhost:8080/jenkins
```
