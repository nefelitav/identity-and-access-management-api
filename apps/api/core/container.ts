// Dependency Injection Container

export class ServiceIdentifier {
  public readonly serviceIdentifier: symbol;

  constructor(identifier: string) {
    this.serviceIdentifier = Symbol(identifier);
  }
}

export class Container {
  private services = new Map<symbol, any>();
  private factories = new Map<symbol, () => any>();

  bind<T>(identifier: ServiceIdentifier, implementation: T): void {
    this.services.set(identifier.serviceIdentifier, implementation);
  }

  bindFactory<T>(identifier: ServiceIdentifier, factory: () => T): void {
    this.factories.set(identifier.serviceIdentifier, factory);
  }

  bindSingleton<T>(identifier: ServiceIdentifier, factory: () => T): void {
    let instance: T | null = null;
    this.factories.set(identifier.serviceIdentifier, () => {
      if (!instance) {
        instance = factory();
      }
      return instance;
    });
  }

  get<T>(identifier: ServiceIdentifier): T {
    // Check for direct service binding
    if (this.services.has(identifier.serviceIdentifier)) {
      return this.services.get(identifier.serviceIdentifier);
    }

    // Check for factory binding
    if (this.factories.has(identifier.serviceIdentifier)) {
      const factory = this.factories.get(identifier.serviceIdentifier)!;
      return factory();
    }

    throw new Error(
      `Service not found: ${identifier.serviceIdentifier.toString()}`,
    );
  }
}

// Global container instance
export const container = new Container();

// Service identifiers
export const SERVICE_IDENTIFIERS = {
  // Repositories
  UserRepository: new ServiceIdentifier("UserRepository"),
  SessionRepository: new ServiceIdentifier("SessionRepository"),
  RbacRepository: new ServiceIdentifier("RbacRepository"),
  PermissionRepository: new ServiceIdentifier("PermissionRepository"),
  TotpRepository: new ServiceIdentifier("TotpRepository"),

  // Services
  AuthService: new ServiceIdentifier("AuthService"),
  SessionService: new ServiceIdentifier("SessionService"),
  RbacService: new ServiceIdentifier("RbacService"),
  PermissionService: new ServiceIdentifier("PermissionService"),
  TotpService: new ServiceIdentifier("TotpService"),
  OtpService: new ServiceIdentifier("OtpService"),
  AdminService: new ServiceIdentifier("AdminService"),
  ProfileService: new ServiceIdentifier("ProfileService"),

  // External Services
  EmailService: new ServiceIdentifier("EmailService"),
  SmsService: new ServiceIdentifier("SmsService"),
  CaptchaService: new ServiceIdentifier("CaptchaService"),

  // Infrastructure
  DatabaseClient: new ServiceIdentifier("DatabaseClient"),
  RedisClient: new ServiceIdentifier("RedisClient"),
  Logger: new ServiceIdentifier("Logger"),
  CacheService: new ServiceIdentifier("CacheService"),

  // Event System
  EventBus: new ServiceIdentifier("EventBus"),
  EventStore: new ServiceIdentifier("EventStore"),
} as const;
