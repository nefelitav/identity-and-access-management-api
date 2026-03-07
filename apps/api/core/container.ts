/** Opaque service identifier wrapping a unique symbol. */
export interface ServiceIdentifier {
  readonly serviceIdentifier: symbol;
}

/** Create a new ServiceIdentifier. */
export function createServiceIdentifier(name: string): ServiceIdentifier {
  return Object.freeze({ serviceIdentifier: Symbol(name) });
}

/** Dependency-injection container. */
export interface Container {
  bind<T>(id: ServiceIdentifier, implementation: T): void;
  bindFactory<T>(id: ServiceIdentifier, factory: () => T): void;
  bindSingleton<T>(id: ServiceIdentifier, factory: () => T): void;
  isBound(id: ServiceIdentifier): boolean;
  get<T>(id: ServiceIdentifier): T;
}

/** Create a new DI container. */
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

/** Global application container. */
export const container = createContainer();

/** Well-known service identifiers used throughout the app. */
export const SERVICE_IDENTIFIERS = {
  // Repositories
  UserRepository: createServiceIdentifier("UserRepository"),
  SessionRepository: createServiceIdentifier("SessionRepository"),
  RbacRepository: createServiceIdentifier("RbacRepository"),
  PermissionRepository: createServiceIdentifier("PermissionRepository"),
  TotpRepository: createServiceIdentifier("TotpRepository"),

  // Services
  AuthService: createServiceIdentifier("AuthService"),
  SessionService: createServiceIdentifier("SessionService"),
  RbacService: createServiceIdentifier("RbacService"),
  PermissionService: createServiceIdentifier("PermissionService"),
  TotpService: createServiceIdentifier("TotpService"),
  OtpService: createServiceIdentifier("OtpService"),
  AdminService: createServiceIdentifier("AdminService"),
  ProfileService: createServiceIdentifier("ProfileService"),
  CaptchaService: createServiceIdentifier("CaptchaService"),

  // Infrastructure
  DatabaseClient: createServiceIdentifier("DatabaseClient"),
  RedisClient: createServiceIdentifier("RedisClient"),
  Logger: createServiceIdentifier("Logger"),
} as const;
