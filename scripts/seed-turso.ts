/**
 * Script untuk seed data ke Turso database
 * 
 * Cara pakai:
 *   1. Set TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN
 *      (set langsung di CMD atau di .env)
 *   2. Jalankan: npx tsx scripts/seed-turso.ts
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌ TURSO_DATABASE_URL belum diatur di .env");
  process.exit(1);
}

const turso = createClient({
  url,
  authToken: authToken || undefined,
});

async function seed() {
  console.log("🌱 Seeding data ke Turso...\n");

  // Cek apakah sudah ada data
  const existingUsers = await turso.execute("SELECT COUNT(*) as count FROM users");
  if (existingUsers.rows[0].count > 0) {
    console.log("⚠️  Data sudah ada di Turso, skip seed.");
    return;
  }

  // 1. Users
  console.log("  👤 Users...");
  const adminId = "admin-001";
  const managerId = "manager-001";
  const staffId = "staff-001";

  const bcrypt = require("bcryptjs");
  const adminPass = await bcrypt.hash("admin123", 10);
  const managerPass = await bcrypt.hash("manager123", 10);
  const staffPass = await bcrypt.hash("staff123", 10);

  await turso.execute({
    sql: `INSERT INTO users (id, name, email, password, role, status, department, joinDate, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
    args: [adminId, "Admin", "admin@dashboard.com", adminPass, "ADMIN", "ACTIVE", "IT"],
  });
  await turso.execute({
    sql: `INSERT INTO users (id, name, email, password, role, status, department, joinDate, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
    args: [managerId, "Manager", "manager@dashboard.com", managerPass, "MANAGER", "ACTIVE", "Produksi"],
  });
  await turso.execute({
    sql: `INSERT INTO users (id, name, email, password, role, status, department, joinDate, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
    args: [staffId, "Siti Staff", "siti@dashboard.com", staffPass, "STAFF", "ACTIVE", "Gudang"],
  });
  console.log("     ✅ 3 users created");

  // 2. Categories
  console.log("  📁 Categories...");
  const cat1Id = "cat-001";
  const cat2Id = "cat-002";
  const cat3Id = "cat-003";

  await turso.execute({
    sql: `INSERT INTO categories (id, name, slug, description, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [cat1Id, "Elektronik", "elektronik", "Produk elektronik dan kelistrikan"],
  });
  await turso.execute({
    sql: `INSERT INTO categories (id, name, slug, description, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [cat2Id, "Perkakas", "perkakas", "Alat kerja dan perkakas industri"],
  });
  await turso.execute({
    sql: `INSERT INTO categories (id, name, slug, description, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [cat3Id, "Safety", "safety", "Alat keselamatan kerja"],
  });
  console.log("     ✅ 3 categories created");

  // 3. Products
  console.log("  📦 Products...");
  await turso.execute({
    sql: `INSERT INTO products (id, name, sku, price, costPrice, stock, minStock, unit, status, categoryId, createdById, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["prod-001", "Kabel NYA 1.5mm", "KBL-001", 250000, 180000, 50, 10, "roll", "ACTIVE", cat1Id, adminId],
  });
  await turso.execute({
    sql: `INSERT INTO products (id, name, sku, price, costPrice, stock, minStock, unit, status, categoryId, createdById, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["prod-002", "Kunci Pas 10mm", "KPS-001", 45000, 32000, 120, 20, "pcs", "ACTIVE", cat2Id, adminId],
  });
  await turso.execute({
    sql: `INSERT INTO products (id, name, sku, price, costPrice, stock, minStock, unit, status, categoryId, createdById, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["prod-003", "Helm Safety Pro", "HLM-001", 185000, 140000, 30, 5, "pcs", "ACTIVE", cat3Id, adminId],
  });
  await turso.execute({
    sql: `INSERT INTO products (id, name, sku, price, costPrice, stock, minStock, unit, status, categoryId, createdById, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["prod-004", "Lampu LED 20W", "LMP-001", 85000, 55000, 75, 15, "pcs", "ACTIVE", cat1Id, adminId],
  });
  await turso.execute({
    sql: `INSERT INTO products (id, name, sku, price, costPrice, stock, minStock, unit, status, categoryId, createdById, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["prod-005", "Obeng Set 6in1", "OBG-001", 65000, 42000, 5, 10, "set", "ACTIVE", cat2Id, adminId],
  });
  console.log("     ✅ 5 products created");

  // 4. Orders
  console.log("  📋 Orders...");
  await turso.execute({
    sql: `INSERT INTO orders (id, orderNumber, userId, status, total, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["ord-001", "ORD-20240101-001", managerId, "COMPLETED", 335000, "Order rutin bulan Januari"],
  });
  await turso.execute({
    sql: `INSERT INTO orders (id, orderNumber, userId, status, total, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["ord-002", "ORD-20240115-002", managerId, "PENDING", 450000, null],
  });
  await turso.execute({
    sql: `INSERT INTO orders (id, orderNumber, userId, status, total, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: ["ord-003", "ORD-20240201-003", staffId, "PROCESSING", 185000, "Pengadaan helm safety"],
  });

  // Order items
  await turso.execute({
    sql: `INSERT INTO order_items (id, orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?, ?)`,
    args: ["oi-001", "ord-001", "prod-001", 1, 250000],
  });
  await turso.execute({
    sql: `INSERT INTO order_items (id, orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?, ?)`,
    args: ["oi-002", "ord-001", "prod-002", 2, 42500], // 45000 * 2 = 90000? no 42500
  });
  // Fix price
  await turso.execute({
    sql: `UPDATE order_items SET price = ? WHERE id = ?`,
    args: [45000, "oi-002"],
  });
  await turso.execute({
    sql: `INSERT INTO order_items (id, orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?, ?)`,
    args: ["oi-003", "ord-002", "prod-004", 5, 85000],
  });
  await turso.execute({
    sql: `INSERT INTO order_items (id, orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?, ?)`,
    args: ["oi-004", "ord-002", "prod-001", 1, 25000],
  });
  // Fix price
  await turso.execute({
    sql: `UPDATE order_items SET price = ? WHERE id = ?`,
    args: [250000, "oi-004"],
  });
  await turso.execute({
    sql: `INSERT INTO order_items (id, orderId, productId, quantity, price)
          VALUES (?, ?, ?, ?, ?)`,
    args: ["oi-005", "ord-003", "prod-003", 1, 185000],
  });

  console.log("     ✅ 3 orders + 5 items created");

  console.log("\n✅ Seed Turso berhasil!");
  console.log("👤 Login user:");
  console.log("   - admin@dashboard.com / admin123 (ADMIN)");
  console.log("   - manager@dashboard.com / manager123 (MANAGER)");
  console.log("   - siti@dashboard.com / staff123 (STAFF)");
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
