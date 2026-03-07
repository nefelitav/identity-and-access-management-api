jest.mock("~/config", () => ({
  config: { JWT_SECRET: "test-jwt-secret-key" },
}));

jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import jwt from "jsonwebtoken";
import { authMiddleware } from "~/middleware/authMiddleware";
import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";

beforeEach(() => jest.clearAllMocks());

describe("authMiddleware", () => {
  it("should return 401 when no authorization header", () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.error.message).toContain("No token provided");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header does not start with Bearer", () => {
    const req = createMockReq({ headers: { authorization: "Basic abc" } });
    const res = createMockRes();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for an expired token", () => {
    // Create a token with exp far in the past (beyond 30s clockTolerance)
    const pastExp = Math.floor(Date.now() / 1000) - 120;
    const token = jwt.sign(
      {
        userId: "u1",
        sessionId: "s1",
        iss: "identity-forge-api",
        aud: "identity-forge-client",
        exp: pastExp,
      },
      "test-jwt-secret-key",
      { algorithm: "HS256" },
    );

    const req = createMockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockRes();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.error.message).toContain("Token expired");
  });

  it("should return 401 for an invalid token", () => {
    const req = createMockReq({
      headers: { authorization: "Bearer invalid.token.here" },
    });
    const res = createMockRes();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.error.message).toContain("Invalid token");
  });

  it("should return 401 when token is missing required claims", () => {
    const token = jwt.sign(
      { foo: "bar", iss: "identity-forge-api", aud: "identity-forge-client" },
      "test-jwt-secret-key",
      { algorithm: "HS256" },
    );

    const req = createMockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockRes();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.error.message).toContain("Invalid token claims");
  });

  it("should set req.user and call next for a valid token", () => {
    const token = jwt.sign(
      {
        userId: "u1",
        sessionId: "s1",
        sub: "u1",
        iss: "identity-forge-api",
        aud: "identity-forge-client",
      },
      "test-jwt-secret-key",
      { algorithm: "HS256" },
    );

    const req = createMockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockRes();
    const next = createMockNext();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe("u1");
    expect(req.user!.sessionId).toBe("s1");
  });
});
