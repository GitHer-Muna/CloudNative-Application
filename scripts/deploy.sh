#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — build/push images and deploy k8s manifests
# Usage: ./deploy.sh [--build] [--push] [--apply] [--cluster-create] [--dry-run]

DRY_RUN=0
DO_BUILD=0
DO_PUSH=0
DO_APPLY=0
DO_CLUSTER_CREATE=0

while (( "$#" )); do
  case "$1" in
    --build) DO_BUILD=1; shift;;
    --push) DO_PUSH=1; shift;;
    --apply) DO_APPLY=1; shift;;
    --cluster-create) DO_CLUSTER_CREATE=1; shift;;
    --dry-run) DRY_RUN=1; shift;;
    -h|--help) echo "Usage: $0 [--build] [--push] [--apply] [--cluster-create] [--dry-run]"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

REGISTRY=${REGISTRY:-}
TAG=${TAG:-latest}
NAMESPACE=${K8S_NAMESPACE:-inventory-system}
CLUSTER_NAME=${CLUSTER_NAME:-didi-cluster}

if [ $DRY_RUN -eq 1 ]; then
  echo "DRY RUN: no destructive changes will be executed"
fi

run(){
  echo "+ $*"
  if [ $DRY_RUN -eq 0 ]; then
    eval "$@"
  fi
}

# Build images
if [ $DO_BUILD -eq 1 ]; then
  if [ -z "$REGISTRY" ]; then
    echo "REGISTRY env var not set. Set REGISTRY to your container registry (e.g., 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo)"; exit 1
  fi
  echo "Building backend image"
  run "docker build -t $REGISTRY/backend:$TAG ./backend"
  echo "Building frontend image"
  run "docker build -t $REGISTRY/frontend:$TAG ./frontend"
fi

# Push images
if [ $DO_PUSH -eq 1 ]; then
  if [ -z "$REGISTRY" ]; then
    echo "REGISTRY env var not set. Set REGISTRY to your container registry"; exit 1
  fi
  echo "Pushing images to $REGISTRY"
  run "docker push $REGISTRY/backend:$TAG"
  run "docker push $REGISTRY/frontend:$TAG"
fi

# Create EKS cluster (optional)
if [ $DO_CLUSTER_CREATE -eq 1 ]; then
  echo "Creating EKS cluster '$CLUSTER_NAME' (this may take 10+ minutes)"
  run "eksctl create cluster --name $CLUSTER_NAME --region ${AWS_REGION:-us-east-1} --nodes 2 || true"
fi

# Deploy k8s manifests
if [ $DO_APPLY -eq 1 ]; then
  echo "Applying manifests into namespace $NAMESPACE"
  run "kubectl create ns $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -"
  # simple replace for images if REGISTRY provided
  if [ -n "$REGISTRY" ]; then
    echo "Templating manifests with registry: $REGISTRY and tag: $TAG"
    run "for f in \$(find k8s -name '*.yaml' -type f); do sed -e 's|REPLACE_REGISTRY|$REGISTRY|g' -e 's|REPLACE_TAG|$TAG|g' \"\$f\" | kubectl apply -n $NAMESPACE -f -; done"
  else
    run "kubectl apply -n $NAMESPACE -f k8s/ -R"
  fi
fi

echo "Done."