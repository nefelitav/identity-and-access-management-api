import request from "supertest";
import app from "~/app";
import {
  setupTestDB,
  cleanDB,
  teardownTestDB,
  getPrisma,
} from "../helpers/testDB";
import { authenticatedAdmin } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("POST /permissions/add", () => {
  it("should create a permission", async () => {
    const { auth } = await authenticatedAdmin();

    const res = await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "write:articles" });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Permission added");
  });
});

describe("GET /permissions", () => {
  it("should list all permissions", async () => {
    const { auth } = await authenticatedAdmin();

    // Seed a permission
    await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "read:data" });

    const res = await request(app).get("/permissions").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data.permissions.length).toBeGreaterThanOrEqual(1);
  });
});

describe("POST /permissions/grant", () => {
  it("should grant permission to a role", async () => {
    const { auth } = await authenticatedAdmin();
    const prisma = getPrisma();

    // Create permission
    await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "edit:posts" });

    // Get admin role ID (the grant API expects a roleId, not userId)
    const adminRole = await prisma.role.findUnique({
      where: { name: "admin" },
    });

    const grantRes = await request(app)
      .post("/permissions/grant")
      .set(auth)
      .send({ userId: adminRole!.id, permission: "edit:posts" });

    expect(grantRes.status).toBe(200);
    expect(grantRes.body.data.message).toBe("Permission granted");
  });
});

describe("DELETE /permissions/delete", () => {
  it("should delete a permission", async () => {
    const { auth } = await authenticatedAdmin();

    await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "temp:perm" });

    const res = await request(app)
      .delete("/permissions/delete")
      .set(auth)
      .send({ name: "temp:perm" });

    expect(res.status).toBe(200);
  });
});

describe("GET /permissions/:userId", () => {
  it("should return user permissions", async () => {
    const { auth, userId } = await authenticatedAdmin();

    const res = await request(app).get(`/permissions/${userId}`).set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data.permissions).toBeDefined();
  });
});
