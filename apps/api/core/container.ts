export interface ServiceIdentifier {
  readonly serviceIdentifier: symbol;
}

export function createServiceIdentifier(name: string): ServiceIdentifier {
  return Object.freeze({ serviceIdentifier: Symbol(name) });
}

export interface Container {
  bind<T>(id: ServiceIdentifier, implementation: T): void;
  bindFactory<T>(id: ServiceIdentifier, factory: () => T): void;
  bindSingleton<T>(id: ServiceIdentifier, factory: () => T): void;
  isBound(id: ServiceIdentifier): boolean;
  get<T>(id: ServiceIdentifier): T;
}

export function createContainer(): Container {
  const services = new Map<symbol, any>();
  const factories = new Map<symbol, () => any>();

  return {
    bind<T>(id: ServiceIdentifier, implementation: T) {
      services.set(id.serviceIdentifier, implementation);
    },

    bindFactory<T>(id: ServiceIdentifier, factory: () => T) {
      factories.set(id.serviceIdentifier, factory);
    },

    bindSingleton<T>(id: ServiceIdentifier, factory: () => T) {
      let instance: T | null = null;
      factories.set(id.serviceIdentifier, () => {
        if (!instance) instance = factory();
        return instance;
      });
    },

    isBound(id: ServiceIdentifier) {
      return (
        services.has(id.serviceIdentifier) ||
        factories.has(id.serviceIdentifier)
      );
    },

    get<T>(id: ServiceIdentifier): T {
      if (services.has(id.serviceIdentifier)) {
        return services.get(id.serviceIdentifier);
      }
      if (factories.has(id.serviceIdentifier)) {
        return factories.get(id.serviceIdentifier)!();
      }
      throw new Error(`Service not found: ${id.serviceIdentifier.toString()}`);
    },
  };
}

export const container = createContainer();

export const SERVICE_IDENTIFIERS = {
  UserRepository: createServiceIdentifier("UserRepository"),
  SessionRepository: createServiceIdentifier("SessionRepository"),
  RbacRepository: createServiceIdentifier("RbacRepository"),
  PermissionRepository: createServiceIdentifier("PermissionRepository"),
  TotpRepository: createServiceIdentifier("TotpRepository"),

  DatabaseClient: createServiceIdentifier("DatabaseClient"),
  RedisClient: createServiceIdentifier("RedisClient"),
  Logger: createServiceIdentifier("Logger"),
} as const;
