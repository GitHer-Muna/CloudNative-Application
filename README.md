# Cloud-Native Inventory Management System

A production-grade, highly available inventory management application built with modern DevOps practices and deployed on AWS.

## Project Overview

This is a full-stack inventory management system that allows businesses to track products, manage stock levels, and monitor inventory across multiple warehouses. The application demonstrates enterprise-grade architecture patterns and cloud-native deployment strategies.

## Architecture

### Application Components
- **Frontend**: React.js SPA with Material-UI
- **Backend**: Node.js REST API with Express
- **Database**: AWS RDS Aurora MySQL (Multi-AZ)
- **Container Orchestration**: Amazon EKS

### AWS Services Used
- **Amazon EKS** - Managed Kubernetes cluster
- **Amazon RDS Aurora MySQL** - Highly available database
- **Amazon VPC** - Network isolation
- **Elastic Load Balancer** - Traffic distribution
- **Amazon ECR** - Container registry
- **AWS Secrets Manager** - Credentials management

## Features

### Inventory Management
- Add, update, and delete products
- Track stock levels across multiple warehouses
- Low stock alerts and notifications
- Product categorization and search
- Bulk import/export capabilities

### User Management
- Role-based access control (Admin, Manager, Staff)
- User authentication and authorization
- Audit logging for all operations

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js >= 18
- Git
- (Optional for EKS) `kubectl`, `eksctl`, `aws` CLI

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/GitHer-Muna/CloudNative-Application.git
   cd CloudNative-Application
   ```

2. **Run backend locally**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Run frontend locally**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm start
   ```

4. **Run locally with Docker Compose** (recommended for dev)

   This starts MySQL (with schema and seed data), the backend (with hot-reload) and the frontend in dev mode.

   ```bash
   # from repository root
   docker compose up -d --build

   # check services
   docker compose ps

   # verify backend health
   curl http://localhost:5000/health
   ```

   Useful tips:
   - Dev DB mapping: host port **3307** -> container port **3306**.
   - Dev DB credentials (compose): `inventory_user` / `inventory_pass` (DB: `inventory_db`) — **development only**.
   - To stop & remove containers and volumes: `docker compose down -v`.
   - If the DB volume exists, schema/seed SQL in `database/` will not be re-run unless you remove the volume.

   For API root: use `/health` or `/api/*`. The server returns `404` for `/` by design (API-only), but an index is also available at `/`.

### Application Deployment

Deployment is managed using three consolidated scripts in the `scripts/` folder:

- `scripts/install.sh` — checks for required CLI tools (`aws`, `eksctl`, `kubectl`, `docker`, `helm`) and can attempt to install missing tools (use `--yes` to auto-install).
- `scripts/deploy.sh` — builds images, pushes them to your registry, optionally creates an EKS cluster, and applies Kubernetes manifests. It supports a safe `--dry-run` mode.
- `scripts/delete.sh` — safe teardown helpers for deleting a namespace and/or EKS cluster (`--namespace`, `--cluster`, `--all`). Use `--yes` to skip interactive confirmation.

Quick examples:

Build and push images (to ECR) and apply manifests (dry-run):
```bash
REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo TAG=ci123 ./scripts/deploy.sh --dry-run --build --push --apply
```

Create cluster, build, push, and apply (dry-run):
```bash
REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo TAG=ci123 ./scripts/deploy.sh --dry-run --cluster-create --build --push --apply
```

Real run (replace REGISTRY/TAG with your values):
```bash
REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo TAG=1.0.0 ./scripts/deploy.sh --cluster-create --build --push --apply
```

Notes & best practices:
- Ensure your ECR repository exists and you are authenticated (`aws ecr get-login-password ... | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com`).
- Manage production secrets via AWS Secrets Manager and inject them into Kubernetes via ExternalSecrets or a secure CI pipeline.
- The orchestration scripts avoid destructive changes by default; use `--dry-run` to validate flows before running for real.

Notes & best practices:
- Use **immutable image tags** (timestamp or commit SHA) in production.
- Store production secrets in **AWS Secrets Manager** and inject into k8s via ExternalSecrets or CI.
- Ensure RDS is in a network accessible from EKS (VPC/subnet & security group rules).

---

## CI/CD Pipeline (if you decide to add)
- Build (unit tests + lint)
- Build and push Docker images to ECR
- Deploy to Kubernetes (kubectl / helm)
- Run integration / smoke tests and health checks

If you prefer I can add a GitHub Actions workflow to automate the above (no Terraform changes required).

## Monitoring & Logging

- **Application Logs**: CloudWatch Logs
- **Metrics**: CloudWatch Metrics
- **Container Insights**: EKS monitoring
- **Database Monitoring**: RDS Performance Insights

## Security

- Network isolation using VPC
- Private subnets for databases
- Security groups with least privilege
- Secrets stored in AWS Secrets Manager
- HTTPS/TLS encryption
- Regular security scanning of container images

## Cost Optimization

- Auto-scaling for EKS nodes
- RDS Aurora with read replicas
- Spot instances for non-critical workloads
- Resource tagging for cost allocation

## Contributing

This is a portfolio project for demonstrating DevOps capabilities. For questions or discussions, please open an issue.