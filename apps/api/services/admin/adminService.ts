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

export class AdminService {
  static async getUsers({
    page,
    limit,
    search,
    role,
    sortBy,
    sortOrder,
  }: GetUsersParams) {
    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    return await userRepository.findMany({
      page,
      limit,
      search,
      role,
      sortBy,
      sortOrder,
    });
  }

  static async deleteUsers() {
    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    // Delete all users - this would need to be implemented in UserRepository
    // For now, we'll need to get all users and delete them one by one
    // This is not ideal but works for now
    const users = await userRepository.findMany({ page: 1, limit: 1000 });
    for (const user of users.data) {
      await userRepository.delete(user.id);
    }
  }
}
