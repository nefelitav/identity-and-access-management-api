import request from "supertest";
import app from "~/app";
import { setupTestDB, cleanDB, teardownTestDB } from "../helpers/testDB";
import { authenticatedUser } from "../helpers/testUser";

beforeAll(() => setupTestDB());
afterEach(() => cleanDB());
afterAll(() => teardownTestDB());

describe("POST /mfa/totp/enable", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).post("/mfa/totp/enable");
    expect(res.status).toBe(401);
  });

  it("should return 201 with QR code", async () => {
    const { auth } = await authenticatedUser("totp@test.com");

    const res = await request(app).post("/mfa/totp/enable").set(auth);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.qrCode).toBeDefined();
    expect(res.body.data.secret).toBeDefined();
  });
});

describe("MFA OTP auth requirements", () => {
  it("POST /mfa/otp/request-email should return 401 without auth", async () => {
    const res = await request(app)
      .post("/mfa/otp/request-email")
      .send({ email: "user@test.com" });

    expect(res.status).toBe(401);
  });

  it("POST /mfa/otp/request-sms should return 401 without auth", async () => {
    const res = await request(app)
      .post("/mfa/otp/request-sms")
      .send({ phone: "+1234567890" });

    expect(res.status).toBe(401);
  });

  it("POST /mfa/otp/verify should return 401 without auth", async () => {
    const res = await request(app)
      .post("/mfa/otp/verify")
      .send({ code: "123456" });

    expect(res.status).toBe(401);
  });
});
