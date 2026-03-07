jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/captcha/captchaService");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import { verifyCaptcha } from "~/services/captcha/captchaService";
import { verifyHandler } from "~/controllers/captcha/captchaController";

beforeEach(() => jest.clearAllMocks());

describe("captchaController.verifyHandler", () => {
  it("should return success and score from captcha service", async () => {
    (verifyCaptcha as jest.Mock).mockResolvedValue({
      success: true,
      score: 0.9,
    });

    const req = createMockReq({
      body: { token: "captcha-tok" },
      ip: "1.2.3.4",
    });
    const res = createMockRes();
    const next = createMockNext();

    await verifyHandler(req, res, next);

    expect(verifyCaptcha).toHaveBeenCalledWith("captcha-tok", "1.2.3.4");
    expect(res._json.data).toEqual({ success: true, score: 0.9 });
  });

  it("should forward errors to next", async () => {
    const err = new Error("captcha failed");
    (verifyCaptcha as jest.Mock).mockRejectedValue(err);

    const req = createMockReq({ body: { token: "bad" } });
    const res = createMockRes();
    const next = createMockNext();

    await verifyHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
