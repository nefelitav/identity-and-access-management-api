import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";

interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

function getUserRepository() {
  return container.get<UserRepository>(SERVICE_IDENTIFIERS.UserRepository);
}

/** Fetch a paginated list of users with optional filtering and sorting. */
export async function getUsers(params: GetUsersParams) {
  const userRepository = getUserRepository();
  return await userRepository.findMany(params);
}

/** Delete all users from the system. */
export async function deleteUsers() {
  const userRepository = getUserRepository();
  const users = await userRepository.findMany({ page: 1, limit: 1000 });
  for (const user of users.data) {
    await userRepository.delete(user.id);
  }
}
