/**
 * Script untuk push schema Prisma ke Turso database
 * 
 * Cara pakai:
 *   1. Set TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di .env
 *   2. Jalankan: npx tsx scripts/push-to-turso.ts
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌ TURSO_DATABASE_URL belum diatur di .env");
  process.exit(1);
}

console.log(`📦 Connecting to Turso: ${url}`);

const turso = createClient({
  url,
  authToken: authToken || undefined,
});

async function main() {
  // Cek koneksi
  try {
    const result = await turso.execute("SELECT 1 as test");
    console.log("✅ Koneksi ke Turso berhasil!");
  } catch (err) {
    console.error("❌ Gagal konek ke Turso:", (err as Error).message);
    process.exit(1);
  }

  // Buat tabel-tabel
  console.log("📋 Membuat tabel...");

  const statements = [
    // Users
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STAFF',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      phone TEXT,
      avatar TEXT,
      position TEXT,
      department TEXT,
      joinDate TEXT NOT NULL DEFAULT (datetime('now')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    // Accounts (NextAuth)
    `CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS accounts_provider_providerAccountId ON accounts(provider, providerAccountId)`,

    // Sessions (NextAuth)
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      sessionToken TEXT NOT NULL UNIQUE,
      userId TEXT NOT NULL,
      expires TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Verification Tokens (NextAuth)
    `CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TEXT NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS verification_tokens_identifier_token ON verification_tokens(identifier, token)`,

    // Categories
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      slug TEXT NOT NULL UNIQUE,
      image TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    // Products
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sku TEXT NOT NULL UNIQUE,
      barcode TEXT,
      price REAL NOT NULL DEFAULT 0,
      costPrice REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      minStock INTEGER NOT NULL DEFAULT 0,
      maxStock INTEGER,
      unit TEXT NOT NULL DEFAULT 'pcs',
      image TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      categoryId TEXT,
      createdById TEXT,
      updatedById TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      FOREIGN KEY (createdById) REFERENCES users(id),
      FOREIGN KEY (updatedById) REFERENCES users(id)
    )`,

    // Orders
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT NOT NULL UNIQUE,
      userId TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,

    // Order Items
    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,
  ];

  for (const sql of statements) {
    try {
      await turso.execute(sql);
    } catch (err) {
      console.error(`❌ Error executing SQL:`, (err as Error).message);
      console.error(`   SQL: ${sql.substring(0, 80)}...`);
    }
  }

  console.log("✅ Schema berhasil di-push ke Turso!");
  console.log("");
  console.log("📊 Tabel yang dibuat:");
  console.log("  - users");
  console.log("  - accounts");
  console.log("  - sessions");
  console.log("  - verification_tokens");
  console.log("  - categories");
  console.log("  - products");
  console.log("  - orders");
  console.log("  - order_items");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
