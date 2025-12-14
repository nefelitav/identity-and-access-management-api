# Auth API

## Run server

```
docker-compose up -d
```

---

# Technologies Used

- **TypeScript**
- **MySQL**
- **Prisma**
- **Redis**
- **Mailhog**
- **Docker**

---

# Services

## Admin:

The Admin API provides endpoints for managing users within the application. It supports retrieving single or multiple users with pagination and filtering, updating user profiles, and deleting users either individually or in bulk. These operations are protected and intended for administrative use only.

**Endpoints:**

- get users: Retrieve a paginated list of users, with optional filtering and sorting.
- get user: Fetch detailed information about a specific user by their ID.
- delete users: Remove all users from the system (use with caution).
- delete user: Delete a single user by their ID.
- update user: Modify user details such as email or password.

## Auth:

The Auth API handles user authentication and session management, including registration, login, logout, and token refresh. It ensures secure access with features like password hashing, session tracking, account lockouts on repeated failed logins, and notifications for logins from new devices or locations.

**Endpoints:**

- register: Create a new user account with email and password.
- login: Authenticate user credentials and issue JWT access and refresh tokens.
- logout: Invalidate current user session or all sessions.
- refresh token: Generate a new access token using a valid refresh token.

## Captcha:

The Captcha service verifies reCAPTCHA tokens to protect endpoints from automated abuse and bots.

**Endpoints:**

- verify token: Validate the user's captcha token with Google's reCAPTCHA API to ensure the request is legitimate.

## MFA (Multi-Factor Authentication):

MFA enhances account security by requiring a second verification step via OTP or TOTP, delivered by email, SMS, or authenticator apps.

**Endpoints:**

- OTP request code with email: Generate and send a one-time password to the user’s email.
- OTP request code with sms: Generate and send a one-time password via SMS.
- OTP verify code: Verify the submitted OTP code.
- TOTP enable: Begin the process to enable Time-based One-Time Password authentication.
- TOTP disable: Disable TOTP MFA for the user.
- TOTP confirm & enable: Confirm the TOTP token and activate MFA.
- TOTP verify: Verify a TOTP token during login or sensitive operations.

## Profile:

Profile service manages user personal data, password updates, and account lifecycle actions including deletion and password resets.

**Endpoints:**

- get user: Retrieve the profile information of the authenticated user.
- update user: Update user details such as email or password.
- delete user: Permanently delete a user account and all related sessions.
- reset password: Change the user’s password using a valid reset token.
- request password reset: Initiate password reset by sending an email with a reset link.

## RBAC (Role-Based Access Control):

The RBAC API manages user roles and permissions, enabling fine-grained access control. It supports assigning and removing roles for users, creating and deleting roles, and managing permissions associated with roles. This allows flexible control over what users can do within the application.

**Endpoints:**

- **Roles Management:**
  - create role: Create a new role with a given name.
  - assign role: Assign a specific role to a user.
  - remove user role: Remove a specific role from a user.
  - delete role: Delete an existing role by name.
  - get user roles: Retrieve all roles assigned to a specific user.
  - get all roles: Fetch a list of all roles available in the system.

- **Permissions Management:**
  - add permission: Add a new permission to the system.
  - grant permission: Grant a permission to a role.
  - check permission: Verify if a user has a specific permission.
  - revoke permission: Revoke a permission from a role.
  - get all permissions: Retrieve all available permissions.
  - get user permissions: Get all permissions assigned to a user through their roles.
  - delete permission: Delete an existing permission by name.

## Session:

The Session API manages user sessions, allowing users to view, delete, or revoke their active sessions. This enhances security by enabling users to monitor and control their active logins across devices and browsers.

**Endpoints:**

- **list sessions:** Retrieve all active sessions for the authenticated user, including details like user agent, IP address, creation time, and last activity time.
- **delete session:** Delete a specific session by its ID, effectively logging out that session.
- **delete all sessions:** Delete all active sessions for the authenticated user, logging out from all devices except the current one.

---

# Implementation Details

## Architecture

The project follows a **Controller-Service-Repository** architecture pattern, which helps maintain a clean separation of concerns:

- **Controller:** Handles HTTP requests/responses, input validation, and delegates business logic to services.
- **Service:** Contains core business logic, orchestrates repository calls, and implements application workflows.
- **Repository:** Manages direct interaction with the database or external data sources, abstracting persistence details.

## Dependency Injection Container

The application uses a **custom DI container** to manage dependencies, supporting:

- **Service registration** as direct instances, factories (new instance per request), or singletons (one shared instance).
- **Service resolution** through a centralized `get()` method.

### Key Benefits

- **Loose coupling:** Components depend on abstractions, enabling easy swapping or mocking.
- **Centralized management:** All bindings and lifecycles are organized in one place.
- **Lazy initialization:** Services are created only when needed.
- **Singleton handling:** Efficient reuse of shared instances.
- **Improved testability:** Easy injection of mocks without code changes.

## DTOs (Data Transfer Objects)

Created dedicated request and response DTOs for every endpoint to clearly define and validate data structures, improving type safety and clarity.

## Custom Exceptions

Implemented custom exceptions for various error cases to provide meaningful error handling and standardized error responses.

## Authentication Middleware

Added a JWT-based middleware that:

- Extracts and verifies JWT tokens from the `Authorization` header.
- Validates essential claims (`userId` and `sessionId`).
- Handles token expiration and invalid token errors gracefully.
- Attaches the authenticated user info to the request object for downstream handlers.

## Data Validation

Integrated input validation (e.g., using DTO schemas and validation libraries) to ensure request data is correct before processing, reducing runtime errors and improving API reliability.

## Logger

- A custom logger with support for different log levels: `info`, `warn`, `error`, and `debug`.
- Includes optional contextual tags and structured metadata for enriched logs.
- Skips logging during tests and limits debug logs to development environment.

## Email Sending Utility

- Utilizes `nodemailer` to send transactional emails.
- Configured via SMTP settings defined in environment variables.
- Supports sending both plain text and HTML email content.
- Used for account verification, password resets, and notifications.

## SMS Sending Utility

- Uses Twilio's API to send SMS messages to users.
- Configured with Twilio credentials from environment variables.
- Provides reliable message delivery for features like OTP codes and alerts.
- Includes error handling to catch and report failures during sending.

---

# Configuration

The application relies on environment variables for configuration. Below is an example `.env` file with common settings:

```env
# Environment
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/identity_forge

# JWT Authentication
JWT_SECRET=prod-jwt-secret-key-at-least-32-characters-long
JWT_EXPIRY=15m

# Redis (for caching, sessions, etc.)
REDIS_URL=redis://:redis_password@redis:6379

# Email (SMTP settings for sending emails, e.g., MailHog for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=user
SMTP_PASS=password
SMTP_FROM=noreply@localhost

# SMS (Twilio credentials for sending SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-test-auth-token
TWILIO_PHONE_NUMBER=+15005550006

# Captcha (Google reCAPTCHA test keys)
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Security Settings
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Session Management
SESSION_SECRET=prod-session-secret-key-at-least-32-characters-long

# Logging
LOG_LEVEL=debug
```

---

# Development & CI/CD

### GitHub Actions CI/CD Pipeline

The repository includes a comprehensive GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that automates the following tasks on pushes and pull requests to `main`:

- **Code Quality Checks:**
  - Checkout code
  - Setup Node.js (version 20)
  - Install dependencies with Yarn
  - Run ESLint linting
  - Run TypeScript type checking
  - Run Prettier format check
  - Upload test coverage reports to Codecov

- **Security Scanning:**
  - Run Trivy vulnerability scanner on the file system
  - Run `yarn audit` to check for npm package vulnerabilities

- **Build, Deploy, and Test:**
  - Install `docker-compose`
  - Launch API and dependent services in detached mode
  - Wait for API health check to pass
  - Run database migrations inside the container
  - Run unit and integration tests with coverage
  - Tear down containers after tests

- **Documentation Generation:**
  - Install dependencies
  - Generate project documentation

### Local Development Tools

- **Husky & lint-staged:**
  - Pre-commit hooks configured with Husky to run `lint-staged` for automatically linting and formatting staged files.

- **ESLint and Prettier:**
  - ESLint is configured with the `@typescript-eslint` parser and plugin, enforcing rules such as no unused variables and explicit function return types.
  - Prettier is integrated to ensure consistent code formatting.

### Commitlint

Ensures commit messages follow a consistent style and format, improving repository clarity.

### Turbo (Turborepo)

Used for high-performance build and task orchestration across monorepo packages.

### TypeScript Configuration

Strict compiler options enabled for safer and cleaner code.

---

# Deployment

- The application is primarily deployed using **Docker Compose** for easy local development and simple multi-container setups.
- Additionally, **Kubernetes manifests** have been created to support scalable and production-grade deployments in container orchestration environments.

---

# Testing

Some test cases and scenarios have been documented in the `TESTING.md` file to guide the testing process and ensure key functionality is covered.

---

# Documentation

API documentation is autogenerated and maintained in the `docs` folder, ensuring up-to-date and easily accessible reference material for developers and users.
