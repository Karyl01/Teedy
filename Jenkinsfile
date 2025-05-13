pipeline {
    agent any

    environment {
        // 定义环境变量
        DOCKER_HUB_CREDENTIALS = credentials('1') // Jenkins 中存储的 Docker Hub 凭据 ID
        DOCKER_IMAGE = 'dyl542/teedy-app' // 替换为你的 Docker Hub 用户名/仓库名
        DOCKER_TAG = "${env.BUILD_NUMBER}" // 使用构建编号作为标签
    }

    stages {
        stage('Build') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/master']],
                    extensions: [],
                    userRemoteConfigs: [[url: 'https://github.com/Karyl01/Teedy.git']]
                )
                bat 'mvn -B -DskipTests clean package'
            }
        }

        stage('Building image') {
            steps {
                script {
                    docker.build("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}")
                }
            }
        }

        stage('Upload image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'DOCKER_HUB_CREDENTIALS') {
                        docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").push()
                        docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Run containers') {
            steps {
                script {
                    bat 'docker stop teedy-container-8081 || exit 0'
                    bat 'docker rm teedy-container-8081 || exit 0'

                    bat """
                        docker run --name teedy-container-8081 -d -p 8081:8080 ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                    """

                    bat 'docker ps --filter "name=teedy-container"'
                }
            }
        }
    }
}
