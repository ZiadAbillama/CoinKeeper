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
            when {
                expression { return env.ENVIRONMENT != 'production' }
            }
            steps {
                echo "✓ Running SonarQube analysis (placeholder)"
                sh 'echo "Skipping SonarQube for now"'
            }
        }

        /* --------------------
           ENABLED NOW: BUILD DOCKER IMAGES
           -------------------- */

        stage('Build Docker Images') {
            steps {
                echo "✓ Building Docker images"
                sh '''
                    BUILD_TAG=build-$BUILD_NUMBER

                    echo "Using image tag: $BUILD_TAG"

                    # Frontend image
                    docker build -t coinkeeper-frontend:$BUILD_TAG ./frontend

                    # Service images
                    docker build -t coinkeeper-auth-service:$BUILD_TAG ./services/auth-service
                    docker build -t coinkeeper-expenses-service:$BUILD_TAG ./services/expenses-service
                    docker build -t coinkeeper-budgets-service:$BUILD_TAG ./services/budgets-service
                    docker build -t coinkeeper-analytics-service:$BUILD_TAG ./services/analytics-service
                '''
            }
        }

        /* --------------------
           STILL DISABLED FOR THIS STEP
           -------------------- */

        stage('Push Docker Images') {
            when { expression { false } }
            steps {
                echo "⏭ Skipping Docker image push (disabled for this step)"
            }
        }

        stage('Deploy to Kubernetes') {
            when { expression { false } }
            steps {
                echo "⏭ Skipping Kubernetes deployment (disabled for this step)"
            }
        }

        stage('Smoke Tests') {
            when { expression { false } }
            steps {
                echo "⏭ Skipping smoke tests (disabled for this step)"
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
