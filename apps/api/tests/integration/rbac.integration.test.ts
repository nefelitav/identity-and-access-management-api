import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedAdmin } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("POST /roles/add", () => {
  it("should create a role", async () => {
    const { auth } = await authenticatedAdmin();

    const res = await request(app)
      .post("/roles/add")
      .set(auth)
      .send({ name: "editor" });

    expect(res.status).toBe(200);
    expect(res.body.data.role.name).toBe("editor");
  });
});

describe("GET /roles", () => {
  it("should return all roles", async () => {
    const { auth } = await authenticatedAdmin();

    const res = await request(app).get("/roles").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // At least the "admin" role from authenticatedAdmin
    expect(res.body.data.roles.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("POST /roles/assign + GET /roles/:userId", () => {
  it("should assign a role and retrieve it", async () => {
    const { auth, userId } = await authenticatedAdmin();

    // Create a role
    await request(app).post("/roles/add").set(auth).send({ name: "viewer" });

    // Assign it
    const assignRes = await request(app)
      .post("/roles/assign")
      .set(auth)
      .send({ userId, role: "viewer" });

    expect(assignRes.status).toBe(200);

    // Fetch user roles
    const rolesRes = await request(app).get(`/roles/${userId}`).set(auth);

    expect(rolesRes.status).toBe(200);
    const roleNames = rolesRes.body.data.roles.map((r: any) => r);
    expect(roleNames).toContain("viewer");
  });
});

describe("DELETE /roles/remove", () => {
  it("should remove a role from a user", async () => {
    const { auth, userId } = await authenticatedAdmin();

    await request(app).post("/roles/add").set(auth).send({ name: "temp" });
    await request(app)
      .post("/roles/assign")
      .set(auth)
      .send({ userId, role: "temp" });

    const res = await request(app)
      .delete("/roles/remove")
      .set(auth)
      .send({ userId, role: "temp" });

    expect(res.status).toBe(200);
  });
});

describe("DELETE /roles/delete", () => {
  it("should delete a role", async () => {
    const { auth } = await authenticatedAdmin();

    await request(app)
      .post("/roles/add")
      .set(auth)
      .send({ name: "disposable" });

    const res = await request(app)
      .delete("/roles/delete")
      .set(auth)
      .send({ name: "disposable" });

    expect(res.status).toBe(200);
  });
});
