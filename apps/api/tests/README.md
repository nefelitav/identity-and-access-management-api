# Test Suite Documentation

This directory contains a comprehensive test suite for the Identity Forge API, covering unit tests, integration tests, E2E tests, performance tests, and security tests.

## Test Structure

```
tests/
├── setup/              # Test setup and configuration
│   ├── testSetup.ts     # Test container and mocks
│   └── jest.setup.ts    # Jest global setup
├── helpers/             # Test helper utilities
│   └── testHelpers.ts   # Common test utilities
├── unit/                # Unit tests
│   ├── services/        # Service unit tests
│   ├── middleware/      # Middleware unit tests
│   ├── utils/           # Utility function tests
│   ├── domain/          # Domain model tests
│   └── core/            # Core component tests
├── integration/         # Integration tests
│   ├── authFlow.test.ts
│   ├── rbacFlow.test.ts
│   └── mfaFlow.test.ts
├── e2e/                 # End-to-end tests
│   ├── auth.test.ts
│   ├── admin.test.ts
│   ├── session.test.ts
│   ├── profile.test.ts
│   ├── captcha.test.ts
│   ├── mfa.test.ts
│   ├── rbac.test.ts
│   ├── permissions.test.ts
│   └── health.test.ts
├── performance/         # Performance/load tests
│   └── load.test.ts
└── security/            # Security tests
    └── security.test.ts
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Performance tests only
npm run test:performance

# Security tests only
npm run test:security
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run in Watch Mode

```bash
npm run test:watch
```

## Test Coverage

### Unit Tests

- **Services**: AuthService, SessionService, TotpService, RbacService, PermissionService, AdminService, ProfileService
- **Repositories**: UserRepository, SessionRepository, RbacRepository, PermissionsRepository
- **Middleware**: AuthMiddleware, ValidationMiddleware
- **Utils**: Token generation, password hashing
- **Domain**: User entity, Domain events

### Integration Tests

- Complete authentication flow (register → login → refresh → logout)
- RBAC flow (role assignment → permission granting → verification)
- MFA flow (TOTP setup → verification, OTP request → verification)

### E2E Tests

All API endpoints are tested end-to-end:

#### Auth Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - User logout

#### Admin Endpoints

- `GET /admin/users` - List users (paginated)
- `GET /admin/users/:id` - Get user by ID
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `DELETE /admin/users` - Delete all users

#### Session Endpoints

- `GET /sessions` - List user sessions
- `DELETE /sessions/:sessionId` - Delete specific session
- `DELETE /sessions` - Delete all user sessions

#### Profile Endpoints

- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `DELETE /profile` - Delete account
- `POST /profile/request-password-reset` - Request password reset
- `POST /profile/password-reset` - Reset password

#### Captcha Endpoints

- `POST /captcha/verify` - Verify captcha token

#### MFA Endpoints

- `POST /mfa/totp/enable` - Enable TOTP
- `POST /mfa/totp/confirm` - Confirm TOTP setup
- `POST /mfa/totp/verify` - Verify TOTP code
- `POST /mfa/totp/disable` - Disable TOTP
- `POST /mfa/otp/request-sms` - Request OTP via SMS
- `POST /mfa/otp/request-email` - Request OTP via email
- `POST /mfa/otp/verify` - Verify OTP code

#### RBAC Endpoints

- `POST /roles/assign` - Assign role to user
- `DELETE /roles/remove` - Remove role from user
- `GET /roles/:userId` - Get user roles
- `GET /roles` - Get all roles
- `POST /roles/add` - Create role
- `DELETE /roles/delete` - Delete role

#### Permissions Endpoints

- `GET /permissions/check` - Check user permission
- `POST /permissions/grant` - Grant permission to role
- `POST /permissions/revoke` - Revoke permission from role
- `POST /permissions/add` - Create permission
- `DELETE /permissions/delete` - Delete permission
- `GET /permissions` - Get all permissions
- `GET /permissions/:userId` - Get user permissions

#### Health Endpoints

- `GET /health` - Health check
- `GET /ready` - Readiness check

### Performance Tests

- Concurrent request handling
- Load testing (multiple simultaneous requests)
- Rate limiting verification
- Response time benchmarks

### Security Tests

- Authentication token validation
- Authorization checks
- Input validation (SQL injection, XSS)
- Password security (hashing, complexity)
- Rate limiting
- Session security

## Test Environment Setup

### Prerequisites

1. Test database (PostgreSQL)
2. Redis instance (for caching and sessions)
3. Environment variables set in `.env.test`

### Environment Variables

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/test_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-jwt-secret-key-that-is-at-least-32-characters-long
```

### Database Setup

Tests use a separate test database. The test setup automatically:

- Connects to the test database
- Cleans up data between tests
- Disconnects after all tests complete

## Writing New Tests

### Unit Test Example

```typescript
import { AuthService } from "~/services";
import { TestHelpers } from "../helpers/testHelpers";

describe("AuthService Unit Tests", () => {
  it("should register a new user", async () => {
    const email = TestHelpers.generateRandomEmail();
    const password = "Test123!@#";

    const result = await AuthService.register({ email, password });

    expect(result).toHaveProperty("id");
    expect(result.email).toBe(email);
  });
});
```

### E2E Test Example

```typescript
import request from "supertest";
import app from "~/app";

describe("Auth Endpoints E2E", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "Test123!@#" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("accessToken");
  });
});
```

## Mock Services

The test suite includes mock implementations for:

- **EmailService**: Tracks sent emails without actually sending
- **SmsService**: Tracks sent SMS without actually sending
- **CaptchaService**: Configurable verification results
- **Redis**: In-memory mock for caching

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after each test
3. **Naming**: Use descriptive test names that explain what is being tested
4. **Assertions**: Be specific with assertions - test exact values when possible
5. **Mocking**: Mock external services and dependencies
6. **Coverage**: Aim for high code coverage (>80%)

## Troubleshooting

### Tests Failing

- Check database connection
- Verify Redis is running
- Check environment variables
- Review test logs for specific errors

### Slow Tests

- Ensure tests are running in parallel (Jest default)
- Check for database connection pooling
- Review test data cleanup efficiency

### Coverage Issues

- Run `npm run test:coverage` to see coverage report
- Add tests for uncovered code paths
- Review coverage thresholds in `jest.config.js`
