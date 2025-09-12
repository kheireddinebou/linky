import { PrismaClient } from "@prisma/client";


declare global {
  namespace NodeJS {
    interface Global {
      __prisma?: PrismaClient;
    }
  }
}

const prisma = (global as NodeJS.Global).__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  (global as NodeJS.Global).__prisma = prisma;
}

export default prisma;
