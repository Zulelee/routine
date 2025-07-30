import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function to get or create the default user
export async function getOrCreateUser() {
  const user = await prisma.user.upsert({
    where: { email: "me@example.com" },
    update: {},
    create: {
      id: "me",
      email: "me@example.com",
      name: "Me",
    },
  });
  return user;
}
