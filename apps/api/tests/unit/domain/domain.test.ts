import { createEntity } from "~/domain/base";
import { createUser } from "~/domain/user";

describe("createEntity", () => {
  it("should create a frozen entity with defaults", () => {
    const entity = createEntity("abc-123");

    expect(entity.id).toBe("abc-123");
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(Object.isFrozen(entity)).toBe(true);
  });

  it("should accept custom dates", () => {
    const created = new Date("2024-01-01");
    const updated = new Date("2024-06-01");
    const entity = createEntity("id", created, updated);

    expect(entity.createdAt).toEqual(created);
    expect(entity.updatedAt).toEqual(updated);
  });

  it("should be immutable", () => {
    const entity = createEntity("x");
    expect(() => {
      (entity as any).id = "changed";
    }).toThrow();
  });
});

describe("createUser", () => {
  const baseProps = {
    id: "user-1",
    email: "test@example.com",
    password: "hashed",
    failedLoginAttempts: 0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
  };

  it("should create a frozen User object", () => {
    const user = createUser(baseProps);

    expect(user.id).toBe("user-1");
    expect(user.email).toBe("test@example.com");
    expect(user.failedLoginAttempts).toBe(0);
    expect(Object.isFrozen(user)).toBe(true);
  });

  it("should include optional lockoutUntil", () => {
    const lockout = new Date("2025-01-01");
    const user = createUser({ ...baseProps, lockoutUntil: lockout });

    expect(user.lockoutUntil).toEqual(lockout);
  });

  it("should be immutable", () => {
    const user = createUser(baseProps);
    expect(() => {
      (user as any).email = "changed@test.com";
    }).toThrow();
  });
});
