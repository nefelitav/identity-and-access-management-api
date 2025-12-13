import app from "../../app";
import request from "supertest";
import { TestHelpers } from "../helpers/testHelpers";
import { SessionRepository, UserRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { hashToken, ResponseCode } from "~/utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClientType } from "@repo/prisma/index";

container.bindFactory(SERVICE_IDENTIFIERS.UserRepository, () => {
  const prisma = container.get<PrismaClientType>(
    SERVICE_IDENTIFIERS.DatabaseClient,
  );
  return new UserRepository(prisma);
});

container.bindFactory(SERVICE_IDENTIFIERS.SessionRepository, () => {
  const prisma = container.get<PrismaClientType>(
    SERVICE_IDENTIFIERS.DatabaseClient,
  );
  return new SessionRepository(prisma);
});

describe("Auth Endpoints E2E", () => {
  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      // arrange
      const email = TestHelpers.generateRandomEmail();
      const password = TestHelpers.generateRandomPassword();

      // act
      const response = await request(app)
        .post("/auth/register")
        .send({ email, password })
        .expect(ResponseCode.CREATED);

      // assert
      // response
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("email", email);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");

      // data
      const userRepository = container.get<UserRepository>(
        SERVICE_IDENTIFIERS.UserRepository,
      );
      const userInDb = await userRepository.findByEmail(email);
      expect(userInDb).toBeTruthy();
      expect(userInDb?.email).toBe(email);
      expect(userInDb!.password).not.toBe(password);
      const valid = await bcrypt.compare(password, userInDb!.password);
      expect(valid).toBe(true);

      // session
      const sessionRepo = container.get<SessionRepository>(
        SERVICE_IDENTIFIERS.SessionRepository,
      );
      const userId = response.body.data.userId;
      const sessions = await sessionRepo.findAll(userId);
      const refreshToken = response.body.data.refreshToken;
      expect(sessions[0].refreshToken).toBe(hashToken(refreshToken));
    });

    it("should fail with invalid email format", async () => {
      const email = "invalid-email";
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "invalid-email", password: "Test123!@#" })
        .expect(ResponseCode.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Validation Error");

      const userRepository = container.get<UserRepository>(
        SERVICE_IDENTIFIERS.UserRepository,
      );
      const userInDb = await userRepository.findByEmail(email);
      expect(userInDb).toBeNull();

      expect(response.body.error.details).toBeDefined();
      expect(Array.isArray(response.body.error.details)).toBe(true);

      const emailErrors = response.body.error.details.filter((err: any) =>
        err.path.includes("email"),
      );
      expect(emailErrors.length).toBeGreaterThan(0);
      expect(emailErrors[0].message).toContain("Invalid email format");
    });

    it("should fail with weak password", async () => {
      const email = TestHelpers.generateRandomEmail();
      const response = await request(app)
        .post("/auth/register")
        .send({ email, password: "weak" })
        .expect(ResponseCode.BAD_REQUEST);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Validation Error");

      const userRepository = container.get<UserRepository>(
        SERVICE_IDENTIFIERS.UserRepository,
      );
      const userInDb = await userRepository.findByEmail(email);
      expect(userInDb).toBeNull();

      expect(response.body.error.details).toBeDefined();
      expect(Array.isArray(response.body.error.details)).toBe(true);

      const passwordErrors = response.body.error.details.filter((err: any) =>
        err.path.includes("password"),
      );
      expect(passwordErrors.length).toBeGreaterThan(0);
      expect(passwordErrors[0].message).toContain(
        "Password must be at least 8 characters",
      );
    });

    it("should fail when email already exists", async () => {
      const email = TestHelpers.generateRandomEmail();
      const password = "Test123!@#";

      await request(app)
        .post("/auth/register")
        .send({ email, password })
        .expect(ResponseCode.CREATED);

      const response = await request(app)
        .post("/auth/register")
        .send({ email, password })
        .expect(ResponseCode.CONFLICT);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("already in use");
    });
  });

  describe("POST /auth/login", () => {
    let testUser: {
      id: string;
      email: string;
      password: string;
      accessToken?: string;
      refreshToken?: string;
    };

    beforeEach(async () => {
      testUser = await TestHelpers.createUser();
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(ResponseCode.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: testUser.password,
        })
        .expect(ResponseCode.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Invalid credentials");
    });

    it("should fail with invalid password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: "WrongPassword123!@#" })
        .expect(ResponseCode.UNAUTHORIZED);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Invalid credentials");
    });

    it("should lock account after multiple failed attempts", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/auth/login")
          .send({ email: testUser.email, password: "WrongPassword123!@#" })
          .expect(ResponseCode.UNAUTHORIZED);
      }

      const response = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(ResponseCode.FORBIDDEN);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("locked");
    });
  });

  describe("POST /auth/refresh-token", () => {
    let authenticatedUser: {
      id: string;
      email: string;
      accessToken?: string;
      refreshToken?: string;
    };

    beforeEach(async () => {
      authenticatedUser = await TestHelpers.createAuthenticatedUser();
    });

    it("should refresh access token successfully", async () => {
      const response = await request(app)
        .post("/auth/refresh-token")
        .send({ refreshToken: authenticatedUser.refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data.accessToken).not.toBe(
        authenticatedUser.accessToken,
      );
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh-token")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Invalid refresh token");
    });

    it("should fail with expired refresh token", async () => {
      const expiredRefreshToken = jwt.sign(
        { userId: "some-user-id" },
        process.env.JWT_SECRET ||
          "dev-jwt-secret-key-at-least-32-characters-long",
        { expiresIn: -1 }, // expires 1 second ago → already expired
      );

      const response = await request(app)
        .post("/auth/refresh-token")
        .send({ refreshToken: expiredRefreshToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch("Invalid refresh token");
    });
  });

  describe("POST /auth/logout", () => {
    let authenticatedUser: {
      id: string;
      email: string;
      accessToken?: string;
      refreshToken?: string;
    };

    beforeEach(async () => {
      authenticatedUser = await TestHelpers.createAuthenticatedUser();
    });

    it("should logout successfully", async () => {
      if (authenticatedUser?.accessToken) {
        const response = await request(app)
          .post("/auth/logout")
          .set(TestHelpers.getAuthHeaders(authenticatedUser.accessToken)!)
          .send({})
          .expect(200);

        expect(response.body.success).toBe(true);
      } else {
        throw new Error("accessToken is undefined");
      }
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
