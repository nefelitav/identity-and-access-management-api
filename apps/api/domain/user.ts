export interface UserProps {
  id: string;
  email: string;
  password: string;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type User = Readonly<UserProps>;

export function createUser(props: UserProps): User {
  return Object.freeze({ ...props });
}
