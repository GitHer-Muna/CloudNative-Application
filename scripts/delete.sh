#!/usr/bin/env bash
set -euo pipefail

# delete.sh — safe teardown helpers
# Usage: ./delete.sh [--namespace] [--cluster] [--all] [--yes]

DEL_NS=0
DEL_CLUSTER=0
YES=0
while (( "$#" )); do
  case "$1" in
    --namespace) DEL_NS=1; shift;;
    --cluster) DEL_CLUSTER=1; shift;;
    --all) DEL_NS=1; DEL_CLUSTER=1; shift;;
    --yes) YES=1; shift;;
    -h|--help) echo "Usage: $0 [--namespace] [--cluster] [--all] [--yes]"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [ $DEL_NS -eq 0 ] && [ $DEL_CLUSTER -eq 0 ]; then
  echo "Nothing to do. Use --namespace, --cluster or --all"; exit 0
fi

confirm(){
  if [ $YES -eq 1 ]; then return 0; fi
  read -p "$1 [y/N] " yn
  case "$yn" in
    [Yy]*) return 0;;
    *) return 1;;
  esac
}

if [ $DEL_NS -eq 1 ]; then
  NS=${K8S_NAMESPACE:-inventory-system}
  if confirm "Delete Kubernetes namespace '$NS'? This will remove all workloads in that namespace."; then
    kubectl delete namespace "$NS" || echo "Namespace $NS not found or already deleted"
  else
    echo "Skipped namespace deletion"
  fi
fi

if [ $DEL_CLUSTER -eq 1 ]; then
  CLUSTER_NAME=${CLUSTER_NAME:-didi-inventory-cluster}
  if confirm "Delete EKS cluster '$CLUSTER_NAME'? This will destroy your cluster and associated resources."; then
    eksctl delete cluster --name "$CLUSTER_NAME" --region ${AWS_REGION:-ap-southeast-2} || echo "Cluster not found or delete failed"
  else
    echo "Skipped cluster deletion"
  fi
fi

echo "Done."