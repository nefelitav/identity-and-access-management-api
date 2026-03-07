/** Base shape shared by all domain entities. */
export interface Entity<T = string> {
  readonly id: T;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Factory for creating a base entity with sensible defaults. */
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
