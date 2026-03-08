import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("GET /health", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("healthy");
  });
});

describe("GET /ready", () => {
  it("should respond without crashing", async () => {
    const res = await request(app).get("/ready");
    // May be 200 or 503 depending on global redis client connectivity
    expect([200, 503]).toContain(res.status);
  });
});
