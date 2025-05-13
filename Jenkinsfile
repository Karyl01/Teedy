pipeline {
    agent any

    environment {
        DEPLOYMENT_NAME = "hello-node"
        CONTAINER_NAME = "docs"
        IMAGE_NAME = "dyl542/teedy-app:latest"
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

                    echo Patching imagePullPolicy to IfNotPresent...
                    kubectl patch deployment %DEPLOYMENT_NAME% ^
                      --type=json ^
                      -p="[{\\"op\\": \\"replace\\", \\"path\\": \\"/spec/template/spec/containers/0/imagePullPolicy\\", \\"value\\": \\"IfNotPresent\\"}]"
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
