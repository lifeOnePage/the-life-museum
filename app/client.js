// lib/prisma.js
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis;
const client = globalForPrisma.prisma || new PrismaClient();
export default client;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
