import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
globalForPrisma.prisma = globalForPrisma.prisma || undefined;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
