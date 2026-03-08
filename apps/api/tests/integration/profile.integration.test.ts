import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedUser } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("GET /profile", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get("/profile");
    expect(res.status).toBe(401);
  });

  it("should return 200 with user data", async () => {
    const { auth, userId } = await authenticatedUser("prof@test.com");

    const res = await request(app).get("/profile").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.email).toBe("prof@test.com");
  });
});

describe("PUT /profile", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).put("/profile").send({ email: "x@y.com" });
    expect(res.status).toBe(401);
  });

  it("should update email", async () => {
    const { auth } = await authenticatedUser("old@test.com");

    const res = await request(app)
      .put("/profile")
      .set(auth)
      .send({ email: "new@test.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /profile", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).delete("/profile");
    expect(res.status).toBe(401);
  });

  it("should delete account", async () => {
    const { auth } = await authenticatedUser("delete@test.com");

    const res = await request(app).delete("/profile").set(auth);
    expect(res.status).toBe(200);
  });
});
