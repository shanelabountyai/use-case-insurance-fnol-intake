import { PrismaClient } from "@prisma/client";
import { assertLocalTestDatabase } from "./local-guard";

// K12: under test, never construct a client for anything but the local test DB.
if (process.env.NODE_ENV === "test") assertLocalTestDatabase(process.env.DATABASE_URL, "fnol_intake_test");

// One client per process. Next's dev server re-evaluates modules on every
// change, and a fresh PrismaClient each time exhausts the connection pool.
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export * from "@prisma/client";
