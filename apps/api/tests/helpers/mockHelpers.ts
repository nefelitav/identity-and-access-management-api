import { Request, Response, NextFunction } from "express";

/** Create a minimal mock Express Request. */
export function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: "127.0.0.1",
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

/** Create a minimal mock Express Response with chainable helpers. */
export function createMockRes(): Response & {
  _status: number;
  _json: any;
  _sentStatus: number | null;
} {
  const res: any = {
    _status: 200,
    _json: null,
    _sentStatus: null,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: any) {
      res._json = data;
      return res;
    },
    sendStatus(code: number) {
      res._sentStatus = code;
      return res;
    },
  };
  return res;
}

/** Create a jest mock NextFunction. */
export function createMockNext(): NextFunction & jest.Mock {
  return jest.fn() as NextFunction & jest.Mock;
}

/** Standard ~/core mock factory. */
export function createCoreMock() {
  return {
    container: {
      get: jest.fn(),
      bind: jest.fn(),
      bindFactory: jest.fn(),
      bindSingleton: jest.fn(),
      isBound: jest.fn(),
    },
    SERVICE_IDENTIFIERS: {
      UserRepository: { serviceIdentifier: Symbol("UserRepository") },
      SessionRepository: { serviceIdentifier: Symbol("SessionRepository") },
      RbacRepository: { serviceIdentifier: Symbol("RbacRepository") },
      PermissionRepository: {
        serviceIdentifier: Symbol("PermissionRepository"),
      },
      TotpRepository: { serviceIdentifier: Symbol("TotpRepository") },
    },
  };
}

/** Standard ~/utils mock factory. */
export function createUtilsMock(overrides: Record<string, any> = {}) {
  return {
    generateTokens: jest.fn().mockResolvedValue({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    }),
    hashToken: jest.fn((t: string) => `hashed_${t}`),
    JWT_EXPIRY: 900,
    JWT_SECRET: "test-jwt-secret-key-long-enough",
    SALT: 10,
    sendEmail: jest.fn().mockResolvedValue(undefined),
    createLogger: () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }),
    ResponseCode: {
      OK: 200,
      CREATED: 201,
      NO_CONTENT: 204,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_ALLOWED: 405,
      CONFLICT: 409,
      UNPROCESSABLE_ENTITY: 422,
      TOO_MANY_REQUESTS: 429,
      INTERNAL_SERVER_ERROR: 500,
      BAD_GATEWAY: 502,
    },
    ...overrides,
  };
}
