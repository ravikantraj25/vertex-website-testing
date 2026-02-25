  // lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Extend global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use the global object to store PrismaClient
const globalForPrisma = global as typeof global & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], 
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
