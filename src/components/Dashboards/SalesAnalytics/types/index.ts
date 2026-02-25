// Core Business Types
export interface Sale {
  id: string;
  customerId: string;
  productId: string;
  date: string;
  quantity: number;
  value: number;
  type: 'Export' | 'Domestic';
  entity: string;
  unit: string;
  margin: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  segment: 'Enterprise' | 'Corporate' | 'SMB';
  region: string;
  status: 'Active' | 'Inactive';
  totalSpent: number;
  margin: number;
  since: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  cost: number;
  margin: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  value: number;
  poNumber: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Ordered' | 'Billed' | 'Pending' | 'Shipped' | 'Delivered';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  notes: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  revenueGrowth: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface FilterParams {
  dateRange: string;
  region?: string;
  segment?: string;
  productCategory?: string;
}

// Component Props
export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  format?: 'currency' | 'number' | 'percent';
}

export interface ChartCardProps {
  title: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'composed';
  data: ChartData[];
  height?: number;
  colors?: string[];
  showToolbar?: boolean;
}

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  dark: '#1f2937',
  light: '#9ca3af',
};

export const CHART_COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export const BAR_CHART_CONFIG = {
  barSize: 40,
  borderRadius: 4,
  animationDuration: 1000,
};

export const LINE_CHART_CONFIG = {
  strokeWidth: 3,
  dotSize: 6,
  animationDuration: 1500,
};

export const PIE_CHART_CONFIG = {
  innerRadius: 60,
  outerRadius: 90,
  animationDuration: 1000,
};