const { PrismaClient } = require('@prisma/client')

/**
 * One shared Prisma client instance.
 * In dev we reuse a global to avoid exhausting DB connections on hot reload.
 */
const globalForPrisma = globalThis

const prisma = globalForPrisma.__assetflow_prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__assetflow_prisma = prisma
}

module.exports = prisma
