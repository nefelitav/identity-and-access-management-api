import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedUser, seedUser } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("POST /auth/register", () => {
  it("should return 201 with user data and tokens", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "new@test.com", password: "Test1234!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.email).toBe("new@test.com");
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should return 409 when email already exists", async () => {
    await seedUser("taken@test.com");

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "taken@test.com", password: "Test1234!" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ password: "Test1234!" });

    expect(res.status).toBe(400);
  });

  it("should return 400 when password is too weak", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", password: "short" });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("should return 200 with tokens on valid credentials", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "login@test.com", password: "Test1234!" });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should return 401 on wrong password", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "wrong@test.com", password: "Test1234!" });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "wrong@test.com", password: "BadPass1!" });

    expect(res.status).toBe(401);
  });

  it("should return 401 on non-existent user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@test.com", password: "Test1234!" });

    expect(res.status).toBe(401);
  });

  it("should return 400 on missing email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "Test1234!" });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/refresh-token", () => {
  it("should return 200 with new access token", async () => {
    const { refreshToken } = await authenticatedUser("refresh@test.com");

    const res = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("should return 401 on invalid refresh token", async () => {
    const res = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken: "invalid-token" });

    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(401);
  });

  it("should return 200 and invalidate session", async () => {
    const { auth } = await authenticatedUser("logout@test.com");

    const res = await request(app).post("/auth/logout").set(auth);
    expect(res.status).toBe(200);
  });
});
