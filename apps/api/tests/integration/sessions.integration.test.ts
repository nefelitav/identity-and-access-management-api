import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedUser } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("GET /sessions", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get("/sessions");
    expect(res.status).toBe(401);
  });

  it("should return 200 with session list", async () => {
    const { auth } = await authenticatedUser("sess@test.com");

    const res = await request(app).get("/sessions").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.sessions)).toBe(true);
    expect(res.body.data.sessions.length).toBeGreaterThanOrEqual(1);
  });
});

describe("DELETE /sessions/:sessionId", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).delete("/sessions/fake-id");
    expect(res.status).toBe(401);
  });

  it("should delete a specific session", async () => {
    const { auth } = await authenticatedUser("delsess@test.com");

    // List sessions, grab first one
    const listRes = await request(app).get("/sessions").set(auth);
    const sessionId = listRes.body.data.sessions[0].id;

    const res = await request(app).delete(`/sessions/${sessionId}`).set(auth);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /sessions", () => {
  it("should delete all sessions", async () => {
    const { auth } = await authenticatedUser("delall@test.com");

    const res = await request(app).delete("/sessions").set(auth);
    expect(res.status).toBe(200);
  });
});
