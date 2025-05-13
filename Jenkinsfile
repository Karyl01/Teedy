pipeline {
    agent any

    environment {
        DEPLOYMENT_NAME = "hello-node"          // 你创建的 Kubernetes Deployment 名字
        CONTAINER_NAME = "docs"            // 容器名（你在 Pod 中的容器名）
        IMAGE_NAME = "dyl542/teedy-app:v1.0"    // 你在 DockerHub 上推送的镜像名
    }


    stages {
        stage('Start Minikube') {
            steps {
                bat '''
                    minikube status | findstr "Running" >nul
                    if errorlevel 1 (
                        echo Starting Minikube...
                        minikube start
                    ) else (
                        echo Minikube already running.
                    )
                '''
            }
        }

        stage('Set Image') {
            steps {
                bat '''
                    echo Setting image for deployment...
                    kubectl set image deployment/%DEPLOYMENT_NAME% %CONTAINER_NAME%=%IMAGE_NAME%
                '''
            }
        }

        stage('Verify') {
            steps {
                bat 'kubectl rollout status deployment/%DEPLOYMENT_NAME%'
                bat 'kubectl get pods'
            }
        }
    }
}
