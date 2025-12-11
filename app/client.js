// lib/prisma.js
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis;
const client = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  transactionOptions: {
    timeout: 10000, // 10초 타임아웃
    maxWait: 5000, // 최대 대기 시간 5초
  },
});
export default client;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
