export interface Entity<T = string> {
  readonly id: T;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function createEntity<T = string>(
  id: T,
  createdAt?: Date,
  updatedAt?: Date,
): Entity<T> {
  return Object.freeze({
    id,
    createdAt: createdAt ?? new Date(),
    updatedAt: updatedAt ?? new Date(),
  });
}
