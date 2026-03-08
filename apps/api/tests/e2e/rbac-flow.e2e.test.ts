import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedAdmin } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("RBAC flow E2E", () => {
  it("should manage roles and permissions end-to-end", async () => {
    const { auth, userId } = await authenticatedAdmin("rbac-e2e@test.com");

    // ── Create a role ──
    const createRoleRes = await request(app)
      .post("/roles/add")
      .set(auth)
      .send({ name: "editor" });

    expect(createRoleRes.status).toBe(200);
    expect(createRoleRes.body.data.role.name).toBe("editor");

    // ── List roles ──
    const listRolesRes = await request(app).get("/roles").set(auth);
    expect(listRolesRes.status).toBe(200);
    const roleNames = listRolesRes.body.data.roles.data.map((r: any) => r.name);
    expect(roleNames).toContain("editor");
    expect(roleNames).toContain("admin");

    // ── Assign role to user ──
    const assignRes = await request(app)
      .post("/roles/assign")
      .set(auth)
      .send({ userId, role: "editor" });

    expect(assignRes.status).toBe(200);

    // ── Get user roles ──
    const userRolesRes = await request(app).get(`/roles/${userId}`).set(auth);

    expect(userRolesRes.status).toBe(200);

    // ── Create a permission ──
    const addPermRes = await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "write:articles" });

    expect(addPermRes.status).toBe(200);

    // ── List permissions ──
    const listPermRes = await request(app).get("/permissions").set(auth);
    expect(listPermRes.status).toBe(200);
    expect(listPermRes.body.data.permissions.length).toBeGreaterThanOrEqual(1);

    // ── Remove role from user ──
    const removeRes = await request(app)
      .delete("/roles/remove")
      .set(auth)
      .send({ userId, role: "editor" });

    expect(removeRes.status).toBe(200);

    // ── Delete role (via body) ──
    const deleteRoleRes = await request(app)
      .delete("/roles/delete")
      .set(auth)
      .send({ name: "editor" });

    expect(deleteRoleRes.status).toBe(200);

    // ── Delete permission ──
    const deletePermRes = await request(app)
      .delete("/permissions/delete")
      .set(auth)
      .send({ name: "write:articles" });

    expect(deletePermRes.status).toBe(200);

    // ── Unauthenticated access blocked ──
    const noAuthRes = await request(app).get("/roles");
    expect(noAuthRes.status).toBe(401);
  });
});
