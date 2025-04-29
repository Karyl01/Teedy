pipeline {
    agent any
    stages {
        stage('Clean') {
            steps {
                sh 'mvn clean'
            }
        }
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test -Dmaven.test.failure.ignore=true'
            }
        }
        stage('PMD') {
            steps {
                sh 'mvn pmd:pmd'
            }
        }
        stage('JaCoCo') {
            steps {
                sh 'mvn jacoco:report'
            }
        }
        stage('Javadoc') {
            steps {
                script {
                    try {
                        sh 'mvn javadoc:javadoc'
                    } catch (err) {
                        echo 'WARNING: Javadoc generation failed, continuing the pipeline...'
                    }
                }
            }
        }

        stage('Site') {
            steps {
                sh 'mvn site'
            }
        }
        stage('Package') {
             steps {
                sh 'mvn package -DskipTests'
             }
         }
    }
     post {
         always {
             archiveArtifacts artifacts: '**/target/site/**/*.*', fingerprint: true
             archiveArtifacts artifacts: '**/target/**/*.jar', fingerprint: true
             archiveArtifacts artifacts: '**/target/**/*.war', fingerprint: true
             junit '**/target/surefire-reports/*.xml'
         }
     }
 }