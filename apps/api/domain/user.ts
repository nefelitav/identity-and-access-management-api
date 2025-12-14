export interface UserProps {
  id: string;
  email: string;
  password: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly _email: string;
  private readonly _password: string;
  private readonly _failedLoginAttempts: number;
  private readonly _lockoutUntil?: Date;

  constructor(props: UserProps) {
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
}
