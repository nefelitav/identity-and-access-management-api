import {
  handleRequest,
  extractUserAgent,
  extractIpAddress,
} from "~/controllers/base/baseController";

function createMockReq(overrides = {}) {
  return {
    headers: { "user-agent": "jest-test/1.0" },
    ip: "127.0.0.1",
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as any;
}

function createMockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
}

describe("handleRequest", () => {
  it("should send JSON response with success true on resolved value", async () => {
    const handler = handleRequest(async () => ({ id: "1" }));
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "1" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should use a custom success status code", async () => {
    const handler = handleRequest(async () => ({ created: true }), 201);
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return JSON with success true when handler returns null", async () => {
    const handler = handleRequest(async () => null);
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
  });

  it("should forward errors to next()", async () => {
    const err = new Error("boom");
    const handler = handleRequest(async () => {
      throw err;
    });
    const req = createMockReq();
    const res = createMockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("extractUserAgent", () => {
  it("should return the user-agent header", () => {
    const req = createMockReq({ headers: { "user-agent": "Chrome/120" } });
    expect(extractUserAgent(req)).toBe("Chrome/120");
  });

  it("should return undefined when header is missing", () => {
    const req = createMockReq({ headers: {} });
    expect(extractUserAgent(req)).toBeUndefined();
  });
});

describe("extractIpAddress", () => {
  it("should return the request IP", () => {
    const req = createMockReq({ ip: "10.0.0.1" });
    expect(extractIpAddress(req)).toBe("10.0.0.1");
  });
});
