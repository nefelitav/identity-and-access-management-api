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

  isBound(identifier: ServiceIdentifier): boolean {
    return (
      this.services.has(identifier.serviceIdentifier) ||
      this.factories.has(identifier.serviceIdentifier)
    );
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

export const container = new Container();

export const SERVICE_IDENTIFIERS = {
  // Repositories
  UserRepository: new ServiceIdentifier("UserRepository"),
  SessionRepository: new ServiceIdentifier("SessionRepository"),
  RbacRepository: new ServiceIdentifier("RbacRepository"),
  PermissionRepository: new ServiceIdentifier("PermissionRepository"),
  TotpRepository: new ServiceIdentifier("TotpRepository"),

  AuthService: new ServiceIdentifier("AuthService"),
  SessionService: new ServiceIdentifier("SessionService"),
  RbacService: new ServiceIdentifier("RbacService"),
  PermissionService: new ServiceIdentifier("PermissionService"),
  TotpService: new ServiceIdentifier("TotpService"),
  OtpService: new ServiceIdentifier("OtpService"),
  AdminService: new ServiceIdentifier("AdminService"),
  ProfileService: new ServiceIdentifier("ProfileService"),

  CaptchaService: new ServiceIdentifier("CaptchaService"),

  DatabaseClient: new ServiceIdentifier("DatabaseClient"),
  RedisClient: new ServiceIdentifier("RedisClient"),
  Logger: new ServiceIdentifier("Logger"),
} as const;
