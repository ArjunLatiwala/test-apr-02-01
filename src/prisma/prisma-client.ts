import { PrismaClient } from '@prisma/client';


// add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export default prisma;
