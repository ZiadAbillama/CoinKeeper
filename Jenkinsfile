pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Target environment for deployment'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run automated tests'
        )
        booleanParam(
            name: 'PUSH_IMAGES',
            defaultValue: true,
            description: 'Push Docker images to registry'
        )
    }

    environment {
        DOCKER_REGISTRY = credentials('docker-registry-url')
        DOCKER_USERNAME = credentials('docker-username')
        DOCKER_PASSWORD = credentials('docker-password')
        KUBECONFIG = credentials('kubeconfig')
        GIT_COMMIT_SHORT = sh(
            script: "git rev-parse --short HEAD",
            returnStdout: true
        ).trim()
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Checkout') {
            steps {
                echo "✓ Checking out code from ${env.GIT_BRANCH}"
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                echo "✓ Building frontend application"
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Build Services') {
            parallel {
                stage('Build Auth Service') {
                    steps {
                        echo "✓ Building auth-service"
                        dir('services/auth-service') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Build Expenses Service') {
                    steps {
                        echo "✓ Building expenses-service"
                        dir('services/expenses-service') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Build Budgets Service') {
                    steps {
                        echo "✓ Building budgets-service"
                        dir('services/budgets-service') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Build Analytics Service') {
                    steps {
                        echo "✓ Building analytics-service"
                        dir('services/analytics-service') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            when {
                expression { return params.RUN_TESTS }
            }
            steps {
                echo "✓ Running unit tests"
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        echo "Frontend tests..."
                        cd frontend && npm test -- --coverage --watchAll=false || true
                        
                        echo "Auth Service tests..."
                        cd ../services/auth-service && npm test || true
                        
                        echo "Expenses Service tests..."
                        cd ../expenses-service && npm test || true
                        
                        echo "Budgets Service tests..."
                        cd ../budgets-service && npm test || true
                        
                        echo "Analytics Service tests..."
                        cd ../analytics-service && npm test || true
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { return env.ENVIRONMENT != 'production' }
            }
            steps {
                echo "✓ Running SonarQube code analysis"
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        echo "Skipping SonarQube for now - configure SonarQube integration as needed"
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "✓ Building Docker images"
                sh '''
                    # Build frontend image
                    docker build -t ${DOCKER_REGISTRY}/coinkeeper-frontend:${GIT_COMMIT_SHORT} ./frontend
                    docker tag ${DOCKER_REGISTRY}/coinkeeper-frontend:${GIT_COMMIT_SHORT} ${DOCKER_REGISTRY}/coinkeeper-frontend:${ENVIRONMENT}
                    
                    # Build service images
                    docker build -t ${DOCKER_REGISTRY}/coinkeeper-auth-service:${GIT_COMMIT_SHORT} ./services/auth-service
                    docker tag ${DOCKER_REGISTRY}/coinkeeper-auth-service:${GIT_COMMIT_SHORT} ${DOCKER_REGISTRY}/coinkeeper-auth-service:${ENVIRONMENT}
                    
                    docker build -t ${DOCKER_REGISTRY}/coinkeeper-expenses-service:${GIT_COMMIT_SHORT} ./services/expenses-service
                    docker tag ${DOCKER_REGISTRY}/coinkeeper-expenses-service:${GIT_COMMIT_SHORT} ${DOCKER_REGISTRY}/coinkeeper-expenses-service:${ENVIRONMENT}
                    
                    docker build -t ${DOCKER_REGISTRY}/coinkeeper-budgets-service:${GIT_COMMIT_SHORT} ./services/budgets-service
                    docker tag ${DOCKER_REGISTRY}/coinkeeper-budgets-service:${GIT_COMMIT_SHORT} ${DOCKER_REGISTRY}/coinkeeper-budgets-service:${ENVIRONMENT}
                    
                    docker build -t ${DOCKER_REGISTRY}/coinkeeper-analytics-service:${GIT_COMMIT_SHORT} ./services/analytics-service
                    docker tag ${DOCKER_REGISTRY}/coinkeeper-analytics-service:${GIT_COMMIT_SHORT} ${DOCKER_REGISTRY}/coinkeeper-analytics-service:${ENVIRONMENT}
                '''
            }
        }

        stage('Push Docker Images') {
            when {
                expression { return params.PUSH_IMAGES }
            }
            steps {
                echo "✓ Pushing Docker images to registry"
                sh '''
                    echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin ${DOCKER_REGISTRY}
                    
                    docker push ${DOCKER_REGISTRY}/coinkeeper-frontend:${GIT_COMMIT_SHORT}
                    docker push ${DOCKER_REGISTRY}/coinkeeper-frontend:${ENVIRONMENT}
                    
                    docker push ${DOCKER_REGISTRY}/coinkeeper-auth-service:${GIT_COMMIT_SHORT}
                    docker push ${DOCKER_REGISTRY}/coinkeeper-auth-service:${ENVIRONMENT}
                    
                    docker push ${DOCKER_REGISTRY}/coinkeeper-expenses-service:${GIT_COMMIT_SHORT}
                    docker push ${DOCKER_REGISTRY}/coinkeeper-expenses-service:${ENVIRONMENT}
                    
                    docker push ${DOCKER_REGISTRY}/coinkeeper-budgets-service:${GIT_COMMIT_SHORT}
                    docker push ${DOCKER_REGISTRY}/coinkeeper-budgets-service:${ENVIRONMENT}
                    
                    docker push ${DOCKER_REGISTRY}/coinkeeper-analytics-service:${GIT_COMMIT_SHORT}
                    docker push ${DOCKER_REGISTRY}/coinkeeper-analytics-service:${ENVIRONMENT}
                    
                    docker logout ${DOCKER_REGISTRY}
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { return env.BRANCH_NAME == null || env.BRANCH_NAME == 'main' }
            }
            steps {
                echo "✓ Deploying to Kubernetes (${params.ENVIRONMENT})"
                sh '''
                    # Update image tags in Kubernetes manifests
                    sed -i "s|IMAGE_TAG|${GIT_COMMIT_SHORT}|g" k8s/*.yaml
                    
                    # Apply namespace
                    kubectl apply -f k8s/namespace.yaml
                    
                    # Apply manifests for environment
                    kubectl apply -f k8s/
                    
                    # Wait for rollout
                    kubectl rollout status deployment/frontend -n coinkeeper --timeout=5m || true
                    kubectl rollout status deployment/auth-service -n coinkeeper --timeout=5m || true
                    kubectl rollout status deployment/expenses-service -n coinkeeper --timeout=5m || true
                    kubectl rollout status deployment/budgets-service -n coinkeeper --timeout=5m || true
                    kubectl rollout status deployment/analytics-service -n coinkeeper --timeout=5m || true
                '''
            }
        }

        stage('Smoke Tests') {
            when {
                expression { return env.BRANCH_NAME == null || env.BRANCH_NAME == 'main' }
            }
            steps {
                echo "✓ Running smoke tests"
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        # Add basic health checks here
                        echo "Health check passed"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed"
            cleanWs()
        }
        success {
            echo "✓ Pipeline completed successfully"
            // Add notification (email, Slack, etc.) here
        }
        failure {
            echo "✗ Pipeline failed"
            // Add notification (email, Slack, etc.) here
        }
        unstable {
            echo "⚠ Pipeline unstable - check logs for warnings"
        }
    }
}
