# Jenkins + GitOps + Kubernetes CI/CD Project

This project showcases a practical CI/CD and GitOps workflow built around a containerized Node.js application. It demonstrates how source code moves from a GitHub push to a Docker image build in Jenkins, then into a Kubernetes deployment managed through Argo CD.

## Project Flow

The diagram below summarizes the delivery flow used in this project, from application code changes to GitOps-based deployment in Kubernetes.

![CI/CD with GitOps Flow](docs/images/gitops-flow.png)

From a recruiter’s point of view, this project highlights hands-on experience with:

- Jenkins pipeline creation and troubleshooting
- Docker image build and registry publishing
- GitOps deployment flow using a separate manifests repository
- Kubernetes `Deployment` and `Service` resources
- Argo CD application creation and sync management
- secret handling outside Git for safer deployment practices

## Project Repositories

This setup uses two separate GitHub repositories.

- Application repository:
  `https://github.com/imhashmi8/jenkins-gitops-kubernetes-app`

- Deployment repository:
  `https://github.com/imhashmi8/jenkins-gitops-kubernetes-deployment`

The separation is intentional and follows a GitOps-friendly pattern:

- the app repository contains source code, Dockerfile, and Jenkins pipeline
- the deployment repository contains Kubernetes manifests
- Argo CD watches only the deployment repository

## High-Level Workflow

```text
Developer pushes code to application repo
        |
        v
Jenkins pipeline starts
        |
        |-- checkout source code
        |-- build Docker image
        |-- push image to Docker Hub
        |-- clone deployment repo
        |-- update image tag in deployment manifest
        |-- commit and push manifest changes
        v
Argo CD detects updated manifest in deployment repo
        |
        v
Kubernetes cluster syncs and deploys new image
```

## Current Setup

### 1. Application Layer

The application is a Node.js and Express-based Todo app backed by MongoDB Atlas.

Current app characteristics:

- containerized with Docker
- runs on port `3000`
- uses `MONGO_URI` from environment variables
- built and tagged by Jenkins

### 2. Jenkins CI Pipeline

Jenkins is configured to:

- trigger on GitHub push
- read the `Jenkinsfile` from the application repository
- build the Docker image
- push the image to Docker Hub
- clone the deployment repository
- update the Kubernetes deployment manifest with the new image tag
- commit and push the updated manifest back to GitHub

This keeps CI in Jenkins while leaving cluster reconciliation to Argo CD.

### 3. Deployment Repository

The deployment repository stores the Kubernetes manifests used by Argo CD, including:

- `deployment.yaml`
- `service.yaml`

This repository acts as the source of truth for the deployed state.

### 4. Argo CD Continuous Delivery

Argo CD is configured to monitor the deployment repository. Once Jenkins updates the image tag and pushes the manifest change, Argo CD detects the drift and syncs the application to Kubernetes.

In this project, the Argo CD application is created through the Argo CD UI rather than by applying an `Application` YAML manifest from the CLI.

## Why the Two-Repo Approach Matters

This design reflects a more production-oriented workflow than a single-repo deployment model.

Benefits:

- clear separation between application code and deployment state
- safer GitOps model where Argo CD watches only Kubernetes manifests
- better audit trail for every deployment change
- easier rollback by reverting a manifest commit
- cleaner ownership model between developers and platform workflows

## Kubernetes Resources Used

The deployment repository contains Kubernetes resources for exposing and running the app:

- `Deployment`
  Runs the application pods and defines the image version to be deployed

- `Service`
  Exposes the application internally or externally depending on the chosen service type

The application deployment references a Kubernetes secret for the MongoDB connection string.

## Manual Secret Deployment

The MongoDB connection string is not stored in GitHub for security reasons.

Instead of committing a real `Secret` manifest to the repository, the secret is deployed manually into the Kubernetes cluster. This avoids exposing sensitive values in a public or shareable repository.

The application uses a Kubernetes secret like:

```yaml
env:
  - name: MONGO_URI
    valueFrom:
      secretKeyRef:
        name: todo-app-secret
        key: MONGO_URI
```

The secret is created manually with `kubectl`, for example:

```bash
kubectl create secret generic todo-app-secret \
  --from-literal=MONGO_URI='your-mongodb-atlas-connection-string'
```

This means:

- the real MongoDB URI stays outside Git
- the deployment manifest only references the secret name
- Kubernetes injects the value into the running container at runtime

## Argo CD Application Setup Using UI

In this project, the Argo CD application is configured from the web portal.

Typical UI configuration steps:

1. Log in to the Argo CD portal.
2. Click `NEW APP`.
3. Set the application name, for example `todo-app`.
4. Select the target project, usually `default`.
5. Set `Sync Policy` to manual or automatic.
6. Under `Source`, add the deployment repository URL.
7. Choose the target branch, such as `main`.
8. Set the path to the Kubernetes manifests inside the deployment repo.
9. Under `Destination`, choose the target Kubernetes cluster and namespace.
10. Create the application and sync it.

Once the application is created, every manifest change pushed by Jenkins can be detected and deployed by Argo CD.

## Recruiter-Focused Project Story

This project demonstrates the full path of a modern application release:

- code change in GitHub
- automated CI in Jenkins
- container image creation in Docker
- Git-based deployment promotion through a separate manifests repo
- automated Kubernetes reconciliation through Argo CD

This is valuable because it shows practical understanding of how CI and CD are separated in a real workflow:

- Jenkins builds artifacts
- Git stores the desired state
- Argo CD performs the deployment

## Missing or Incomplete Steps

The current setup is functional as a learning and portfolio project, but a few pieces are still missing or can be improved.

Current gaps:

- no automated unit or integration test stage yet
- no image vulnerability scanning in the Jenkins pipeline
- no ingress resource documented yet for browser-based access through a domain
- no sealed secrets or external secret manager integration
- no health-based rollout strategy such as canary or blue-green deployment
- no Helm or Kustomize structure yet for manifest reuse
- no monitoring or alerting integration yet

These missing pieces are worth mentioning because they show awareness of how the project could evolve into a more production-grade platform.

## Jenkins Credentials Used

This setup currently relies on Jenkins-managed credentials:

- `docker-hub`
  Used for authenticating to Docker Hub and pushing images

- `github-token`
  Used for pushing updates to the deployment repository

The MongoDB secret is intentionally not stored in Jenkins for deployment automation in this version because it is handled manually inside the cluster.

## Screenshots

### Argo CD Application

The screenshot below shows the Argo CD application after Jenkins updated the deployment repository and Argo CD synced the latest manifests successfully.

![Argo CD Application](docs/images/argocd-application.png)

### Running Application

The screenshot below shows the Todo application running after deployment to Kubernetes.

![Todo App UI](docs/images/todo-app-ui.png)

## End-to-End Delivery Steps

1. Developer pushes code to the application repository.
2. GitHub webhook triggers the Jenkins pipeline.
3. Jenkins checks out the application code.
4. Jenkins builds the Docker image.
5. Jenkins pushes the image to Docker Hub.
6. Jenkins clones the deployment repository.
7. Jenkins updates the image tag in `deployment.yaml`.
8. Jenkins commits and pushes the manifest change.
9. Argo CD detects the repository change.
10. Argo CD syncs the Kubernetes resources.
11. Kubernetes pulls the updated image and rolls out the new version.

## Summary

This project demonstrates a clean GitOps-oriented CI/CD workflow using Jenkins, Docker, GitHub, Kubernetes, and Argo CD. It also shows a good security decision: keeping deployment secrets out of Git and creating them manually in the cluster instead of exposing sensitive data in repository YAML.
