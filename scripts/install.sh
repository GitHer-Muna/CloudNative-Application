#!/usr/bin/env bash
set -euo pipefail

# install.sh — check and optionally install required CLI tools for infra
# Usage: ./install.sh [--yes]

AUTO_YES=0
if [[ ${1:-} == "--yes" ]]; then
  AUTO_YES=1
fi

require(){
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "MISSING: $1"
    return 1
  fi
  return 0
}

MISSING=()
for cmd in aws eksctl kubectl docker helm; do
  if ! require "$cmd"; then
    MISSING+=("$cmd")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "All required CLIs are present: aws eksctl kubectl docker helm"
  exit 0
fi

echo "The following tools are missing: ${MISSING[*]}"
if [ "$AUTO_YES" -eq 0 ]; then
  read -p "Attempt to install missing tools? (requires sudo) [y/N] " yn
  case "$yn" in
    [Yy]*) ;;
    *) echo "Aborting — install missing tools manually or rerun with --yes"; exit 1;;
  esac
fi

# Minimal automated install for common Linux envs. If something fails, guide user.
if [[ " ${MISSING[*]} " == *" eksctl "* ]]; then
  echo "Installing eksctl..."
  curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp && sudo mv /tmp/eksctl /usr/local/bin/
fi
if [[ " ${MISSING[*]} " == *" aws "* ]]; then
  echo "Installing AWS CLI v2..."
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp && sudo /tmp/aws/install || echo "Install awscli manually"
fi
if [[ " ${MISSING[*]} " == *" kubectl "* ]]; then
  echo "Installing kubectl..."
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
fi
if [[ " ${MISSING[*]} " == *" docker "* ]]; then
  echo "Please install Docker using your distro's package manager. See https://docs.docker.com/engine/install/"
fi
if [[ " ${MISSING[*]} " == *" helm "* ]]; then
  echo "Installing Helm..."
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

echo "Done — re-run ./install.sh to verify all tools are now present."