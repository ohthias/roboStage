import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
globalForPrisma.prisma = globalForPrisma.prisma || undefined;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

export default prisma;