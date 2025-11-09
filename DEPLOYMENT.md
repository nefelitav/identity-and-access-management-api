# Identity Forge - Complete Deployment Guide

## 🚀 **Overview**

This guide covers the complete setup for Identity Forge API with automatic documentation, CI/CD pipelines, and Kubernetes deployment.

## 📋 **Prerequisites**

- Node.js 18+
- Docker & Docker Compose
- Kubernetes cluster (minikube, GKE, EKS, AKS)
- kubectl configured
- GitHub repository with Actions enabled

## 🛠️ **Quick Start**

### **Development Setup**

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo>
   cd identity-forge
   yarn install
   ```

2. **Set up environment:**

   ```bash
   cp config/development.env .env
   # Edit .env with your configuration
   ```

3. **Start development environment:**

   ```bash
   yarn docker:dev
   yarn dev
   ```

4. **Access the application:**
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/docs
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090

## 📚 **Automatic Documentation**

### **OpenAPI/Swagger Integration**

The API automatically generates documentation using OpenAPI 3.0:

- **Swagger UI**: Available at `/docs` endpoint
- **OpenAPI Spec**: Generated from JSDoc comments in routes
- **Interactive Testing**: Test endpoints directly from the UI
- **Authentication**: Built-in JWT token testing

### **Documentation Features**

- ✅ **Automatic Schema Generation** - From Zod validation schemas
- ✅ **Interactive API Testing** - Test endpoints with real data
- ✅ **Authentication Support** - JWT token integration
- ✅ **Response Examples** - Comprehensive response documentation
- ✅ **Error Documentation** - All error scenarios documented

### **Adding Documentation**

Add JSDoc comments to your routes:

```typescript
/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 */
```

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Workflow**

The pipeline includes:

1. **Code Quality Checks**
   - ESLint, Prettier, TypeScript checks
   - Unit tests with coverage
   - Security vulnerability scanning

2. **Docker Build & Push**
   - Multi-architecture builds (AMD64, ARM64)
   - Security scanning with Trivy
   - Automated image tagging

3. **Deployment**
   - Staging deployment on `develop` branch
   - Production deployment on `main` branch
   - Automated rollback on failure

4. **Database Migrations**
   - Automated Prisma migrations
   - Environment-specific migration handling

### **Required Secrets**

Configure these secrets in GitHub:

```
KUBE_CONFIG_STAGING      # Staging cluster kubeconfig
KUBE_CONFIG_PRODUCTION   # Production cluster kubeconfig
DATABASE_URL_STAGING     # Staging database URL
DATABASE_URL_PRODUCTION  # Production database URL
SLACK_WEBHOOK_URL        # Slack notifications
```

## ☸️ **Kubernetes Deployment**

### **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   API Service   │    │   Database      │
│   (nginx)       │────│   (3 replicas)  │────│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (1 replica)   │
                       └─────────────────┘
```

### **Deployment Commands**

```bash
# Deploy to staging
./scripts/deploy.sh staging deploy

# Deploy to production
./scripts/deploy.sh production deploy

# Check status
./scripts/deploy.sh production status

# Health check
./scripts/deploy.sh production health

# Rollback
./scripts/deploy.sh production rollback
```

### **Kubernetes Manifests**

- `k8s/api-deployment.yaml` - API service deployment
- `k8s/postgres-deployment.yaml` - Database deployment
- `k8s/redis-deployment.yaml` - Cache deployment
- `k8s/monitoring/` - Monitoring stack

## 📊 **Monitoring & Observability**

### **Prometheus Metrics**

The API exposes metrics at `/metrics`:

- HTTP request duration
- Request count by status code
- Database connection pool metrics
- Redis connection metrics
- Custom business metrics

### **Grafana Dashboards**

Pre-configured dashboards for:

- API Performance
- Database Performance
- Infrastructure Metrics
- Error Rates
- User Activity

### **Alerting Rules**

Configured alerts for:

- High error rates (>5%)
- Slow response times (>2s)
- Database connection issues
- Redis connection issues
- Pod restart frequency

## 🔒 **Security**

### **Security Scanning**

- **Trivy**: Container vulnerability scanning
- **npm audit**: Dependency vulnerability checks
- **CodeQL**: Static code analysis
- **SAST**: Security testing in CI/CD

### **Security Features**

- ✅ **Helmet**: Security headers
- ✅ **CORS**: Cross-origin protection
- ✅ **Rate Limiting**: DDoS protection
- ✅ **JWT Security**: Token validation
- ✅ **Input Validation**: Zod schemas
- ✅ **Secrets Management**: Kubernetes secrets

## 🐳 **Docker**

### **Multi-Stage Build**

Optimized Dockerfile with:

- **Base Stage**: Node.js Alpine image
- **Dependencies Stage**: Install dependencies
- **Build Stage**: Compile TypeScript
- **Runtime Stage**: Minimal production image

### **Docker Commands**

```bash
# Build image
yarn docker:build

# Run locally
yarn docker:run

# Development with compose
yarn docker:dev

# Stop development
yarn docker:down
```

## 🗄️ **Database Management**

### **Prisma Commands**

```bash
# Generate Prisma client
yarn db:generate

# Run migrations
yarn db:migrate

# Open Prisma Studio
yarn db:studio

# Reset database
yarn db:reset
```

### **Migration Strategy**

- **Development**: `yarn prisma migrate dev`
- **Staging**: Automated via CI/CD
- **Production**: Automated via CI/CD with rollback

## 🔧 **Environment Configuration**

### **Environment Files**

- `config/development.env` - Development configuration
- `config/production.env` - Production configuration
- `.env.example` - Example configuration

### **Configuration Management**

- **Development**: Local `.env` files
- **Staging**: Kubernetes ConfigMaps + Secrets
- **Production**: Kubernetes ConfigMaps + Secrets

## 📈 **Performance Optimization**

### **Docker Optimizations**

- Multi-stage builds
- Layer caching
- Minimal base images
- Non-root user

### **Kubernetes Optimizations**

- Resource limits and requests
- Horizontal Pod Autoscaling
- Pod Disruption Budgets
- Node affinity rules

### **Application Optimizations**

- Connection pooling
- Redis caching
- Compression middleware
- Rate limiting

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Issues**

   ```bash
   kubectl logs -f deployment/identity-forge-api -n identity-forge
   ```

2. **Redis Connection Issues**

   ```bash
   kubectl exec -it deployment/redis -n identity-forge-cache -- redis-cli ping
   ```

3. **Health Check Failures**
   ```bash
   kubectl describe pod <pod-name> -n identity-forge
   ```

### **Debug Commands**

```bash
# Check pod logs
kubectl logs -f deployment/identity-forge-api -n identity-forge

# Check service endpoints
kubectl get endpoints -n identity-forge

# Port forward for local testing
kubectl port-forward service/identity-forge-api-service 8080:80 -n identity-forge

# Check resource usage
kubectl top pods -n identity-forge
```

## 📝 **Development Workflow**

### **Local Development**

1. Start dependencies: `yarn docker:dev`
2. Run API: `yarn dev`
3. Access docs: http://localhost:3000/docs
4. Run tests: `yarn test`

### **Feature Development**

1. Create feature branch
2. Make changes with tests
3. Push to trigger CI/CD
4. Deploy to staging
5. Create PR to main
6. Deploy to production

### **Code Quality**

- Pre-commit hooks with Husky
- ESLint + Prettier formatting
- TypeScript strict mode
- Unit test coverage >80%

## 🎯 **Next Steps**

1. **Set up monitoring alerts**
2. **Configure log aggregation**
3. **Implement backup strategies**
4. **Add performance testing**
5. **Set up disaster recovery**

## 📞 **Support**

- **Documentation**: `/docs` endpoint
- **Health Checks**: `/healthz` and `/readyz`
- **Monitoring**: Grafana dashboards
- **Logs**: Kubernetes pod logs

---

**Happy Deploying! 🚀**
