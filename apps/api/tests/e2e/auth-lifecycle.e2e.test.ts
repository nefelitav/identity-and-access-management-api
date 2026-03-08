import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("Auth lifecycle E2E", () => {
  const email = "e2e@test.com";
  const password = "E2eTest1234!";

  it("should complete register → login → refresh → logout", async () => {
    // ── Register ──
    const regRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.id).toBeDefined();
    expect(regRes.body.data.accessToken).toBeDefined();

    const { accessToken, refreshToken } = regRes.body.data;
    const auth = { Authorization: `Bearer ${accessToken}` };

    // ── Duplicate register should fail ──
    const dupRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(dupRes.status).toBe(409);

    // ── Login ──
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();

    // ── Refresh token ──
    const refreshRes = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // ── Access authenticated route ──
    const profileRes = await request(app).get("/profile").set(auth);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe(email);

    // ── Logout ──
    const logoutRes = await request(app).post("/auth/logout").set(auth);
    expect(logoutRes.status).toBe(200);

    // ── Wrong password should fail ──
    const wrongRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "WrongPass1!" });

    expect(wrongRes.status).toBe(401);
  });

  it("should reject malformed requests", async () => {
    // Missing email
    const noEmail = await request(app)
      .post("/auth/register")
      .send({ password });

    expect(noEmail.status).toBe(400);

    // Invalid email
    const badEmail = await request(app)
      .post("/auth/register")
      .send({ email: "not-email", password });

    expect(badEmail.status).toBe(400);

    // Weak password
    const weakPw = await request(app)
      .post("/auth/register")
      .send({ email, password: "short" });

    expect(weakPw.status).toBe(400);
  });
});
