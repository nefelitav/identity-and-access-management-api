jest.mock("~/utils/redis", () => ({
  __esModule: true,
  default: {
    setEx: jest.fn().mockResolvedValue("OK"),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock("~/utils", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  sendSms: jest.fn().mockResolvedValue(undefined),
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import redis from "~/utils/redis";
import { sendEmail, sendSms } from "~/utils";
import * as otpService from "~/services/mfa/otpService";

describe("otpService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateCode", () => {
    it("should generate a 6-digit code and store in Redis", async () => {
      const code = await otpService.generateCode("user-1");

      expect(code).toMatch(/^\d{6}$/);
      expect(redis.setEx).toHaveBeenCalledWith("mfa_code:user-1", 300, code);
    });
  });

  describe("verifyCode", () => {
    it("should return true and delete key when code matches", async () => {
      (redis.get as jest.Mock).mockResolvedValue("123456");

      const result = await otpService.verifyCode("user-1", "123456");

      expect(result).toBe(true);
      expect(redis.del).toHaveBeenCalledWith("mfa_code:user-1");
    });

    it("should return false when code does not match", async () => {
      (redis.get as jest.Mock).mockResolvedValue("123456");

      const result = await otpService.verifyCode("user-1", "000000");

      expect(result).toBe(false);
      expect(redis.del).not.toHaveBeenCalled();
    });

    it("should return false when no code is stored", async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await otpService.verifyCode("user-1", "123456");

      expect(result).toBe(false);
    });
  });

  describe("generateAndSendCodeViaEmail", () => {
    it("should generate a code and send it via email", async () => {
      await otpService.generateAndSendCodeViaEmail("user-1", "test@test.com");

      expect(redis.setEx).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@test.com",
          subject: "Your MFA Code",
        }),
      );
    });
  });

  describe("generateAndSendCodeViaSms", () => {
    it("should generate a code and send it via SMS", async () => {
      await otpService.generateAndSendCodeViaSms("user-1", "+1234567890");

      expect(redis.setEx).toHaveBeenCalled();
      expect(sendSms).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "+1234567890",
        }),
      );
    });
  });
});
