import { UserRepository } from "~/repositories";

export class AdminService {
  static async getUsers() {
    return await UserRepository.findAll();
  }

  static async deleteUsers() {
    await UserRepository.deleteAll();
  }
}
