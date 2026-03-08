jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/mfa/otpService");
jest.mock("~/exceptions", () => ({
  InvalidOtpTokenException: () => {
    const e = new Error("Invalid OTP token") as any;
    e.name = "InvalidOtpTokenException";
    e.statusCode = 400;
    return e;
  },
}));

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as otpService from "~/services/mfa/otpService";
import {
  requestCodeInEmailHandler,
  requestCodeInSmsHandler,
  verifyCodeHandler,
} from "~/controllers/mfa/otpController";

beforeEach(() => jest.clearAllMocks());

describe("requestCodeInEmailHandler", () => {
  it("should send an OTP code via email", async () => {
    (otpService.generateAndSendCodeViaEmail as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockReq({
      body: { email: "a@b.com" },
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await requestCodeInEmailHandler(req, res, next);

    expect(otpService.generateAndSendCodeViaEmail).toHaveBeenCalledWith(
      "u1",
      "a@b.com",
    );
    expect(res._json.data.message).toContain("Verification code sent");
  });
});

describe("requestCodeInSmsHandler", () => {
  it("should send an OTP code via SMS", async () => {
    (otpService.generateAndSendCodeViaSms as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockReq({
      body: { phone: "+123456" },
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await requestCodeInSmsHandler(req, res, next);

    expect(otpService.generateAndSendCodeViaSms).toHaveBeenCalledWith(
      "u1",
      "+123456",
    );
    expect(res._json.data.message).toContain("Verification code sent");
  });
});

describe("verifyCodeHandler", () => {
  it("should return isValid true when code is correct", async () => {
    (otpService.verifyCode as jest.Mock).mockResolvedValue(true);

    const req = createMockReq({
      body: { code: "123456" },
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await verifyCodeHandler(req, res, next);

    expect(otpService.verifyCode).toHaveBeenCalledWith("u1", "123456");
    expect(res._json.data).toEqual({ isValid: true });
  });

  it("should throw InvalidOtpTokenException when code is invalid", async () => {
    (otpService.verifyCode as jest.Mock).mockResolvedValue(false);

    const req = createMockReq({
      body: { code: "000000" },
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await verifyCodeHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.name).toBe("InvalidOtpTokenException");
  });
});
