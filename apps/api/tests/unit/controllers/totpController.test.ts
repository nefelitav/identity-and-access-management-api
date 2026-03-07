jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200, CREATED: 201 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/mfa/totpService");
jest.mock("~/exceptions", () => ({
  InvalidTotpTokenException: () => {
    const e = new Error("Invalid TOTP token") as any;
    e.name = "InvalidTotpTokenException";
    e.statusCode = 400;
    return e;
  },
}));

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as totpService from "~/services/mfa/totpService";
import {
  enableHandler,
  confirmAndEnableHandler,
  verifyHandler,
  disableHandler,
} from "~/controllers/mfa/totpController";

beforeEach(() => jest.clearAllMocks());

describe("enableHandler", () => {
  it("should generate a secret and return 201", async () => {
    (totpService.generateSecret as jest.Mock).mockResolvedValue({
      secret: "BASE32SECRET",
      qrCode: "data:image/png;base64,...",
    });

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await enableHandler(req, res, next);

    expect(totpService.generateSecret).toHaveBeenCalledWith("u1");
    expect(res._status).toBe(201);
    expect(res._json.data.secret).toBe("BASE32SECRET");
  });

  it("should fall back to req.body.userId when req.user is missing", async () => {
    (totpService.generateSecret as jest.Mock).mockResolvedValue({
      secret: "s",
      qrCode: "q",
    });

    const req = createMockReq({ body: { userId: "u2" } });
    const res = createMockRes();
    const next = createMockNext();

    await enableHandler(req, res, next);

    expect(totpService.generateSecret).toHaveBeenCalledWith("u2");
  });

  it("should throw when userId is not available", async () => {
    const req = createMockReq({ body: {} });
    const res = createMockRes();
    const next = createMockNext();

    await enableHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].message).toBe("User ID not found");
  });
});

describe("confirmAndEnableHandler", () => {
  it("should return success when token is valid", async () => {
    (totpService.confirmAndEnable as jest.Mock).mockResolvedValue(true);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
      body: { token: "123456" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await confirmAndEnableHandler(req, res, next);

    expect(totpService.confirmAndEnable).toHaveBeenCalledWith("u1", "123456");
    expect(res._json.data).toEqual({ success: true });
  });

  it("should throw InvalidTotpTokenException when token is invalid", async () => {
    (totpService.confirmAndEnable as jest.Mock).mockResolvedValue(false);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
      body: { token: "000000" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await confirmAndEnableHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].name).toBe("InvalidTotpTokenException");
  });
});

describe("verifyHandler", () => {
  it("should return isValid true for a correct token", async () => {
    (totpService.verifyCode as jest.Mock).mockResolvedValue(true);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
      body: { token: "654321" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await verifyHandler(req, res, next);

    expect(res._json.data).toEqual({ isValid: true });
  });

  it("should throw InvalidTotpTokenException for an incorrect token", async () => {
    (totpService.verifyCode as jest.Mock).mockResolvedValue(false);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
      body: { token: "000000" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await verifyHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].name).toBe("InvalidTotpTokenException");
  });
});

describe("disableHandler", () => {
  it("should disable TOTP and return disabled: true", async () => {
    (totpService.disable as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await disableHandler(req, res, next);

    expect(totpService.disable).toHaveBeenCalledWith("u1");
    expect(res._json.data).toEqual({ disabled: true });
  });
});
