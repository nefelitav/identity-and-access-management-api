import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("🧩 Running database migrations before tests...");
  execSync(
    "yarn prisma migrate deploy --schema=./packages/prisma/prisma/schema.prisma",
    { stdio: "inherit" },
  );
}
