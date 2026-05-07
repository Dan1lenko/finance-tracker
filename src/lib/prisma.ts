import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * Декларативна парадигма: єдиний екземпляр клієнта бази даних для всього застосунку.
 * В режимі розробки зберігається в globalThis щоб уникнути повторного створення
 * при hot-reload (Next.js перезавантажує модулі, але globalThis зберігається).
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
