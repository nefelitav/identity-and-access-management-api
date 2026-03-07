import { createException } from "~/utils/createException";

describe("createException", () => {
  it("should create an error with the given name, message, and statusCode", () => {
    const err = createException("TestError", "Something failed", 400);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("TestError");
    expect(err.message).toBe("Something failed");
    expect(err.statusCode).toBe(400);
  });

  it("should default statusCode to 500 when not provided", () => {
    const err = createException("InternalError", "Server broke");

    expect(err.statusCode).toBe(500);
  });

  it("should include an optional error code", () => {
    const err = createException("AuthError", "Unauthorized", 401, "AUTH_FAIL");

    expect(err.code).toBe("AUTH_FAIL");
  });

  it("should not set code property when code is not provided", () => {
    const err = createException("SimpleError", "oops", 422);

    expect(err.code).toBeUndefined();
  });

  it("should have a stack trace", () => {
    const err = createException("StackError", "trace me", 500);

    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("trace me");
  });
});
