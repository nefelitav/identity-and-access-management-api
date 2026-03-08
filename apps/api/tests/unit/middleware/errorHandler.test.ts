import { errorHandler } from "~/middleware/errorHandler";
import { ZodError, ZodIssue } from "zod";

function createMockReq(overrides = {}) {
  return { method: "POST", path: "/test", headers: {}, ...overrides } as any;
}

function createMockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  const next = jest.fn();

  it("should handle ZodError with 400 and validation details", () => {
    const issues: ZodIssue[] = [
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["email"],
        message: "Expected string",
      },
    ];
    const err = new ZodError(issues);
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(err as any, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Validation Error",
          details: expect.arrayContaining([
            expect.objectContaining({
              path: "email",
              message: "Expected string",
            }),
          ]),
        }),
      }),
    );
  });

  it("should use the error statusCode when present", () => {
    const err: any = new Error("Not found");
    err.statusCode = 404;
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: "Not found" }),
      }),
    );
  });

  it("should default to 500 for errors without statusCode", () => {
    const err = new Error("Unexpected");
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(err as any, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          // In test mode the actual message is exposed; in production it would be "Internal server error"
          message: "Unexpected",
        }),
      }),
    );
  });

  it("should map known exception names to error codes", () => {
    const err: any = new Error("Email foo@bar.com already in use.");
    err.name = "EmailAlreadyInUseException";
    err.statusCode = 409;
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "AUTH_EMAIL_TAKEN" }),
      }),
    );
  });

  it("should use error.code when provided", () => {
    const err: any = new Error("Custom");
    err.statusCode = 422;
    err.code = "CUSTOM_CODE";
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "CUSTOM_CODE" }),
      }),
    );
  });
});
