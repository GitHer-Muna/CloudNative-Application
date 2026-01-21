# Architecture Documentation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              End Users / Clients                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Internet Gateway (AWS)                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    ┌────────────┴──────────────┐
                    │                           │
                    ▼                           ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │   Public Subnet      │    │   Public Subnet      │
        │   (us-east-1a)       │    │   (us-east-1b)       │
        │  ┌────────────────┐  │    │  ┌────────────────┐  │
        │  │  NAT Gateway   │  │    │  │  NAT Gateway   │  │
        │  └────────────────┘  │    │  └────────────────┘  │
        │  ┌────────────────┐  │    │  ┌────────────────┐  │
        │  │ Load Balancer  │◄─┼────┼──┤ Load Balancer  │  │
        │  └────────────────┘  │    │  └────────────────┘  │
        └──────────┬───────────┘    └──────────┬───────────┘
                   │                           │
                   │                           │
        ┌──────────┴───────────┐    ┌──────────┴───────────┐
        │  Private Subnet      │    │  Private Subnet      │
        │   (us-east-1a)       │    │   (us-east-1b)       │
        │                      │    │                      │
        │  ┌────────────────┐  │    │  ┌────────────────┐  │
        │  │  EKS Worker    │  │    │  │  EKS Worker    │  │
        │  │  Node 1        │  │    │  │  Node 2        │  │
        │  │                │  │    │  │                │  │
        │  │ ┌──────────┐   │  │    │  │ ┌──────────┐   │  │
        │  │ │Frontend  │   │  │    │  │ │Frontend  │   │  │
        │  │ │Pod 1     │   │  │    │  │ │Pod 2     │   │  │
        │  │ └──────────┘   │  │    │  │ └──────────┘   │  │
        │  │ ┌──────────┐   │  │    │  │ ┌──────────┐   │  │
        │  │ │Backend   │   │  │    │  │ │Backend   │   │  │
        │  │ │Pod 1     │   │  │    │  │ │Pod 2     │   │  │
        │  │ └─────┬────┘   │  │    │  │ └─────┬────┘   │  │
        │  └───────┼────────┘  │    │  └───────┼────────┘  │
        └──────────┼───────────┘    └──────────┼───────────┘
                   │                           │
                   └───────────┬───────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │   RDS (MySQL)        │
                   │   (Multi-AZ)          │
                   │                       │
                   │  ┌─────────────────┐  │
                   │  │  Primary DB     │  │
                   │  │  (us-east-1a)   │  │
                   │  └────────┬────────┘  │
                   │           │           │
                   │  ┌────────▼────────┐  │
                   │  │  Replica DB     │  │
                   │  │  (us-east-1b)   │  │
                   │  └─────────────────┘  │
                   └───────────────────────┘
```

## Component Architecture

### Frontend (React Application)
```
┌──────────────────────────────────────────────┐
│          React Application                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Components                            │  │
│  │  - Layout (Navigation, Sidebar)        │  │
│  │  - Dashboard                           │  │
│  │  - Products CRUD                       │  │
│  │  - Categories CRUD                     │  │
│  │  - Warehouses CRUD                     │  │
│  └────────────────┬───────────────────────┘  │
│                   │                          │
│  ┌────────────────▼───────────────────────┐  │
│  │  Services (API Layer)                  │  │
│  │  - axios client                        │  │
│  │  - API endpoints                       │  │
│  └────────────────┬───────────────────────┘  │
│                   │                          │
└───────────────────┼──────────────────────────┘
                    │ HTTP/REST
                    ▼
```

### Backend (Node.js API)
```
┌──────────────────────────────────────────────┐
│          Express.js Server                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Middleware                            │  │
│  │  - CORS, Helmet, Morgan                │  │
│  │  - Error Handler                       │  │
│  │  - Request Validation                  │  │
│  └────────────────┬───────────────────────┘  │
│                   │                          │
│  ┌────────────────▼───────────────────────┐  │
│  │  Routes                                │  │
│  │  - /api/products                       │  │
│  │  - /api/categories                     │  │
│  │  - /api/warehouses                     │  │
│  │  - /api/users                          │  │
│  └────────────────┬───────────────────────┘  │
│                   │                          │
│  ┌────────────────▼───────────────────────┐  │
│  │  Models (Business Logic)               │  │
│  │  - Product.js                          │  │
│  │  - Category.js                         │  │
│  │  - Warehouse.js                        │  │
│  └────────────────┬───────────────────────┘  │
│                   │                          │
│  ┌────────────────▼───────────────────────┐  │
│  │  Database Layer                        │  │
│  │  - Connection Pool                     │  │
│  │  - Query Execution                     │  │
│  └────────────────┬───────────────────────┘  │
│                   │                          │
└───────────────────┼──────────────────────────┘
                    │ MySQL Protocol
                    ▼
```

## Data Flow

### Read Operation (Get Products)
```
User Browser
    │
    │ 1. HTTP GET /api/products
    ▼
Load Balancer
    │
    │ 2. Route to healthy pod
    ▼
Frontend Pod (Nginx)
    │
    │ 3. Proxy to backend
    ▼
Backend Pod (Node.js)
    │
    │ 4. Execute query
    ▼
RDS (MySQL)
    │
    │ 5. Return data
    ▼
Backend Pod
    │
    │ 6. Format JSON response
    ▼
Frontend Pod
    │
    │ 7. Render in browser
    ▼
User Browser
```

### Write Operation (Create Product)
```
User Browser
    │
    │ 1. HTTP POST /api/products
    │    with product data
    ▼
Load Balancer
    │
    │ 2. Route to pod
    ▼
Backend Pod
    │
    │ 3. Validate data
    ▼
Backend Pod
    │
    │ 4. INSERT query
    ▼
RDS Primary
    │
    │ 5. Replicate to standby
    ▼
RDS Replica
    │
    │ 6. Return inserted record
    ▼
Backend Pod
    │
    │ 7. Return success response
    ▼
User Browser
```

## Infrastructure Components

### AWS VPC Configuration
```
VPC (10.0.0.0/16)
│
├── Public Subnets
│   ├── 10.0.0.0/20 (us-east-1a)
│   │   ├── NAT Gateway
│   │   └── Load Balancer
│   └── 10.0.16.0/20 (us-east-1b)
│       ├── NAT Gateway
│       └── Load Balancer
│
└── Private Subnets
    ├── 10.0.32.0/20 (us-east-1a)
    │   ├── EKS Worker Nodes
    │   └── RDS Primary
    └── 10.0.48.0/20 (us-east-1b)
        ├── EKS Worker Nodes
        └── RDS Replica
```

### EKS Cluster Components
```
EKS Control Plane (Managed by AWS)
    │
    ├── API Server
    ├── etcd
    ├── Controller Manager
    └── Scheduler
    
Node Group (Managed by eksctl or your IaC of choice)
    │
    ├── EC2 Instance (t3.medium) - AZ 1
    │   └── Pods
    │       ├── frontend-xxx
    │       ├── backend-xxx
    │       └── system pods
    │
    └── EC2 Instance (t3.medium) - AZ 2
        └── Pods
            ├── frontend-yyy
            ├── backend-yyy
            └── system pods

> Note: This project uses `eksctl` for in-repo cluster creation by default. The repository also includes helper scripts to automate the full flow:
> - `scripts/eksctl_full_deploy.sh` — (optional) create cluster, build & push images, deploy manifests
> - `scripts/build_and_push.sh` — builds backend/frontend and pushes to ECR
> - `scripts/k8s_deploy.sh` — applies manifests and updates deployment images
> - `scripts/validate_repo.sh` — basic preflight checks
>
> Important project-specific notes:
> - The deploy scripts **do not** create or manage a production database (RDS). You must provision an RDS instance (or provide an in-cluster DB) and create the Kubernetes `backend-secrets` with the DB credentials before deploying the backend.
> - For development, the repo includes a `docker-compose.yml` that brings up a local MySQL instance (mapped to host port 3307). That compose file contains **development-only** credentials and is intended for local development only — do not use it in production.
> - For production-grade secret handling, use **AWS Secrets Manager** and a mechanism such as Kubernetes ExternalSecrets (or IRSA + Secrets Manager) to inject secrets into the cluster. See `k8s/backend/secrets.example.yaml` for the example keys expected by the backend.
> - The frontend dev server may have WebSocket (HMR) limitations in browser previews (Codespaces). The project provides `WDS_SOCKET_*` env var placeholders in `docker-compose.yml` and `CHOKIDAR_USEPOLLING=true` for reliable file watching in constrained environments.
> 
> If you manage infrastructure with a different IaC tool, keep those configs in a separate infra repository and follow standard practices.
```

### Database Structure
```
RDS Aurora Cluster
    │
    ├── Writer Instance (Primary)
    │   └── Handles: All writes, reads
    │
    └── Reader Instance (Replica)
        └── Handles: Read operations
        
RDS storage (Auto-scaling)
    │
    ├── Continuous backup to S3
    ├── Point-in-time recovery
    └── Automated snapshots
```

## Security Architecture

### Network Security
```
Internet → IGW → Load Balancer → Frontend Pods → Backend Pods → RDS
    │                 │                │              │           │
    ├─────────────────┼────────────────┼──────────────┼───────────┘
    │                 │                │              │
Security Groups:      │                │              │
├─ LB SG: 80/443     │                │              │
│  from 0.0.0.0/0    │                │              │
│                    │                │              │
├─ EKS Node SG:      │                │              │
│  All traffic from  │                │              │
│  Load Balancer SG  │                │              │
│                    │                │              │
└─ RDS SG:           │                │              │
   3306 from         │                │              │
   EKS Node SG only  │                │              │
```

### Secrets Management
```
Application Deployment
    │
    ├── Database Credentials
    │   └── AWS Secrets Manager (recommended)
    │       └── Use ExternalSecrets or IRSA to inject into k8s
    │
    ├── JWT Secret
    │   └── Kubernetes Secret (example: k8s/backend/secrets.example.yaml)
    │       └── Base64 encoded or created from secrets manager
    │
    └── Environment Variables
        └── ConfigMap
            └── Non-sensitive config
```

> Best practice: rotate secrets, avoid committing any secrets, and grant least privilege access to secrets via IAM roles and Kubernetes service accounts (IRSA).

## Scaling Strategy

### Horizontal Pod Autoscaling
```
CloudWatch Metrics
    │
    ├── CPU Utilization > 70%
    │   └── Add pod replicas
    │
    ├── Memory Utilization > 80%
    │   └── Add pod replicas
    │
    └── CPU/Memory < threshold
        └── Remove pod replicas

Min Replicas: 2
Max Replicas: 10 (Backend), 5 (Frontend)
```

### Node Autoscaling
```
EKS Node Group
    │
    ├── Pods pending (insufficient resources)
    │   └── Add worker node
    │
    └── Low resource utilization
        └── Remove worker node

Min Nodes: 2
Max Nodes: 4
Instance Type: t3.medium
```

## CI/CD Pipeline Flow

```
GitHub Repository
    │
    │ Push to main branch
    ▼
CI/CD pipeline (platform of your choice)
    │
    ├─── Infrastructure Pipeline (OPTIONAL)
    │    │
    │    ├── 1. Provision infrastructure (e.g., `eksctl` or other external IaC tool)
    │    ├── 2. Output cluster info (kubeconfig/ARNs)
    │    └── 3. Approval gates for production changes
    │
    └─── Application Pipeline
         │
         ├── 1. Run Tests
         │   ├── Backend unit tests
         │   └── Frontend unit tests
         │
         ├── 2. Build Docker Images
         │   ├── Build backend image
         │   ├── Build frontend image
         │   └── Push to ECR
         │
         └── 3. Deploy to EKS
             ├── Update secrets
             ├── Apply K8s manifests
             ├── Rolling update
             └── Health checks
```

## Monitoring and Logging

```
Application Logs → CloudWatch Logs
    │
    ├── Backend API logs
    ├── Frontend access logs
    └── Database query logs

CloudWatch Metrics
    │
    ├── EKS Container Insights
    │   ├── Pod CPU/Memory
    │   ├── Node utilization
    │   └── Cluster metrics
    │
    └── RDS Performance Insights
        ├── Query performance
        ├── Connection stats
        └── Resource utilization
```

## Disaster Recovery

### Backup Strategy
```
RDS Aurora
    │
    ├── Automated snapshots (daily) and point-in-time recovery enabled
    ├── Continuous backup to S3 (managed by AWS)
    └── Manual snapshot capability for pre-change backups
```

### Recovery & Runbooks
- Document runbooks for node/availability zone failures, RDS failover, and cluster control-plane issues.
- Test restore and failover procedures regularly (e.g., quarterly).
- Use automated health checks and alerts (CloudWatch Alarms / SNS) to trigger runbook execution.
    ├── Automated Backups (7 days retention)
    ├── Manual Snapshots
    └── Point-in-time Recovery (up to 5 minutes)

Application State
    │
    └── Stateless design
        └── No persistent data in pods
        └── All data in RDS

Infrastructure
    │
    └── Remote State / IaC Considerations
        └── If you use an external IaC tool, follow best practices for remote state storage and locking; otherwise use `eksctl` for simple in-repo cluster creation.
```

### High Availability
- Multi-AZ deployment
- Auto-healing pods (Kubernetes restarts failed pods)
- RDS automatic failover (< 2 minutes)
- Multiple replicas prevent single point of failure
- Load balancer health checks route traffic to healthy pods

This architecture provides:
- ✅ High Availability (99.9%+ uptime)
- ✅ Scalability (horizontal scaling)
- ✅ Security (network isolation, secrets management)
- ✅ Observability (logging, metrics)
- ✅ Disaster Recovery (backups, multi-AZ)
- ✅ Cost Optimization (auto-scaling, right-sizing)
