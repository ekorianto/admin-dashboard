import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton dengan dukungan dual-database:
 * - TURSO_DATABASE_URL terdefinisi → Turso (libSQL di edge) ✅
 * - TURSO_DATABASE_URL tidak terdefinisi → SQLite lokal (dev.db)
 *
 * Untuk development lokal dengan Turso:
 *   Set TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di file .env
 *   Restart server: Ctrl+C → npm run dev
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;

  // Production/Local dengan Turso
  if (url) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("@libsql/client");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");

      const libsql = createClient({
        url,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      const adapter = new PrismaLibSQL(libsql);
      return new PrismaClient({ adapter });
    } catch (err) {
      throw new Error(
        "[Prisma] Gagal initialize Turso. Pastikan @prisma/adapter-libsql dan @libsql/client sudah terinstall.\n" +
          "Jalankan: npm install @prisma/adapter-libsql @libsql/client\n" +
          (err instanceof Error ? `\nDetail: ${err.message}` : "")
      );
    }
  }

  // Local development: SQLite biasa
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
