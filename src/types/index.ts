export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string | null;
  avatar: string | null;
  position: string | null;
  department: string | null;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  activeUsers: number;
};

export type ChartDataPoint = {
  name: string;
  value: number;
};

export type MonthlyRevenue = {
  month: string;
  revenue: number;
  orders: number;
};

export type ProductWithCategory = {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  status: string;
  category: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithCounts = SafeUser & {
  _count: {
    orders: number;
    createdProducts: number;
  };
};
