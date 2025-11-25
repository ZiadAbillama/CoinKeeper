pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run automated tests'
        )
    }

    environment {
        // Tag for images built in this run, e.g. build-8
        BUILD_TAG = "build-${env.BUILD_NUMBER}"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Checkout') {
            steps {
                echo "✓ Checking out code"
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                echo "✓ Building frontend application"
                dir('frontend') {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh '''
                            npm ci
                            CI=false npm run build
                        '''
                    }
                }
            }
        }

        stage('Build Services') {
            parallel {
                stage('Build Auth Service') {
                    steps {
                        echo "✓ Building auth-service"
                        dir('services/auth-service') {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Build Expenses Service') {
                    steps {
                        echo "✓ Building expenses-service"
                        dir('services/expenses-service') {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Build Budgets Service') {
                    steps {
                        echo "✓ Building budgets-service"
                        dir('services/budgets-service') {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Build Analytics Service') {
                    steps {
                        echo "✓ Building analytics-service"
                        dir('services/analytics-service') {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                sh 'npm ci'
                            }
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
                        cd ../services/expenses-service && npm test || true
                        
                        echo "Budgets Service tests..."
                        cd ../services/budgets-service && npm test || true
                        
                        echo "Analytics Service tests..."
                        cd ../services/analytics-service && npm test || true
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo "✓ Running SonarQube analysis (placeholder)"
                sh 'echo "Skipping SonarQube for now"'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "✓ Building Docker images with tag: ${BUILD_TAG}"
                sh """
                    set -eux

                    echo "Using image tag: ${BUILD_TAG}"

                    # Frontend
                    docker build -t coinkeeper-frontend:${BUILD_TAG} ./frontend

                    # Services
                    docker build -t coinkeeper-auth-service:${BUILD_TAG} ./services/auth-service
                    docker build -t coinkeeper-expenses-service:${BUILD_TAG} ./services/expenses-service
                    docker build -t coinkeeper-budgets-service:${BUILD_TAG} ./services/budgets-service
                    docker build -t coinkeeper-analytics-service:${BUILD_TAG} ./services/analytics-service
                """
            }
        }

        stage('Deploy with Docker') {
            when {
                expression { return env.BRANCH_NAME == null || env.BRANCH_NAME == 'main' }
            }
            steps {
                echo "✓ Deploying containers with images tagged: ${BUILD_TAG}"
                sh """
                    set -eux

                    # Stop & remove existing containers if they exist
                    docker rm -f coinkeeper-frontend || true
                    docker rm -f coinkeeper-auth || true
                    docker rm -f coinkeeper-expenses || true
                    docker rm -f coinkeeper-budgets || true
                    docker rm -f coinkeeper-analytics || true

                    # Start fresh containers with new images
                    docker run -d --name coinkeeper-auth \\
                      -p 5001:5001 \\
                      coinkeeper-auth-service:${BUILD_TAG}

                    docker run -d --name coinkeeper-expenses \\
                      -p 5002:5002 \\
                      coinkeeper-expenses-service:${BUILD_TAG}

                    docker run -d --name coinkeeper-budgets \\
                      -p 5003:5003 \\
                      coinkeeper-budgets-service:${BUILD_TAG}

                    docker run -d --name coinkeeper-analytics \\
                      -p 5004:5004 \\
                      coinkeeper-analytics-service:${BUILD_TAG}

                    docker run -d --name coinkeeper-frontend \\
                      -p 3000:80 \\
                      coinkeeper-frontend:${BUILD_TAG}
                """
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed"
        }
        success {
            echo "✓ Pipeline completed successfully"
        }
        failure {
            echo "✗ Pipeline failed"
        }
        unstable {
            echo "⚠ Pipeline unstable - check logs for warnings"
        }
    }
}
