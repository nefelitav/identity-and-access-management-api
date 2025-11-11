import { AggregateRoot } from "./base";
import { UserRegisteredEvent, UserLoginEvent, UserLockedEvent } from "./events";

export interface UserProps {
  id: string;
  email: string;
  password: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<string> {
  private _email: string;
  private _password: string;
  private _failedLoginAttempts: number;
  private _lockoutUntil?: Date;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = props.email;
    this._password = props.password;
    this._failedLoginAttempts = props.failedLoginAttempts;
    this._lockoutUntil = props.lockoutUntil;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }

  get lockoutUntil(): Date | undefined {
    return this._lockoutUntil;
  }

  get isLocked(): boolean {
    return this._lockoutUntil ? this._lockoutUntil > new Date() : false;
  }

  // Business Logic Methods
  changeEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error("Invalid email format");
    }
    this._email = newEmail;
    this.updateTimestamp();
  }

  changePassword(newPassword: string): void {
    if (!this.isValidPassword(newPassword)) {
      throw new Error("Password does not meet requirements");
    }
    this._password = newPassword;
    this.updateTimestamp();
  }

  recordFailedLogin(): void {
    this._failedLoginAttempts += 1;

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 15; // minutes

    if (this._failedLoginAttempts >= MAX_ATTEMPTS) {
      this._lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION * 60 * 1000);
      this.addDomainEvent(new UserLockedEvent(this._id, this._lockoutUntil));
    }

    this.updateTimestamp();
  }

  resetFailedLogins(): void {
    this._failedLoginAttempts = 0;
    this._lockoutUntil = undefined;
    this.updateTimestamp();
  }

  recordSuccessfulLogin(userAgent?: string, ip?: string): void {
    this.resetFailedLogins();
    this.addDomainEvent(new UserLoginEvent(this._id, userAgent, ip));
  }

  // Factory Methods
  static create(
    props: Omit<
      UserProps,
      "id" | "createdAt" | "updatedAt" | "failedLoginAttempts"
    >,
  ): User {
    const user = new User({
      id: crypto.randomUUID(),
      email: props.email,
      password: props.password,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user.addDomainEvent(new UserRegisteredEvent(user._id, user._email));
    return user;
  }

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // Validation Methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Serialization
  toPersistence(): UserProps {
    return {
      id: this._id,
      email: this._email,
      password: this._password,
      failedLoginAttempts: this._failedLoginAttempts,
      lockoutUntil: this._lockoutUntil,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toDTO(): UserDTO {
    return {
      id: this._id,
      email: this._email,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      isLocked: this.isLocked,
    };
  }
}

export interface UserDTO {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
}
