/** Properties that define a User. */
export interface UserProps {
  id: string;
  email: string;
  password: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Immutable User domain object. */
export type User = Readonly<UserProps>;

/** Create a frozen User object from its properties. */
export function createUser(props: UserProps): User {
  return Object.freeze({ ...props });
}
