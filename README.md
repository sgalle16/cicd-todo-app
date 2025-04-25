# ToDo App CI/CD Pipeline Implementation

[![CI/CD Pipeline ToDo App](https://github.com/sgalle16/cicd-todo-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/sgalle16/cicd-todo-app/actions/workflows/ci-cd.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sgalle16_cicd-todo-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sgalle16_cicd-todo-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Goal

This repository demonstrates and implements a complete **Continuous Integration and Continuous Deployment (CI/CD) pipeline** for a ToDo web application, built as part of a learning process focused on core DevOps practices through automation.

The application itself is a simple ToDo list manager built with Node.js, Express, and TypeScript. The primary focus of this project is the automation pipeline, showcasing practices in automated testing, code quality analysis, containerization, Infrastructure as Code (IaC), and deployment to multiple environments on AWS ECS (Fargate) with rollback capabilities. This fosters collaboration between development and operations by providing a reliable, repeatable, and rapid deployment workflow.

## CI/CD Pipeline Overview

The pipeline is implemented using **GitHub Actions**, fully automates the application lifecycle from code commit to continuos production deployment:

1.  **Continuous Integration (CI):**

    - **Code Quality:** Runs linters (ESLint) and formatters (Prettier).
    - **Testing:** Runs unit and integration tests (Jest) and generates coverage reports.
    - **SonarCloud Analysis:** Analyzes code quality, security, and coverage; checks Quality Gate..
    - **Docker Build & Scan:** Builds a production-ready Docker image, scans for vulnerabilities (Trivy).
    - **Publishing:** Pushes the validated Docker image to Docker Hub.

2.  **Continuous Deployment (CD):**
    - **Infrastructure:** Provisions or updates AWS infrastructure using **CloudFormation**.
    - **Deploy to Staging:** Deploys the new Docker image to **AWS ECS (Fargate)** in a dedicated Staging environment.
    - **Test Staging:** Runs **E2E/Acceptance Tests** (Playwright) against the live Staging environment.
    - **Deploy to Production:** If Staging tests pass, deploys the same Docker image to the Production environment on AWS ECS.
    - **Test Production:** Runs **Smoke Tests** (Playwright) against the live Production environment.
    - **Rollback:** Includes a mechanism to automatically trigger a rollback to the previous stable version if Production smoke tests fail.

## Technology Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Frontend:** HTML, CSS, JS
- **Testing:** Jest, Playwright
- **Linting/Formatting:** ESLint, Prettier
- **Containerization:** Docker, DockerHub
- **CI/CD:** GitHub Actions
- **Code Analysis:** SonarCloud
- **Cloud/Deployment:** AWS ECS (Fargate), AWS Application Load Balancer (ALB)
- **IaC:** AWS CloudFormation

## Getting Started Locally

### Prerequisites

- Node.js (v22.14+)
- npm or yarn
- Docker (Optional, for building/running the image locally)

### Running the Application

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Build TypeScript:**
    ```bash
    npm run build
    ```
3.  **Start Server:**
    ```bash
    npm start
    ```
4.  Open your browser to `http://localhost:5000` (or configured port).

### Running Tests

```bash
# Run linters
npm run lint

# Run format checker
npm run format:check
npm run format # format code style

# Run unit & integration tests (Jest) with coverage report
npm run test:cov

# Run playwright tests (requires app running, e.g., via `npm start`)
npm run test:e2e:setup # install browsers
npm run test:acceptance
npm run test:smoke
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
