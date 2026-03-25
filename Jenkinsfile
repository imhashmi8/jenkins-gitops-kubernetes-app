pipeline{
    agent any
     environment{
        NAME= "TODO-APP"
        VERSION= "${env.BUILD_ID}-${env.GIT_COMMIT}"
        IMAGE_REPO= "hashmi111"
        APP_GIT_REPO= "jenkins-gitops-kubernetes-app"
        K8S_DEPLOYMENT_GIT_REPO= "jenkins-gitops-kubernetes-deployment"
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
                    if (fileExists("${K8S_DEPLOYMENT_GIT_REPO}")) {
                        echo "========Pulling Latest Changes from Repository========"
                        dir("${K8S_DEPLOYMENT_GIT_REPO}") {
                            sh "git pull origin main"
                        }
                    } else {
                echo "========Cloning/Pulling Repository========"
                sh "git clone https://github.com/imhashmi8/${K8S_DEPLOYMENT_GIT_REPO}.git"
                }
            }
        }
        }
        stage("Update Kubernetes Deployment Manifest"){
            steps{
                echo "========Updating Kubernetes Deployment with New Image========"
                dir("${K8S_DEPLOYMENT_GIT_REPO}/todo-app-k8s-manifest") {
                    sh "sed -i 's|image: ${IMAGE_REPO}/${NAME}:.*|image: ${IMAGE_REPO}/${NAME}:${VERSION}|g' deployment.yaml"
                    sh "cat deployment.yaml"
                }
            }
        }

        stage("Commit and Push Changes to GitHub"){
            steps{
                echo "========Committing and Pushing Changes to GitHub========"
                dir("${K8S_DEPLOYMENT_GIT_REPO}") {
                    sh "git config user.name 'Qamar-Jenkins'"
                    sh "git config user.email 'qamar.hashmi@outlook.com'"
                    sh "git remote set-url origin https://$GITHUB_TOKEN@github.com/imhashmi8/${K8S_DEPLOYMENT_GIT_REPO}.git"
                    sh "git add ."
                    sh "git commit -m 'Update deployment with new image version ${VERSION}'"
                    sh "git push origin main"
                }
            }
        }


    }
}