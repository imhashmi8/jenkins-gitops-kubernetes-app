pipeline{
    agent any
     environment{
        NAME= "TODO-APP"
        VERSION= "${env.BUILD_ID}-${env.GIT_COMMIT}"
        IMAGE_REPO= "hashmi111"
        GIT_REPO= "jenkins-gitops-kubernetes-cicd"
        ARGOCD_TOKEN= credentials("argocd-token")
        GITHUB_TOKEN= credentials("github-token")
    }

    stages{
        stage("Unit Testing"){
            steps{
                echo "========executing A========"
                echo "========executing B========"
            }
        }

        stage("Build Docker Image"){
            steps{
                echo "========Building Docker Image========"
                sh "docker build -t ${IMAGE_REPO}/${NAME}:${VERSION} ."
                sh "docker tag ${IMAGE_REPO}/${NAME}:${VERSION} ${IMAGE_REPO}/${NAME}:latest"
            }
        }

        stage("Push Docker Image"){
            steps{
                echo "========Pushing Docker Image to Registry========"
                withDockerRegistry(credentialsId: 'docker-hub', url: '') {
                    sh "docker push ${IMAGE_REPO}/${NAME}:${VERSION}"
                }   
            }
        }

        stage("clone/Pull Repo"){
            steps{
                script{
                    if (fileExists("${GIT_REPO}")) {
                        echo "========Pulling Latest Changes from Repository========"
                        dir("${GIT_REPO}") {
                            sh "git pull origin main"
                        }
                    } else {
                echo "========Cloning/Pulling Repository========"
                sh "git clone https://github.com/imhashmi8/${GIT_REPO}.git"
                }
            }
        }
        }
        stage
}
}