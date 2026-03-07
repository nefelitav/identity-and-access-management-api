import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  emailSchema,
  passwordSchema,
  uuidSchema,
  paginationSchema,
  getUserSchema,
} from "~/validation/schemas";

describe("emailSchema", () => {
  it("should accept a valid email", () => {
    expect(() => emailSchema.parse("user@example.com")).not.toThrow();
  });

  it("should reject an empty string", () => {
    expect(() => emailSchema.parse("")).toThrow();
  });

  it("should reject an invalid email", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
  });
});

describe("passwordSchema", () => {
  it("should accept a valid password", () => {
    expect(() => passwordSchema.parse("P@ssw0rd!")).not.toThrow();
  });

  it("should reject passwords shorter than 8 chars", () => {
    expect(() => passwordSchema.parse("Ab1!")).toThrow();
  });

  it("should reject passwords without uppercase", () => {
    expect(() => passwordSchema.parse("p@ssw0rd!")).toThrow();
  });

  it("should reject passwords without lowercase", () => {
    expect(() => passwordSchema.parse("P@SSW0RD!")).toThrow();
  });

  it("should reject passwords without a digit", () => {
    expect(() => passwordSchema.parse("P@ssword!")).toThrow();
  });

  it("should reject passwords without a special char", () => {
    expect(() => passwordSchema.parse("Passw0rdd")).toThrow();
  });
});

describe("uuidSchema", () => {
  it("should accept a valid UUID", () => {
    expect(() =>
      uuidSchema.parse("123e4567-e89b-12d3-a456-426614174000"),
    ).not.toThrow();
  });

  it("should reject a non-UUID string", () => {
    expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
  });
});

describe("registerSchema", () => {
  it("should accept valid body", () => {
    const result = registerSchema.parse({
      body: { email: "user@test.com", password: "P@ssw0rd!" },
    });
    expect(result.body.email).toBe("user@test.com");
  });

  it("should reject missing email", () => {
    expect(() =>
      registerSchema.parse({ body: { password: "P@ssw0rd!" } }),
    ).toThrow();
  });
});

describe("loginSchema", () => {
  it("should accept valid credentials", () => {
    const result = loginSchema.parse({
      body: { email: "user@test.com", password: "anypassword" },
    });
    expect(result.body.email).toBe("user@test.com");
  });

  it("should accept optional remember field", () => {
    const result = loginSchema.parse({
      body: { email: "user@test.com", password: "pass", remember: true },
    });
    expect(result.body.remember).toBe(true);
  });
});

describe("refreshTokenSchema", () => {
  it("should accept a valid refresh token", () => {
    const result = refreshTokenSchema.parse({
      body: { refreshToken: "some-token-value" },
    });
    expect(result.body.refreshToken).toBe("some-token-value");
  });

  it("should reject empty refresh token", () => {
    expect(() =>
      refreshTokenSchema.parse({ body: { refreshToken: "" } }),
    ).toThrow();
  });
});

describe("getUserSchema", () => {
  it("should accept a valid UUID param", () => {
    const result = getUserSchema.parse({
      params: { id: "123e4567-e89b-12d3-a456-426614174000" },
    });
    expect(result.params.id).toBeTruthy();
  });

  it("should reject invalid UUID param", () => {
    expect(() => getUserSchema.parse({ params: { id: "bad" } })).toThrow();
  });
});

describe("paginationSchema", () => {
  it("should provide defaults when no values given", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it("should parse string numbers", () => {
    const result = paginationSchema.parse({ page: "3", limit: "25" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });

  it("should reject limit > 100", () => {
    expect(() => paginationSchema.parse({ limit: "200" })).toThrow();
  });

  it("should reject page <= 0", () => {
    expect(() => paginationSchema.parse({ page: "0" })).toThrow();
  });
});
