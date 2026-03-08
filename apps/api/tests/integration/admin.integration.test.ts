import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedAdmin } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("GET /admin/users", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get("/admin/users");
    expect(res.status).toBe(401);
  });

  it("should return 200 with paginated users for admin", async () => {
    const { auth } = await authenticatedAdmin();

    const res = await request(app).get("/admin/users").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it("should support pagination params", async () => {
    const { auth } = await authenticatedAdmin();

    const res = await request(app).get("/admin/users?page=1&limit=5").set(auth);

    expect(res.status).toBe(200);
  });
});

describe("GET /admin/users/:id", () => {
  it("should return a specific user", async () => {
    const { auth, userId } = await authenticatedAdmin();

    const res = await request(app).get(`/admin/users/${userId}`).set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });
});

describe("DELETE /admin/users/:id", () => {
  it("should delete a user", async () => {
    const { auth } = await authenticatedAdmin();

    // Seed an extra user to delete
    const regRes = await request(app)
      .post("/auth/register")
      .send({ email: "tobedeleted@test.com", password: "Test1234!" });
    const targetId = regRes.body.data.id;

    const res = await request(app).delete(`/admin/users/${targetId}`).set(auth);

    expect(res.status).toBe(200);
  });
});
