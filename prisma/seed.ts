import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dashboard.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@dashboard.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      position: "System Administrator",
      department: "IT",
      phone: "+62 812-3456-7890",
    },
  });

  // Create manager users
  const managerPassword = await bcrypt.hash("manager123", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@dashboard.com" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "manager@dashboard.com",
      password: managerPassword,
      role: "MANAGER",
      status: "ACTIVE",
      position: "Warehouse Manager",
      department: "Logistics",
      phone: "+62 813-9876-5432",
    },
  });

  // Create staff users
  const staffPassword = await bcrypt.hash("staff123", 12);
  const staffUsers = [
    { name: "Siti Rahayu", email: "siti@dashboard.com", position: "Staff Gudang", department: "Gudang" },
    { name: "Ahmad Fauzi", email: "ahmad@dashboard.com", position: "Staff Produksi", department: "Produksi" },
    { name: "Dewi Lestari", email: "dewi@dashboard.com", position: "Admin Keuangan", department: "Keuangan" },
    { name: "Rudi Hartono", email: "rudi@dashboard.com", position: "Staff QC", department: "Quality Control" },
    { name: "Mega Putri", email: "mega@dashboard.com", position: "Staff HR", department: "SDM" },
  ];

  const createdStaff: typeof admin[] = [];
  for (const staff of staffUsers) {
    const created = await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        ...staff,
        password: staffPassword,
        role: "STAFF",
        status: "ACTIVE",
        phone: "+62 8" + Math.floor(1000000000 + Math.random() * 9000000000),
      },
    });
    createdStaff.push(created);
  }

  // Create categories
  const categoryData = [
    { name: "Elektronik", description: "Produk elektronik dan aksesoris", slug: "elektronik" },
    { name: "Furniture", description: "Perabotan rumah dan kantor", slug: "furniture" },
    { name: "ATK", description: "Alat Tulis Kantor", slug: "atk" },
    { name: "Sembako", description: "Sembilan Bahan Pokok", slug: "sembako" },
    { name: "Pakaian", description: "Pakaian dan aksesoris fashion", slug: "pakaian" },
    { name: "Otomotif", description: "Spare part dan aksesoris kendaraan", slug: "otomotif" },
  ];

  const categories: Awaited<ReturnType<typeof prisma.category.create>>[] = [];
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(created);
  }

  // Create products
  const productData = [
    { name: "Monitor LED 24 Inch", sku: "ELC-001", price: 2500000, costPrice: 2000000, stock: 45, minStock: 10, maxStock: 100, unit: "pcs", categoryIndex: 0 },
    { name: "Keyboard Mechanical", sku: "ELC-002", price: 450000, costPrice: 320000, stock: 120, minStock: 20, maxStock: 200, unit: "pcs", categoryIndex: 0 },
    { name: "Mouse Wireless", sku: "ELC-003", price: 175000, costPrice: 120000, stock: 200, minStock: 30, maxStock: 500, unit: "pcs", categoryIndex: 0 },
    { name: "Webcam HD 1080p", sku: "ELC-004", price: 350000, costPrice: 250000, stock: 78, minStock: 15, maxStock: 150, unit: "pcs", categoryIndex: 0 },
    { name: "Headset Bluetooth", sku: "ELC-005", price: 550000, costPrice: 400000, stock: 55, minStock: 10, maxStock: 100, unit: "pcs", categoryIndex: 0 },
    { name: "Meja Kantor Minimalis", sku: "FRN-001", price: 1850000, costPrice: 1400000, stock: 23, minStock: 5, maxStock: 50, unit: "set", categoryIndex: 1 },
    { name: "Kursi Ergonomis", sku: "FRN-002", price: 2750000, costPrice: 2100000, stock: 15, minStock: 5, maxStock: 30, unit: "pcs", categoryIndex: 1 },
    { name: "Rak Buku 3 Tingkat", sku: "FRN-003", price: 850000, costPrice: 600000, stock: 34, minStock: 10, maxStock: 60, unit: "pcs", categoryIndex: 1 },
    { name: "Lemari Arsip", sku: "FRN-004", price: 2250000, costPrice: 1700000, stock: 8, minStock: 3, maxStock: 20, unit: "pcs", categoryIndex: 1 },
    { name: "Lampu Meja LED", sku: "FRN-005", price: 275000, costPrice: 190000, stock: 67, minStock: 15, maxStock: 100, unit: "pcs", categoryIndex: 1 },
    { name: "Kertas HVS A4 70gr", sku: "ATK-001", price: 55000, costPrice: 45000, stock: 500, minStock: 100, maxStock: 1000, unit: "rim", categoryIndex: 2 },
    { name: "Ballpoint Standard", sku: "ATK-002", price: 5000, costPrice: 3000, stock: 2000, minStock: 500, maxStock: 5000, unit: "pcs", categoryIndex: 2 },
    { name: "Stapler HD-10", sku: "ATK-003", price: 35000, costPrice: 25000, stock: 150, minStock: 30, maxStock: 300, unit: "pcs", categoryIndex: 2 },
    { name: "Buku Tulis Sidu 38 Lembar", sku: "ATK-004", price: 8500, costPrice: 6000, stock: 800, minStock: 200, maxStock: 2000, unit: "pcs", categoryIndex: 2 },
    { name: "Tinta Printer Epson L3110", sku: "ATK-005", price: 95000, costPrice: 75000, stock: 42, minStock: 10, maxStock: 80, unit: "botol", categoryIndex: 2 },
    { name: "Beras Premium 5Kg", sku: "SMB-001", price: 75000, costPrice: 65000, stock: 200, minStock: 50, maxStock: 500, unit: "karung", categoryIndex: 3 },
    { name: "Minyak Goreng 2L", sku: "SMB-002", price: 45000, costPrice: 38000, stock: 150, minStock: 30, maxStock: 300, unit: "botol", categoryIndex: 3 },
    { name: "Gula Pasir 1Kg", sku: "SMB-003", price: 18000, costPrice: 15000, stock: 300, minStock: 50, maxStock: 600, unit: "kg", categoryIndex: 3 },
    { name: "Telur Ayam 1Kg", sku: "SMB-004", price: 30000, costPrice: 26000, stock: 80, minStock: 20, maxStock: 200, unit: "kg", categoryIndex: 3 },
    { name: "Susu Kental Manis", sku: "SMB-005", price: 15000, costPrice: 12000, stock: 250, minStock: 50, maxStock: 500, unit: "kaleng", categoryIndex: 3 },
    { name: "Kemeja Pria Lengan Panjang", sku: "PKN-001", price: 185000, costPrice: 130000, stock: 95, minStock: 20, maxStock: 200, unit: "pcs", categoryIndex: 4 },
    { name: "Celana Chino Pria", sku: "PKN-002", price: 225000, costPrice: 160000, stock: 60, minStock: 15, maxStock: 150, unit: "pcs", categoryIndex: 4 },
    { name: "Blouse Wanita", sku: "PKN-003", price: 195000, costPrice: 140000, stock: 75, minStock: 15, maxStock: 150, unit: "pcs", categoryIndex: 4 },
    { name: "Jaket Hoodie", sku: "PKN-004", price: 275000, costPrice: 200000, stock: 40, minStock: 10, maxStock: 100, unit: "pcs", categoryIndex: 4 },
    { name: "Oli Mesin 1L", sku: "OTM-001", price: 85000, costPrice: 65000, stock: 120, minStock: 30, maxStock: 200, unit: "botol", categoryIndex: 5 },
    { name: "Ban Dalam Motor", sku: "OTM-002", price: 65000, costPrice: 45000, stock: 55, minStock: 10, maxStock: 100, unit: "pcs", categoryIndex: 5 },
    { name: "Lampu LED Mobil", sku: "OTM-003", price: 350000, costPrice: 250000, stock: 30, minStock: 5, maxStock: 60, unit: "pasang", categoryIndex: 5 },
    { name: "Aki Kering 12V", sku: "OTM-004", price: 650000, costPrice: 500000, stock: 18, minStock: 5, maxStock: 40, unit: "pcs", categoryIndex: 5 },
  ];

  const products: Awaited<ReturnType<typeof prisma.product.create>>[] = [];
  for (const prod of productData) {
    const { categoryIndex, ...productFields } = prod;
    const created = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        ...productFields,
        status: prod.stock === 0 ? "OUT_OF_STOCK" : prod.stock < prod.minStock ? "ACTIVE" : "ACTIVE",
        categoryId: categories[prod.categoryIndex].id,
        createdById: admin.id,
      },
    });
    products.push(created);
  }

  // Create some sample orders
  const orderData = [
    { orderNumber: "ORD-2025-001", userId: createdStaff[0]?.id || admin.id, status: "DELIVERED" as const, total: 2950000, items: [
      { productSku: "ELC-001", quantity: 1, price: 2500000 },
      { productSku: "ELC-002", quantity: 1, price: 450000 },
    ]},
    { orderNumber: "ORD-2025-002", userId: createdStaff[1]?.id || admin.id, status: "PROCESSING" as const, total: 980000, items: [
      { productSku: "ELC-003", quantity: 2, price: 175000 },
      { productSku: "ELC-005", quantity: 1, price: 550000 },
      { productSku: "ATK-001", quantity: 1, price: 55000 },
      { productSku: "ATK-005", quantity: 1, price: 95000 },
    ]},
    { orderNumber: "ORD-2025-003", userId: createdStaff[2]?.id || admin.id, status: "PENDING" as const, total: 4600000, items: [
      { productSku: "FRN-001", quantity: 1, price: 1850000 },
      { productSku: "FRN-002", quantity: 1, price: 2750000 },
    ]},
    { orderNumber: "ORD-2025-004", userId: createdStaff[3]?.id || admin.id, status: "SHIPPED" as const, total: 625000, items: [
      { productSku: "ELC-004", quantity: 1, price: 350000 },
      { productSku: "ATK-001", quantity: 5, price: 55000 },
    ]},
    { orderNumber: "ORD-2025-005", userId: createdStaff[4]?.id || admin.id, status: "DELIVERED" as const, total: 930000, items: [
      { productSku: "SMB-001", quantity: 4, price: 75000 },
      { productSku: "SMB-002", quantity: 4, price: 45000 },
      { productSku: "SMB-003", quantity: 10, price: 18000 },
      { productSku: "SMB-004", quantity: 5, price: 30000 },
    ]},
  ];

  for (const order of orderData) {
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: order.orderNumber },
    });
    if (!existingOrder) {
      await prisma.order.create({
        data: {
          orderNumber: order.orderNumber,
          userId: order.userId,
          status: order.status,
          total: order.total,
          items: {
            create: order.items.map((item) => ({
              productId: products.find((p) => p.sku === item.productSku)!.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log("👤 Admin login: admin@dashboard.com / admin123");
  console.log("👤 Manager login: manager@dashboard.com / manager123");
  console.log("👤 Staff login: siti@dashboard.com / staff123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
