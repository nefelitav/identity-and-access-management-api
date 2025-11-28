import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import { AuthService } from "~/services";
import bcrypt from "bcryptjs";
import { SALT } from "~/utils";

export interface TestUser {
  id: string;
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
}

export class TestHelpers {
  static async createUser(
    email: string = `test-${Date.now()}@example.com`,
    password: string = "Test123!@#",
  ): Promise<TestUser> {
    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    const hashedPassword = await bcrypt.hash(password, SALT);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      password,
    };
  }

  static async createAuthenticatedUser(
    email?: string,
    password?: string,
  ): Promise<TestUser> {
    const user = await this.createUser(email, password);
    const result = await AuthService.login({
      email: user.email,
      password: user.password,
    });

    return {
      ...user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  static async createUserWithRole(
    email: string,
    password: string,
    roleName: string,
  ): Promise<TestUser> {
    const user = await this.createUser(email, password);
    const { RbacService } = require("~/services");
    await RbacService.assignRoleToUser(user.id, roleName);
    return user;
  }

  static getAuthHeaders(token: string): { Authorization: string } {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static generateRandomEmail(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  }

  static generateRandomPassword(): string {
    return `Test${Math.random().toString(36).substring(2, 15)}!@#`;
  }
}
