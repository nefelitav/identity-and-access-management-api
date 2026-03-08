/**
 * Convenience wrappers for integration / e2e tests that need
 * a registered user and valid auth tokens.
 */
import request from "supertest";
import app from "~/app";
import bcrypt from "bcryptjs";
import { getPrisma } from "./testDB";

export interface TestUser {
  id: string;
  email: string;
  password: string; // plain-text
}

/** Insert a user directly in the DB and return their info. */
export async function seedUser(
  email = "test@example.com",
  password = "Test1234!",
): Promise<TestUser> {
  const prisma = getPrisma();
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });
  return { id: user.id, email, password };
}

/** Register through the API and return tokens + user id. */
export async function registerUser(
  email = "test@example.com",
  password = "Test1234!",
) {
  const res = await request(app)
    .post("/auth/register")
    .send({ email, password });
  return res;
}

/** Login through the API and return tokens. */
export async function loginUser(
  email = "test@example.com",
  password = "Test1234!",
) {
  const res = await request(app).post("/auth/login").send({ email, password });
  return res;
}

/** Register + login, return auth header object. */
export async function authenticatedUser(
  email = "test@example.com",
  password = "Test1234!",
) {
  const regRes = await registerUser(email, password);
  if (regRes.status !== 201) {
    throw new Error(
      `authenticatedUser: register failed with ${regRes.status}: ${JSON.stringify(regRes.body)}`,
    );
  }
  const token = regRes.body.data.accessToken;
  return {
    auth: { Authorization: `Bearer ${token}` },
    userId: regRes.body.data.id as string,
    accessToken: token as string,
    refreshToken: regRes.body.data.refreshToken as string,
  };
}

/** Seed user + assign admin role so they pass requireRole("admin"). */
export async function authenticatedAdmin(
  email = "admin@example.com",
  password = "Admin1234!",
) {
  const result = await authenticatedUser(email, password);
  const prisma = getPrisma();

  // Ensure "admin" role exists
  const role = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  await prisma.userRole.create({
    data: { userId: result.userId, roleId: role.id },
  });

  return result;
}
