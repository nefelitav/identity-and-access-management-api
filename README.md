# Identity and Access Management API

> An Identity & Access Management (IAM) API built with **Node.js**, **Express 5**, **TypeScript**, **Prisma**, and **Redis**.

## Features

| Category               | Capabilities                                                           |
| ---------------------- | ---------------------------------------------------------------------- |
| **Authentication**     | Register, login, logout, JWT access & refresh tokens, session tracking |
| **Multi-Factor Auth**  | TOTP (authenticator apps), OTP via email & SMS                         |
| **Authorization**      | Role-based access control (RBAC) with granular permissions             |
| **Session Management** | Multi-device sessions, revocation, activity tracking                   |
| **Profile**            | Self-service profile updates, password reset via email                 |
| **Security**           | Account lockout, rate limiting, CAPTCHA, Helmet, CORS                  |
| **Observability**      | Structured logging, health & readiness endpoints                       |

---

## Tech Stack

- **Runtime:** Node.js ≥ 18
- **Framework:** Express 5
- **Language:** TypeScript 5 (strict mode)
- **ORM:** Prisma 6
- **Database:** PostgreSQL
- **Cache / Sessions:** Redis
- **Validation:** Zod
- **Auth:** JWT (`jsonwebtoken`), bcrypt
- **MFA:** Speakeasy (TOTP), custom OTP with Redis TTL
- **Email:** Nodemailer
- **SMS:** Twilio
- **CAPTCHA:** Google reCAPTCHA v3
- **Docs:** Swagger / OpenAPI 3.0 (auto-generated), TypeDoc
- **Testing:** Jest, ts-jest, Supertest
- **CI/CD:** GitHub Actions
- **Deployment:** Docker, Docker Compose, Kubernetes

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Yarn 1.x
- Docker & Docker Compose

### 1. Clone & install

```bash
git clone https://github.com/your-org/identity-forge.git
cd identity-forge
yarn install
```

### 2. Start infrastructure

```bash
docker-compose up -d   # PostgreSQL + Redis + MailHog
```

### 3. Run database migrations

```bash
yarn db:migrate
yarn db:generate
```

### 4. Configure environment

Copy the example below into a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/identity_forge

# JWT
JWT_SECRET=your-jwt-secret-key-at-least-32-characters-long
JWT_EXPIRY=15

# Redis
REDIS_URL=redis://localhost:6379

# Email (MailHog for local dev)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=user
SMTP_PASS=password
SMTP_FROM=noreply@localhost

# SMS (Twilio – use test credentials for dev)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-test-auth-token
TWILIO_PHONE_NUMBER=+15005550006

# CAPTCHA (Google test keys)
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
SESSION_SECRET=your-session-secret-key-at-least-32-characters-long

# Logging
LOG_LEVEL=debug
```

### 5. Start the dev server

```bash
yarn dev
```

The API will be available at `http://localhost:3000`.

---

## API Endpoints

### Health

| Method | Path      | Description                  |
| ------ | --------- | ---------------------------- |
| `GET`  | `/health` | Liveness check               |
| `GET`  | `/ready`  | Readiness check (DB + Redis) |

### Authentication (`/auth`)

| Method | Path                  | Auth   | Description                   |
| ------ | --------------------- | ------ | ----------------------------- |
| `POST` | `/auth/register`      | —      | Create a new account          |
| `POST` | `/auth/login`         | —      | Authenticate & receive tokens |
| `POST` | `/auth/logout`        | Bearer | Invalidate session(s)         |
| `POST` | `/auth/refresh-token` | —      | Refresh an access token       |

### Profile (`/profile`)

| Method   | Path                              | Auth   | Description               |
| -------- | --------------------------------- | ------ | ------------------------- |
| `GET`    | `/profile`                        | Bearer | Get current user profile  |
| `PUT`    | `/profile`                        | Bearer | Update email / password   |
| `DELETE` | `/profile`                        | Bearer | Delete account            |
| `POST`   | `/profile/request-password-reset` | Bearer | Send password reset email |
| `POST`   | `/profile/password-reset`         | Bearer | Reset password with token |

### Admin (`/admin`)

| Method   | Path               | Auth   | Description            |
| -------- | ------------------ | ------ | ---------------------- |
| `GET`    | `/admin/users`     | Bearer | List users (paginated) |
| `GET`    | `/admin/users/:id` | Bearer | Get user by ID         |
| `PUT`    | `/admin/users/:id` | Bearer | Update a user          |
| `DELETE` | `/admin/users/:id` | Bearer | Delete a user          |
| `DELETE` | `/admin/users`     | Bearer | Delete all users       |

### Sessions (`/sessions`)

| Method   | Path                   | Auth   | Description          |
| -------- | ---------------------- | ------ | -------------------- |
| `GET`    | `/sessions`            | Bearer | List active sessions |
| `DELETE` | `/sessions/:sessionId` | Bearer | Revoke a session     |
| `DELETE` | `/sessions`            | Bearer | Revoke all sessions  |

### MFA – OTP (`/mfa/otp`)

| Method | Path                     | Auth | Description        |
| ------ | ------------------------ | ---- | ------------------ |
| `POST` | `/mfa/otp/request-email` | —    | Send OTP via email |
| `POST` | `/mfa/otp/request-sms`   | —    | Send OTP via SMS   |
| `POST` | `/mfa/otp/verify`        | —    | Verify OTP code    |

### MFA – TOTP (`/mfa/totp`)

| Method | Path                | Auth   | Description             |
| ------ | ------------------- | ------ | ----------------------- |
| `POST` | `/mfa/totp/enable`  | Bearer | Begin TOTP setup        |
| `POST` | `/mfa/totp/confirm` | Bearer | Confirm & activate TOTP |
| `POST` | `/mfa/totp/verify`  | Bearer | Verify TOTP token       |
| `POST` | `/mfa/totp/disable` | Bearer | Disable TOTP            |

### RBAC – Roles (`/roles`)

| Method   | Path             | Auth   | Description           |
| -------- | ---------------- | ------ | --------------------- |
| `POST`   | `/roles/add`     | Bearer | Create a role         |
| `POST`   | `/roles/assign`  | Bearer | Assign role to user   |
| `DELETE` | `/roles/remove`  | Bearer | Remove role from user |
| `DELETE` | `/roles/delete`  | Bearer | Delete a role         |
| `GET`    | `/roles/:userId` | Bearer | Get user roles        |
| `GET`    | `/roles`         | Bearer | List all roles        |

### RBAC – Permissions (`/permissions`)

| Method   | Path                   | Auth   | Description                 |
| -------- | ---------------------- | ------ | --------------------------- |
| `POST`   | `/permissions/add`     | Bearer | Create a permission         |
| `POST`   | `/permissions/grant`   | Bearer | Grant permission to role    |
| `POST`   | `/permissions/revoke`  | Bearer | Revoke permission from role |
| `GET`    | `/permissions/check`   | Bearer | Check user permission       |
| `GET`    | `/permissions`         | Bearer | List all permissions        |
| `GET`    | `/permissions/:userId` | Bearer | Get user permissions        |
| `DELETE` | `/permissions/delete`  | Bearer | Delete a permission         |

### CAPTCHA (`/captcha`)

| Method | Path              | Auth | Description            |
| ------ | ----------------- | ---- | ---------------------- |
| `POST` | `/captcha/verify` | —    | Verify reCAPTCHA token |

---

## Architecture

```
apps/api/
├── config/          # Environment config (envalid) & Swagger setup
├── controllers/     # Route handlers – thin, delegate to services
├── core/            # DI container & service registration
├── domain/          # Domain types (User, Entity)
├── dtos/            # Request / response type definitions
├── exceptions/      # Custom application errors with status codes
├── middleware/       # Auth, validation, error handling
├── repositories/    # Data-access layer (Prisma)
├── routes/          # Express route definitions
├── services/        # Business logic
├── utils/           # Logger, tokens, hashing, email, SMS, rate limiting
├── validation/      # Zod schemas
├── tests/           # Unit & integration tests
├── app.ts           # Express app setup
└── server.ts        # Server entrypoint
```

The codebase follows a **functional architecture** — no classes. All modules export plain functions and factory functions. Dependency injection is handled by a lightweight custom DI container.

### Key patterns

- **Controller → Service → Repository**: Clean separation of HTTP concerns, business logic, and data access.
- **Factory functions** for repositories: `createUserRepository(prisma)` returns a plain object implementing the repository interface.
- **Centralized error handling**: Errors thrown anywhere in the request pipeline are caught by a single `errorHandler` middleware.
- **Custom exceptions**: Each exception type is a factory function returning a typed `AppException` with a name, message, status code, and optional error code.
- **Immutable domain objects**: `createEntity()` and `createUser()` return frozen objects.

---

## Testing

```bash
# Run all tests
yarn test

# Run with coverage report
yarn test:coverage

# Run a specific test file
npx jest apps/api/tests/unit/utils/createLogger.test.ts
```

Tests live in `apps/api/tests/` and are organized by layer:

```
tests/
├── setup/           # Jest setup (environment config)
└── unit/
    ├── controllers/ # Controller handler tests
    ├── core/        # DI container tests
    ├── domain/      # Domain factory tests
    ├── exceptions/  # Exception factory tests
    ├── middleware/  # Error handler & validation tests
    ├── services/    # Service logic tests (mocked repos)
    ├── utils/       # Utility function tests
    └── validation/  # Zod schema tests
```

---

## Scripts

| Script                | Description                    |
| --------------------- | ------------------------------ |
| `yarn dev`            | Start development server       |
| `yarn build`          | Build the project              |
| `yarn test`           | Run tests                      |
| `yarn test:coverage`  | Run tests with coverage        |
| `yarn lint`           | Lint with ESLint               |
| `yarn format`         | Format with Prettier           |
| `yarn check-types`    | TypeScript type checking       |
| `yarn db:migrate`     | Run Prisma migrations          |
| `yarn db:generate`    | Generate Prisma client         |
| `yarn db:studio`      | Open Prisma Studio             |
| `yarn db:reset`       | Reset database                 |
| `yarn docker:dev`     | Start Docker Compose stack     |
| `yarn docker:down`    | Stop Docker Compose stack      |
| `yarn docs`           | Generate TypeDoc documentation |
| `yarn security:audit` | Run `yarn audit`               |

---

## Deployment

### Docker Compose (development / staging)

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, and the API.

### Kubernetes (production)

Kubernetes manifests are in the `k8s/` directory:

```bash
kubectl apply -f k8s/
```

Includes deployments for the API, PostgreSQL, and Redis.

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) runs on every push and PR to `main`:

1. **Lint & type-check** — ESLint, TypeScript `--noEmit`, Prettier
2. **Security scan** — Trivy filesystem scan, `yarn audit`
3. **Build & test** — Docker Compose up, migrations, Jest with coverage, Codecov upload
4. **Docs** — Auto-generate TypeDoc documentation
