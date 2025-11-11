import { DomainEvent } from "./base";

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
    super();
  }
}

export class UserLoginEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
  ) {
    super();
  }
}

export class UserLockedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly lockoutUntil: Date,
  ) {
    super();
  }
}

export class UserPasswordChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
    super();
  }
}

export class UserEmailChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly oldEmail: string,
    public readonly newEmail: string,
  ) {
    super();
  }
}

export class SessionCreatedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
  ) {
    super();
  }
}

export class SessionDeletedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
  ) {
    super();
  }
}

export class RoleAssignedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly roleName: string,
  ) {
    super();
  }
}

export class PermissionGrantedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly permissionId: string,
    public readonly permissionName: string,
  ) {
    super();
  }
}

export class MfaEnabledEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly mfaType: "TOTP" | "OTP",
  ) {
    super();
  }
}

export class MfaDisabledEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly mfaType: "TOTP" | "OTP",
  ) {
    super();
  }
}
