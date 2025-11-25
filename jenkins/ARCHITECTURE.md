# Jenkins CI/CD Pipeline Architecture

## Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository Push                         │
│            (or Manual Build Trigger in Jenkins)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │      Jenkins - Checkout Stage              │
        │  ✓ Clone repository                        │
        │  ✓ Checkout specific branch                │
        └───────────────┬───────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────────┐
        │   Frontend Build (Sequential)              │
        │  ✓ npm install                             │
        │  ✓ npm run build                           │
        │  ✓ Create production bundle                │
        └───────────────┬───────────────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │        Microservices Build (Parallel)                    │
        │                                                           │
        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
        │  │ Auth Service │  │ Expenses Svc │  │ Budgets Svc  │  │
        │  │ npm install  │  │ npm install  │  │ npm install  │  │
        │  └──────────────┘  └──────────────┘  └──────────────┘  │
        │  ┌──────────────┐                                        │
        │  │Analytics Svc │                                        │
        │  │ npm install  │                                        │
        │  └──────────────┘                                        │
        └─────────────┬──────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────────────────────────┐
        │          Unit Tests (Parallel - Optional)                │
        │                                                           │
        │  ✓ Frontend: react-scripts test                          │
        │  ✓ Services: npm test (each service)                     │
        │  ✓ Generate coverage reports                             │
        └─────────────┬──────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │ Tests Pass? (catchError) │
         │    Continue/Unstable    │
         └────────────┬────────────┘
                      │
                      ▼
        ┌───────────────────────────────────────────┐
        │    SonarQube Code Analysis (Optional)      │
        │  ✓ Code quality scan                       │
        │  ✓ Security analysis                       │
        │  ✓ Generate quality gates                  │
        └───────────────┬───────────────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │      Build Docker Images (Parallel)                      │
        │                                                           │
        │  $ docker build -t coinkeeper-frontend:TAG ./frontend   │
        │  $ docker build -t coinkeeper-auth-service:TAG          │
        │  $ docker build -t coinkeeper-expenses-service:TAG      │
        │  $ docker build -t coinkeeper-budgets-service:TAG       │
        │  $ docker build -t coinkeeper-analytics-service:TAG     │
        │                                                           │
        │  Tag all with:                                           │
        │  - Git commit SHA (short)                               │
        │  - Environment name (dev/staging/prod)                 │
        └─────────────┬──────────────────────────────────────────┘
                      │
         ┌────────────┴─────────────┐
         │ PUSH_IMAGES = true?       │
         └────────────┬─────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
         YES                      NO → Skip Push
          │                       │
          ▼                       │
        ┌──────────────────────────────────────────┐
        │  Push to Docker Registry (Parallel)      │
        │                                          │
        │  ✓ Login to registry                    │
        │  ✓ Push all images with commit SHA     │
        │  ✓ Push all images with env tag        │
        │  ✓ Logout from registry                │
        └──────────────┬───────────────────────────┘
                       │
                       │
          ┌────────────┴───────────────────┐
          │ Branch = main?                  │
          └────────────┬───────────────────┘
                       │
          ┌───────────┴───────────┐
          │                       │
         YES                      NO → End
          │                       │
          ▼                       │
        ┌──────────────────────────────────────────┐
        │   Deploy to Kubernetes                   │
        │                                          │
        │  ✓ Update image tags in manifests       │
        │  ✓ Apply namespace                      │
        │  ✓ Apply all K8s manifests              │
        │  ✓ Wait for rollout (5min timeout)      │
        └──────────────┬───────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │     Smoke Tests                          │
        │  ✓ Health check endpoints                │
        │  ✓ Service connectivity                  │
        │  ✓ Basic functionality                   │
        └──────────────┬───────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │        Pipeline Complete                 │
        │                                          │
        │  ✓ Build Successful                     │
        │  ✓ Tests Passed                         │
        │  ✓ Images Pushed                        │
        │  ✓ Services Deployed                    │
        └──────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Jenkins Master                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pipeline Engine (Declarative + Groovy)                  │  │
│  │                                                            │  │
│  │  • Jenkinsfile (main pipeline)                           │  │
│  │  • Jenkinsfile.services (service-specific)               │  │
│  │  • Shared library (optional)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Configuration as Code (JCasC)                            │  │
│  │  • casc.yaml - System configuration                      │  │
│  │  • plugins.txt - Plugin management                       │  │
│  │  • init.groovy.d - Initialization scripts                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Credentials Management                                   │  │
│  │  • Docker Registry credentials                           │  │
│  │  • GitHub PAT                                            │  │
│  │  • Kubeconfig (encrypted)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
    │   GitHub    │  │   Docker     │  │   Kubernetes     │
    │  Repository │  │   Registry   │  │   Cluster        │
    │             │  │              │  │                  │
    │ • Code      │  │ • Frontend   │  │ • Deployments    │
    │ • Webhooks  │  │ • Services   │  │ • Services       │
    │             │  │ • Images     │  │ • Ingress        │
    └─────────────┘  └──────────────┘  └──────────────────┘
```

## Service Parallel Build Strategy

```
┌────────────────────────────────────────────────────────────────┐
│                   Start Services Build                          │
└────────────────────┬───────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┬──────────────┐
        │                         │              │              │
        ▼                         ▼              ▼              ▼
   ┌─────────────┐         ┌──────────────┐ ┌──────────┐ ┌─────────────┐
   │Auth Service │         │Expenses Svc  │ │Budgets   │ │Analytics    │
   │             │         │              │ │Service   │ │Service      │
   │npm ci       │         │npm ci        │ │npm ci    │ │npm ci       │
   │             │         │              │ │          │ │             │
   │BUILD TIME:  │         │BUILD TIME:   │ │BUILD TIME│ │BUILD TIME:  │
   │~45 seconds  │         │~45 seconds   │ │~45 sec   │ │~45 seconds  │
   └─────────────┘         └──────────────┘ └──────────┘ └─────────────┘
        │                         │              │              │
        └────────────┬────────────┴──────────────┴──────────────┘
                     │
            ✓ Total Time: ~45 seconds
              (instead of ~180 seconds sequential)
```

## Environment Deployment Strategy

```
Development          Staging              Production
    │                   │                     │
    ▼                   ▼                     ▼
┌──────────┐      ┌──────────┐      ┌──────────────┐
│dev image │      │staging   │      │prod image:  │
│tag       │      │image tag │      │latest,vX.X.X│
│          │      │          │      │              │
│Quick test│      │Pre-prod  │      │Full tested  │
│2 replicas│      │3 replicas│      │5+ replicas  │
└──────────┘      └──────────┘      └──────────────┘
     │                 │                    │
     ▼                 ▼                    ▼
coinkeeper-dev    coinkeeper-staging  coinkeeper-prod
namespace         namespace            namespace
```

## Docker Image Tagging Strategy

```
For each build with commit abc1234 to dev environment:

┌──────────────────────────────────────────────────────────────┐
│             Image Tagging Convention                         │
├──────────────────────────────────────────────────────────────┤
│ docker.io/yourname/coinkeeper-auth-service:abc1234          │
│ docker.io/yourname/coinkeeper-auth-service:dev              │
│                                                              │
│ docker.io/yourname/coinkeeper-expenses-service:abc1234      │
│ docker.io/yourname/coinkeeper-expenses-service:dev          │
│                                                              │
│ docker.io/yourname/coinkeeper-budgets-service:abc1234       │
│ docker.io/yourname/coinkeeper-budgets-service:dev           │
│                                                              │
│ docker.io/yourname/coinkeeper-analytics-service:abc1234     │
│ docker.io/yourname/coinkeeper-analytics-service:dev         │
│                                                              │
│ docker.io/yourname/coinkeeper-frontend:abc1234              │
│ docker.io/yourname/coinkeeper-frontend:dev                  │
└──────────────────────────────────────────────────────────────┘

Benefits:
✓ Unique commit-based tags for rollback
✓ Environment tags for easy updates
✓ Easy image tracking and management
```

## Kubernetes Deployment Flow

```
Git Commit SHA: abc1234
Environment: staging

            ┌─────────────────────┐
            │  Jenkinsfile        │
            │  Stage: Deploy       │
            └──────────┬──────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ sed -i "s|IMAGE_TAG|abc1234|" │
        │ k8s/*.yaml                    │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ kubectl apply -f k8s/         │
        │ namespace.yaml                │
        └──────────────┬────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────────┐      ┌──────────────────┐
   │ Create namespace│      │ Apply manifests  │
   │ coinkeeper      │      │ (deployments,    │
   │                 │      │ services, etc.)  │
   └────────┬────────┘      └────────┬─────────┘
            │                        │
            └───────┬────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ kubectl rollout status       │
        │ deployment/auth-service      │
        │ --timeout=5m                 │
        └──────────────┬───────────────┘
                       │
            ✓ Pods ready and running
```

## Plugin Architecture

```
Jenkins LTS with 50+ plugins:

┌─────────────────────────────────────────────────────────┐
│ Core Pipeline Plugins (10+)                             │
│ • workflow-aggregator                                   │
│ • pipeline-model-definition                             │
│ • pipeline-stage-view                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Source Control (5+)                                     │
│ • git                                                   │
│ • github                                                │
│ • github-branch-source                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Docker & Container (8+)                                 │
│ • docker-plugin                                         │
│ • docker-workflow                                       │
│ • docker-commons                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Kubernetes (3+)                                         │
│ • kubernetes                                            │
│ • kubernetes-credentials-provider                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Code Quality (8+)                                       │
│ • sonar                                                 │
│ • cobertura                                             │
│ • jacoco                                                │
│ • warnings-ng                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Notifications (4+)                                      │
│ • email-ext                                             │
│ • slack                                                 │
│ • hipchat                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ UI & Configuration (10+)                                │
│ • configuration-as-code                                 │
│ • timestamper                                           │
│ • log-parser                                            │
│ • build-timeout                                         │
└─────────────────────────────────────────────────────────┘
```

## Security & Credentials Flow

```
┌────────────────────────────────────────────┐
│      Jenkins Credentials Store              │
│        (Encrypted at rest)                  │
│                                             │
│  ├─ Docker Registry:                        │
│  │  └─ Username + Password (encrypted)      │
│  │                                          │
│  ├─ GitHub:                                 │
│  │  └─ Personal Access Token (encrypted)    │
│  │                                          │
│  ├─ Kubernetes:                             │
│  │  └─ kubeconfig (encrypted)               │
│  │                                          │
│  └─ Optional:                               │
│     ├─ Slack Webhook                        │
│     ├─ SonarQube Token                      │
│     └─ Email Credentials                    │
└────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐   ┌────────┐   ┌────────────┐
   │ Docker   │   │GitHub  │   │Kubernetes  │
   │ Registry │   │API     │   │Cluster     │
   └──────────┘   └────────┘   └────────────┘
```

---

**Diagram Version**: 1.0  
**Last Updated**: November 2025
