import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma: PrismaClient;


if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

const prismaWithAccelerate = prisma.$extends(withAccelerate());

export default prismaWithAccelerate;
