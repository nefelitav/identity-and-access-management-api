jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200, CREATED: 201 },
  JWT_SECRET: "test-secret",
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/auth/authService");
jest.mock("jsonwebtoken");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as authService from "~/services/auth/authService";
import jwt from "jsonwebtoken";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
} from "~/controllers/auth/authController";

beforeEach(() => jest.clearAllMocks());

describe("registerHandler", () => {
  it("should call authService.register and return 201", async () => {
    const result = {
      id: "u1",
      email: "a@b.com",
      accessToken: "at",
      refreshToken: "rt",
    };
    (authService.register as jest.Mock).mockResolvedValue(result);

    const req = createMockReq({
      body: { email: "a@b.com", password: "P@ss1234" },
      headers: { "user-agent": "jest" },
      ip: "1.2.3.4",
    });
    const res = createMockRes();
    const next = createMockNext();

    await registerHandler(req, res, next);

    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@b.com", password: "P@ss1234" }),
    );
    expect(res._status).toBe(201);
    expect(res._json.data).toEqual(result);
  });

  it("should forward errors to next", async () => {
    const err = new Error("boom");
    (authService.register as jest.Mock).mockRejectedValue(err);

    const req = createMockReq({ body: { email: "a@b.com", password: "x" } });
    const res = createMockRes();
    const next = createMockNext();

    await registerHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("loginHandler", () => {
  it("should call authService.login and return tokens", async () => {
    const tokens = { accessToken: "at", refreshToken: "rt" };
    (authService.login as jest.Mock).mockResolvedValue(tokens);

    const req = createMockReq({
      body: { email: "a@b.com", password: "P@ss1234", remember: true },
      headers: { "user-agent": "jest" },
      ip: "1.2.3.4",
    });
    const res = createMockRes();
    const next = createMockNext();

    await loginHandler(req, res, next);

    expect(authService.login).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@b.com", remember: true }),
    );
    expect(res._status).toBe(200);
    expect(res._json.data).toEqual(tokens);
  });
});

describe("logoutHandler", () => {
  it("should return 401 via next when no authorization header", async () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    const next = createMockNext();

    await logoutHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });

  it("should verify JWT and call authService.logout", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      sessionId: "s1",
      userId: "u1",
    });
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({
      headers: { authorization: "Bearer some-token" },
    });
    const res = createMockRes();
    const next = createMockNext();

    await logoutHandler(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("some-token", "test-secret");
    expect(authService.logout).toHaveBeenCalledWith({
      sessionId: "s1",
      userId: "u1",
    });
  });
});

describe("refreshTokenHandler", () => {
  it("should call authService.refreshToken with the provided token", async () => {
    const result = { accessToken: "new-at" };
    (authService.refreshToken as jest.Mock).mockResolvedValue(result);

    const req = createMockReq({ body: { refreshToken: "rt-value" } });
    const res = createMockRes();
    const next = createMockNext();

    await refreshTokenHandler(req, res, next);

    expect(authService.refreshToken).toHaveBeenCalledWith("rt-value");
    expect(res._json.data).toEqual(result);
  });
});
