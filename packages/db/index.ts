import { PrismaClient } from "@prisma/client";

// One client per process. Next's dev server re-evaluates modules on every
// change, and a fresh PrismaClient each time exhausts the connection pool.
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export * from "@prisma/client";
