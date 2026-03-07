import { createContainer, createServiceIdentifier } from "~/core/container";

describe("DI Container", () => {
  it("should bind and retrieve a direct value", () => {
    const container = createContainer();
    const id = createServiceIdentifier("TestService");

    container.bind(id, { name: "test" });
    const result = container.get<{ name: string }>(id);

    expect(result).toEqual({ name: "test" });
  });

  it("should bind a factory and create a new instance each time", () => {
    const container = createContainer();
    const id = createServiceIdentifier("FactoryService");
    let callCount = 0;

    container.bindFactory(id, () => {
      callCount++;
      return { count: callCount };
    });

    const a = container.get<{ count: number }>(id);
    const b = container.get<{ count: number }>(id);

    expect(a.count).toBe(1);
    expect(b.count).toBe(2);
    expect(a).not.toBe(b);
  });

  it("should bind a singleton and return the same instance each time", () => {
    const container = createContainer();
    const id = createServiceIdentifier("SingletonService");
    let callCount = 0;

    container.bindSingleton(id, () => {
      callCount++;
      return { count: callCount };
    });

    const a = container.get<{ count: number }>(id);
    const b = container.get<{ count: number }>(id);

    expect(a.count).toBe(1);
    expect(b.count).toBe(1);
    expect(a).toBe(b);
  });

  it("should report whether a service is bound", () => {
    const container = createContainer();
    const id = createServiceIdentifier("Bound");
    const notBound = createServiceIdentifier("NotBound");

    container.bind(id, "hello");

    expect(container.isBound(id)).toBe(true);
    expect(container.isBound(notBound)).toBe(false);
  });

  it("should throw when getting an unbound service", () => {
    const container = createContainer();
    const id = createServiceIdentifier("Missing");

    expect(() => container.get(id)).toThrow("Service not found");
  });

  it("should prefer direct binding over factory", () => {
    const container = createContainer();
    const id = createServiceIdentifier("Priority");

    container.bind(id, "direct");
    container.bindFactory(id, () => "factory");

    expect(container.get(id)).toBe("direct");
  });
});

describe("createServiceIdentifier", () => {
  it("should create a frozen object with a unique symbol", () => {
    const id = createServiceIdentifier("MyService");

    expect(id).toHaveProperty("serviceIdentifier");
    expect(typeof id.serviceIdentifier).toBe("symbol");
    expect(Object.isFrozen(id)).toBe(true);
  });

  it("should create distinct identifiers for different names", () => {
    const a = createServiceIdentifier("A");
    const b = createServiceIdentifier("B");

    expect(a.serviceIdentifier).not.toBe(b.serviceIdentifier);
  });
});
