import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

declare global {
  var __prisma__: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: env.databaseUrl
});

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}
