#!/bin/bash

# Identity Forge Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Environment: staging, production
# Action: deploy, rollback, status

set -e

ENVIRONMENT=${1:-staging}
ACTION=${2:-deploy}
NAMESPACE="identity-forge"
IMAGE_TAG=${3:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build and push Docker image
build_image() {
    log_info "Building Docker image..."
    
    # Build image
    docker build -t identity-forge-api:$IMAGE_TAG .
    
    # Tag for registry
    docker tag identity-forge-api:$IMAGE_TAG ghcr.io/your-org/identity-forge:$IMAGE_TAG
    
    # Push to registry
    docker push ghcr.io/your-org/identity-forge:$IMAGE_TAG
    
    log_success "Docker image built and pushed"
}

# Deploy to Kubernetes
deploy() {
    log_info "Deploying to $ENVIRONMENT environment..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Update image tag in deployment
    sed -i.bak "s|image: identity-forge-api:latest|image: ghcr.io/your-org/identity-forge:$IMAGE_TAG|g" k8s/api-deployment.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/postgres-deployment.yaml
    kubectl apply -f k8s/redis-deployment.yaml
    kubectl apply -f k8s/api-deployment.yaml
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/identity-forge-api -n $NAMESPACE --timeout=300s
    
    # Restore original file
    mv k8s/api-deployment.yaml.bak k8s/api-deployment.yaml
    
    log_success "Deployment completed"
}

# Rollback deployment
rollback() {
    log_info "Rolling back deployment..."
    
    kubectl rollout undo deployment/identity-forge-api -n $NAMESPACE
    kubectl rollout status deployment/identity-forge-api -n $NAMESPACE --timeout=300s
    
    log_success "Rollback completed"
}

# Check deployment status
status() {
    log_info "Checking deployment status..."
    
    echo "=== Deployment Status ==="
    kubectl get deployments -n $NAMESPACE
    
    echo -e "\n=== Pod Status ==="
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n=== Service Status ==="
    kubectl get services -n $NAMESPACE
    
    echo -e "\n=== Ingress Status ==="
    kubectl get ingress -n $NAMESPACE
    
    echo -e "\n=== Recent Events ==="
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    # Get service URL
    SERVICE_URL=$(kubectl get service identity-forge-api-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$SERVICE_URL" ]; then
        log_warning "Service URL not found, using port-forward"
        kubectl port-forward service/identity-forge-api-service 8080:80 -n $NAMESPACE &
        PORT_FORWARD_PID=$!
        sleep 5
        SERVICE_URL="localhost:8080"
    fi
    
    # Run health checks
    log_info "Testing /healthz endpoint..."
    if curl -f http://$SERVICE_URL/healthz; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    log_info "Testing /readyz endpoint..."
    if curl -f http://$SERVICE_URL/readyz; then
        log_success "Readiness check passed"
    else
        log_error "Readiness check failed"
        exit 1
    fi
    
    # Clean up port-forward if used
    if [ ! -z "$PORT_FORWARD_PID" ]; then
        kill $PORT_FORWARD_PID
    fi
    
    log_success "All health checks passed"
}

# Database migration
migrate() {
    log_info "Running database migrations..."
    
    # Get database URL from secret
    DATABASE_URL=$(kubectl get secret identity-forge-secrets -n $NAMESPACE -o jsonpath='{.data.DATABASE_URL}' | base64 -d)
    
    # Run migrations
    DATABASE_URL=$DATABASE_URL yarn prisma migrate deploy
    
    log_success "Database migrations completed"
}

# Main execution
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"
    log_info "Image Tag: $IMAGE_TAG"
    
    check_prerequisites
    
    case $ACTION in
        "deploy")
            build_image
            deploy
            health_check
            migrate
            status
            ;;
        "rollback")
            rollback
            health_check
            status
            ;;
        "status")
            status
            ;;
        "health")
            health_check
            ;;
        "migrate")
            migrate
            ;;
        *)
            log_error "Unknown action: $ACTION"
            echo "Usage: $0 [environment] [action] [image_tag]"
            echo "Actions: deploy, rollback, status, health, migrate"
            exit 1
            ;;
    esac
    
    log_success "Deployment process completed"
}

# Run main function
main "$@"
