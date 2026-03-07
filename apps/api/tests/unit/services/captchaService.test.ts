jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
  ResponseCode: { CONFLICT: 409 },
}));

jest.mock("~/config", () => ({
  config: { RECAPTCHA_SECRET_KEY: "test-secret-key" },
}));

jest.mock("~/exceptions", () => ({
  CaptchaVerificationFailedException: () => {
    const e = new Error("Captcha verification failed") as any;
    e.name = "CaptchaVerificationFailedException";
    e.statusCode = 409;
    return e;
  },
}));

import { verifyCaptcha } from "~/services/captcha/captchaService";

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

beforeEach(() => jest.clearAllMocks());

describe("captchaService.verifyCaptcha", () => {
  it("should return success and score when captcha passes", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ success: true, score: 0.9 }),
    });

    const result = await verifyCaptcha("valid-token", "1.2.3.4");

    expect(result.success).toBe(true);
    expect(result.score).toBe(0.9);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://www.google.com/recaptcha/api/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("should return failure when captcha fails", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    });

    const result = await verifyCaptcha("bad-token");

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("invalid-input-response");
  });

  it("should throw CaptchaVerificationFailedException on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));

    await expect(verifyCaptcha("token")).rejects.toMatchObject({
      name: "CaptchaVerificationFailedException",
    });
  });
});
