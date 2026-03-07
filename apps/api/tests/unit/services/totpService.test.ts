jest.mock("~/core", () => ({
  container: { get: jest.fn() },
  SERVICE_IDENTIFIERS: {
    TotpRepository: { serviceIdentifier: Symbol("TotpRepository") },
  },
}));

jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/utils/redis", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    del: jest.fn(),
    setEx: jest.fn(),
  },
}));

jest.mock("speakeasy", () => ({
  generateSecret: jest.fn().mockReturnValue({
    base32: "JBSWY3DPEHPK3PXP",
    otpauth_url: "otpauth://totp/YourApp?secret=JBSWY3DPEHPK3PXP",
  }),
  totp: {
    verify: jest.fn(),
  },
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,FAKE"),
}));

import { container } from "~/core";
import redis from "~/utils/redis";
import * as speakeasy from "speakeasy";
import * as totpService from "~/services/mfa/totpService";

const mockRepo = {
  createOrUpdateSecret: jest.fn(),
  getSecretByUserId: jest.fn(),
  enableMfa: jest.fn(),
  disableMfa: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockRepo);
});

describe("totpService.generateSecret", () => {
  it("should generate a secret, store it, and return a QR code", async () => {
    mockRepo.createOrUpdateSecret.mockResolvedValue(undefined);

    const result = await totpService.generateSecret("u1");

    expect(speakeasy.generateSecret).toHaveBeenCalledWith({
      name: "YourApp (u1)",
    });
    expect(mockRepo.createOrUpdateSecret).toHaveBeenCalledWith(
      "u1",
      "JBSWY3DPEHPK3PXP",
      false,
    );
    expect(result.secret).toBe("JBSWY3DPEHPK3PXP");
    expect(result.qrCode).toContain("data:image/png");
  });
});

describe("totpService.confirmAndEnable", () => {
  it("should return false when no secret exists", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue(null);

    const result = await totpService.confirmAndEnable("u1", "123456");
    expect(result).toBe(false);
  });

  it("should enable MFA when token is valid", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue({
      secret: "SEC",
      enabled: false,
    });
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
    mockRepo.enableMfa.mockResolvedValue(undefined);

    const result = await totpService.confirmAndEnable("u1", "123456");

    expect(result).toBe(true);
    expect(mockRepo.enableMfa).toHaveBeenCalledWith("u1");
  });

  it("should return false and not enable MFA when token is invalid", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue({
      secret: "SEC",
      enabled: false,
    });
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

    const result = await totpService.confirmAndEnable("u1", "000000");

    expect(result).toBe(false);
    expect(mockRepo.enableMfa).not.toHaveBeenCalled();
  });
});

describe("totpService.verifyCode", () => {
  it("should return false when no secret exists", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue(null);

    const result = await totpService.verifyCode("u1", "123456");
    expect(result).toBe(false);
  });

  it("should return false when MFA is not enabled", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue({
      secret: "SEC",
      enabled: false,
    });

    const result = await totpService.verifyCode("u1", "123456");
    expect(result).toBe(false);
  });

  it("should return false when max attempts exceeded", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue({
      secret: "SEC",
      enabled: true,
    });
    (redis.get as jest.Mock).mockResolvedValue("5");

    const result = await totpService.verifyCode("u1", "123456");
    expect(result).toBe(false);
  });

  it("should return true and clear attempts on valid code", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue({
      secret: "SEC",
      enabled: true,
    });
    (redis.get as jest.Mock).mockResolvedValue("0");
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

    const result = await totpService.verifyCode("u1", "123456");

    expect(result).toBe(true);
    expect(redis.del).toHaveBeenCalledWith("mfa_attempts:u1");
  });

  it("should increment attempts on invalid code", async () => {
    mockRepo.getSecretByUserId.mockResolvedValue({
      secret: "SEC",
      enabled: true,
    });
    (redis.get as jest.Mock).mockResolvedValue("2");
    (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

    const result = await totpService.verifyCode("u1", "000000");

    expect(result).toBe(false);
    expect(redis.setEx).toHaveBeenCalledWith("mfa_attempts:u1", 300, "3");
  });
});

describe("totpService.disable", () => {
  it("should disable MFA for a user", async () => {
    mockRepo.disableMfa.mockResolvedValue(undefined);

    await totpService.disable("u1");

    expect(mockRepo.disableMfa).toHaveBeenCalledWith("u1");
  });
});
