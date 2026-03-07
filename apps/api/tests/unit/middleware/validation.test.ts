import { z } from "zod";
import { validateRequest } from "~/middleware/validation";
import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";

beforeEach(() => jest.clearAllMocks());

describe("validateRequest – plain schema object", () => {
  const schema = {
    body: z.object({ email: z.string().email(), password: z.string().min(8) }),
  };

  it("should parse valid body and call next", () => {
    const req = createMockReq({
      body: { email: "a@b.com", password: "12345678" },
    });
    const res = createMockRes();
    const next = createMockNext();

    validateRequest(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // no error
    expect(req.body.email).toBe("a@b.com");
  });

  it("should call next with ZodError for invalid body", () => {
    const req = createMockReq({ body: { email: "bad", password: "short" } });
    const res = createMockRes();
    const next = createMockNext();

    validateRequest(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.name).toBe("ZodError");
  });
});

describe("validateRequest – with query and params", () => {
  const schema = {
    query: z.object({ page: z.string() }),
    params: z.object({ id: z.string().uuid() }),
  };

  it("should parse valid query and params", () => {
    const req = createMockReq({
      query: { page: "1" } as any,
      params: { id: "550e8400-e29b-41d4-a716-446655440000" },
    });
    const res = createMockRes();
    const next = createMockNext();

    validateRequest(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should fail when params are invalid", () => {
    const req = createMockReq({
      query: { page: "1" } as any,
      params: { id: "not-a-uuid" },
    });
    const res = createMockRes();
    const next = createMockNext();

    validateRequest(schema)(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
  });
});

describe("validateRequest – ZodObject with shape", () => {
  const schema = z.object({
    body: z.object({ name: z.string().min(1) }),
  });

  it("should parse body from ZodObject shape and call next", () => {
    const req = createMockReq({ body: { name: "test" } });
    const res = createMockRes();
    const next = createMockNext();

    validateRequest(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.name).toBe("test");
  });

  it("should forward ZodError for invalid data", () => {
    const req = createMockReq({ body: { name: "" } });
    const res = createMockRes();
    const next = createMockNext();

    validateRequest(schema)(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.name).toBe("ZodError");
  });
});
