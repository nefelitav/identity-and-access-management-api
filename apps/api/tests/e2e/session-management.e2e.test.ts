import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("Session management E2E", () => {
  it("should login → list sessions → delete one → delete all", async () => {
    const email = "session-e2e@test.com";
    const password = "Session1234!";

    // ── Register (creates first session) ──
    const regRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(regRes.status).toBe(201);
    const auth = { Authorization: `Bearer ${regRes.body.data.accessToken}` };

    // ── Login again (creates second session) ──
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(loginRes.status).toBe(200);

    // ── List Sessions ──
    const listRes = await request(app).get("/sessions").set(auth);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.sessions.length).toBeGreaterThanOrEqual(1);

    // ── Delete one session ──
    const sessionId = listRes.body.data.sessions[0].id;
    const delOneRes = await request(app)
      .delete(`/sessions/${sessionId}`)
      .set(auth);

    expect(delOneRes.status).toBe(200);

    // ── Delete all sessions ──
    const delAllRes = await request(app).delete("/sessions").set(auth);
    expect(delAllRes.status).toBe(200);

    // ── Unauthenticated access blocked ──
    const noAuthRes = await request(app).get("/sessions");
    expect(noAuthRes.status).toBe(401);
  });
});
