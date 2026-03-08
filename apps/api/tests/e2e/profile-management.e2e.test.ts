import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("Profile management E2E", () => {
  it("should register → view profile → update → delete", async () => {
    const email = "profile-e2e@test.com";
    const password = "Profile1234!";

    // ── Register ──
    const regRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(regRes.status).toBe(201);
    const token = regRes.body.data.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    // ── Get Profile ──
    const profileRes = await request(app).get("/profile").set(auth);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe(email);

    // ── Update Profile ──
    const updateRes = await request(app)
      .put("/profile")
      .set(auth)
      .send({ email: "updated-e2e@test.com" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);

    // ── Delete Account ──
    const deleteRes = await request(app).delete("/profile").set(auth);
    expect(deleteRes.status).toBe(200);

    // ── Unauthenticated access blocked ──
    const noAuthRes = await request(app).get("/profile");
    expect(noAuthRes.status).toBe(401);
  });
});
