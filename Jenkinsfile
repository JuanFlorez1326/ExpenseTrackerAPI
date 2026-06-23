pipeline {
    agent any

    environment {
        NODE_VERSION    = '20'
        IMAGE_NAME      = 'expense-tracker-api'
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
    }

    tools {
        nodejs "${NODE_VERSION}"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        pollSCM('* * * * *')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Rama: ${env.BRANCH_NAME} | Build: ${env.BUILD_NUMBER}"
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Pruebas unitarias') {
            steps {
                sh 'npm run test -- --ci --forceExit --passWithNoTests'
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'coverage/junit.xml'
                }
            }
        }

        stage('Cobertura de código') {
            steps {
                sh 'npm run test:cov -- --ci --forceExit'
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : 'coverage/lcov-report',
                        reportFiles          : 'index.html',
                        reportName           : 'Cobertura de Código'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}", '--file Dockerfile --target production .')
                    docker.build("${IMAGE_NAME}:latest",       '--file Dockerfile --target production .')
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId   : 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                            docker tag ${IMAGE_NAME}:latest       ${DOCKER_USER}/${IMAGE_NAME}:latest
                            docker push ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                            docker push ${DOCKER_USER}/${IMAGE_NAME}:latest
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            sh 'docker rmi ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest 2>/dev/null || true'
        }
        success {
            echo "Pipeline completado exitosamente — Build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline fallido — revisar logs del Build #${env.BUILD_NUMBER}"
        }
    }
}
